import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function AuthModal({ onAdminLogin }) {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const { theme } = useTheme();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginTab) {
        const loggedUser = await login(email, password);
        if (loggedUser?.role === 'admin' && onAdminLogin) {
          onAdminLogin();
        }
      } else {
        if (!name.trim()) {
          throw new Error('Por favor ingresa tu nombre completo');
        }
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pestañas de Login / Registro */}
        <div className="flex rounded-xl bg-gray-950 p-1 mb-6 border border-gray-800">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isLoginTab ? `${theme.primaryBg} text-white shadow-md` : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isLoginTab ? `${theme.primaryBg} text-white shadow-md` : 'text-gray-400 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-white">
            {isLoginTab ? '¡Te damos la bienvenida!' : 'Únete a OMNITRON'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isLoginTab
              ? 'Ingresa tus credenciales para acceder a tus compras y cursos'
              : 'Regístrate en segundos para realizar tu compra'}
          </p>
        </div>

        {/* Alerta de error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre y apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-950 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-gray-600 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-gray-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-gray-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-xl transition mt-2 ${theme.primaryBg} ${theme.primaryHover} text-white disabled:opacity-50`}
          >
            <span>{loading ? 'Procesando...' : isLoginTab ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
