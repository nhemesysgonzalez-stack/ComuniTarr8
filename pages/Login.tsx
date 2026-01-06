import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                navigate('/');
            } else {
                if (!neighborhood) {
                    alert('Por favor selecciona un barrio');
                    return;
                }
                await signUp(email, password, {
                    full_name: fullName,
                    neighborhood: neighborhood
                }, avatarFile);
                alert('🎉 ¡BIENVENIDO A COMUNITARR! Ya eres parte de la comunidad. Ya puedes entrar con tu email y contraseña.');
                setIsLogin(true);
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-background-dark flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
            {/* Decorative Circles */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500/10 rounded-full blur-[80px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden border border-white/20 relative z-10"
            >
                {/* Left Side: Art/Info */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-primary text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 opacity-90"></div>
                    <div className="absolute inset-0 bg-[url('https://www.tarragona.cat/la-ciutat/fets-i-xifres/image_mini')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <img src="/logo.svg" alt="Logo" className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl" />
                            <h1 className="text-3xl font-black tracking-tight">ComuniTarr</h1>
                        </div>
                        <motion.h2
                            key={isLogin ? 'login-title' : 'signup-title'}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl font-black leading-tight mb-6 tracking-tight"
                        >
                            {isLogin ? (
                                <>Bienvenido de nuevo, <br /><span className="text-blue-200">vecino.</span></>
                            ) : (
                                <>Únete a la <br /><span className="text-blue-200">comunidad.</span></>
                            )}
                        </motion.h2>
                        <p className="text-xl opacity-80 leading-relaxed max-w-md font-medium">
                            La red social exclusiva para Tarragona. Seguridad, comercio local y apoyo mutuo.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-10">
                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex-1 hover:bg-white/20 transition-colors">
                            <p className="text-3xl font-black">1.2k+</p>
                            <p className="text-sm font-bold opacity-70">Vecinos</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex-1 hover:bg-white/20 transition-colors">
                            <p className="text-3xl font-black">24/7</p>
                            <p className="text-sm font-bold opacity-70">Actividad</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-surface-dark relative">
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src="/logo.svg" alt="Logo" className="w-20 h-20 rounded-3xl shadow-xl" />
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h3 className="text-3xl md:text-4xl font-black dark:text-white mb-2 tracking-tight">
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                            {isLogin ? 'Accede a tu cuenta para continuar.' : 'Es rápido, fácil y gratuito.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="flex flex-col items-center mb-6">
                                        <label className="relative cursor-pointer group">
                                            <div className="size-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-4xl text-gray-400">add_a_photo</span>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 size-8 bg-primary rounded-full border-4 border-white dark:border-gray-700 flex items-center justify-center text-white shadow-lg">
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Foto de perfil</p>
                                    </div>

                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-2xl">person</span>
                                        <input
                                            required={!isLogin}
                                            type="text"
                                            placeholder="Nombre y Apellido"
                                            className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-gray-750 transition-all rounded-[20px] text-base font-bold dark:text-white placeholder:text-gray-400 outline-none"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-2xl">location_city</span>
                                        <select
                                            required={!isLogin}
                                            className="w-full pl-14 pr-10 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-gray-750 transition-all rounded-[20px] text-base font-bold dark:text-white appearance-none outline-none text-gray-500"
                                            value={neighborhood}
                                            onChange={(e) => setNeighborhood(e.target.value)}
                                        >
                                            <option value="">Selecciona tu barrio</option>
                                            <option value="Part Alta">Part Alta</option>
                                            <option value="Serrallo">El Serrallo</option>
                                            <option value="Eixample">Eixample</option>
                                            <option value="Nou Eixample">Nou Eixample</option>
                                            <option value="San Salvador">San Salvador</option>
                                            <option value="Sant Pere i Sant Pau">Sant Pere i Sant Pau</option>
                                            <option value="Llevant">Llevant</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-2xl">alternate_email</span>
                            <input
                                required
                                type="email"
                                placeholder="Correo electrónico"
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-gray-750 transition-all rounded-[20px] text-base font-bold dark:text-white placeholder:text-gray-400 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-2xl">lock</span>
                            <input
                                required
                                type="password"
                                placeholder="Contraseña"
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-gray-750 transition-all rounded-[20px] text-base font-bold dark:text-white placeholder:text-gray-400 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-[22px] font-black text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 mt-6 flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (isLogin ? 'INICIAR SESIÓN' : 'REGISTRARME')}
                        </button>
                    </form>

                    <footer className="mt-8 text-center">
                        <p className="text-gray-400 font-bold text-sm">
                            {isLogin ? '¿Aún no eres miembro?' : '¿Ya tienes una cuenta?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary hover:text-primary-hover hover:underline transition-all font-black"
                            >
                                {isLogin ? 'Crea una aquí' : 'Entra ahora'}
                            </button>
                        </p>
                    </footer>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
