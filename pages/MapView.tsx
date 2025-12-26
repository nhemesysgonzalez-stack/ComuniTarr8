import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MapView: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const pins = [
    { id: 1, type: 'incident', x: '40%', y: '45%', title: 'Corte de Agua', desc: 'Mantenimiento urgente en tubería principal.', status: 'En progreso', color: 'bg-red-500', icon: 'report' },
    { id: 2, type: 'event', x: '60%', y: '30%', title: 'Festa Major Pròxima', desc: 'Preparativos para la fiesta del barrio el próximo finde.', status: 'Abierto', color: 'bg-primary', icon: 'celebration' },
    { id: 3, type: 'cleanup', x: '30%', y: '65%', title: 'Limpieza Playa del Miracle', desc: 'Grupo de voluntarios para recogida de plásticos.', status: 'Mañana 10:00', color: 'bg-emerald-500', icon: 'park' },
    { id: 4, type: 'business', x: '75%', y: '55%', title: 'Oferta Brasa Real', desc: 'Menú especial vecinos 2x1 hoy.', status: 'Activo', color: 'bg-amber-500', icon: 'restaurant' }
  ];

  return (
    <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] w-full relative overflow-hidden font-sans border-l border-gray-100 dark:border-gray-800">
      {/* Background Simulating Map */}
      {/* Background Simulating Map - Actualizado a Tarragona */}
      <div className="absolute inset-0 bg-[#f8f9fa] dark:bg-[#1a1b1e] z-0">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, opacity: 0.8, filter: 'grayscale(0%) contrast(1.1)' }}
          src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GEMINI_API_KEY}&center=41.1189,1.2445&zoom=14&maptype=roadmap`}
          allowFullScreen
        ></iframe>
        {/* Overlay para poder interactuar con los pines sin que el iframe capture todos los clics */}
        <div className="absolute inset-0 pointer-events-none"></div>
      </div>

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
            <button className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              Añadir Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Map Content - SVG or Div with Pins */}
      <div className="relative w-full h-full p-20 cursor-grab active:cursor-grabbing">
        {pins.map(pin => (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelectedPin(pin)}
            key={pin.id}
            className={`absolute size-14 md:size-16 rounded-3xl ${pin.color} text-white flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800`}
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
              <button className="py-4 bg-primary text-white text-[10px] font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest transition-all hover:scale-105 active:scale-95">Más Info</button>
              <button className="py-4 bg-gray-50 dark:bg-gray-800 text-[10px] font-black dark:text-white rounded-2xl uppercase tracking-widest hover:bg-gray-100 transition-all">Seguir</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapView;
