import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Directory from './pages/Directory';
import BusinessProfile from './pages/BusinessProfile';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

function App() {
  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR", intent: "subscription" }}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/directorio" element={<Directory />} />
                <Route path="/negocio/:slug" element={<BusinessProfile />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-gray-200 py-12 mt-20">
              <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-6">
                  <div className="size-8 bg-dr-blue rounded-lg flex items-center justify-center text-white font-black text-xs">DD</div>
                  <span className="font-bold text-lg">Directorio Dominicano <span className="text-dr-red">BCN</span></span>
                </div>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                  Conectando la comunidad dominicana en Barcelona. Encuentra los mejores negocios, servicios y productos de nuestra tierra.
                </p>
                <div className="flex justify-center gap-8 mb-8">
                  <a href="#" className="text-gray-400 hover:text-dr-blue transition-colors font-semibold">Términos</a>
                  <a href="#" className="text-gray-400 hover:text-dr-blue transition-colors font-semibold">Privacidad</a>
                  <a href="#" className="text-gray-400 hover:text-dr-blue transition-colors font-semibold">Contacto</a>
                </div>
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  © 2026 Directorio Dominicano BCN. Hecho con ❤️ para la comunidad.
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}

export default App;
