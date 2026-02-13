import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface PatrolGroup {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  neighborhood: string;
  contact_info: string;
  created_at: string;
}

const Patrols: React.FC = () => {
  const { user } = useAuth();
  const [patrols, setPatrols] = useState<PatrolGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [patrolName, setPatrolName] = useState('');
  const [patrolDescription, setPatrolDescription] = useState('');
  const [patrolContact, setPatrolContact] = useState('');

  useEffect(() => {
    fetchPatrols();
  }, [user?.user_metadata?.neighborhood]);

  const fetchPatrols = async () => {
    setLoading(true);
    try {
      const data = await safeSupabaseFetch('patrol_groups',
        supabase
          .from('patrol_groups')
          .select('*')
          .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
          .order('created_at', { ascending: false })
      );

      const mockPatrols: PatrolGroup[] = [
        {
          id: 'p-1',
          creator_id: 'v1',
          name: 'Protección Rua Infantil 🎭',
          description: 'Acompañamiento a los colegios en el desfile de hoy para asegurar que los recorridos estén libres de obstáculos.',
          neighborhood: 'CENTRO',
          contact_info: '622 33 44 55',
          created_at: new Date().toISOString()
        },
        {
          id: 'p-2',
          creator_id: 'v2',
          name: 'Brigada "Ojo de Vecino" 🧹',
          description: 'Aviso de cornisas o ramas que hayan quedado tocadas tras el viento de ayer para avisar a los servicios municipales.',
          neighborhood: 'PART ALTA',
          contact_info: '611 99 88 77',
          created_at: new Date().toISOString()
        }
      ];

      setPatrols(data && data.length > 0 ? data : mockPatrols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePatrolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('patrol_groups', {
        creator_id: user?.id,
        name: patrolName,
        description: patrolDescription,
        contact_info: patrolContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
      });

      if (!success) throw new Error('Falló la creación');
      alert('¡Grupo de patrulla creado con éxito!');
      setShowCreateModal(false);
      setPatrolName('');
      setPatrolDescription('');
      setPatrolContact('');
      fetchPatrols();
    } catch (e) {
      console.error(e);
      alert('Error al crear grupo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 py-24 px-6 border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            Seguridad Vecinal
          </span>
          <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter uppercase leading-none mb-6">
            PATRULLAS VECINALES
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-bold max-w-2xl mx-auto mb-8">
            Grupos de vecinos organizados para velar por la seguridad y el bienestar del barrio. (Los datos mostrados pueden ser ejemplos).
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-3 px-8 py-5 bg-orange-500 text-white rounded-[30px] shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
          >
            <span className="material-symbols-outlined font-black">add_circle</span>
            CREAR GRUPO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20 opacity-20">
            <div className="size-10 border-4 border-orange-500 border-t-transparent animate-spin rounded-full"></div>
            <p className="text-xs font-black uppercase tracking-widest">Cargando grupos...</p>
          </div>
        ) : patrols.length === 0 ? (
          <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10 p-12 rounded-[40px] border-2 border-dashed border-orange-500/20 text-center max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-orange-500 text-6xl mb-4 block">shield</span>
            <h3 className="text-lg font-black dark:text-white mb-2">No hay grupos de patrulla aún</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sé el primero en crear un grupo de patrulla vecinal en {user?.user_metadata?.neighborhood || 'tu barrio'}.
              Estos grupos ayudan a mantener el barrio seguro mediante rondas, comunicación con autoridades y vigilancia colaborativa.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              CREAR PRIMER GRUPO
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {patrols.map((patrol, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={patrol.id}
                className="group bg-white dark:bg-surface-dark rounded-[35px] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-orange-500/30 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-orange-500/40">shield</span>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/90 dark:bg-gray-800/90 text-orange-500 shadow-lg">
                    Patrulla
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black dark:text-white leading-tight mb-3 group-hover:text-orange-500 transition-colors">
                    {patrol.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {patrol.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-orange-500">person</span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Coordinador
                      </span>
                    </div>
                    {patrol.contact_info && (
                      <a
                        href={`tel:${patrol.contact_info}`}
                        className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-xl text-xs font-black hover:bg-orange-500 hover:text-white transition-all"
                      >
                        UNIRME
                      </a>
                    )}
                  </div>
                  {patrol.contact_info && (
                    <p className="text-[10px] font-bold text-gray-400 mt-3">
                      📞 {patrol.contact_info}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-16 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10 p-8 rounded-[35px] border border-orange-500/20">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-orange-500 text-3xl">info</span>
            <div>
              <h3 className="text-sm font-black dark:text-white mb-2 uppercase tracking-widest">Cómo funcionan las patrullas</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Las patrullas vecinales son grupos organizados de vecinos que colaboran para mantener el barrio seguro.
                Trabajan en coordinación con las autoridades locales y se basan en la prevención y la comunicación.
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Rondas periódicas por el barrio</li>
                <li>✓ Comunicación rápida ante incidencias</li>
                <li>✓ Coordinación con policía local</li>
                <li>✓ Prevención mediante presencia visible</li>
                <li>✓ Grupos de WhatsApp para alertas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Patrol Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear Grupo de Patrulla</h3>
                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handlePatrolSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Nombre del Grupo</label>
                  <input
                    type="text"
                    value={patrolName}
                    onChange={(e) => setPatrolName(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-orange-500/20 outline-none"
                    placeholder="Ej: Patrulla Vecinal Part Alta"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea
                    value={patrolDescription}
                    onChange={(e) => setPatrolDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-orange-500/20 outline-none resize-none"
                    placeholder="Describe el objetivo del grupo, horarios de ronda, zona que cubren..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto del Coordinador</label>
                  <input
                    type="text"
                    value={patrolContact}
                    onChange={(e) => setPatrolContact(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-orange-500/20 outline-none"
                    placeholder="Teléfono o email"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    Los vecinos interesados te contactarán para unirse
                  </p>
                </div>

                <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  Crear Grupo
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default Patrols;
