import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message || 'Error al iniciar sesión. Revisa tus credenciales.');
            setLoading(false);
        } else {
            navigate('/perfil');
        }
    };

    return (
        <div className="min-h-screen bg-surface-2 flex items-center justify-center p-6">
            <div className="card max-w-lg w-full p-10 md:p-16 animate-in">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                        <div className="size-12 bg-dr-blue rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                            DD
                        </div>
                        <div className="text-left leading-tight">
                            <span className="font-black text-xl tracking-tight">Directorio</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dr-red block">Dominicano</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">¡Hola de nuevo!</h1>
                    <p className="text-gray-500 font-medium">Entra en tu cuenta para gestionar tu negocio o tus favoritos.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 mb-8 animate-in">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                className="form-input pl-12"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="form-input pl-12 pr-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dr-blue transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <Link to="/recovery" className="text-xs font-bold text-dr-blue hover:underline text-right mt-1">¿Olvidaste tu contraseña?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg w-full shadow-xl shadow-dr-blue/20"
                    >
                        {loading ? <div className="spinner size-5 border-2 border-white/30 border-t-white"></div> : "Entrar Ahora"}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 font-medium mb-4">¿No tienes cuenta?</p>
                    <Link to="/registro" className="btn btn-outline w-full gap-2">
                        Registrarme ahora <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
