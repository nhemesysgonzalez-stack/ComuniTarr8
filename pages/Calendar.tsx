import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { safeSupabaseFetch, safeSupabaseInsert } from '../services/dataHandler';

interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  neighborhood: string;
  contact_info: string;
  created_at: string;
}

const NeighborhoodCalendar: React.FC = () => {
  const { user } = useAuth();
  const now = new Date();
  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('Ocio');
  const [eventContact, setEventContact] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [user?.user_metadata?.neighborhood]);

  // Official Events for January/February 2026
  const officialEvents: Event[] = [
    {
      id: 'evt-monday-cleanup',
      creator_id: 'admin',
      title: "🧹 Limpieza Post-Paella",
      description: "Quedada rápida para dejar el local social impecable. +50XP extra.",
      event_date: '2026-02-02',
      event_time: '18:00',
      location: 'Local Social Vía Augusta',
      category: 'Solidario',
      neighborhood: 'GENERAL',
      contact_info: 'Admin ComuniTarr (655 00 11 22)',
      created_at: new Date().toISOString()
    },
    {
      id: 'evt-tuesday-yoga',
      creator_id: 'admin',
      title: "🧘‍♀️ Yoga al Atardecer",
      description: "Clase gratuita para liberar el estrés del inicio de semana. Trae tu esterilla.",
      event_date: '2026-02-03',
      event_time: '19:30',
      location: 'Parc de la Ciutat',
      category: 'Deporte',
      neighborhood: 'GENERAL',
      contact_info: 'Mireia R. (644 99 88 77)',
      created_at: new Date().toISOString()
    }
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await safeSupabaseFetch('events',
        supabase
          .from('events')
          .select('*')
          .or(`neighborhood.eq.${user?.user_metadata?.neighborhood || 'GENERAL'},neighborhood.eq.GENERAL`)
          .gte('event_date', new Date().toISOString().split('T')[0]) // Filter strictly future/today events on DB query if possible, or filter locally
          .order('event_date', { ascending: true })
      );

      const dbEvents = data || [];

      // Combine official events (filtering only future ones) + DB events
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allEvents = [...officialEvents, ...dbEvents].filter((e) => {
        const eDate = new Date(e.event_date);
        return eDate >= today; // Only show events from today onwards
      }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

      // Deduplicate by ID just in case
      const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id, item])).values());

      setEvents(uniqueEvents);
    } catch (e) {
      console.error(e);
      // Fallback to official events if DB fails
      setEvents(officialEvents.filter(e => new Date(e.event_date) >= new Date()));
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (offset: number) => {
    let newMonthIdx = monthNames.indexOf(selectedMonth) + offset;
    let newYear = selectedYear;
    if (newMonthIdx < 0) {
      newMonthIdx = 11;
      newYear--;
    } else if (newMonthIdx > 11) {
      newMonthIdx = 0;
      newYear++;
    }
    setSelectedMonth(monthNames[newMonthIdx]);
    setSelectedYear(newYear);
  };

  const getDaysInMonth = (month: string, year: number) => {
    const monthIdx = monthNames.indexOf(month);
    return new Date(year, monthIdx + 1, 0).getDate();
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success } = await safeSupabaseInsert('events', {
        creator_id: user?.id,
        title: eventTitle,
        description: eventDescription,
        event_date: eventDate,
        event_time: eventTime,
        location: eventLocation,
        category: eventCategory,
        contact_info: eventContact,
        neighborhood: user?.user_metadata?.neighborhood || 'GENERAL'
      });

      if (!success) throw new Error('Falló la creación');
      alert('¡Evento creado con éxito!');
      setShowEventModal(false);
      // Reset form
      setEventTitle('');
      setEventDescription('');
      setEventDate('');
      setEventTime('');
      setEventLocation('');
      setEventCategory('Ocio');
      setEventContact('');
      fetchEvents();
    } catch (e) {
      console.error(e);
      alert('Error al crear evento');
    }
  };

  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  const getEventColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fiesta': 'bg-red-500',
      'Solidario': 'bg-emerald-500',
      'Cultura': 'bg-primary',
      'Ocio': 'bg-indigo-500',
      'Deporte': 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-20 font-sans">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter uppercase leading-none mb-4">CALENDARIO</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">¿Qué pasa hoy en {user?.user_metadata?.neighborhood || 'tu barrio'}?</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-2 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
          <button onClick={() => changeMonth(-1)} className="size-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <span className="material-symbols-outlined font-black">chevron_left</span>
          </button>
          <span className="text-sm font-black dark:text-white w-32 text-center tracking-widest">{selectedMonth} {selectedYear}</span>
          <button onClick={() => changeMonth(1)} className="size-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <span className="material-symbols-outlined font-black">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-[40px] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-2xl">
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-8">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
            ))}
            {days.map(d => {
              const hasEvent = events.find(e => {
                const dObj = new Date(e.event_date);
                return dObj.getDate() === d &&
                  monthNames[dObj.getMonth()] === selectedMonth &&
                  dObj.getFullYear() === selectedYear;
              });
              return (
                <div key={d} className="aspect-square flex flex-col items-center justify-center relative rounded-2xl md:rounded-[25px] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group">
                  <span className={`text-xs md:text-sm font-black ${hasEvent ? 'text-primary' : 'text-gray-400 dark:text-gray-600'}`}>{d}</span>
                  {hasEvent && (
                    <span className={`absolute bottom-2 md:bottom-4 size-1.5 md:size-2 rounded-full ${getEventColor(hasEvent.category)} shadow-lg animate-pulse`}></span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShowEventModal(true)}
              className="w-full py-5 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[30px] flex items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary transition-all group"
            >
              <span className="material-symbols-outlined font-black">add_circle</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Crear Evento</span>
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-8">
          <h2 className="text-xl font-black dark:text-white tracking-widest uppercase px-4">Próximos Eventos</h2>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-10 opacity-20">
              <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
              <p className="text-xs font-black uppercase tracking-widest">Cargando...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 p-8 rounded-[35px] border-2 border-dashed border-primary/20">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 block">event_available</span>
              <h3 className="text-sm font-black dark:text-white mb-2">No hay eventos aún</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Sé el primero en organizar algo en {user?.user_metadata?.neighborhood || 'tu barrio'}</p>
              <button
                onClick={() => setShowEventModal(true)}
                className="text-xs font-black text-primary hover:underline"
              >
                CREAR PRIMER EVENTO →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {events.slice(0, 5).map((event, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={event.id}
                  className="group bg-white dark:bg-surface-dark p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all relative overflow-hidden"
                >
                  <div className="flex gap-5">
                    <div className={`shrink-0 size-16 md:size-20 rounded-2xl flex flex-col items-center justify-center text-white ${getEventColor(event.category)} shadow-lg font-black`}>
                      <span className="text-[10px] leading-none uppercase opacity-80">
                        {new Date(event.event_date).toLocaleDateString('es', { month: 'short' })}
                      </span>
                      <span className="text-2xl leading-none">{new Date(event.event_date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {event.category} • {event.event_time}
                      </p>
                      <h3 className="text-sm md:text-base font-black dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {event.location}
                        </p>
                      )}
                      {event.contact_info && (
                        <p className="text-[10px] font-bold text-primary">
                          Contacto: {event.contact_info}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Creation Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-dark rounded-[40px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">Crear Evento</h3>
                <button onClick={() => setShowEventModal(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Título del Evento</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Ej: Cena de Navidad del Barrio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Fecha</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Hora</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Categoría</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                  >
                    <option>Ocio</option>
                    <option>Fiesta</option>
                    <option>Solidario</option>
                    <option>Cultura</option>
                    <option>Deporte</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Ubicación</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Ej: Plaza Mayor"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Descripción</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none resize-none"
                    placeholder="Detalles del evento..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Contacto</label>
                  <input
                    type="text"
                    value={eventContact}
                    onChange={(e) => setEventContact(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 font-bold dark:text-white focus:ring-2 ring-primary/20 outline-none"
                    placeholder="Teléfono o email"
                  />
                </div>

                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                  Publicar Evento
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeighborhoodCalendar;
