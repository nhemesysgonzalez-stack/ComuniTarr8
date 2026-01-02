import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const Invite: React.FC = () => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const promoText = `👋 ¡Hola, Vecino de Tarragona! ¿Conoces el secreto mejor guardado de tu barrio?

Presentamos ComuniTarr, la Web App que está transformando la vida vecinal en Tarragona. ¡No necesitas descargar nada! Simplemente escanea el código QR y entra.

ComuniTarr es tu Super App Comunitaria, con funcionalidades que te harán la vida más fácil y conectada:
🏡 BARRIO VIVO: Conexión y Ocio
Feed del Barrio: Entérate de lo que pasa en tu calle en tiempo real.
Foro Vecinal: Resuelve dudas, comparte ideas y debate con tus vecinos.
Quedadas y Clubs: Organiza o únete a actividades de ocio y aficiones.
Comercio Local: Descubre ofertas exclusivas y apoya a los negocios de tu zona.

🛡️ SEGURIDAD Y UTILIDAD: Apoyo Mutuo
Ayuda Mutua: Pide o ofrece ayuda a otros vecinos con un clic (favores, herramientas, etc.).
Patrullas y Emergencias: Accede a información de seguridad y reporta incidencias de forma rápida.
Mercadillo: Compra, vende o intercambia artículos de segunda mano en tu comunidad.

🤝 ACCIÓN SOCIAL: Haz la Diferencia
Micro-Voluntarios: Participa en pequeñas acciones solidarias que mejoran tu entorno.
Círculos de Apoyo: Encuentra o forma grupos para apoyo emocional o temático.

✨ ¡Y mucho más! Incluyendo un Mapa Interactivo, Calendario de Eventos y un Asistente IA para ayudarte en lo que necesites.

¿A qué esperas para unirte a la comunidad más activa de Tarragona?

🔗 Visita: https://tarragonavecinal.vercel.app

#ComuniTarr #Tarragona #BarriosTarragona #Webapp #VecinosConectados #ComercioLocal #AyudaMutua`;

    const handleCopy = () => {
        navigator.clipboard.writeText(promoText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        { name: 'WhatsApp', icon: 'chat', color: 'bg-[#25D366]', link: `https://wa.me/?text=${encodeURIComponent(promoText)}` },
        { name: 'Telegram', icon: 'send', color: 'bg-[#0088cc]', link: `https://t.me/share/url?url=https://tarragonavecinal.vercel.app&text=${encodeURIComponent(promoText)}` },
        { name: 'Facebook', icon: 'facebook', color: 'bg-[#1877F2]', link: `https://www.facebook.com/sharer/sharer.php?u=https://tarragonavecinal.vercel.app` },
    ];

    return (
        <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-12 pb-20 font-sans">
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="size-20 bg-primary/10 text-primary rounded-[30px] flex items-center justify-center mx-auto mb-6"
                >
                    <span className="material-symbols-outlined text-4xl font-black">campaign</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter uppercase leading-none">
                    KITS DE <span className="text-primary italic">DIFUSIÓN</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg mx-auto">
                    Ayúdanos a hacer crecer ComuniTarr en tu barrio. ¡Cuantos más seamos, más fuerte será nuestra comunidad!
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: QR and Download */}
                <section className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[40px] border-4 border-dashed border-gray-200 dark:border-gray-800 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img
                            src="/img/qr_official.png"
                            alt="QR Code"
                            className="w-48 md:w-64 h-auto rounded-3xl relative z-10 shadow-2xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Tu Código QR</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Imprímelo o enséñalo en tu móvil</p>
                    </div>
                    <button className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-4 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all">
                        <span className="material-symbols-outlined">download</span>
                        DESCARGAR QR KIT
                    </button>
                </section>

                {/* Right: Text Copy and Share */}
                <section className="space-y-6">
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Mensaje Viral</h3>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${copied ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-sm">{copied ? 'done' : 'content_copy'}</span>
                                {copied ? '¡COPIADO!' : 'COPIAR'}
                            </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl h-[250px] overflow-y-auto text-xs font-bold text-gray-500 dark:text-gray-300 leading-relaxed custom-scrollbar">
                            {promoText.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {shareOptions.map((opt) => (
                            <a
                                key={opt.name}
                                href={opt.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${opt.color} text-white p-4 rounded-[30px] flex flex-col items-center justify-center gap-2 hover:scale-110 transition-all shadow-lg`}
                            >
                                <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{opt.name}</span>
                            </a>
                        ))}
                    </div>
                </section>
            </div>

            {/* Marketing Advice */}
            <section className="bg-primary/5 p-8 rounded-[40px] border border-primary/10 space-y-6">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined">lightbulb</span>
                    CONSEJOS PARA LA DIFUSIÓN
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'GRUPOS DE WHATSAPP', desc: 'Comparte el mensaje en el grupo de tu comunidad de vecinos o del colegio.' },
                        { title: 'COMERCIO LOCAL', desc: 'Pide a tu panadería o bar de confianza que pongan el QR en el mostrador.' },
                        { title: 'REDES SOCIALES', desc: 'Sube el QR a tus Stories de Instagram mencionando a @Tarragona_App.' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-2">
                            <p className="text-xs font-black text-primary uppercase tracking-widest">{item.title}</p>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Invite;
