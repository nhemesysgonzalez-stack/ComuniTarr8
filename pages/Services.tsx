
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emergencias' | 'escolar' | 'mujer' | 'empleo45' | 'tramites' | 'transporte' | 'bullying' | 'voluntariado'>('emergencias');

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

            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border-2 border-orange-400 dark:border-orange-600 relative overflow-hidden animate-pulse">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-9xl text-orange-600">air</span>
              </div>
              <div className="flex items-start gap-3 mb-3 relative z-10">
                <span className="material-symbols-outlined text-3xl text-orange-600 animate-bounce">warning</span>
                <div>
                  <h3 className="text-xl font-black text-orange-700 dark:text-orange-400">⚠️ ALERTA ACTIVA: VIENTO EXTREMO</h3>
                  <p className="text-xs text-orange-600 dark:text-orange-300 font-bold uppercase">VENTCAT - Protecció Civil Generalitat</p>
                </div>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 relative z-10 leading-relaxed font-medium">
                <strong>ES-Alert enviado a todos los móviles.</strong> Se prevén rachas de <strong>+100 km/h</strong> hoy y mañana en toda la costa de Tarragona.
              </p>

              <div className="bg-white dark:bg-surface-dark p-4 rounded-xl mb-4 relative z-10">
                <p className="text-xs font-black text-red-600 uppercase mb-2">⛔ Medidas Excepcionales (00:00-20:00 Jueves 12):</p>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>• ❌ Suspendidas: Clases, universidad, actividad sanitaria no urgente</li>
                  <li>• 🏠 Evita desplazamientos innecesarios. Prioriza teletrabajo.</li>
                  <li>• 🌳 Parques cerrados (Part Alta, Francolí, Miracle)</li>
                  <li>• 🏛️ Monumentos cerrados (Passeig Arqueològic, Amfiteatre)</li>
                </ul>
              </div>

              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl mb-3 relative z-10">
                <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase mb-1">🔴 Recomendaciones Urgentes:</p>
                <ul className="text-[10px] text-red-800 dark:text-red-300 space-y-0.5 ml-3">
                  <li>• Retira macetas, toldos y objetos de balcones</li>
                  <li>• Asegura puertas y ventanas</li>
                  <li>• Aléjate de fachadas, cornisas y árboles</li>
                  <li>• Vehículos 2 ruedas: extremar precaución o no circular</li>
                </ul>
              </div>

              <a
                href="https://interior.gencat.cat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/50 flex items-center justify-center gap-2 relative z-10"
              >
                VER INFO PROTECCIÓ CIVIL
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-3xl border border-green-100 dark:border-green-800/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-9xl text-green-500">factory</span>
              </div>
              <h3 className="text-lg font-black text-green-600 dark:text-green-400 mb-2 relative z-10">ALERTA QUÍMICA (PLASEQTA)</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 relative z-10 font-medium">Estado actual de las sirenas y protocolos de seguridad.</p>

              <div className="flex gap-2 relative z-10">
                <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-xl border border-green-200 dark:border-green-700/50 flex flex-col items-center justify-center">
                  <span className="size-4 rounded-full bg-green-500 animate-pulse mb-1"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-green-600">Polígono Norte</span>
                </div>
                <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-xl border border-green-200 dark:border-green-700/50 flex flex-col items-center justify-center">
                  <span className="size-4 rounded-full bg-green-500 animate-pulse mb-1"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-green-600">Polígono Sur</span>
                </div>
              </div>
              <a
                href="https://tinet.cat"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-3 bg-green-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
              >
                VER INFO PLASEQTA (Tinet.cat)
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        );
      case 'mujer':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-purple-600 rounded-[35px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <span className="material-symbols-outlined text-[200px]">female</span>
              </div>
              <h3 className="text-3xl font-black mb-4 relative z-10 flex items-center gap-2">
                <span className="material-symbols-outlined text-4xl">shield_with_heart</span> APOYO A LA MUJER
              </h3>
              <p className="text-lg opacity-90 mb-8 max-w-2xl relative z-10 font-bold leading-relaxed">
                No estás sola. Tarragona dispone de una red de protección y acompañamiento integral para mujeres en situación de vulnerabilidad o violencia.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <a href="tel:016" className="bg-white text-purple-600 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center hover:scale-105 transition-all">
                  <span className="text-[10px] uppercase font-black tracking-widest mb-1">Emergencia 24h</span>
                  <span className="text-5xl font-black">016</span>
                  <span className="text-xs mt-2 font-bold uppercase">No deja rastro en factura</span>
                </a>
                <a href="tel:900900120" className="bg-purple-800 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center hover:scale-105 transition-all border border-purple-400/30">
                  <span className="text-[10px] uppercase font-black tracking-widest mb-1">Atención Cataluña</span>
                  <span className="text-3xl font-black italic">900 900 120</span>
                  <span className="text-xs mt-2 font-bold uppercase">Acompañamiento SIAD</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h4 className="font-black text-purple-600 mb-3 uppercase tracking-widest text-xs">Puntos de Atención Local</h4>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-purple-400">location_on</span>
                    <div>
                      <p className="text-sm font-black">SIAD Tarragona</p>
                      <p className="text-xs text-gray-500">C/ de la Unió, 13 (Servicio de Información y Atención a las Mujeres)</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="material-symbols-outlined text-purple-400">call</span>
                    <div>
                      <p className="text-xs font-bold">977 296 150</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-800/30">
                <h4 className="font-black text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-widest text-xs">Recursos y Guías</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 font-medium italic">"Si necesitas hablar o un lugar seguro, Tarragona cuenta con pisos tutelados de emergencia. Llama al 016 o ven al SIAD."</p>
                <div className="flex flex-col gap-2">
                  <a href="https://violenciagenero.igualdad.gob.es/informacionUtil/recursos/Home.htm" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-purple-100 rounded-xl text-xs font-bold text-purple-600 text-center">GUÍA DE RECURSOS DEL ESTADO</a>
                </div>
              </div>
            </div>
          </div>
        );
      case 'empleo45':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-600 rounded-[35px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <span className="material-symbols-outlined text-[200px]">person_add</span>
              </div>
              <h3 className="text-3xl font-black mb-2 relative z-10">TALENTO +45 TARRAGONA</h3>
              <p className="text-lg opacity-90 mb-6 max-w-2xl relative z-10 font-medium">
                La experiencia es un grado. Impulsamos la reinserción laboral de vecinos mayores de 45 años con programas específicos de Tarragona Impulsa y empresas locales colaboradoras.
              </p>
              <button onClick={() => alert("Próximo Taller de Reinvención Laboral: Martes 17 Feb en Tarragona Impulsa (Tabacalera).")} className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                VER PRÓXIMAS ACTIVIDADES
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border-2 border-dashed border-emerald-500/30 shadow-sm">
                <h4 className="font-black text-emerald-600 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">work_history</span> PROGRAMA "TALENT SÉNIOR"
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                    <p className="text-sm font-black text-emerald-700">Tarragona Impulsa (Ajuntament)</p>
                    <p className="text-xs text-gray-500 mb-2">Servicio especializado en orientación para mayores de 45.</p>
                    <a href="https://www.tarragona.cat/tarragonaimpulsa" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black underline uppercase text-emerald-600">Pedir cita orientación</a>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm font-black text-gray-700 dark:text-white">Cambra de Comerç - PICE Sénior</p>
                    <p className="text-xs text-gray-500">Programas de formación en digitalización y ventas para perfiles con experiencia.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h4 className="font-black text-gray-400 mb-4 uppercase tracking-widest text-[9px]">Anuncios de Apoyo</h4>
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <p className="text-xs font-black dark:text-white">"Se busca operario de mantenimiento con experiencia."</p>
                    <p className="text-[10px] text-gray-500">Prioridad residentes barrio con +10 años sector. 📞 611 22 33 44</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-xs font-black dark:text-white">"Asesoría contable para PYMES - Socio Senior."</p>
                    <p className="text-[10px] text-gray-500">¿Eres gestor jubilado o en paro? Colabora con nuestra red. 📧 senior@tgn.cat</p>
                  </div>
                </div>
              </div>
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
                <a href="https://educacio.gencat.cat" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  CEIP El Miracle
                </a>
                <a href="https://educacio.gencat.cat" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  Escola Pax
                </a>
                <a href="https://educacio.gencat.cat" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  Marcel·lí Domingo
                </a>
                <a href="https://educacio.gencat.cat" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-surface-dark border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
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
              <a href="https://www.citapreviadnie.es" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Renovar DNI</p>
                  <p className="text-[10px] text-gray-500">Cita Previa Policía Nacional</p>
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
                <a href="https://www.emtanem.cat" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-lg bg-red-600 text-white font-black flex items-center justify-center">54</span>
                    <div>
                      <p className="text-xs font-bold">Bonavista - Cooperativa</p>
                      <p className="text-[10px] text-gray-400">Ver horarios y paradas</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">open_in_new</span>
                </a>
                <a href="https://www.emtanem.cat" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer group">
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
                  href="https://www.anar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white text-purple-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  WEB FUNDACIÓN ANAR (Ayuda)
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
                <a href="https://www.anar.org" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-start gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <span className="material-symbols-outlined text-purple-500 mt-1">menu_book</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Fundación ANAR - Recursos</p>
                    <p className="text-[10px] text-gray-500">Información oficial sobre acoso escolar</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-purple-500">open_in_new</span>
                </a>
                <a href="https://educacio.gencat.cat" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-start gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <span className="material-symbols-outlined text-blue-500 mt-1">gavel</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Departament d'Educació</p>
                    <p className="text-[10px] text-gray-500">Información oficial sobre convivencia escolar</p>
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
      case 'voluntariado':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-600 rounded-[35px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <span className="material-symbols-outlined text-[200px]">volunteer_activism</span>
              </div>
              <h3 className="text-3xl font-black mb-4 relative z-10 flex items-center gap-2">
                <span className="material-symbols-outlined text-4xl">favorite</span> VOLUNTARIADO TGN
              </h3>
              <p className="text-lg opacity-90 mb-6 max-w-2xl relative z-10 font-bold leading-relaxed">
                El abrazo que cambia vidas. Encuentra iniciativas de acompañamiento a bebés, niños, ancianos y personas en soledad en nuestra ciudad.
              </p>
              <div className="flex gap-4 relative z-10">
                <a href="mailto:info@tarracosalut.org" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  Contactar Punto Voluntariado
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bebés y Niños */}
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-blue-500/30 transition-all">
                <h4 className="font-black text-blue-600 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined">child_care</span> BEBÉS Y NEONATOS
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                    <p className="text-sm font-black dark:text-white">TarracoSalut</p>
                    <p className="text-xs text-gray-500 mb-2">Acompañamiento pediátrico en Joan XXIII y Santa Tecla. Apoyo a familias e infancia hospitalizada.</p>
                    <a href="https://tarracosalut.org" target="_blank" className="text-[10px] font-black underline uppercase text-blue-600">Saber más / Unirse</a>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm font-black dark:text-white">Som Prematurs</p>
                    <p className="text-xs text-gray-500 mb-2">Acompañamiento a familias con bebés prematuros en la UCIN del Hospital Joan XXIII.</p>
                    <a href="https://somprematurs.cat" target="_blank" className="text-[10px] font-black underline uppercase text-gray-500">Info Voluntariado</a>
                  </div>
                  <div className="p-3 border-l-4 border-indigo-500 bg-indigo-50/30">
                    <p className="text-[11px] font-black text-indigo-700">Inspiración: Mamás en Acción</p>
                    <p className="text-[9px] text-gray-500">Red de voluntarios que abrazan a niños hospitalizados que están solos. (Consulta info@mamasenaccion.es para expansión en TGN).</p>
                  </div>
                </div>
              </div>

              {/* Gente Gran y Soledad */}
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-500/30 transition-all">
                <h4 className="font-black text-emerald-600 mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined">elderly</span> GENTE GRAN Y SOLEDAD
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                    <p className="text-sm font-black dark:text-white">Amics de la Gent Gran (Tarragona)</p>
                    <p className="text-xs text-gray-500 mb-2">Llamadas y visitas semanales a personas mayores en situación de soledad no deseada.</p>
                    <a href="tel:932076773" className="text-[10px] font-black underline uppercase text-emerald-600">Llamar: 93 207 67 73</a>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <p className="text-sm font-black dark:text-white">Cruz Roja "Te Acompaña"</p>
                    <p className="text-xs text-gray-500 mb-2">Programa estatal contra la soledad no deseada con presencia activa en Tarragona.</p>
                    <a href="tel:900444114" className="text-[10px] font-black underline uppercase text-gray-500">Llamar Gratis: 900 444 114</a>
                  </div>
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100">
                    <p className="text-sm font-black dark:text-white">Fundación Avismón</p>
                    <p className="text-xs text-gray-500 mb-2">Acompañamiento a citas médicas y gestión para mayores en riesgo de aislamiento.</p>
                    <a href="https://avismon.org" target="_blank" className="text-[10px] font-black underline uppercase text-blue-600">Saber más</a>
                  </div>
                </div>
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
          onClick={() => setActiveTab('mujer')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'mujer' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">female</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Mujer</span>
        </button>

        <button
          onClick={() => setActiveTab('empleo45')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'empleo45' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">person_add</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Empleo +45</span>
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
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'bullying' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">security</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Anti-Bullying</span>
        </button>

        <button
          onClick={() => setActiveTab('voluntariado')}
          className={`p-4 rounded-2xl flex md:flex-row flex-col items-center gap-4 transition-all ${activeTab === 'voluntariado' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white dark:bg-surface-dark text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
          <span className="hidden md:block font-black text-xs uppercase tracking-widest">Voluntariado</span>
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
