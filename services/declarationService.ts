import { supabase } from './supabaseClient';

export type DeclarationPurpose = 'fisco_saude' | 'geral' | 'custom';
export type DeclarationEntityType = 'associacao' | 'sindicato';

export interface DeclarationRecord {
    verification_code: string;
    member_name: string;
    member_matricula: string;
    entity_type: DeclarationEntityType;
    purpose: DeclarationPurpose;
    custom_recipient?: string;
    issued_at: string;
    valid_until: string;
    status: 'valid' | 'expired' | 'revoked';
    signer_name: string;
    signer_role: string;
}

export interface VerificationResult {
    valid: boolean;
    reason?: string;
    record?: DeclarationRecord;
}

export interface EntityMetadata {
    article: 'A' | 'O';
    fullName: string;
    shortName: string;
    cnpj: string;
    logoUrl: string;
    signerName: string;
    memberLabel: string;
    groupLabel: string;
    statusValidText: string;
    footerTitle: string;
}

export const ENTITY_CONFIG: Record<DeclarationEntityType, EntityMetadata> = {
    associacao: {
        article: 'A',
        fullName: 'Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco',
        shortName: 'AUDITORES-TCE/PE',
        cnpj: '09.457.898/0001-04',
        logoUrl: '/logo-declaracao.png',
        signerName: 'AUDITORES-TCE/PE',
        memberLabel: 'associado(a) ativo(a)',
        groupLabel: 'quadro de associados desta entidade',
        statusValidText: 'Associado(a) Ativo(a) e Regular com as obrigações estatutárias',
        footerTitle: 'Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco – AUDITORES TCE/PE',
    },
    sindicato: {
        article: 'O',
        fullName: 'Sindicato dos Auditores do Tribunal de Contas do Estado de Pernambuco',
        shortName: 'AUDITORES SINDICAL',
        cnpj: '17.780.088/0001-04',
        logoUrl: '/logo-sindicato.jpg',
        signerName: 'AUDITORES SINDICAL – TCE/PE',
        memberLabel: 'filiado(a) ativo(a)',
        groupLabel: 'quadro de filiados desta entidade sindical',
        statusValidText: 'Filiado(a) Ativo(a) e Regular com as obrigações estatutárias',
        footerTitle: 'Sindicato dos Auditores do Tribunal de Contas do Estado de Pernambuco – AUDITORES SINDICAL',
    },
};

export const INSTITUTION_INFO = {
    fullName: ENTITY_CONFIG.associacao.fullName,
    shortName: ENTITY_CONFIG.associacao.shortName,
    cnpj: ENTITY_CONFIG.associacao.cnpj,
    address: 'Rua da Aurora, nº 985 (esquina com Travessa do Costa), Santo Amaro, Recife - PE, CEP: 50040-090',
    phone: '(81) 9 9163-0278',
    fiscoSaudeName: 'Fisco Saúde',
    fiscoSaudeCnpj: '11.996.146/0001-55',
    defaultSignerName: ENTITY_CONFIG.associacao.signerName,
    defaultSignerRole: 'Assinado e autenticado eletronicamente pelo Portal Oficial',
    validityDays: 60,
};

function sanitizeRecipient(raw?: string | null): string | undefined {
    const cleaned = (raw || '').replace(/[<>]/g, '').trim().slice(0, 140);
    return cleaned || undefined;
}

function normalizeRecord(raw: Record<string, unknown>): DeclarationRecord {
    const verificationCode = String(raw.verification_code || '').toUpperCase();
    const entityRaw = String(raw.entity_type || '').toLowerCase();
    const entityType: DeclarationEntityType =
        entityRaw === 'sindicato' || (!entityRaw && verificationCode.startsWith('SIN-'))
            ? 'sindicato'
            : 'associacao';

    const purposeRaw = String(raw.purpose || 'fisco_saude');
    const purpose: DeclarationPurpose =
        purposeRaw === 'geral' || purposeRaw === 'custom' ? purposeRaw : 'fisco_saude';

    const statusRaw = String(raw.status || 'valid');
    const status: 'valid' | 'expired' | 'revoked' =
        statusRaw === 'expired' || statusRaw === 'revoked' ? statusRaw : 'valid';

    return {
        verification_code: verificationCode,
        member_name: String(raw.member_name || ''),
        member_matricula: String(raw.member_matricula || ''),
        entity_type: entityType,
        purpose,
        custom_recipient: raw.custom_recipient ? sanitizeRecipient(String(raw.custom_recipient)) : undefined,
        issued_at: String(raw.issued_at || ''),
        valid_until: String(raw.valid_until || ''),
        status,
        signer_name: String(raw.signer_name || ENTITY_CONFIG[entityType].signerName),
        signer_role: String(raw.signer_role || INSTITUTION_INFO.defaultSignerRole),
    };
}

export function buildValidationUrl(record: DeclarationRecord): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://auditorestcepe.org.br';
    return `${origin}/#/validar-declaracao?code=${encodeURIComponent(record.verification_code)}`;
}

export async function issueDeclaration(
    purpose: DeclarationPurpose = 'fisco_saude',
    customRecipient?: string,
    entityType: DeclarationEntityType = 'associacao'
): Promise<DeclarationRecord> {
    const cleanRecipient = purpose === 'custom' ? sanitizeRecipient(customRecipient) : undefined;

    const { data, error } = await supabase.rpc('issue_membership_declaration', {
        p_purpose: purpose,
        p_custom_recipient: cleanRecipient ?? null,
        p_entity_type: entityType,
    });

    if (error) {
        throw new Error(
            'Não foi possível emitir a declaração no servidor oficial. Verifique sua conexão e tente novamente.'
        );
    }

    if (!data || data.ok !== true) {
        throw new Error(
            (data && typeof data.message === 'string' && data.message) ||
                'Emissão não autorizada para este cadastro.'
        );
    }

    return normalizeRecord(data as Record<string, unknown>);
}

export async function verifyDeclaration(code: string): Promise<VerificationResult> {
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
        return {
            valid: false,
            reason: 'Informe o código de autenticidade para verificar o documento.',
        };
    }

    const { data, error } = await supabase.rpc('verify_membership_declaration', {
        p_code: cleanCode,
    });

    if (error || !data) {
        return {
            valid: false,
            reason: 'Não foi possível consultar a base oficial no momento. Tente novamente em instantes.',
        };
    }

    const rpcRes = data as { valid?: boolean; reason?: string; record?: Record<string, unknown> };
    if (rpcRes.valid === true && rpcRes.record) {
        return {
            valid: true,
            record: normalizeRecord(rpcRes.record),
        };
    }

    return {
        valid: false,
        reason: rpcRes.reason || 'Código de autenticidade não encontrado na base oficial da entidade.',
        record: rpcRes.record ? normalizeRecord(rpcRes.record) : undefined,
    };
}

export function getPurposeLabel(purpose: DeclarationPurpose, customRecipient?: string): string {
    if (purpose === 'fisco_saude') {
        return `Fins Gerais e Convênio Fisco Saúde (CNPJ: ${INSTITUTION_INFO.fiscoSaudeCnpj})`;
    }
    if (purpose === 'custom') {
        return customRecipient
            ? `Fins de comprovação junto a ${customRecipient}`
            : 'Fins Específicos / Convênios';
    }
    return 'Fins Gerais — Comprovação de Vínculo e Regularidade';
}
