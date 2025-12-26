import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseInsert } from '../services/dataHandler';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<'offer' | 'request'>('request');

  // Incident form state
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentContact, setIncidentContact] = useState('');

  // Help form state
  const [helpTitle, setHelpTitle] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [helpCategory, setHelpCategory] = useState('');
  const [helpContact, setHelpContact] = useState('');

  const quickActions = [
    { icon: 'report_problem', label: 'Reportar Incidencia', action: () => setShowIncidentModal(true), color: 'bg-red-500', shadow: 'shadow-red-500/20' },
    { icon: 'shopping_basket', label: 'Publicar Producto', to: '/market', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { icon: 'event_available', label: 'Crear Evento', to: '/calendar', color: 'bg-sky-500', shadow: 'shadow-sky-500/20' },
    { icon: 'diversity_3', label: 'Pedir/Ofrecer Ayuda', action: () => setShowHelpModal(true), color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' }
  ];

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success, isLocal } = await safeSupabaseInsert('incidents', {
        user_id: user?.id,
        title: incidentTitle,
        description: incidentDescription,
        contact_info: incidentContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
        status: 'open'
      });

      if (!success) throw new Error('Falló la creación');
      alert('¡Incidencia reportada con éxito!');
      setShowIncidentModal(false);
      setIncidentTitle('');
      setIncidentDescription('');
      setIncidentContact('');
    } catch (e) {
      console.error(e);
      alert('Error al reportar incidencia');
    }
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('services', {
        user_id: user?.id,
        type: helpType,
        title: helpTitle,
        description: helpDescription,
        category: helpCategory,
        contact_info: helpContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
      });

      if (!success) throw new Error('Falló la publicación');
      alert(helpType === 'offer' ? '¡Servicio ofrecido publicado!' : '¡Solicitud de ayuda publicada!');
      setShowHelpModal(false);
      setHelpTitle('');
      setHelpDescription('');
      setHelpCategory('');
      setHelpContact('');
    } catch (e) {
      console.error(e);
      alert('Error al publicar');
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 font-sans pb-20">
      {/* Hero Section */}
      <section className="relative h-[250px] md:h-[400px] rounded-[40px] overflow-hidden shadow-2xl group flex items-center px-6 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
        <img
          src="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
          alt="Tarragona"
        />
        <div className="relative z-20 max-w-2xl animate-in slide-in-from-left duration-700">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md text-primary-light text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/30">
            <span className="size-2 bg-primary rounded-full animate-ping"></span>
            Tu Barrio en Tiempo Real
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-4">
            HOLA, {user?.user_metadata?.full_name?.split(' ')[0] || 'VECINO'}!
          </h1>
          <p className="text-gray-300 text-sm md:text-lg font-bold max-w-lg leading-relaxed">
            Bienvenido a <span className="text-white underline decoration-primary decoration-4">ComuniTarr</span>. Tu plataforma para conectar, compartir y mejorar <span className="text-white">{user?.user_metadata?.neighborhood || 'tu barrio'}</span>.
          </p>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {quickActions.map((action, idx) => (
          action.to ? (
            <Link key={idx} to={action.to} className="group relative">
              <div className={`p-6 md:p-8 rounded-[35px] ${action.color} h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-1`}>
                <div className="bg-white/20 size-12 md:size-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-lg">
                  <span className="material-symbols-outlined text-white text-3xl md:text-4xl font-black">{action.icon}</span>
                </div>
                <h3 className="text-white font-black text-sm md:text-lg leading-tight uppercase tracking-tight">{action.label}</h3>
                <span className="material-symbols-outlined absolute top-8 right-8 text-white/30 group-hover:text-white transition-all">arrow_forward_ios</span>
              </div>
              <div className={`absolute inset-x-6 -bottom-2 h-4 ${action.color} opacity-20 blur-xl transition-all group-hover:opacity-40`}></div>
            </Link>
          ) : (
            <button key={idx} onClick={action.action} className="group relative text-left">
              <div className={`p-6 md:p-8 rounded-[35px] ${action.color} h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-1`}>
                <div className="bg-white/20 size-12 md:size-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-lg">
                  <span className="material-symbols-outlined text-white text-3xl md:text-4xl font-black">{action.icon}</span>
                </div>
                <h3 className="text-white font-black text-sm md:text-lg leading-tight uppercase tracking-tight">{action.label}</h3>
                <span className="material-symbols-outlined absolute top-8 right-8 text-white/30 group-hover:text-white transition-all">arrow_forward_ios</span>
              </div>
              <div className={`absolute inset-x-6 -bottom-2 h-4 ${action.color} opacity-20 blur-xl transition-all group-hover:opacity-40`}></div>
            </button>
          )
        ))}
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: What You Can Do */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">¿Qué puedes hacer aquí?</h2>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 p-8 rounded-[35px] border-2 border-primary/20">
            <h3 className="text-lg font-black dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              ComuniTarr está lista para ti
            </h3>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Esta plataforma muestra <span className="text-primary font-black">datos de ejemplo</span> para demostración. Al crear nuevo contenido (reportes, eventos, etc.), este se guardará y mostrará, pero los datos preexistentes son ilustrativos.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl">
                <span className="material-symbols-outlined text-red-500 mb-2">report_problem</span>
                <h4 className="font-black text-xs dark:text-white mb-1">REPORTAR INCIDENCIAS</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Problemas en la calle, averías, etc.</p>
              </div>
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl">
                <span className="material-symbols-outlined text-emerald-500 mb-2">shopping_basket</span>
                <h4 className="font-black text-xs dark:text-white mb-1">VENDER O INTERCAMBIAR</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Publica objetos que ya no uses</p>
              </div>
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl">
                <span className="material-symbols-outlined text-sky-500 mb-2">event_available</span>
                <h4 className="font-black text-xs dark:text-white mb-1">ORGANIZAR EVENTOS</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Crea quedadas, talleres o fiestas</p>
              </div>
              <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl">
                <span className="material-symbols-outlined text-indigo-500 mb-2">diversity_3</span>
                <h4 className="font-black text-xs dark:text-white mb-1">PEDIR U OFRECER AYUDA</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Servicios, favores, apoyo mutuo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Widgets */}
        <section className="space-y-10">
          {/* Level Widget */}
          <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80">Nivel de Vecino</p>
              <div className="flex items-end gap-2 mb-6">
                <h3 className="text-5xl font-black tracking-tighter">LVL 1</h3>
                <span className="text-sm font-black mb-1 opacity-80">Nuevo</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div className="h-full bg-white rounded-full w-1/4 shadow-lg"></div>
              </div>
              <p className="text-[10px] font-bold mt-4 opacity-80">Participa para subir de nivel</p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10 rotate-12 transition-transform group-hover:rotate-45 duration-700">stars</span>
          </div>

          {/* Quick Map Widget */}
          <div className="relative h-64 rounded-[40px] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Map Preview"
            />
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
              <div className="size-16 rounded-full bg-white flex items-center justify-center shadow-xl animate-bounce mb-4">
                <span className="material-symbols-outlined text-primary text-3xl font-black">location_on</span>
              </div>
              <h4 className="text-white font-black text-lg leading-tight uppercase tracking-tight mb-2">Explora el Mapa</h4>
              <Link to="/map" className="px-6 py-3 bg-white text-primary text-[10px] font-black rounded-full shadow-lg hover:scale-110 transition-transform uppercase tracking-widest">Abrir Mapa</Link>
            </div>
          </div>
        </section>
      </div>

      {/* Incident Modal */}
      <AnimatePresence>
        {showIncidentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIncidentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Reportar Incidencia</h3>
                <button onClick={() => setShowIncidentModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título</label>
                  <input
                    type="text"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Ej: Farola rota en Calle Mayor"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none resize-none"
                    placeholder="Describe el problema..."
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto (opcional)</label>
                  <input
                    type="text"
                    value={incidentContact}
                    onChange={(e) => setIncidentContact(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Teléfono o email"
                  />
                </div>
                <button type="submit" className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                  Enviar Reporte
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Ayuda Vecinal</h3>
                <button onClick={() => setShowHelpModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Toggle between offer and request */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setHelpType('request')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${helpType === 'request' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Pedir Ayuda
                </button>
                <button
                  type="button"
                  onClick={() => setHelpType('offer')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${helpType === 'offer' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Ofrecer Servicio
                </button>
              </div>

              <form onSubmit={handleHelpSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título</label>
                  <input
                    type="text"
                    value={helpTitle}
                    onChange={(e) => setHelpTitle(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder={helpType === 'offer' ? 'Ej: Clases de guitarra' : 'Ej: Necesito ayuda con mudanza'}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Categoría</label>
                  <input
                    type="text"
                    value={helpCategory}
                    onChange={(e) => setHelpCategory(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Ej: Educación, Hogar, Transporte..."
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea
                    value={helpDescription}
                    onChange={(e) => setHelpDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none resize-none"
                    placeholder="Detalles..."
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto</label>
                  <input
                    type="text"
                    value={helpContact}
                    onChange={(e) => setHelpContact(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Teléfono o email"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                  Publicar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
