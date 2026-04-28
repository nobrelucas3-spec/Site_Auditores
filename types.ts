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
