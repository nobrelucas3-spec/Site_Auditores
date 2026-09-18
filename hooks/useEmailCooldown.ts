import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar contagem regressiva de reenvio de e-mail (2 minutos por padrão)
 * com persistência em sessionStorage para manter a contagem mesmo após F5/recarregamento.
 */
export const useEmailCooldown = (storageKey: string = 'default', defaultSeconds: number = 120) => {
    const fullKey = `email_cooldown_${storageKey.trim().toLowerCase()}`;

    const getRemainingSeconds = useCallback(() => {
        try {
            const savedExpiry = sessionStorage.getItem(fullKey);
            if (!savedExpiry) return 0;
            const expiryTime = parseInt(savedExpiry, 10);
            if (isNaN(expiryTime)) return 0;
            const diff = Math.ceil((expiryTime - Date.now()) / 1000);
            return diff > 0 ? diff : 0;
        } catch {
            return 0;
        }
    }, [fullKey]);

    const [timeLeft, setTimeLeft] = useState<number>(getRemainingSeconds);

    // Efeito para sincronizar ao mudar a chave de storage (ex: e-mail digitado)
    useEffect(() => {
        setTimeLeft(getRemainingSeconds());
    }, [getRemainingSeconds]);

    // Timer de contagem regressiva
    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    try {
                        sessionStorage.removeItem(fullKey);
                    } catch {}
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, fullKey]);

    const startCooldown = useCallback((seconds: number = defaultSeconds) => {
        const expiryTime = Date.now() + seconds * 1000;
        try {
            sessionStorage.setItem(fullKey, expiryTime.toString());
        } catch {}
        setTimeLeft(seconds);
    }, [fullKey, defaultSeconds]);

    // Formata segundos para mm:ss (ex: "01:59", "00:45")
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return {
        timeLeft,
        isCoolingDown: timeLeft > 0,
        formattedTime,
        startCooldown
    };
};

export default useEmailCooldown;
