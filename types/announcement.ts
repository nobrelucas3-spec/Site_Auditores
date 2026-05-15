export type AnnouncementSeverity = 'info' | 'warning' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  severity: AnnouncementSeverity;
  category: string;
  isRead?: boolean; // Usado localmente para o sistema de alertas
}
