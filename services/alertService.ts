import { supabase } from './supabaseClient';

/**
 * Servicio de Alertas Oficiales – ComuniTarr
 *
 * Solo lee alertas reales almacenadas en la tabla `announcements` con las
 * categorías TIEMPO, SEGURIDAD o ALERTA. No rasca noticias externas ni
 * genera falsas emergencias automáticamente.
 */

export interface ExternalAlert {
    id: string;
    source: 'VENTCAT' | 'PLASEQTA' | 'PROCICAT' | 'PCTGN';
    level: 'amarillo' | 'naranja' | 'rojo' | 'verde';
    message: string;
    description?: string;
    timestamp: string;
}

export const alertService = {
    /**
     * Devuelve la alerta oficial más reciente del día, si existe en `announcements`.
     * Categorías admitidas: TIEMPO, SEGURIDAD, ALERTA.
     * Nunca genera alertas automáticas desde fuentes externas no verificadas.
     */
    async checkOfficialAlerts(): Promise<ExternalAlert | null> {
        try {
            const { data } = await supabase
                .from('announcements')
                .select('id, category, title, content, created_at')
                .in('category', ['TIEMPO', 'SEGURIDAD', 'ALERTA'])
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data[0]) {
                const hoyStr = new Date().toDateString();
                const esDeHoy = new Date(data[0].created_at).toDateString() === hoyStr;
                if (esDeHoy) {
                    return {
                        id: data[0].id,
                        source: data[0].category === 'TIEMPO' ? 'VENTCAT' : 'PCTGN',
                        level: 'naranja',
                        message: data[0].content ?? data[0].title,
                        timestamp: data[0].created_at,
                    };
                }
            }
        } catch (error) {
            console.error('Error al comprobar alertas oficiales:', error);
        }

        return null;
    },

    /**
     * Envía una notificación push del navegador solo cuando hay una alerta real.
     */
    sendSystemNotification(alert: ExternalAlert) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        const sourceLabel = alert.source === 'PCTGN' ? 'PROTECCIÓ CIVIL TARRAGONA' : alert.source;
        new Notification(`🚨 ${sourceLabel}: AVISO`, {
            body: alert.message,
            icon: '/favicon.ico',
            tag: 'emergency-alert',
            silent: false,
        });
    },
};
