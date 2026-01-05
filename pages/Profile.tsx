import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateMetadata, updateEmail, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [email, setEmail] = useState(user?.email || '');

  const meta = user?.user_metadata || {};

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      // 1. Actualizar Datos Básicos
      await updateMetadata({
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string,
        bio: formData.get('bio') as string,
        neighborhood: formData.get('neighborhood') as string,
      });

      // 2. Actualizar Email si cambió
      const formEmail = formData.get('email') as string;
      if (formEmail && formEmail !== user?.email) {
        await updateEmail(formEmail);
        alert('Perfil actualizado. Se ha enviado un correo de confirmación a tu nueva dirección.');
      } else {
        alert('Perfil actualizado con éxito');
      }

    } catch (e: any) {
      console.error(e);
      alert('Error actualizando perfil: ' + (e.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);
    try {
      await updateAvatar(file);
      alert('Foto de perfil actualizada');
      window.location.reload(); // Recargar para ver cambios si no es reactivo
    } catch (e) {
      alert('Error subiendo imagen. Asegúrate de que pesa menos de 2MB.');
    } finally {
      setLoading(false);
    }
  };

  const neighborhoods = [
    'Part Alta', 'Serrallo', 'Eixample', 'Nou Eixample',
    'San Salvador', 'Sant Pere i Sant Pau', 'Llevant'
  ];

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto pb-20 font-sans">
      <div className="bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-primary to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          <button className="absolute bottom-4 right-8 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30 hover:bg-white/30 transition-all">
            Cambiar Portada
          </button>
        </div>

        {/* Profile Info Header */}
        <div className="px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 md:-mt-20 mb-8">
            <div className="relative group">
              <img
                src={meta.avatar_url || 'https://ui-avatars.com/api/?name=' + (meta.full_name || 'V')}
                alt="Profile"
                className="size-32 md:size-40 rounded-[35px] border-8 border-white dark:border-surface-dark shadow-2xl object-cover transition-transform group-hover:scale-105"
              />
              <label className="absolute bottom-2 right-2 size-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <span className="material-symbols-outlined text-[20px] font-black">photo_camera</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-5xl font-black dark:text-white tracking-tighter leading-none">{meta.full_name || 'Nuevo Vecino'}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{meta.neighborhood || 'Sin Barrio'}</span>
                <span className="text-gray-400 font-bold text-xs">• Miembro desde Dic 2023</span>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20" title="Experiencia Acumulada">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    <span>NV. {Math.floor((meta.karma || 0) / 100) + 1}</span>
                    <span className="opacity-40">•</span>
                    <span>{meta.karma || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20" title="Saldo Canjeable">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    <span>{meta.comuni_points || 0} CP</span>
                  </div>
                </div>
                {user?.email === 'nhemesysgonzalez@gmail.com' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="ml-2 flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    PANEL ADMIN
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-100 dark:border-gray-800 mb-10 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'info', label: 'INFORMACIÓN', icon: 'person' },
              { id: 'activity', label: 'MI ACTIVIDAD', icon: 'timeline' },
              { id: 'badges', label: 'LOGROS', icon: 'military_tech' },
              { id: 'settings', label: 'AJUSTES', icon: 'settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabProfile" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl">
            {activeTab === 'info' && (
              <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nombre Completo</label>
                    <input
                      name="full_name"
                      defaultValue={meta.full_name}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold dark:text-white focus:ring-4 ring-primary/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Barrio de Residencia</label>
                    <select
                      name="neighborhood"
                      defaultValue={meta.neighborhood}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold dark:text-white focus:ring-4 ring-primary/10 outline-none transition-all appearance-none"
                    >
                      {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Teléfono (Solo Visible para Moderadores/Emergencias)</label>
                    <input
                      name="phone"
                      defaultValue={meta.phone}
                      placeholder="+34 600 000 000"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold dark:text-white focus:ring-4 ring-primary/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Correo Electrónico</label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold dark:text-white focus:ring-4 ring-primary/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Biografía / Sobre Mí</label>
                  <textarea
                    name="bio"
                    defaultValue={meta.bio}
                    rows={4}
                    placeholder="Cuéntanos un poco sobre ti..."
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl px-5 py-4 font-bold dark:text-white focus:ring-4 ring-primary/10 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-5 bg-primary text-white text-xs font-black rounded-3xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'badges' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {[
                  { icon: 'handshake', label: 'Buen Vecino', color: 'text-emerald-500' },
                  { icon: 'campaign', label: 'Vigilante', color: 'text-red-500' },
                  { icon: 'shopping_bag', label: 'Comerciante', color: 'text-sky-500' },
                  { icon: 'military_tech', label: 'Veterano', color: 'text-amber-500' }
                ].map((badge, i) => (
                  <div key={i} className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[30px] border border-gray-100 dark:border-gray-700">
                    <span className={`material-symbols-outlined text-4xl mb-3 ${badge.color} font-black`}>{badge.icon}</span>
                    <span className="text-[10px] font-black dark:text-white uppercase tracking-tighter text-center">{badge.label}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm font-bold text-gray-400 text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700">Aún no hay actividad reciente para mostrar</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                  <h4 className="text-red-500 font-black text-sm uppercase mb-2">Zona de Peligro</h4>
                  <p className="text-red-500/80 text-xs font-bold mb-4">Estas acciones no se pueden deshacer.</p>
                  <button className="px-6 py-3 bg-red-500 text-white text-[10px] font-black rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest">Eliminar Cuenta</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
