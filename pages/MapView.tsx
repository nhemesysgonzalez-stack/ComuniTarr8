import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';

const MapView: React.FC = () => {
  const { user } = useAuth();
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const [pins, setPins] = useState<any[]>([
    { id: 'plan-1', type: 'ocio', x: '45%', y: '55%', title: '💃 Feria Abril Bonavista', desc: 'La 32a edición sigue su curso esta semana. Sevillanas, gastronomía andaluza, casetas y música. ¡Plan perfecto para esta tarde de miércoles!', status: 'Hoy 17h-02h', color: 'bg-red-500', icon: 'celebration', glow: 'shadow-[0_0_50px_rgba(239,68,68,0.3)]', creator_name: 'Feria TGN 2026' },
    { id: 'plan-2', type: 'ocio', x: '55%', y: '75%', title: '🚢 Yate "Seven Seas"', desc: 'El espectacular megayate de Steven Spielberg está atracado en el Moll de Costa. Acércate a verlo antes de que zarpe.', status: 'Atracado', color: 'bg-blue-500', icon: 'directions_boat', creator_name: 'Moll Costa' },
    { id: 'plan-3', type: 'cultura', x: '30%', y: '40%', title: '🖼️ Expo "Escenaris" (Teatre TGN)', desc: 'Exposición fotográfica sobre los escenarios más emblemáticos de la ciudad. Entrada libre. Hasta el 9 de mayo.', status: 'Abierto hasta 20h', color: 'bg-purple-500', icon: 'photo_camera', creator_name: 'Teatre Tarragona' },
    { id: 'plan-4', type: 'deporte', x: '15%', y: '65%', title: '🏖️ Nuevo Paseo La Pineda', desc: 'Por fin se ha inaugurado el nuevo paseo marítimo de La Pineda tras 14 meses de obras. Perfecto para pasear o ir en bici esta tarde soleada.', status: 'Inaugurado', color: 'bg-emerald-500', icon: 'pedal_bike', creator_name: 'Vila-seca' }
  ]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [followedPins, setFollowedPins] = useState<number[]>([]);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportType, setNewReportType] = useState('ocio');

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
      desc: '¡Acabo de crear este plan! Hablemos para coordinarnos.',
      status: 'Creado ahora',
      color: newReportType === 'ocio' ? 'bg-orange-500' : newReportType === 'deporte' ? 'bg-blue-500' : 'bg-purple-500',
      icon: newReportType === 'ocio' ? 'local_bar' : newReportType === 'deporte' ? 'fitness_center' : 'group',
      creator_name: user?.user_metadata?.full_name || 'Tú',
      creator_neighborhood: user?.user_metadata?.neighborhood || 'General',
      is_demo: false
    };
    setPins([...pins, newPin]);
    setShowReportModal(false);
    setNewReportTitle('');
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full relative overflow-hidden font-sans border-l border-gray-100 dark:border-gray-800 bg-[#e5e7eb]">
      {/* Background Simulating Map - Actualizado a Tarragona */}
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply filter grayscale contrast-125">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11984.664687679365!2d1.2407559134907082!3d41.118021085004576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a3f2c525f2af45%3A0x673c683c310c85c3!2sTarragona!5e0!3m2!1ses!2ses!4v1703612345678!5m2!1ses!2ses"
          allowFullScreen
          loading="lazy"
        ></iframe>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none"></div>
      </div>

      {/* Floating Header Especial */}
      <div className="absolute top-8 left-8 right-8 z-10 flex flex-col md:flex-row gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-[35px] shadow-[0_20px_50px_rgba(249,115,22,0.3)] border border-white/20 flex-1 flex flex-col md:flex-row items-start md:items-center justify-between text-white">
          <div>
            <h1 className="text-2xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-1">¿QUÉ TE APETECE HACER HOY?</h1>
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] opacity-90 drop-shadow-md">
              Encuentra a alguien para tomar un café, hacer deporte o pasear al perro.
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-8 py-4 rounded-2xl bg-white text-orange-600 text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">location_on</span>
              DEJAR MI PIN
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full p-20 z-0">
        {pins.map(pin => (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, translateY: -10 }}
            onClick={() => setSelectedPin(pin)}
            key={pin.id}
            className={`absolute flex flex-col items-center justify-center cursor-pointer z-10 group`}
            style={{ left: pin.x, top: pin.y }}
          >
            {/* Pin head */}
            <div className={`size-14 md:size-16 rounded-full ${pin.color} ${pin.glow || 'shadow-2xl'} text-white flex items-center justify-center border-[4px] border-white relative z-10 overflow-hidden`}>
              {/* Si tiene avatar se podría mostrar aquí, por ahora usamos el icono */}
              <span className="material-symbols-outlined text-2xl font-black drop-shadow-md">{pin.icon}</span>
            </div>

            {/* Pin tail */}
            <div className={`w-1 h-6 ${pin.color} -mt-2 shadow-lg`}></div>
            <div className="w-4 h-1 bg-black/30 rounded-full blur-[2px] mt-1"></div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 font-bold text-[10px] whitespace-nowrap text-gray-800"
            >
              {pin.creator_name.split(' ')[0]} busca plan
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-10 space-y-2">
        {[
          { id: 1, label: 'OCIO & CAFÉ', color: 'bg-orange-500' },
          { id: 2, label: 'DEPORTE', color: 'bg-blue-500' },
          { id: 3, label: 'MASCOTAS & OTROS', color: 'bg-purple-500' }
        ].map(l => (
          <div key={l.id} className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg flex items-center gap-3">
            <span className={`size-4 rounded-full ${l.color} shadow-inner bg-gradient-to-br from-white/30 to-transparent`}></span>
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
            className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-white dark:bg-surface-dark shadow-[-20px_0_60px_rgba(0,0,0,0.15)] z-50 p-8 flex flex-col border-l border-gray-100 dark:border-gray-800"
          >
            <button onClick={() => setSelectedPin(null)} className="absolute top-8 left-0 -translate-x-full size-12 bg-white dark:bg-surface-dark flex items-center justify-center rounded-l-2xl shadow-xl md:shadow-none border-y border-l border-gray-100 dark:border-gray-800 text-gray-400">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div className={`mt-10 size-24 rounded-full ${selectedPin.color} text-white flex items-center justify-center shadow-2xl shadow-current mb-6 border-[6px] border-gray-50 dark:border-gray-800 relative`}>
              <span className="material-symbols-outlined text-4xl font-black drop-shadow-lg">{selectedPin.icon}</span>
              <div className="absolute -bottom-2 px-3 py-1 bg-black text-white text-[9px] font-black uppercase rounded-full shadow-lg border border-white/20 tracking-widest">
                {selectedPin.creator_name}
              </div>
            </div>

            <h2 className="text-3xl font-black dark:text-white tracking-tight leading-tight mb-4">{selectedPin.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-8 leading-relaxed text-base">{selectedPin.desc}</p>

            <div className="space-y-4 mb-auto">
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span> ¿Cuándo?</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg ${selectedPin.color}`}>{selectedPin.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {selectedPin.id > 100 && (
                <button
                  onClick={() => {
                    setPins(pins.filter(p => p.id !== selectedPin.id));
                    setSelectedPin(null);
                  }}
                  className="py-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  Cancelar mi plan
                </button>
              )}

              <button
                onClick={() => toggleFollow(selectedPin.id)}
                className={`py-5 text-sm font-black rounded-[25px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${followedPins.includes(selectedPin.id) ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/20 hover:scale-105 hover:shadow-orange-500/40'}`}
              >
                <span className="material-symbols-outlined">{followedPins.includes(selectedPin.id) ? 'check_circle' : 'waving_hand'}</span>
                {followedPins.includes(selectedPin.id) ? 'Ya te has apuntado' : 'Me Apunto!'}
              </button>

              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-400 font-medium">Al apuntarte, {selectedPin.creator_name.split(' ')[0]} recibirá una notificación para abrir chat.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report/Plan Modal */}
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
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-pink-500"></div>

              <div className="flex justify-between items-start mb-6 mt-2">
                <div>
                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear un Plan</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Deja tu pin para que los vecinos te encuentren.</p>
                </div>
                <button onClick={() => setShowReportModal(false)} className="size-8 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleAddReport} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2 mb-1 block">¿Qué quieres hacer?</label>
                  <input
                    type="text"
                    placeholder="Ej: Salir a correr suave..."
                    value={newReportTitle}
                    onChange={(e) => setNewReportTitle(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-orange-500/20 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2 mb-1 block">Categoría</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setNewReportType('ocio')} className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${newReportType === 'ocio' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                      <span className="material-symbols-outlined filter drop-shadow-sm">local_bar</span>
                      <span className="text-[9px] font-black uppercase tracking-wider">Ocio</span>
                    </button>
                    <button type="button" onClick={() => setNewReportType('deporte')} className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${newReportType === 'deporte' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                      <span className="material-symbols-outlined filter drop-shadow-sm">fitness_center</span>
                      <span className="text-[9px] font-black uppercase tracking-wider">Deporte</span>
                    </button>
                    <button type="button" onClick={() => setNewReportType('mascotas')} className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${newReportType === 'mascotas' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                      <span className="material-symbols-outlined filter drop-shadow-sm">pets</span>
                      <span className="text-[9px] font-black uppercase tracking-wider">Mascotas</span>
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                  <span className="material-symbols-outlined">place</span>
                  DEJAR MI PIN EN EL MAPA
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapView;
