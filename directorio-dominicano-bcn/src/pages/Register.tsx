import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ChevronRight, AlertCircle, Building2 } from 'lucide-react';

const Register: React.FC = () => {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'gratis';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'cliente' | 'negocio_gratis' | 'negocio_premium'>(
        plan === 'premium' ? 'negocio_premium' : 'cliente'
    );

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await signUp(email, password, fullName, role);

        if (error) {
            setError(error.message || 'Error al registrarse. Inténtalo de nuevo.');
            setLoading(false);
        } else {
            // If they are registering as a business, take them to onboarding
            if (role.startsWith('negocio')) {
                navigate('/perfil?setup=business');
            } else {
                navigate('/perfil');
            }
        }
    };

    return (
        <div className="min-h-screen bg-surface-2 flex items-center justify-center p-6 py-20">
            <div className="card max-w-2xl w-full p-10 md:p-16 animate-in">
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
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Crea tu cuenta</h1>
                    <p className="text-gray-500 font-medium">Únete a la mayor comunidad dominicana en España.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 mb-8 animate-in">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole('cliente')}
                            className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${role === 'cliente' ? 'border-dr-blue bg-blue-50/50' : 'border-gray-100 hover:border-dr-blue/30'}`}
                        >
                            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${role === 'cliente' ? 'bg-dr-blue text-white shadow-lg' : 'bg-surface-2 text-gray-400'}`}>
                                <User size={24} />
                            </div>
                            <div>
                                <span className="font-black text-lg block leading-none mb-1">Cliente</span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Para descubrir negocios</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole('negocio_gratis')}
                            className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${role.startsWith('negocio') ? 'border-dr-blue bg-blue-50/50' : 'border-gray-100 hover:border-dr-blue/30'}`}
                        >
                            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${role.startsWith('negocio') ? 'bg-dr-blue text-white shadow-lg' : 'bg-surface-2 text-gray-400'}`}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <span className="font-black text-lg block leading-none mb-1">Negocio</span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Para publicar mi local</span>
                            </div>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="form-group">
                            <label className="form-label">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="form-input pl-12"
                                    placeholder="Ej: Jose Rodriguez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

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
                                    type="password"
                                    required
                                    className="form-input pl-12"
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-surface-2 rounded-2xl border border-gray-100 flex items-start gap-4">
                        <input type="checkbox" required className="mt-1 size-4 accent-dr-blue" />
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Acepto los <Link to="/terminos" className="text-dr-blue font-bold">Términos y Condiciones</Link> y la <Link to="/privacidad" className="text-dr-blue font-bold">Política de Privacidad</Link>. Entiendo que el Directorio Dominicano BCN protege mis datos según la GDPR.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg w-full shadow-xl shadow-dr-blue/20"
                    >
                        {loading ? <div className="spinner size-5 border-2 border-white/30 border-t-white"></div> : "Crear Mi Cuenta"}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 font-medium mb-4">¿Ya tienes cuenta?</p>
                    <Link to="/login" className="btn btn-outline w-full gap-2">
                        Iniciar Sesión <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
