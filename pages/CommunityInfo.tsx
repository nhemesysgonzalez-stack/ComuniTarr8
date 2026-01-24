import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CommunityInfo: React.FC = () => {
    const { t, language } = useLanguage();

    // Content tailored for Spanish based on user request, but structurally ready for other languages if expanded
    const content = {
        es: {
            title_prefix: 'Centralizando la vida de',
            title_highlight: 'Tarragona',
            mission: 'ComuniTarr nace con una misión clara: unir a todos los vecinos en una sola plataforma digital, facilitando la colaboración, la seguridad y el comercio local. Queremos recuperar el sentido de comunidad.',

            rules_title: 'Código de Convivencia',
            rules_subtitle: 'Reglas fundamentales para una comunidad sana',
            rules: [
                { title: 'CERO Bullying y Acoso', desc: 'No se tolera el acoso, la intimidación ni el ciberbullying. Respeto absoluto entre vecinos.', icon: 'block', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                { title: 'CERO Racismo y Odio', desc: 'Nuestra comunidad es diversa. Discriminación por raza, religión, género u origen resultará en expulsión inmediata.', icon: 'public', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { title: 'Respeto y Educación', desc: 'Trata a los demás como te gustaría ser tratado. La amabilidad es el pegamento de este barrio.', icon: 'sentiment_satisfied', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { title: 'Seguridad y Privacidad', desc: 'Protege la información de tus vecinos. No compartas datos sensibles sin permiso.', icon: 'verified_user', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
            ],

            features_title: 'Lo que encontrarás en tu Menú',
            features_desc: 'Herramientas diseñadas para potenciar la vida vecinal.',
            features: [
                { title: 'Avisos y Alertas', desc: 'Mantente informado sobre cortes de agua, obras o emergencias en tiempo real.', icon: 'campaign' },
                { title: 'Foro: Empleo y Talento', desc: 'Encuentra trabajo en tu propio barrio o publica vacantes para tus vecinos.', icon: 'work' },
                { title: 'Seguridad y Preppers', desc: 'Preparación para el entorno petroquímico y protocolos PLASEQTA.', icon: 'shield' },
                { title: 'Mercado Local', desc: 'Apoya a los comercios de tu barrio y encuentra gangas cerca de ti.', icon: 'storefront' },
                { title: 'Ayuda Mutua', desc: 'Ofrece tus habilidades o pide ayuda para tareas puntuales. Solidaridad.', icon: 'handshake' },
                { title: 'Mapa Interactivo', desc: 'Explora recursos, comercios e incidencias en el mapa real de Tarragona.', icon: 'explore' },
                { title: 'Asistente IA', desc: 'Nuestro asistente digital para resolver cualquier duda sobre la ciudad.', icon: 'handshake' },
                { title: 'Calendario', desc: 'No te pierdas ningún evento, fiesta o curso en tu barrio.', icon: 'calendar_month' }
            ],

            philosophy_title: 'Una App Viva, no Impuesta',
            philosophy_desc: 'ComuniTarr es una herramienta creada para los vecinos y por los vecinos. Aquí la interacción es total: nada está impuesto, la comunidad es quien le da vida día a día con sus historias, avisos y ayuda mutua.',

            final_message: 'Juntos hacemos barrio. Únete y participa activamente.'
        },
        // Fallback for other languages (simplified for this task)
        en: {
            title_prefix: 'Centralizing life in',
            title_highlight: 'Tarragona',
            mission: 'ComuniTarr is born with a clear mission: to unite all neighbors in a single digital platform, facilitating collaboration, security, and local commerce.',
            rules_title: 'Code of Conduct',
            rules_subtitle: 'Fundamental rules for a healthy community',
            rules: [
                { title: 'ZERO Bullying', desc: 'Harassment or cyberbullying is not tolerated.', icon: 'block', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                { title: 'ZERO Racism', desc: 'Discrimination results in immediate ban.', icon: 'public', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { title: 'Respect', desc: 'Treat others as you wish to be treated.', icon: 'sentiment_satisfied', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { title: 'Safety', desc: 'Protect neighbor privacy.', icon: 'verified_user', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
            ],
            features_title: 'Main Functions',
            features_desc: 'Tools designed to empower neighborhood life.',
            features: [
                { title: 'Alerts', desc: 'Stay informed about emergencies.', icon: 'campaign' },
                { title: 'Local Market', desc: 'Support local businesses.', icon: 'storefront' },
                { title: 'Mutual Aid', desc: 'Offer skills or ask for help.', icon: 'handshake' },
                { title: 'Safety', desc: 'Keep streets safe.', icon: 'shield' }
            ],
            final_message: 'Together we make the neighborhood.'
        },
        ca: {
            title_prefix: 'Centralitzant la vida a',
            title_highlight: 'Tarragona',
            mission: 'ComuniTarr neix amb una missió clara: unir a tots els veïns en una sola plataforma digital, facilitant la col·laboració, la seguretat i el comerç local.',
            rules_title: 'Codi de Convivència',
            rules_subtitle: 'Regles fonamentals per a una comunitat sana',
            rules: [
                { title: 'ZERO Bullying', desc: 'No es tolera l’assetjament ni la intimidació.', icon: 'block', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                { title: 'ZERO Racisme', desc: 'La discriminació comporta expulsió immediata.', icon: 'public', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { title: 'Respecte', desc: 'Tracta als altres com t’agradaria ser tractat.', icon: 'sentiment_satisfied', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { title: 'Seguretat', desc: 'Protegeix la privacitat dels veïns.', icon: 'verified_user', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
            ],
            features_title: 'Funcions Principals',
            features_desc: 'Eines dissenyades per potenciar la vida veïnal.',
            features: [
                { title: 'Avisos', desc: 'Estigues informat sobre emergències.', icon: 'campaign' },
                { title: 'Mercat Local', desc: 'Suporta els comerços del teu barri.', icon: 'storefront' },
                { title: 'Ajuda Mútua', desc: 'Ofereix habilitats o demana ajuda.', icon: 'handshake' },
                { title: 'Seguretat', desc: 'Mantingues els carrers segurs.', icon: 'shield' }
            ],
            final_message: 'Junts fem barri.'
        },
        fr: {
            title_prefix: 'Centraliser la vie à',
            title_highlight: 'Tarragone',
            mission: 'ComuniTarr est née avec une mission claire : unir tous les voisins sur une seule plateforme numérique, facilitant la collaboration et la sécurité.',
            rules_title: 'Code de Conduite',
            rules_subtitle: 'Règles fondamentales pour une communauté saine',
            rules: [
                { title: 'ZERO Intimidation', desc: 'Le harcèlement n\'est pas toléré.', icon: 'block', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                { title: 'ZERO Racisme', desc: 'La discrimination entraîne une exclusion immédiate.', icon: 'public', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { title: 'Respect', desc: 'Traitez les autres comme vous voudriez être traité.', icon: 'sentiment_satisfied', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { title: 'Sécurité', desc: 'Protégez la vie privée des voisins.', icon: 'verified_user', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
            ],
            features_title: 'Fonctions Principales',
            features_desc: 'Outils conçus pour améliorer la vie de quartier.',
            features: [
                { title: 'Alertes', desc: 'Restez informé des urgences.', icon: 'campaign' },
                { title: 'Marché Local', desc: 'Soutenez les commerces locaux.', icon: 'storefront' },
                { title: 'Entraide', desc: 'Offrez des compétences ou demandez de l\'aide.', icon: 'handshake' },
                { title: 'Sécurité', desc: 'Gardez les rues sûres.', icon: 'shield' }
            ],
            final_message: 'Ensemble, nous faisons le quartier.'
        }
    };

    // Helper to get content safely with fallback to 'es'
    const c = content[language] || content['es'];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background-dark p-6 md:p-12 space-y-16 font-sans pb-20">

            {/* Header / Intro */}
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-widest">
                    {t('about')}
                </span>
                <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                    {c.title_prefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">{c.title_highlight}</span>.
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed font-bold max-w-3xl mx-auto">
                    {c.mission}
                </p>
            </div>

            {/* Rules Section (Highlighted) */}
            <section className="max-w-5xl mx-auto w-full">
                <div className="bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-primary"></div>
                    <div className="p-8 md:p-12">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{c.rules_title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{c.rules_subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {c.rules.map((rule, idx) => (
                                <div key={idx} className={`p-6 rounded-3xl border border-gray-100 dark:border-gray-800 transition-all hover:scale-[1.02] hover:shadow-lg ${rule.bg}`}>
                                    <div className="flex items-start gap-4">
                                        <span className={`material-symbols-outlined text-4xl ${rule.color}`}>{rule.icon}</span>
                                        <div>
                                            <h3 className={`text-xl font-black mb-1 ${rule.color}`}>{rule.title}</h3>
                                            <p className="text-sm font-bold opacity-80 dark:text-gray-300 leading-relaxed">
                                                {rule.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Functions Section */}
            <section className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{c.features_title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{c.features_desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {c.features.map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-surface-dark p-8 rounded-[30px] shadow-lg border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                            </div>
                            <h3 className="text-lg font-black dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="max-w-4xl mx-auto text-center py-10">
                <div className="bg-primary/5 dark:bg-primary/10 p-10 md:p-16 rounded-[60px] border border-primary/20">
                    <span className="material-symbols-outlined text-6xl text-primary mb-6">workspace_premium</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{c.philosophy_title}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 font-bold leading-relaxed italic">
                        "{c.philosophy_desc}"
                    </p>
                </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-10 border-t border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
                <h3 className="text-2xl font-black text-gray-400 dark:text-gray-600 uppercase tracking-tight">
                    {c.final_message}
                </h3>
            </div>
        </div>
    );
};

export default CommunityInfo;
