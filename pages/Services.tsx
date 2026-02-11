
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emergencias' | 'escolar' | 'tramites' | 'transporte' | 'bullying'>('emergencias');

  const renderContent = () => {
    switch (activeTab) {
      case 'emergencias':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-800/30">
              <h3 className="text-lg font-black text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">sos</span> TELÉFONOS RÁPIDOS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="tel:112" className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 flex items-center justify-between hover:scale-105 transition-transform active:scale-95">
                  <span className="font-black text-2xl text-red-600">112</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">General</span>
                </a>
                <a href="tel:092" className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 flex items-center justify-between hover:scale-105 transition-transform active:scale-95">
                  <span className="font-black text-2xl text-blue-600">092</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Policía Local</span>
                </a>
                <a href="tel:061" className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30 flex items-center justify-between hover:scale-105 transition-transform active:scale-95">
                  <span className="font-black text-2xl text-orange-600">061</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Salut Respon</span>
                </a>
                <a href="tel:016" className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/30 flex items-center justify-between hover:scale-105 transition-transform active:scale-95">
                  <span className="font-black text-2xl text-purple-600">016</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Violencia M.</span>
                </a>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-800/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-9xl text-orange-500">factory</span>
              </div>
              <h3 className="text-lg font-black text-orange-600 dark:text-orange-400 mb-2 relative z-10">ALERTA QUÍMICA (PLASEQTA)</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 relative z-10 font-medium">Estado actual de las sirenas y protocolos de seguridad.</p>

              <div className="flex gap-2 relative z-10">
                <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-xl border border-orange-200 dark:border-orange-700/50 flex flex-col items-center justify-center">
                  <span className="size-4 rounded-full bg-green-500 animate-pulse mb-1"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-green-600">Polígono Norte</span>
                </div>
                <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-xl border border-orange-200 dark:border-orange-700/50 flex flex-col items-center justify-center">
                  <span className="size-4 rounded-full bg-green-500 animate-pulse mb-1"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-green-600">Polígono Sur</span>
                </div>
              </div>
              <a
                href="https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/plans_de_proteccio_civil_a_catalunya/plans_de_proteccio_civil_sectorials/plaseqta/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-3 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                VER MAPA DE AFECTACIÓN
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        );
      case 'escolar':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-lg font-black text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">school</span> CALENDARIO ESCOLAR
              </h3>
              <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm mb-3">
                <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xl">
                  27
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-400">Próximo Festivo</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">Día de libre disposición (Carnaval)</p>
                  <p className="text-[10px] text-gray-500">Quedan 16 días</p>
                </div>
              </div>
              <a
                href="https://educacio.gencat.cat/ca/departament/calendari-escolar/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                VER CALENDARIO COMPLETO
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400 mb-2">MENÚS COMEDOR</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 font-medium">Consulta el menú basal y de alérgicos de los principales colegios públicos.</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://menuescolar.gencat.cat/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  CEIP El Miracle
                </a>
                <a href="https://menuescolar.gencat.cat/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  Escola Pax
                </a>
                <a href="https://menuescolar.gencat.cat/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  Marcel·lí Domingo
                </a>
                <a href="https://educacio.gencat.cat/ca/arees-actuacio/centres-serveis-educatius/serveis-educatius/menjador-escolar/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  Ver todos...
                </a>
              </div>
            </div>
          </div>
        );
      case 'tramites':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-black px-2">TRÁMITES RÁPIDOS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="https://citaprevia.tarragona.cat" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Cita Previa OMAC</p>
                  <p className="text-[10px] text-gray-500">Ayuntamiento y Padu</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-primary">arrow_forward</span>
              </a>
              <a href="tel:977296222" className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-green-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Recogida Muebles</p>
                  <p className="text-[10px] text-gray-500">977 296 222 (Teléfono verde)</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-green-500">call</span>
              </a>
              <a href="https://sede.policia.gob.es:38089/Temas/DNI/Cita-Previa/" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Renovar DNI</p>
                  <p className="text-[10px] text-gray-500">Cita Previa Online</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-blue-500">open_in_new</span>
              </a>
            </div>
          </div>
        );
      case 'transporte':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">directions_bus</span> EMT TARRAGONA
              </h3>

              <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <span className="material-symbols-outlined text-yellow-600">warning</span>
                <div>
                  <p className="text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase">INCIDENCIA ACTIVA</p>
                  <p className="text-[10px] text-yellow-800 dark:text-yellow-400 font-medium">Líneas 8, 11, 12 desviadas por Rambla Nova (Gradas Carnaval).</p>
                </div>
              </div>

              <div className="space-y-2">
                <a href="https://www.emtanemweb.cat/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-lg bg-red-600 text-white font-black flex items-center justify-center">54</span>
                    <div>
                      <p className="text-xs font-bold">Bonavista - Cooperativa</p>
                      <p className="text-[10px] text-gray-400">Ver horarios y paradas</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">open_in_new</span>
                </a>
                <a href="https://www.emtanemweb.cat/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-lg bg-red-600 text-white font-black flex items-center justify-center">6</span>
                    <div>
                      <p className="text-xs font-bold">Campclar - Sant Pere</p>
                      <p className="text-[10px] text-gray-400">Ver horarios y paradas</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">open_in_new</span>
                </a>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">train</span> CERCANÍAS RENFE
              </h3>
              <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <p className="text-xs font-black text-green-700 dark:text-green-500 uppercase">SERVICIO NORMAL</p>
                  <p className="text-[10px] text-green-800 dark:text-green-400 font-medium">Líneas R14, R15, R16 operando sin retrasos.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bullying':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 rounded-[30px] shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <span className="material-symbols-outlined text-9xl">shield</span>
              </div>
              <h3 className="text-2xl font-black mb-2 relative z-10">ZONA SEGURA</h3>
              <p className="text-sm opacity-90 mb-6 max-w-[80%] relative z-10 leading-relaxed">
                El acoso escolar no es un juego. Si tú o alguien que conoces necesita ayuda, estamos aquí. Todo es confidencial.
              </p>

              <div className="flex flex-col gap-3 relative z-10">
                <a
                  href="https://www.anar.org/ayuda-chat-anar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white text-purple-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  CHAT ANÓNIMO ANAR (Fundación)
                </a>
                <a href="tel:900018018" className="w-full py-3 bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-purple-800 transition-colors shadow-lg border border-purple-400/50 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">call</span>
                  TELÉFONO CONTRA EL ACOSO (900 018 018)
                </a>
                <a href="tel:116111" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors shadow-lg border border-indigo-400/50 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">phone_in_talk</span>
                  TELÉFONO DEL MENOR (116 111)
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-3xl border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-black mb-3 text-yellow-800 dark:text-yellow-400">¿QUÉ ES EL ACOSO ESCOLAR?</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Es cualquier forma de maltrato psicológico, verbal o físico producido entre escolares de forma reiterada. Incluye:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Insultos, motes, burlas, amenazas</li>
                <li>• Exclusión social, rechazo, aislamiento</li>
                <li>• Agresiones físicas (empujones, golpes, palizas)</li>
                <li>• Ciberacoso (mensajes, publicaciones humillantes)</li>
                <li>• Robo o daño de pertenencias</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-black mb-4">RECURSOS Y GUÍAS</h3>
              <div className="space-y-3">
                <a href="https://www.anar.org/wp-content/uploads/2018/02/Gu%C3%ADa-de-actuaci%C3%B3n-contra-el-acoso-escolar.pdf" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-start gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <span className="material-symbols-outlined text-purple-500 mt-1">menu_book</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Guía para padres (PDF)</p>
                    <p className="text-[10px] text-gray-500">Cómo detectar y actuar si tu hijo sufre acoso.</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-purple-500">open_in_new</span>
                </a>
                <a href="https://educacio.gencat.cat/ca/departament/publicacions/colleccions/inclusio-convivencia/conflictes-violencia-centres-educatius/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-start gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <span className="material-symbols-outlined text-blue-500 mt-1">gavel</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Protocolos Escolares (Gencat)</p>
                    <p className="text-[10px] text-gray-500">Qué debe hacer el colegio por ley.</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-500">open_in_new</span>
                </a>
                <a href="https://www.savethechildren.es/donde/espana/violencia-contra-la-infancia/acoso-escolar-bullying" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-start gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <span className="material-symbols-outlined text-orange-500 mt-1">school</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Save the Children: Materiales educativos</p>
                    <p className="text-[10px] text-gray-500">Información completa y recursos de prevención.</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-orange-500">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6 h-full p-6 md:p-8 max-w-7xl mx-auto items-start">
      {/* Sidebar Navigation */}
      <div className="w-20 md:w-64 shrink-0 flex flex-col gap-2 sticky top-8">
        <button
          onClick={() => setActiveTab('emergencias')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'emergencias' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">local_police</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Emergencias</span>
        </button>

        <button
          onClick={() => setActiveTab('escolar')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'escolar' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">school</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Escolar</span>
        </button>

        <button
          onClick={() => setActiveTab('tramites')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'tramites' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">contract_edit</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Trámites</span>
        </button>

        <button
          onClick={() => setActiveTab('transporte')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'transporte' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">directions_bus</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Movilidad</span>
        </button>

        <button
          onClick={() => setActiveTab('bullying')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'bullying' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Anti-Bullying</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-[40px] p-6 md:p-10 border border-white/20 shadow-xl min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
