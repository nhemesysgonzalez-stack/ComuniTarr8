import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  neighborhood: string;
  contact_info: string;
  is_example: boolean;
  created_at: string;
}

const Challenges: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeContact, setChallengeContact] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, [user?.user_metadata?.neighborhood]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await safeSupabaseFetch('challenges',
        supabase
          .from('challenges')
          .select('*')
          .eq('neighborhood', user?.user_metadata?.neighborhood || 'GENERAL')
          .order('created_at', { ascending: false })
      );

      const mockChallenges: Challenge[] = [
        {
          id: 'mock-ch-sat-1',
          creator_id: 'admin',
          title: '🧹 Operación "Rambla Radiante"',
          description: 'Quedada este sábado tarde para repasar las zonas de la Rambla donde hubo más afluencia y dejar el pavimento perfecto. ¡Por nuestro barrio!',
          neighborhood: 'GENERAL',
          contact_info: 'AAVV Centro (Cora)',
          is_example: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-ch-sat-2',
          creator_id: 'user2',
          title: '🔋 Recogida de Pilas y Pequeños RAEE',
          description: 'Mañana domingo aprovecharemos la Carrera Popular para poner un punto de recogida de pilas usadas y pequeños electrodomésticos.',
          neighborhood: 'PONENT',
          contact_info: '633 44 55 66 (Joan)',
          is_example: false,
          created_at: new Date().toISOString()
        }
      ];


      setChallenges(data && data.length > 0 ? data : mockChallenges);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('challenges', {
        creator_id: user?.id,
        title: challengeTitle,
        description: challengeDescription,
        contact_info: challengeContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL',
        is_example: false
      });

      if (!success) throw new Error('Falló la creación');
      alert('¡Reto solidario creado con éxito!');
      setShowCreateModal(false);
      setChallengeTitle('');
      setChallengeDescription('');
      setChallengeContact('');
      fetchChallenges();
    } catch (e) {
      console.error(e);
      alert('Error al crear reto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-20 font-sans">
      <div className="bg-gradient-to-br from-emerald-500/10 to-primary/10 dark:from-emerald-500/20 dark:to-primary/20 py-24 px-6 border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            Solidaridad
          </span>
          <h1 className="text-5xl md:text-7xl font-black dark:text-white tracking-tighter uppercase leading-none mb-6">
            RETOS SOLIDARIOS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-bold max-w-2xl mx-auto mb-8">
            Organiza o únete a iniciativas solidarias en tu barrio. Cada pequeña acción cuenta.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-3 px-8 py-5 bg-emerald-500 text-white rounded-[30px] shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
          >
            <span className="material-symbols-outlined font-black">add_circle</span>
            CREAR RETO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20 opacity-20">
            <div className="size-10 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
            <p className="text-xs font-black uppercase tracking-widest">Cargando retos...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-gradient-to-br from-emerald-500/5 to-primary/5 dark:from-emerald-500/10 dark:to-primary/10 p-12 rounded-[40px] border-2 border-dashed border-emerald-500/20 text-center max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-emerald-500 text-6xl mb-4 block">volunteer_activism</span>
            <h3 className="text-lg font-black dark:text-white mb-2">No hay retos solidarios aún</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sé el primero en organizar un reto solidario en {user?.user_metadata?.neighborhood || 'tu barrio'}.
              Puede ser una recogida de alimentos, limpieza de espacios, donación de ropa, o cualquier iniciativa que ayude a la comunidad.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              CREAR PRIMER RETO
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={challenge.id}
                className="group bg-white dark:bg-surface-dark rounded-[35px] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-emerald-500/30 transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-green-500/20 relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-emerald-500/40">volunteer_activism</span>
                  {challenge.is_example && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-yellow-500/90 text-white shadow-lg">
                      EJEMPLO
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black dark:text-white leading-tight mb-3 group-hover:text-emerald-500 transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-4">
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-500">person</span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Organizador
                      </span>
                    </div>
                    {challenge.contact_info && (
                      <a
                        href={`tel:${challenge.contact_info}`}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        UNIRME
                      </a>
                    )}
                  </div>
                  {challenge.contact_info && (
                    <p className="text-[10px] font-bold text-gray-400 mt-3">
                      📞 {challenge.contact_info}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-16 bg-gradient-to-r from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10 p-8 rounded-[35px] border border-emerald-500/20">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-emerald-500 text-3xl">info</span>
            <div>
              <h3 className="text-sm font-black dark:text-white mb-2 uppercase tracking-widest">Cómo funcionan los retos</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Los retos solidarios son iniciativas creadas por vecinos para ayudar a la comunidad.
                Si quieres participar en un reto, contacta directamente con el organizador usando el botón "UNIRME".
                Juntos podemos hacer del barrio un lugar mejor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
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
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear Reto Solidario</h3>
                <button onClick={() => setShowCreateModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleChallengeSubmit} className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl mb-4 text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Ideas Rápidas (Click para rellenar)</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { t: 'Limpieza de Playa', d: 'Quedada el sábado para limpiar la playa del Milagro después del temporal.', c: '611888222' },
                      { t: 'Donación de Disfraces', d: 'Recogemos disfraces que ya no uses para donarlos a ludotecas y centros infantiles.', c: '633444555' },
                      { t: 'Compañía a Mayores', d: 'Grupo para pasear con vecinos mayores ahora que vuelve el buen tiempo.', c: '655666777' }
                    ].map((idea, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setChallengeTitle(idea.t);
                          setChallengeDescription(idea.d);
                          setChallengeContact(idea.c);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        + {idea.t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título del Reto</label>
                  <input
                    type="text"
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-emerald-500/20 outline-none"
                    placeholder="Ej: Recogida de Alimentos para el Banco Local"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea
                    value={challengeDescription}
                    onChange={(e) => setChallengeDescription(e.target.value)}
                    required
                    rows={5}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-emerald-500/20 outline-none resize-none"
                    placeholder="Describe el reto: qué necesitas, cuándo, dónde, cómo pueden ayudar los vecinos..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Tu Contacto</label>
                  <input
                    type="text"
                    value={challengeContact}
                    onChange={(e) => setChallengeContact(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-emerald-500/20 outline-none"
                    placeholder="Teléfono o email"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    Los vecinos te contactarán para unirse al reto
                  </p>
                </div>

                <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                  Crear Reto
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Challenges;
