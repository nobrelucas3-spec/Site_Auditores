export enum NewsCategory {
  INSTITUCIONAL = 'Institucional',
  JURIDICO = 'Jurídico',
  EVENTOS = 'Eventos',
  NA_MIDIA = 'Na Mídia',
  ARTIGOS = 'Artigos',
  ARQUIVO = 'Arquivo',
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML or Markdown content
  date: string;
  imageUrl: string;
  category: NewsCategory;
  author?: string;
  isHighlight?: boolean;
  customLink?: string;
  imagePosition?: 'top' | 'center' | 'bottom';
  imageCaption?: string;
  hideCoverInArticle?: boolean;
}

export interface ServiceLink {
  title: string;
  items?: { name: string; link: string }[];
  iconName?: string;
  image?: string;
  description: string;
  link: string;
}

export interface PartnerLink {
  name: string;
  discount: string;
  category: string;
  image: string;
  description: string;
  link?: string;
}

export type PautaCategory =
  | 'Carreira e Remuneração'
  | 'Condições de Trabalho'
  | 'Prerrogativas'
  | 'Saúde e Benefícios'
  | 'Tecnologia e Processos'
  | 'Institucional'
  | 'Outros';

export type PautaStatus =
  | 'aberta'
  | 'em_analise_de'
  | 'priorizada_de'
  | 'em_negociacao'
  | 'atendida'
  | 'arquivada'
  | 'unificada';

export interface Pauta {
  id: string;
  title: string;
  category: PautaCategory | string;
  description: string;
  status: PautaStatus | string;
  is_prioritized: boolean;
  priority_note?: string | null;
  de_considerations?: string | null;
  current_progress?: string | null;
  support_count: number;
  oppose_count: number;
  score: number;
  created_by?: string;
  unified_into_pauta_id?: string | null;
  created_at: string;
  updated_at: string;
  // Campos locais agregados pelo frontend:
  user_vote?: 'support' | 'oppose' | null;
}

export interface PautaVote {
  id: string;
  pauta_id: string;
  user_id: string;
  vote_type: 'support' | 'oppose';
  created_at: string;
  updated_at: string;
}

export interface PautaUpdate {
  id: string;
  pauta_id: string;
  title: string;
  description: string;
  event_date: string;
  created_at: string;
}

export interface DEMeeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time?: string | null;
  meeting_type: string;
  location?: string | null;
  status: 'agendada' | 'realizada' | 'cancelada' | string;
  general_deliberations?: string | null;
  created_at: string;
  updated_at?: string;
  // Vínculos populados
  linked_pautas?: MeetingPauta[];
}

export interface MeetingPauta {
  id: string;
  meeting_id: string;
  pauta_id: string;
  discussion_notes?: string | null;
  deliberation_result?: string | null;
  created_at?: string;
  pauta?: Pauta;
}
