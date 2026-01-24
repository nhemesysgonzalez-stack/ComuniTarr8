
import React from 'react';

const Emergency: React.FC = () => {
  const contacts = [
    { name: 'Policía Local', number: '092', icon: 'local_police', color: 'bg-blue-100 text-blue-600', link: 'tel:092' },
    { name: 'Emergencias Médicas', number: '061', icon: 'medical_services', color: 'bg-orange-100 text-orange-600', link: 'tel:061' },
    { name: 'Bomberos Tarragona', number: '085', icon: 'fire_truck', color: 'bg-red-100 text-red-600', link: 'tel:085' },
    { name: 'Mossos d\'Esquadra', number: '112', icon: 'shield', color: 'bg-indigo-100 text-indigo-600', link: 'tel:112' },
    { name: 'Cruz Roja', number: '977 244 711', icon: 'emergency', color: 'bg-rose-100 text-rose-600', link: 'tel:977244711' },
    { name: 'Servicios Sociales', number: '977 296 100', icon: 'group', color: 'bg-emerald-100 text-emerald-600', link: 'tel:977296100' },
  ];

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto w-full space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black dark:text-white">Directorio de Emergencias</h1>
        <p className="text-text-secondary dark:text-gray-400 text-lg">Contactos críticos de Tarragona siempre a mano.</p>
      </div>

      <div className="bg-red-600 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 opacity-10 transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-[300px]">warning</span>
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-7xl md:text-8xl font-black mb-2 tracking-tighter">112</h2>
          <p className="text-2xl md:text-3xl font-bold opacity-90">Emergencias Generales 24h</p>
          <p className="mt-4 text-red-100">Llamada única para cualquier tipo de emergencia en Europa.</p>
        </div>
        <a href="tel:112" className="relative z-10 bg-white text-red-600 px-10 py-5 rounded-2xl font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl">call</span>
          LLAMAR AHORA
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map(contact => (
          <div key={contact.name} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-lg transition">
            <div className={`size-16 ${contact.color} rounded-2xl flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined text-3xl">{contact.icon}</span>
            </div>
            <div className="mb-6">
              <h4 className="font-bold text-lg dark:text-white mb-1">{contact.name}</h4>
              <p className="text-2xl font-black text-text-main dark:text-white">{contact.number}</p>
            </div>
            <a href={contact.link} className="w-full bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">call</span>
              Llamar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Emergency;
