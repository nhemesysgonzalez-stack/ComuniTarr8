import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Banned: React.FC = () => {
    const { signOut } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">block</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Cuenta Suspendida</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Tu acceso a <strong>ComuniTarr</strong> ha sido revocado debido al incumplimiento de nuestras normas de convivencia comunitaria.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 text-sm text-left">
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">¿Crees que es un error?</p>
                    <p className="text-gray-500 dark:text-gray-400">Contacta con la administración del barrio para revisar tu caso.</p>
                </div>

                <button
                    onClick={() => signOut()}
                    className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
                >
                    Cerrar Sesión e Ir al Inicio
                </button>
            </div>
        </div>
    );
};

export default Banned;
