export interface CalendarMeetingData {
    title: string;
    meeting_date: string;
    meeting_time?: string | null;
    meeting_type?: string | null;
    location?: string | null;
    general_deliberations?: string | null;
    meeting_pautas?: Array<{
        pautas?: { title: string; category?: string } | null;
        discussion_notes?: string | null;
        deliberation_result?: string | null;
    }>;
}

export const getGoogleCalendarUrl = (meeting: CalendarMeetingData): string => {
    const text = encodeURIComponent(meeting.title || 'Reunião da Diretoria Executiva');

    const dateClean = (meeting.meeting_date || '').replace(/-/g, '');
    let startTime = '140000';
    let endTime = '160000';

    if (meeting.meeting_time && meeting.meeting_time.includes(':')) {
        const [h, m] = meeting.meeting_time.split(':');
        const startH = parseInt(h, 10);
        const endH = (startH + 2) % 24;
        startTime = `${h.padStart(2, '0')}${m.padStart(2, '0')}00`;
        endTime = `${String(endH).padStart(2, '0')}${m.padStart(2, '0')}00`;
    }

    const dates = `${dateClean}T${startTime}/${dateClean}T${endTime}`;

    let detailsText = `Reunião da Diretoria Executiva - Auditores TCE-PE\nTipo: ${meeting.meeting_type || 'Ordinária'}\n\n`;

    if (meeting.meeting_pautas && meeting.meeting_pautas.length > 0) {
        detailsText += `📋 PAUTAS DA ORDEM DO DIA:\n`;
        meeting.meeting_pautas.forEach((mp, idx) => {
            const pTitle = mp.pautas?.title || 'Pauta da Categoria';
            const pCat = mp.pautas?.category ? `[${mp.pautas.category}] ` : '';
            detailsText += `${idx + 1}. ${pCat}${pTitle}\n`;
            if (mp.deliberation_result) {
                detailsText += `   ↳ Deliberação: ${mp.deliberation_result}\n`;
            }
        });
        detailsText += `\n`;
    }

    if (meeting.general_deliberations) {
        detailsText += `📝 DELIBERAÇÕES GERAIS:\n${meeting.general_deliberations}\n\n`;
    }

    detailsText += `Consulte e participe das deliberações na Área do Filiado: https://auditorestcepe.org.br/#/area-do-filiado/pautas`;

    const details = encodeURIComponent(detailsText);
    const location = encodeURIComponent(meeting.location || 'Sede da Associação / Online');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&ctz=America/Recife`;
};
