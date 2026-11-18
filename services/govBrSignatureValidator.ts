export interface GovBrValidationResult {
    valid: boolean;
    error?: string;
    signerName?: string;
    signerCpfMasked?: string;
    issuer?: string;
    signedAt?: string;
    foundSignerName?: string;
}

const STOP_WORDS = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E']);

const CA_KEYWORDS = [
    'AUTORIDADE CERTIFICADORA',
    'ICP-BRASIL',
    'AC RAIZ',
    'AC SERPRO',
    'AC SOLUTI',
    'AC VALID',
    'AC CERTISIGN',
    'AC SAFEWEB',
    'AC DIGITAL',
    'AC GOV',
    'AC INTERMEDIARIA',
    'AC FINAL',
    'GOVERNO FEDERAL',
    'SECRETARIA DA RECEITA',
    'RECEITA FEDERAL',
    'SERPRO FINAL',
    'TIMESTAMP',
    'CARIMBO DE TEMPO',
    'ITI ',
    'ROOT CA',
    ' CA '
];

function normalizeText(value: string): string {
    return (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9\s:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getSignificantTokens(fullName: string): string[] {
    const clean = normalizeText(fullName).replace(/:/g, ' ');
    const allTokens = clean.split(' ').filter((t) => t.length >= 2);
    const filtered = allTokens.filter((t) => !STOP_WORDS.has(t));
    return filtered.length > 0 ? filtered : allTokens;
}

function maskCpf(digits: string): string {
    if (!digits || digits.length !== 11) return '***.***.***-**';
    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

function isCaString(value: string): boolean {
    const norm = ` ${normalizeText(value)} `;
    return CA_KEYWORDS.some((kw) => norm.includes(kw));
}

function bytesMatch(buf: Uint8Array, offset: number, pattern: number[]): boolean {
    if (offset + pattern.length > buf.length) return false;
    for (let i = 0; i < pattern.length; i++) {
        if (buf[offset + i] !== pattern[i]) return false;
    }
    return true;
}

function readDerLength(buf: Uint8Array, offset: number): { length: number; nextOffset: number } | null {
    if (offset >= buf.length) return null;
    const first = buf[offset];
    if (first < 0x80) {
        return { length: first, nextOffset: offset + 1 };
    }
    const numBytes = first & 0x7f;
    if (numBytes === 0 || numBytes > 4 || offset + 1 + numBytes > buf.length) {
        return null;
    }
    let length = 0;
    for (let i = 0; i < numBytes; i++) {
        length = (length << 8) | buf[offset + 1 + i];
    }
    return { length, nextOffset: offset + 1 + numBytes };
}

function decodeDerStringValue(buf: Uint8Array, tag: number, start: number, length: number): string {
    if (length <= 0 || start + length > buf.length) return '';
    const slice = buf.subarray(start, start + length);
    try {
        if (tag === 0x0c) {
            return new TextDecoder('utf-8').decode(slice).trim();
        }
        if (tag === 0x1e) {
            // BMPString (UTF-16BE)
            let res = '';
            for (let i = 0; i + 1 < slice.length; i += 2) {
                res += String.fromCharCode((slice[i] << 8) | slice[i + 1]);
            }
            return res.trim();
        }
        return new TextDecoder('latin1').decode(slice).trim();
    } catch {
        return '';
    }
}

interface ExtractedCertMetadata {
    commonNames: string[];
    organizations: string[];
    organizationalUnits: string[];
    icpBrasilCpfs: string[];
    printableRuns: string[];
}

function extractDerMetadata(derBytes: Uint8Array): ExtractedCertMetadata {
    const commonNames: string[] = [];
    const organizations: string[] = [];
    const organizationalUnits: string[] = [];
    const icpBrasilCpfs: string[] = [];
    const printableRuns: string[] = [];

    // OID 2.5.4.3 (CN), 2.5.4.10 (O), 2.5.4.11 (OU), 2.16.76.1.3.1 (ICP-Brasil PF)
    const OID_CN = [0x06, 0x03, 0x55, 0x04, 0x03];
    const OID_O = [0x06, 0x03, 0x55, 0x04, 0x0a];
    const OID_OU = [0x06, 0x03, 0x55, 0x04, 0x0b];
    const OID_ICP_PF = [0x06, 0x05, 0x60, 0x4c, 0x01, 0x03, 0x01];

    const STRING_TAGS = new Set([0x04, 0x0c, 0x13, 0x14, 0x16, 0x1a, 0x1e]);

    for (let i = 0; i < derBytes.length - 6; i++) {
        let targetList: string[] | null = null;
        let oidLen = 0;
        let isCpfOid = false;

        if (bytesMatch(derBytes, i, OID_CN)) {
            targetList = commonNames;
            oidLen = OID_CN.length;
        } else if (bytesMatch(derBytes, i, OID_O)) {
            targetList = organizations;
            oidLen = OID_O.length;
        } else if (bytesMatch(derBytes, i, OID_OU)) {
            targetList = organizationalUnits;
            oidLen = OID_OU.length;
        } else if (bytesMatch(derBytes, i, OID_ICP_PF)) {
            isCpfOid = true;
            oidLen = OID_ICP_PF.length;
        }

        if (targetList || isCpfOid) {
            const valOffset = i + oidLen;
            if (valOffset < derBytes.length) {
                const tag = derBytes[valOffset];
                if (STRING_TAGS.has(tag)) {
                    const lenInfo = readDerLength(derBytes, valOffset + 1);
                    if (lenInfo && lenInfo.length > 0 && lenInfo.length < 512 && lenInfo.nextOffset + lenInfo.length <= derBytes.length) {
                        const decoded = decodeDerStringValue(derBytes, tag, lenInfo.nextOffset, lenInfo.length);
                        if (decoded) {
                            if (isCpfOid) {
                                // Padrão ICP-Brasil OID 2.16.76.1.3.1: DDMMAAAA (8) + CPF (11) + ...
                                const digits = decoded.replace(/\D/g, '');
                                if (digits.length >= 19) {
                                    const cpfCandidate = digits.slice(8, 19);
                                    if (!icpBrasilCpfs.includes(cpfCandidate)) {
                                        icpBrasilCpfs.push(cpfCandidate);
                                    }
                                }
                            } else if (targetList && !targetList.includes(decoded)) {
                                targetList.push(decoded);
                            }
                        }
                    }
                }
            }
        }
    }

    // Coleta também trechos legíveis dentro do bloco PKCS#7 para referência de emissor/texto
    let current = '';
    for (let i = 0; i < derBytes.length; i++) {
        const b = derBytes[i];
        if ((b >= 0x20 && b <= 0x7e) || (b >= 0xc0 && b <= 0xff)) {
            current += String.fromCharCode(b);
        } else {
            if (current.length >= 6) {
                printableRuns.push(current);
            }
            current = '';
        }
    }
    if (current.length >= 6) {
        printableRuns.push(current);
    }

    return {
        commonNames,
        organizations,
        organizationalUnits,
        icpBrasilCpfs,
        printableRuns,
    };
}

function hexToUint8Array(hexRaw: string): Uint8Array | null {
    const clean = hexRaw.replace(/\s+/g, '');
    if (clean.length < 64 || clean.length % 2 !== 0) return null;
    // Ignorar placeholders zerados (assinaturas não preenchidas)
    if (/^0+$/.test(clean)) return null;

    const bytes = new Uint8Array(clean.length / 2);
    let hasNonZero = false;
    for (let i = 0; i < bytes.length; i++) {
        const val = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
        if (Number.isNaN(val)) return null;
        if (val !== 0) hasNonZero = true;
        bytes[i] = val;
    }
    return hasNonZero ? bytes : null;
}

function parsePdfDate(raw: string): string | undefined {
    const match = raw.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
    if (!match) return undefined;
    const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}

function decodePdfTextString(raw: string): string {
    if (!raw) return '';
    if (raw.startsWith('\xfe\xff')) {
        let out = '';
        for (let i = 2; i + 1 < raw.length; i += 2) {
            out += String.fromCharCode((raw.charCodeAt(i) << 8) | raw.charCodeAt(i + 1));
        }
        return out.trim();
    }
    return raw.replace(/\\([()\\])/g, '$1').trim();
}

function checkNameMatch(candidateName: string, expectedFullName: string): { matched: boolean; score: number } {
    const sigTokens = getSignificantTokens(expectedFullName);
    if (sigTokens.length === 0) return { matched: false, score: 0 };

    const cleanCandidate = ` ${normalizeText(candidateName).replace(/:/g, ' ')} `;
    const candidateWords = new Set(cleanCandidate.trim().split(' ').filter(Boolean));

    const matchedTokens = sigTokens.filter(
        (token) => candidateWords.has(token) || cleanCandidate.includes(` ${token} `)
    );

    const first = sigTokens[0];
    const last = sigTokens[sigTokens.length - 1];
    const hasFirstAndLast = candidateWords.has(first) && candidateWords.has(last);
    const ratio = matchedTokens.length / sigTokens.length;

    const matched =
        (sigTokens.length === 1 && matchedTokens.length === 1) ||
        (hasFirstAndLast && ratio >= 0.5) ||
        (matchedTokens.length >= 2 && ratio >= 0.6);

    return { matched, score: matchedTokens.length };
}

export async function validateGovBrSignedPdf(
    file: File,
    expectedFullName: string,
    expectedCpf: string
): Promise<GovBrValidationResult> {
    if (!file) {
        return { valid: false, error: 'Selecione um arquivo PDF válido.' };
    }

    const lowerName = file.name.toLowerCase();
    if (file.type && file.type !== 'application/pdf' && !lowerName.endsWith('.pdf')) {
        return { valid: false, error: 'Formato inválido. Envie o arquivo no formato PDF assinado.' };
    }

    if (file.size === 0) {
        return { valid: false, error: 'O arquivo selecionado está vazio.' };
    }

    if (file.size > 12 * 1024 * 1024) {
        return { valid: false, error: 'O arquivo PDF ultrapassa o limite máximo de 12 MB.' };
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const pdfLatin1 = new TextDecoder('latin1').decode(bytes);

    if (!pdfLatin1.slice(0, 1024).includes('%PDF-')) {
        return { valid: false, error: 'O arquivo selecionado não é um documento PDF válido.' };
    }

    // 1. Verificar se existe assinatura criptográfica PAdES / PKCS#7 no PDF
    const hasByteRange = /\/ByteRange\s*\[/.test(pdfLatin1);
    const hasContents = /\/Contents\s*<[0-9A-Fa-f\s]+>/.test(pdfLatin1);
    const hasSigDict =
        /\/Type\s*\/Sig\b/.test(pdfLatin1) ||
        /\/FT\s*\/Sig\b/.test(pdfLatin1) ||
        /\/SubFilter\s*\/(adbe\.pkcs7|ETSI\.CAdES|ETSI\.RFC3161|adbe\.x509)/i.test(pdfLatin1);

    if (!hasByteRange || !hasContents || !hasSigDict) {
        return {
            valid: false,
            error:
                'Este PDF não contém assinatura digital criptográfica. Baixe a ficha em PDF no Passo 1, assine pelo Assinador Gov.br (assinador.iti.br ou aplicativo Gov.br) e anexe o arquivo assinado gerado.'
        };
    }

    // 2. Extrair todos os blocos PKCS#7 /Contents <hex> e metadados do dicionário /Sig
    const contentsRegex = /\/Contents\s*<([0-9A-Fa-f\s]+)>/g;
    const allCommonNames: string[] = [];
    const allOrgs: string[] = [];
    const allOUs: string[] = [];
    const allIcpCpfs: string[] = [];
    const allPrintableRuns: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = contentsRegex.exec(pdfLatin1)) !== null) {
        const derBytes = hexToUint8Array(match[1]);
        if (!derBytes) continue;
        const meta = extractDerMetadata(derBytes);
        allCommonNames.push(...meta.commonNames);
        allOrgs.push(...meta.organizations);
        allOUs.push(...meta.organizationalUnits);
        allIcpCpfs.push(...meta.icpBrasilCpfs);
        allPrintableRuns.push(...meta.printableRuns);
    }

    const pdfNameMatches = Array.from(pdfLatin1.matchAll(/\/Name\s*\(([^)]{2,160})\)/g))
        .map((m) => decodePdfTextString(m[1]))
        .filter(Boolean);

    const pdfDateMatch = pdfLatin1.match(/\/M\s*\((D:[^)]+)\)/);
    const signedAt = pdfDateMatch ? parsePdfDate(pdfDateMatch[1]) : undefined;

    if (allCommonNames.length === 0 && allPrintableRuns.length === 0 && pdfNameMatches.length === 0) {
        return {
            valid: false,
            error: 'Não foi possível ler o certificado digital dentro deste PDF. Gere novamente a assinatura pelo Gov.br.'
        };
    }

    // 3. Separar CNs de Autoridade Certificadora vs Titular da Assinatura
    const uniqueCNs = Array.from(new Set(allCommonNames));
    const signerCandidates = uniqueCNs.filter((cn) => !isCaString(cn));
    const expectedCpfDigits = (expectedCpf || '').replace(/\D/g, '');

    // Extrair CPFs presentes no formato ICP-Brasil CN ("NOME:12345678900") ou OID 2.16.76.1.3.1
    const signerCpfsFromCn: string[] = [];
    for (const cn of signerCandidates) {
        const cpfMatch = cn.match(/:\s*(\d{11})\b/);
        if (cpfMatch) {
            signerCpfsFromCn.push(cpfMatch[1]);
        }
    }
    const allSignerCpfs = Array.from(new Set([...signerCpfsFromCn, ...allIcpCpfs]));

    // 4. Verificar coincidência de CPF e Nome Completo
    let cpfMatched = false;
    if (expectedCpfDigits.length === 11 && allSignerCpfs.length > 0) {
        if (!allSignerCpfs.includes(expectedCpfDigits)) {
            const firstFoundCn = signerCandidates[0]?.split(':')[0]?.trim();
            return {
                valid: false,
                foundSignerName: firstFoundCn,
                error: firstFoundCn
                    ? `A assinatura digital encontrada pertence a "${firstFoundCn}" (CPF ${maskCpf(allSignerCpfs[0])}) e não coincide com o associado cadastrado (${expectedFullName.trim()}).`
                    : 'O CPF do certificado digital que assinou este PDF não coincide com o CPF informado na ficha.'
            };
        }
        cpfMatched = true;
    }

    // Avaliar coincidência do Nome Completo entre os CNs do assinante e /Name do PDF
    const nameCandidates = [...signerCandidates.map((cn) => cn.split(':')[0].trim()), ...pdfNameMatches];
    let bestMatchedName = '';
    let bestScore = -1;

    for (const candidate of nameCandidates) {
        if (!candidate || isCaString(candidate)) continue;
        const { matched, score } = checkNameMatch(candidate, expectedFullName);
        if (matched && score > bestScore) {
            bestMatchedName = candidate;
            bestScore = score;
        }
    }

    // Fallback: verificar em strings UTF-8/Latin1 do bloco PKCS#7 ou texto visível do carimbo Gov.br
    if (!bestMatchedName) {
        const searchableBuffers = [...allPrintableRuns, pdfLatin1.slice(-65536)];
        for (const chunk of searchableBuffers) {
            if (checkNameMatch(chunk, expectedFullName).matched) {
                bestMatchedName = expectedFullName.trim();
                break;
            }
        }
    }

    if (!cpfMatched && !bestMatchedName) {
        const wrongSigner = signerCandidates[0]?.split(':')[0]?.trim() || pdfNameMatches[0];
        return {
            valid: false,
            foundSignerName: wrongSigner,
            error: wrongSigner
                ? `A assinatura digital encontrada neste PDF está em nome de "${wrongSigner}", que não coincide com "${expectedFullName.trim()}". Use a conta Gov.br do próprio associado.`
                : `Não foi possível confirmar que a assinatura digital pertence a "${expectedFullName.trim()}". Verifique se o PDF foi assinado no Assinador Gov.br com os dados do associado.`
        };
    }

    // Se CPF bateu, mas o nome do CN veio completamente distinto (não compartilha nenhum token), rejeitar por segurança
    if (cpfMatched && !bestMatchedName && signerCandidates.length > 0) {
        const expectedTokens = getSignificantTokens(expectedFullName);
        const rawCnTokens = normalizeText(signerCandidates[0].split(':')[0]);
        const sharesAnyToken = expectedTokens.some((t) => rawCnTokens.includes(t));
        if (!sharesAnyToken) {
            return {
                valid: false,
                foundSignerName: signerCandidates[0].split(':')[0]?.trim(),
                error: `A assinatura digital encontrada ("${signerCandidates[0].split(':')[0]?.trim()}") não corresponde ao nome do associado "${expectedFullName.trim()}".`
            };
        }
        bestMatchedName = signerCandidates[0].split(':')[0].trim();
    }

    // 5. Identificar autoridade emissora (Gov.br / SERPRO / ICP-Brasil)
    const chainText = normalizeText([...uniqueCNs, ...allOrgs, ...allOUs, ...allPrintableRuns, pdfLatin1.slice(-65536)].join(' '));
    const isGovBr =
        chainText.includes('GOV BR') ||
        chainText.includes('GOV.BR') ||
        chainText.includes('GOVERNO FEDERAL') ||
        chainText.includes('SERPRO') ||
        chainText.includes('ASSINADOR ITI') ||
        chainText.includes('ITI');
    const isIcpBrasil = chainText.includes('ICP BRASIL') || chainText.includes('ICP-BRASIL') || isGovBr;

    const issuer = isGovBr
        ? 'Gov.br / ICP-Brasil (ITI/SERPRO)'
        : isIcpBrasil
            ? 'Certificado Digital ICP-Brasil'
            : 'Certificado Digital X.509 (PAdES)';

    const displaySignerName = bestMatchedName || signerCandidates[0]?.split(':')[0]?.trim() || expectedFullName.trim();
    const displayCpf = allSignerCpfs[0] ? maskCpf(allSignerCpfs[0]) : maskCpf(expectedCpfDigits);

    return {
        valid: true,
        signerName: displaySignerName,
        signerCpfMasked: displayCpf,
        issuer,
        signedAt
    };
}
