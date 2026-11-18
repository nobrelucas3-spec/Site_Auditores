import { supabase } from './supabaseClient';

export interface FichaPdfData {
    full_name: string;
    cpf: string;
    rg: string;
    birth_date: string;
    birthplace: string;
    address: string;
    matricula: string;
    role: string;
    email_institutional: string;
    email_personal: string;
    phone_fixed: string;
    phone_mobile: string;
    affiliation_type: string;
    is_retired: boolean;
    created_at: string;
}

interface JpegImagePayload {
    bytes: Uint8Array;
    width: number;
    height: number;
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const WIN_ANSI_SPECIAL_MAP: Record<number, number> = {
    0x20AC: 0x80, // €
    0x201A: 0x82, // ‚
    0x0192: 0x83, // ƒ
    0x201E: 0x84, // „
    0x2026: 0x85, // …
    0x2020: 0x86, // †
    0x2021: 0x87, // ‡
    0x02C6: 0x88, // ˆ
    0x2030: 0x89, // ‰
    0x0160: 0x8A, // Š
    0x2039: 0x8B, // ‹
    0x0152: 0x8C, // Œ
    0x017D: 0x8E, // Ž
    0x2018: 0x91, // ‘
    0x2019: 0x92, // ’
    0x201C: 0x93, // “
    0x201D: 0x94, // ”
    0x2022: 0x95, // •
    0x2013: 0x96, // –
    0x2014: 0x97, // —
    0x02DC: 0x98, // ˜
    0x2122: 0x99, // ™
    0x0161: 0x9A, // š
    0x203A: 0x9B, // ›
    0x0153: 0x9C, // œ
    0x017E: 0x9E, // ž
    0x0178: 0x9F, // Ÿ
};

function encodeWinAnsi(text: string): Uint8Array {
    const out = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code <= 0xFF) {
            out[i] = code;
        } else if (WIN_ANSI_SPECIAL_MAP[code] !== undefined) {
            out[i] = WIN_ANSI_SPECIAL_MAP[code];
        } else {
            out[i] = 0x2D; // '-' fallback for unsupported characters
        }
    }
    return out;
}

function escapePdfLiteral(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\r?\n/g, ' ');
}

function estimateTextWidth(text: string, fontSize: number, bold = false): number {
    let factor = 0;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === ' ') {
            factor += 0.25;
        } else if ('ijlI1.,:;|!\'"`'.includes(ch)) {
            factor += 0.28;
        } else if ('ftr()-/[]'.includes(ch)) {
            factor += 0.34;
        } else if ('mwMW@'.includes(ch)) {
            factor += bold ? 0.82 : 0.76;
        } else if (ch >= 'A' && ch <= 'Z') {
            factor += bold ? 0.66 : 0.61;
        } else {
            factor += bold ? 0.50 : 0.46;
        }
    }
    return factor * fontSize;
}

function wrapText(text: string, maxWidth: number, fontSize: number, bold = false): string[] {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [''];

    const words = clean.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (estimateTextWidth(candidate, fontSize, bold) <= maxWidth) {
            current = candidate;
        } else {
            if (current) {
                lines.push(current);
                current = '';
            }
            if (estimateTextWidth(word, fontSize, bold) <= maxWidth) {
                current = word;
            } else {
                // Split ultra-long unbroken strings (e.g. very long emails)
                let slice = '';
                for (const ch of word) {
                    if (estimateTextWidth(slice + ch, fontSize, bold) > maxWidth && slice) {
                        lines.push(slice);
                        slice = ch;
                    } else {
                        slice += ch;
                    }
                }
                current = slice;
            }
        }
    }

    if (current) {
        lines.push(current);
    }

    return lines;
}

function formatBirthDatePt(dateStr: string): string {
    if (!dateStr) return '';
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? dateStr : parsed.toLocaleDateString('pt-BR');
}

function getFullAffiliationName(type: string): string {
    if (type === 'Ambos') {
        return 'Associação dos Auditores de Controle Externo do TCE-PE e Sindicato dos Auditores do TCE-PE';
    }
    if (type === 'Associação') {
        return 'Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco';
    }
    return 'Sindicato dos Auditores do Tribunal de Contas do Estado de Pernambuco';
}

async function loadLogoAsJpeg(): Promise<JpegImagePayload | null> {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const maxTargetW = 900;
                const scale = img.naturalWidth > maxTargetW ? maxTargetW / img.naturalWidth : 1;
                const width = Math.max(1, Math.round(img.naturalWidth * scale));
                const height = Math.max(1, Math.round(img.naturalHeight * scale));

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                const base64 = dataUrl.split(',')[1];
                if (!base64) {
                    resolve(null);
                    return;
                }
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                resolve({ bytes, width, height });
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = '/logo-declaracao.png';
    });
}

function buildPdfBinary(contentStream: string, logo: JpegImagePayload | null): Uint8Array {
    const contentBytes = encodeWinAnsi(contentStream);

    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let currentOffset = 0;

    const pushAscii = (str: string) => {
        const bytes = encodeWinAnsi(str);
        chunks.push(bytes);
        currentOffset += bytes.byteLength;
    };

    const pushBytes = (bytes: Uint8Array) => {
        chunks.push(bytes);
        currentOffset += bytes.byteLength;
    };

    const startObj = (id: number) => {
        offsets[id] = currentOffset;
        pushAscii(`${id} 0 obj\n`);
    };

    const endObj = () => {
        pushAscii('\nendobj\n');
    };

    // PDF Header
    pushAscii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    // 1: Catalog
    startObj(1);
    pushAscii('<< /Type /Catalog /Pages 2 0 R >>');
    endObj();

    // 2: Pages
    startObj(2);
    pushAscii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    endObj();

    // 3: Page
    startObj(3);
    const xObjectRef = logo ? '/XObject << /ImLogo 7 0 R >>' : '';
    pushAscii(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH.toFixed(2)} ${A4_HEIGHT.toFixed(2)}] ` +
        `/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> ${xObjectRef} >> /Contents ${logo ? 8 : 7} 0 R >>`
    );
    endObj();

    // 4: Times-Roman
    startObj(4);
    pushAscii('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>');
    endObj();

    // 5: Times-Bold
    startObj(5);
    pushAscii('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>');
    endObj();

    // 6: Times-Italic
    startObj(6);
    pushAscii('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>');
    endObj();

    if (logo) {
        // 7: Image XObject (Logo JPEG)
        startObj(7);
        pushAscii(
            `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} ` +
            `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.byteLength} >>\nstream\n`
        );
        pushBytes(logo.bytes);
        pushAscii('\nendstream');
        endObj();

        // 8: Content stream
        startObj(8);
        pushAscii(`<< /Length ${contentBytes.byteLength} >>\nstream\n`);
        pushBytes(contentBytes);
        pushAscii('\nendstream');
        endObj();
    } else {
        // 7: Content stream
        startObj(7);
        pushAscii(`<< /Length ${contentBytes.byteLength} >>\nstream\n`);
        pushBytes(contentBytes);
        pushAscii('\nendstream');
        endObj();
    }

    const totalObjects = offsets.length;
    const xrefOffset = currentOffset;
    pushAscii(`xref\n0 ${totalObjects}\n`);
    pushAscii('0000000000 65535 f \n');
    for (let id = 1; id < totalObjects; id++) {
        const padded = String(offsets[id]).padStart(10, '0');
        pushAscii(`${padded} 00000 n \n`);
    }

    pushAscii(`trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

    const merged = new Uint8Array(currentOffset);
    let pos = 0;
    for (const chunk of chunks) {
        merged.set(chunk, pos);
        pos += chunk.byteLength;
    }
    return merged;
}

export async function generateFichaPdfBlob(data: FichaPdfData, id: string): Promise<Blob> {
    const logo = await loadLogoAsJpeg();

    const ops: string[] = [];
    const drawText = (text: string, x: number, y: number, font: 'F1' | 'F2' | 'F3', size: number, gray = 0) => {
        ops.push(`BT /${font} ${size.toFixed(1)} Tf ${gray.toFixed(2)} g 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfLiteral(text)}) Tj ET`);
    };

    const drawCenteredText = (text: string, y: number, font: 'F1' | 'F2' | 'F3', size: number, gray = 0) => {
        const w = estimateTextWidth(text, size, font === 'F2');
        const x = Math.max(46, (A4_WIDTH - w) / 2);
        drawText(text, x, y, font, size, gray);
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number, width = 1, gray = 0) => {
        ops.push(`q ${width.toFixed(2)} w ${gray.toFixed(2)} G ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S Q`);
    };

    const drawSectionHeader = (title: string, topY: number) => {
        const left = 48;
        const width = A4_WIDTH - 96;
        const height = 18;
        const bottomY = topY - height;
        ops.push(`q 0.945 0.961 0.976 rg ${left} ${bottomY.toFixed(2)} ${width.toFixed(2)} ${height} re f Q`);
        drawLine(left, topY, left + width, topY, 0.8);
        drawLine(left, bottomY, left + width, bottomY, 0.8);
        drawText(title, left + 8, bottomY + 5.5, 'F2', 9.5);
        return bottomY;
    };

    const drawLabeledField = (label: string, value: string, x: number, y: number, maxWidth: number): number => {
        const labelStr = `${label}: `;
        const labelW = estimateTextWidth(labelStr, 9.5, true);
        drawText(labelStr, x, y, 'F2', 9.5);

        const firstLineMaxW = Math.max(80, maxWidth - labelW);
        const firstWrapped = wrapText(value || 'N/A', firstLineMaxW, 9.5, false);
        drawText(firstWrapped[0], x + labelW, y, 'F1', 9.5);

        let linesUsed = 1;
        if (firstWrapped.length > 1) {
            const remainder = firstWrapped.slice(1).join(' ');
            const restWrapped = wrapText(remainder, maxWidth, 9.5, false);
            for (const line of restWrapped) {
                linesUsed++;
                drawText(line, x, y - (linesUsed - 1) * 12.5, 'F1', 9.5);
            }
        }
        return linesUsed;
    };

    // Moldura externa da folha
    ops.push(`q 1.4 w 0 G 30 30 ${(A4_WIDTH - 60).toFixed(2)} ${(A4_HEIGHT - 60).toFixed(2)} re S Q`);

    let cursorY = 795;

    // Cabeçalho com Logo Oficial
    if (logo) {
        const targetH = 52;
        const aspect = logo.width / logo.height;
        let drawW = targetH * aspect;
        let drawH = targetH;
        if (drawW > 240) {
            drawW = 240;
            drawH = drawW / aspect;
        }
        const imgX = (A4_WIDTH - drawW) / 2;
        const imgY = cursorY - drawH;
        ops.push(`q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm /ImLogo Do Q`);
        cursorY = imgY - 18;
    } else {
        drawCenteredText('ASSOCIAÇÃO DOS AUDITORES DE CONTROLE EXTERNO DO TCE-PE', cursorY - 18, 'F2', 12);
        cursorY -= 38;
    }

    drawCenteredText('FORMULÁRIO DE ADMISSÃO', cursorY, 'F2', 14.5);
    cursorY -= 12;
    drawLine(48, cursorY, A4_WIDTH - 48, cursorY, 1.5);
    cursorY -= 14;

    // 1. Dados Pessoais
    const s1Bottom = drawSectionHeader('1. DADOS PESSOAIS', cursorY);
    cursorY = s1Bottom - 16;

    const fullW = A4_WIDTH - 104;
    const col1X = 52;
    const col2X = 304;
    const colW = 238;

    const lName = drawLabeledField('Nome Completo', (data.full_name || '').trim(), col1X, cursorY, fullW);
    cursorY -= 16 + (lName - 1) * 12;

    drawLabeledField('CPF', data.cpf, col1X, cursorY, colW);
    drawLabeledField('RG', data.rg, col2X, cursorY, colW);
    cursorY -= 16;

    drawLabeledField('Data de Nascimento', formatBirthDatePt(data.birth_date), col1X, cursorY, colW);
    drawLabeledField('Naturalidade', data.birthplace, col2X, cursorY, colW);
    cursorY -= 16;

    const lAddr = drawLabeledField('Endereço Residencial', data.address, col1X, cursorY, fullW);
    cursorY -= 20 + (lAddr - 1) * 12.5;

    // 2. Dados Funcionais e Contato
    const s2Bottom = drawSectionHeader('2. DADOS FUNCIONAIS E CONTATO', cursorY);
    cursorY = s2Bottom - 16;

    drawLabeledField('Matrícula TCE-PE', data.matricula, col1X, cursorY, colW);
    drawLabeledField('Cargo Atual', data.role, col2X, cursorY, colW);
    cursorY -= 16;

    const lEmail1 = drawLabeledField('E-mail Institucional', data.email_institutional || 'N/A', col1X, cursorY, colW);
    const lEmail2 = drawLabeledField('E-mail Particular', data.email_personal || 'N/A', col2X, cursorY, colW);
    cursorY -= 16 + (Math.max(lEmail1, lEmail2) - 1) * 12.5;

    drawLabeledField('Telefone Fixo', data.phone_fixed || 'N/A', col1X, cursorY, colW);
    drawLabeledField('Celular / WhatsApp', data.phone_mobile, col2X, cursorY, colW);
    cursorY -= 16;

    drawLabeledField('Situação Funcional', data.is_retired ? 'Aposentado' : 'Auditor na Ativa', col1X, cursorY, fullW);
    cursorY -= 20;

    // 3. Filiação Solicitada
    const s3Bottom = drawSectionHeader('3. FILIAÇÃO SOLICITADA', cursorY);
    cursorY = s3Bottom - 16;

    const affiliationStr = getFullAffiliationName(data.affiliation_type);
    const affLabel = 'Entidade(s) para Adesão: ';
    const affLabelW = estimateTextWidth(affLabel, 9.5, true);
    drawText(affLabel, col1X, cursorY, 'F2', 9.5);
    const affLines = wrapText(affiliationStr, fullW - affLabelW, 9.5, false);
    drawText(affLines[0], col1X + affLabelW, cursorY, 'F3', 9.5);
    if (affLines.length > 1) {
        for (let i = 1; i < affLines.length; i++) {
            cursorY -= 13;
            drawText(affLines[i], col1X, cursorY, 'F3', 9.5);
        }
    }
    cursorY -= 24;

    // Quadro de Autorização e Assinatura (com área livre generosa para carimbo Gov.br)
    const boxLeft = 48;
    const boxRight = A4_WIDTH - 48;
    const boxW = boxRight - boxLeft;
    const boxBottom = 94;
    const boxTop = Math.min(cursorY, 370);
    const boxH = Math.max(185, boxTop - boxBottom);

    ops.push(`q 0.9 w 0 G ${boxLeft} ${boxBottom} ${boxW.toFixed(2)} ${boxH.toFixed(2)} re S Q`);

    const authText =
        'Solicito a minha inclusão conforme selecionado acima e autorizo o débito da contribuição mensal ' +
        'em minha conta corrente ou por desconto direto em meus vencimentos na folha de pagamento do TCE-PE. ' +
        'Declaro estar ciente e de acordo com as regras estatutárias das entidades representativas, as quais tive prévio conhecimento.';
    const authLines = wrapText(authText, boxW - 28, 9.5, false);

    let textY = boxTop - 22;
    for (const line of authLines) {
        drawText(line, boxLeft + 14, textY, 'F1', 9.5);
        textY -= 14;
    }

    // Data à esquerda e linha de assinatura à direita (com ~65pt livres acima da linha para assinatura Gov.br)
    const createdDate = new Date(data.created_at || Date.now());
    const dateDay = createdDate.getDate();
    const dateMonth = createdDate.toLocaleString('pt-BR', { month: 'long' });
    const dateYear = createdDate.getFullYear();

    const sigLineY = boxBottom + 34;
    drawText(`Recife - PE, ${dateDay} de ${dateMonth} de ${dateYear}`, boxLeft + 14, sigLineY + 2, 'F1', 10);

    const sigLineX1 = 315;
    const sigLineX2 = boxRight - 20;
    drawLine(sigLineX1, sigLineY, sigLineX2, sigLineY, 0.9);

    const sigCenterX = (sigLineX1 + sigLineX2) / 2;
    const sigTitle = 'ASSINATURA DO ASSOCIADO';
    const sigTitleW = estimateTextWidth(sigTitle, 9, true);
    drawText(sigTitle, sigCenterX - sigTitleW / 2, sigLineY - 13, 'F2', 9);

    const trimmedName = (data.full_name || '').trim();
    const sigNameW = estimateTextWidth(trimmedName, 8.5, false);
    drawText(trimmedName, sigCenterX - sigNameW / 2, sigLineY - 24, 'F1', 8.5, 0.35);

    // Rodapé de autenticidade
    const sentStr = createdDate.toLocaleString('pt-BR');
    drawCenteredText(
        `Este documento é uma representação digital da proposta enviada em ${sentStr} via Site Auditores TCE-PE.`,
        68,
        'F1',
        7.8,
        0.45
    );
    drawCenteredText(`ID de Autenticidade: ${id}`, 56, 'F1', 7.8, 0.45);

    const pdfBytes = buildPdfBinary(ops.join('\n'), logo);
    return new Blob([pdfBytes.slice().buffer], { type: 'application/pdf' });
}

export function buildFichaFileName(fullName: string): string {
    const slug = (fullName || 'associado')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `ficha-admissao-${slug || 'associado'}.pdf`;
}

export async function generateAndDownloadFichaPdf(data: FichaPdfData, id: string): Promise<{ fileName: string; blob: Blob }> {
    const blob = await generateFichaPdfBlob(data, id);
    const fileName = buildFichaFileName(data.full_name);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    return { fileName, blob };
}

export async function openOrDownloadPdfUrl(urlOrPath: string, fileName?: string): Promise<void> {
    if (!urlOrPath) return;

    if (urlOrPath.startsWith('blob:')) {
        window.open(urlOrPath, '_blank', 'noopener,noreferrer');
        return;
    }

    if (urlOrPath.startsWith('data:')) {
        try {
            const parts = urlOrPath.split(',');
            const base64 = parts[1];
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes.buffer], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName || 'ficha-assinada-govbr.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
            return;
        } catch {
            // fallback below
        }
    }

    const isRelativeStoragePath = !urlOrPath.startsWith('http');
    const isSignedFichasUrl = urlOrPath.includes('/signed-fichas/');

    if (isRelativeStoragePath || isSignedFichasUrl) {
        const storagePath = isSignedFichasUrl
            ? decodeURIComponent(urlOrPath.split('/signed-fichas/')[1].split('?')[0])
            : urlOrPath;

        const { data, error } = await supabase.storage
            .from('signed-fichas')
            .createSignedUrl(storagePath, 120);

        if (error || !data?.signedUrl) {
            alert('Acesso restrito: apenas administradores autenticados podem abrir ou baixar o PDF assinado armazenado no cofre.');
            return;
        }

        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    window.open(urlOrPath, '_blank', 'noopener,noreferrer');
}
