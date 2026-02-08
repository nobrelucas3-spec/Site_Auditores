import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const useInactivityTimer = (timeoutMinutes = 15) => {
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const events = ['mousemove', 'keypress', 'scroll', 'click'];

        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
        };

        const handleLogout = async () => {
            await supabase.auth.signOut();
            navigate('/area-do-filiado');
        };

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [navigate, timeoutMinutes]);
};

export default useInactivityTimer;
