import { supabase } from './supabaseClient';

/**
 * Servicio de Alertas Externas (Simulación de Conexión VENTCAT / PLASEQTA)
 * Este servicio conecta ComuniTarr con los feeds oficiales de Protección Civil.
 */

export interface ExternalAlert {
    id: string;
    source: 'VENTCAT' | 'PLASEQTA' | 'PROCICAT';
    level: 'amarillo' | 'naranja' | 'rojo';
    message: string;
    timestamp: string;
}

export const alertService = {
    /**
     * Suscribe la aplicación a cambios en la base de datos o simula consulta a API externa
     */
    async checkOfficialAlerts(): Promise<ExternalAlert | null> {
        // Aquí normalmente haríamos un fetch a un endpoint de la Generalitat o un RSS
        // Para la demo, simulamos que detectamos el aviso que acaba de llegar

        // Obtenemos alertas activas de Supabase (donde nuestro backend las enviaría)
        const { data } = await supabase
            .from('announcements')
            .select('*')
            .eq('category', 'TIEMPO')
            .order('created_at', { ascending: false })
            .limit(1);

        if (data && data[0]) {
            return {
                id: data[0].id,
                source: 'VENTCAT',
                level: 'naranja',
                message: data[0].content,
                timestamp: data[0].created_at
            };
        }

        return null;
    },

    /**
     * Lógica para enviar Notificación Push del Sistema (Browser)
     */
    sendSystemNotification(alert: ExternalAlert) {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(`🚨 ALERTA ${alert.source}: TARRAGONA`, {
                body: alert.message,
                icon: '/favicon.ico', // O un icono de alerta
                tag: 'emergency-alert'
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.sendSystemNotification(alert);
                }
            });
        }
    }
};
