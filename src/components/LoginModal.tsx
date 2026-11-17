import React, { useState } from 'react';
import { X, LogIn, ShieldCheck, Store, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CLAVE_DEMO = 'demo123';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, demoUsers, switchUser, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loginModalOpen) return null;

  const cerrar = () => {
    setLoginModalOpen(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        setError('No existe una cuenta con ese correo.');
        setLoading(false);
        return;
      }
      if (password !== CLAVE_DEMO) {
        setError('Contrasena incorrecta. Usa la clave demo indicada abajo.');
        setLoading(false);
        return;
      }
      switchUser(user);
      showToast(`Sesion iniciada como ${user.rol.toUpperCase()}`);
      cerrar();
      setLoading(false);
    }, 500);
  };

  const cuentasDemo = demoUsers.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <LogIn className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Iniciar Sesion</h3>
              <p className="text-xs text-slate-300">Accede como cliente, tienda o administrador</p>
            </div>
          </div>
          <button onClick={cerrar} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electronico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@comparapc.pe"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contrasena *</label>
            <div className="relative">
              <input
                type={verClave ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-bold bg-[#56d991] hover:brightness-95 text-slate-950 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Cuentas demo (clave: <span className="text-blue-700">{CLAVE_DEMO}</span>)
            </p>
            {cuentasDemo.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setEmail(u.email); setPassword(CLAVE_DEMO); }}
                className="w-full text-left flex items-center gap-2 text-[11px] text-slate-600 hover:text-blue-700 hover:bg-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {u.rol === 'tienda' ? (
                  <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : u.rol === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="font-medium truncate">{u.email}</span>
                <span className="ml-auto text-[9px] uppercase font-bold text-slate-400">{u.rol}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
