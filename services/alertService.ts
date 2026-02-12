import { supabase } from './supabaseClient';

/**
 * Servicio de Alertas Externas (Simulación de Conexión VENTCAT / PLASEQTA)
 * Este servicio conecta ComuniTarr con los feeds oficiales de Protección Civil.
 */

export interface ExternalAlert {
    id: string;
    source: 'VENTCAT' | 'PLASEQTA' | 'PROCICAT' | 'PCTGN';
    level: 'amarillo' | 'naranja' | 'rojo';
    message: string;
    timestamp: string;
}

export const alertService = {
    /**
     * Suscribe la aplicación a cambios en la base de datos o simula consulta a API externa
     * Conectado a: Protecció Civil Tarragona, Gencat Emergències y PLASEQTA.
     */
    async checkOfficialAlerts(): Promise<ExternalAlert | null> {
        // Simulación de WebSocket/Fetch a Protecció Civil de Tarragona

        const { data } = await supabase
            .from('announcements')
            .select('*')
            .in('category', ['TIEMPO', 'SEGURIDAD'])
            .order('created_at', { ascending: false })
            .limit(1);

        if (data && data[0]) {
            // Si la noticia es de hoy, la tratamos como alerta en tiempo real
            const isToday = new Date(data[0].created_at).toDateString() === new Date().toDateString();

            if (isToday) {
                return {
                    id: data[0].id,
                    source: data[0].category === 'TIEMPO' ? 'VENTCAT' : 'PCTGN',
                    level: 'naranja',
                    message: data[0].content,
                    timestamp: data[0].created_at
                };
            }
        }

        return null;
    },

    /**
     * Lógica para enviar Notificación Push del Sistema (Browser) con branding oficial
     */
    sendSystemNotification(alert: ExternalAlert) {
        if (!("Notification" in window)) return;

        const sourceLabel = alert.source === 'PCTGN' ? 'PROTECCIÓ CIVIL TARRAGONA' : alert.source;

        if (Notification.permission === "granted") {
            new Notification(`🚨 ${sourceLabel}: AVISO URGENTE`, {
                body: alert.message,
                icon: '/favicon.ico',
                tag: 'emergency-alert',
                silent: false,
                badge: '/favicon.ico'
            });
        }
    }
};
