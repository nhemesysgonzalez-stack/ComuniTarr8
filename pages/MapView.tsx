import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';

const MapView: React.FC = () => {
  const { user } = useAuth();
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const [pins, setPins] = useState<any[]>([
    { id: 1, type: 'cleanup', x: '51%', y: '64%', title: 'Retirada Ramas', desc: 'Brigada municipal troceando árbol caído ayer.', status: 'En Proceso', color: 'bg-emerald-500', icon: 'forest', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]' },
    { id: 2, type: 'event', x: '45%', y: '80%', title: 'Concierto Sala Zero', desc: 'Tributo a Queen. Apertura puertas 20:30.', status: 'Esta Noche', color: 'bg-purple-500', icon: 'music_note', glow: 'shadow-[0_0_35px_rgba(168,85,247,0.5)]' },
    { id: 3, type: 'incident', x: '75%', y: '45%', title: 'Semáforo Averiado', desc: 'Intermitente tras el viento. Policía regulando.', status: 'Precaución', color: 'bg-yellow-500', icon: 'traffic', glow: 'shadow-[0_0_40px_rgba(234,179,8,0.6)]' },
    { id: 4, type: 'event', x: '42%', y: '35%', title: 'Vermut Fòrum', desc: 'Preparativos para mañana. Escenario montado.', status: 'Mañana', color: 'bg-orange-500', icon: 'celebration', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]' },
    { id: 5, type: 'cleanup', x: '15%', y: '65%', title: 'Charla Prepper', desc: 'Centro Cívico Torreforta. Tema: Riesgo Químico.', status: 'Sábado 17h', color: 'bg-gray-700', icon: 'masks' }
  ]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [followedPins, setFollowedPins] = useState<number[]>([]);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportType, setNewReportType] = useState('incident');

  const toggleFollow = (id: number) => {
    if (followedPins.includes(id)) {
      setFollowedPins(followedPins.filter(pid => pid !== id));
    } else {
      setFollowedPins([...followedPins, id]);
    }
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newPin = {
      id: Date.now(),
      type: newReportType,
      x: '50%', // Por defecto en el centro para demo
      y: '50%',
      title: newReportTitle,
      desc: 'Nuevo reporte ciudadano generado ahora mismo.',
      status: 'Nuevo',
      color: newReportType === 'incident' ? 'bg-red-500' : 'bg-blue-500',
      icon: newReportType === 'incident' ? 'report_problem' : 'info',
      creator_name: user?.user_metadata?.full_name || 'Vecino Anónimo',
      creator_neighborhood: user?.user_metadata?.neighborhood || 'General',
      is_demo: false
    };
    setPins([...pins, newPin]);
    setShowReportModal(false);
    setNewReportTitle('');
    // Feedback visual es suficiente al ver el pin aparecer
  };

  return (
    <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] w-full relative overflow-hidden font-sans border-l border-gray-100 dark:border-gray-800">
      {/* Background Simulating Map */}
      {/* Background Simulating Map - Actualizado a Tarragona */}
      {/* Background Simulating Map - Taragona Static Placeholder for Demo */}
      <div className="absolute inset-0 bg-[#e5e7eb] z-0">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, opacity: 1, filter: 'contrast(1.05) saturation(1.2)' }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11984.664687679365!2d1.2407559134907082!3d41.118021085004576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a3f2c525f2af45%3A0x673c683c310c85c3!2sTarragona!5e0!3m2!1ses!2ses!4v1703612345678!5m2!1ses!2ses"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        {/* Capa transparente para permitir clicks en los pines flotantes pero dejar ver el mapa debajo */}
        <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
      </div>

      {/* Banner de Datos de Ejemplo */}
      {/* Banner de Datos de Ejemplo (Solo visible si hay pines demo activos y NO se ha cerrado) */}
      {/* Eliminado a petición para dar sensación más real */}


      {/* Floating Header */}
      <div className="absolute top-8 left-8 right-8 z-10 flex flex-col md:flex-row gap-4">
        <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl p-6 rounded-[35px] shadow-2xl border border-white/20 flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-black dark:text-white tracking-tighter uppercase leading-none mb-1">MAPA VIVO</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tarragona en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <button className="size-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 shadow-lg">
              <span className="material-symbols-outlined font-black">my_location</span>
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
            >
              Añadir Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Map Content - SVG or Div with Pins */}
      {/* Map Content - Floating Pins Re-enabled */}
      <div className="relative w-full h-full p-20">
        {pins.map(pin => (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedPin(pin)}
            key={pin.id}
            className={`absolute size-14 md:size-16 rounded-3xl ${pin.color} ${pin.glow || ''} text-white flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 cursor-pointer z-10`}
            style={{ left: pin.x, top: pin.y }}
          >
            <span className="material-symbols-outlined text-2xl font-black">{pin.icon}</span>
            <div className={`absolute -bottom-1 -right-1 size-5 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700`}>
              <div className={`size-1.5 rounded-full ${pin.color} animate-ping`}></div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-10 space-y-2">
        {[
          { id: 1, label: 'INCIDENTES', color: 'bg-red-500' },
          { id: 2, label: 'EVENTOS', color: 'bg-primary' },
          { id: 3, label: 'AYUDA', color: 'bg-emerald-500' }
        ].map(l => (
          <div key={l.id} className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg flex items-center gap-3">
            <span className={`size-3 rounded-full ${l.color}`}></span>
            <span className="text-[10px] font-black dark:text-white tracking-widest uppercase">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-surface-dark shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-50 p-10 flex flex-col border-l border-gray-100 dark:border-gray-800"
          >
            <button onClick={() => setSelectedPin(null)} className="absolute top-8 left-0 -translate-x-full size-12 bg-white dark:bg-surface-dark flex items-center justify-center rounded-l-2xl shadow-xl md:shadow-none border-y border-l border-gray-100 dark:border-gray-800 text-gray-400">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className={`size-20 rounded-[30px] ${selectedPin.color} text-white flex items-center justify-center shadow-2xl shadow-primary/20 mb-8`}>
              <span className="material-symbols-outlined text-4xl font-black">{selectedPin.icon}</span>
            </div>

            <h2 className="text-3xl font-black dark:text-white tracking-tighter uppercase leading-tight mb-4">{selectedPin.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 leading-relaxed">{selectedPin.desc}</p>

            <div className="space-y-4 mb-auto">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${selectedPin.color}`}>{selectedPin.status}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Barrio</span>
                <span className="dark:text-white">PART ALTA</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Botón Eliminar solo si es el creador */}
              {/* En una app real, verificaríamos user?.id === selectedPin.creator_id */}
              {/* Como es demo, permitimos eliminar los que acabamos de crear nosotros (id > 100) */}
              {selectedPin.id > 100 && (
                <button
                  onClick={() => {
                    setPins(pins.filter(p => p.id !== selectedPin.id));
                    setSelectedPin(null);
                  }}
                  className="col-span-2 py-3 bg-red-100 text-red-600 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-red-200 transition-all mb-2"
                >
                  Eliminar Mi Reporte
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(true)}
                className="py-4 bg-primary text-white text-[10px] font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              >
                Más Info
              </button>
              <button
                onClick={() => toggleFollow(selectedPin.id)}
                className={`py-4 text-[10px] font-black rounded-2xl uppercase tracking-widest transition-all ${followedPins.includes(selectedPin.id) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-50 dark:bg-gray-800 dark:text-white hover:bg-gray-100'}`}
              >
                {followedPins.includes(selectedPin.id) ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal (Replacement for Alert) */}
      <AnimatePresence>
        {showDetailModal && selectedPin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className={`inline-flex items-center justify-center size-16 rounded-2xl ${selectedPin.color} text-white mb-6 shadow-lg`}>
                <span className="material-symbols-outlined text-3xl">{selectedPin.icon}</span>
              </div>

              <h3 className="text-2xl font-black dark:text-white mb-2 uppercase leading-tight">{selectedPin.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-6">{selectedPin.desc}</p>

              <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">schedule</span>
                  <span className="text-xs font-bold dark:text-white">Horario: {selectedPin.id < 100 ? '09:00 - 20:00 (Est.)' : 'Reciente'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">location_on</span>
                  <span className="text-xs font-bold dark:text-white">Ubicación: {selectedPin.id < 100 ? 'Centro / Rambla' : 'Marcador Usuario'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">person</span>
                  <span className="text-xs font-bold dark:text-white line-clamp-1">
                    Organiza: {selectedPin.creator_name ? selectedPin.creator_name : (selectedPin.id < 100 ? 'Asociación Vecinal (Demo)' : 'Vecino')}
                  </span>
                </div>
                {selectedPin.creator_neighborhood && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400">home_work</span>
                    <span className="text-xs font-bold dark:text-white">Barrio: {selectedPin.creator_neighborhood}</span>
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                Contactar Organizador
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-black dark:text-white mb-4 uppercase">Nuevo Reporte</h3>
              <form onSubmit={handleAddReport} className="space-y-4">
                <input
                  type="text"
                  placeholder="Título del reporte o evento..."
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-primary/20 dark:text-white"
                  autoFocus
                />
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl font-bold text-sm outline-none dark:text-white"
                >
                  <option value="incident">Incidente</option>
                  <option value="event">Evento</option>
                  <option value="cleanup">Voluntariado</option>
                </select>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">
                  Publicar en Mapa
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default MapView;
