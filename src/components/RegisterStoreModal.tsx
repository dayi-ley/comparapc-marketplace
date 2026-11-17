import React, { useState } from 'react';
import { X, Store, ShieldCheck, CheckCircle2, Mail, Lock, ArrowLeft, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const UBICACIONES: Record<string, Record<string, string[]>> = {
  Lima: {
    Lima: ['Miraflores', 'San Isidro', 'Surco', 'La Victoria', 'Cercado de Lima', 'San Juan de Lurigancho'],
    Callao: ['Callao', 'Bellavista', 'La Perla'],
  },
  Arequipa: {
    Arequipa: ['Arequipa', 'Cayma', 'Yanahuara'],
  },
  'La Libertad': {
    Trujillo: ['Trujillo', 'Victor Larco', 'El Porvenir'],
  },
  Piura: {
    Piura: ['Piura', 'Castilla', 'Catacaos'],
  },
  Cusco: {
    Cusco: ['Cusco', 'Wanchaq', 'San Sebastian'],
  },
};

export const RegisterStoreModal: React.FC = () => {
  const { registerStoreModalOpen, setRegisterStoreModalOpen, showToast, reloadUserData } = useApp();

  const [formData, setFormData] = useState({
    nombreTienda: '',
    razonSocial: '',
    ruc: '',
    nombreCompleto: '',
    dni: '',
    email: '',
    telefono: '',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Miraflores',
    direccion: '',
    aceptaTerminos: false,
  });

  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState<'datos' | 'verificar' | 'clave' | 'exito'>('datos');
  const [codigoDemo, setCodigoDemo] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');

  if (!registerStoreModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.ruc.length !== 11 || !/^\d+$/.test(formData.ruc)) {
      setError('El RUC debe contener exactamente 11 dígitos numéricos.');
      return;
    }
    if (!/^(10|20)\d{9}$/.test(formData.ruc)) {
      setError('El RUC peruano debe iniciar en 10 o 20 (ej. 20601234567).');
      return;
    }
    if (formData.dni.length !== 8 || !/^\d+$/.test(formData.dni)) {
      setError('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }
    if (!formData.aceptaTerminos) {
      setError('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    setCodigoDemo(String(Math.floor(100000 + Math.random() * 900000)));
    setPaso('verificar');
    showToast(`✓ Código enviado a ${formData.email} (demo).`);
  };

  const verificarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (codigoInput.trim() !== codigoDemo) {
      setError('El código de verificación no coincide.');
      return;
    }
    setPaso('clave');
  };

  const crearClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const direccionCompleta = `${formData.distrito}, ${formData.provincia}, ${formData.departamento} — ${formData.direccion}`;
      await api.registrarTienda({
        ...formData,
        password,
        direccion: direccionCompleta,
      });
      setPaso('exito');
      showToast('✓ Tienda registrada y correo verificado.');
      await reloadUserData();
      setTimeout(() => {
        cerrarYLimpiar();
      }, 2200);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cerrarYLimpiar = () => {
    setRegisterStoreModalOpen(false);
    setPaso('datos');
    setPassword('');
    setConfirmar('');
    setCodigoInput('');
    setCodigoDemo('');
    setError('');
    setFormData({
      nombreTienda: '',
      razonSocial: '',
      ruc: '',
      nombreCompleto: '',
      dni: '',
      email: '',
      telefono: '',
      departamento: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores',
      direccion: '',
      aceptaTerminos: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Store className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Registrar Nueva Tienda</h3>
              <p className="text-xs text-blue-100">Únete a la red de distribuidores de ComparaPC</p>
            </div>
          </div>
          <button
            onClick={cerrarYLimpiar}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paso === 'exito' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">¡Tienda Registrada con Éxito!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Correo verificado y cuenta creada. Tu tienda quedó en estado pendiente de validación de RUC por el administrador.
            </p>
          </div>
        ) : paso === 'verificar' ? (
          <form onSubmit={verificarCodigo} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold">{error}</div>
            )}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Verifica tu correo</h4>
              <p className="text-xs text-slate-600">
                Enviamos un código de 6 dígitos a <strong>{formData.email}</strong>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
              <strong>Modo demo:</strong> tu código es{' '}
              <span className="font-mono font-black text-amber-900 text-sm tracking-widest">{codigoDemo}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Código de verificación *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3 py-2 text-sm text-center tracking-[0.4em] font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaso('datos')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Volver
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-[#56d991] hover:brightness-95 text-slate-950 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Verificar
              </button>
            </div>
          </form>
        ) : paso === 'clave' ? (
          <form onSubmit={crearClave} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold">{error}</div>
            )}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Crea tu contraseña</h4>
              <p className="text-xs text-slate-600">Correo verificado. Define la clave de acceso a tu panel de tienda.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña *</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Contraseña *</label>
              <input type="password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="pt-2 flex items-center justify-end">
              <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium bg-[#56d991] hover:brightness-95 text-slate-950 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
                {loading ? 'Registrando...' : 'Crear cuenta de tienda'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verificación Oficial:</strong> Requerimos un RUC de 11 dígitos válido para garantizar transparencia a los compradores.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Comercial de la Tienda *</label>
              <input
                type="text"
                required
                value={formData.nombreTienda}
                onChange={(e) => setFormData({ ...formData, nombreTienda: e.target.value })}
                placeholder="Ej. Tienda Alpha Tech"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razón Social (SUNAT) *</label>
              <input
                type="text"
                required
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                placeholder="Ej. ALPHA TECH S.A.C."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RUC (11 dígitos) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}
                  placeholder="20601234567"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="987654321"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Representante *</label>
              <input
                type="text"
                required
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                placeholder="Ej. Carlos Mendoza"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">DNI del Representante *</label>
              <input
                type="text"
                required
                maxLength={8}
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                placeholder="Ej. 45678912"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico de Contacto *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ventas@tienda.pe"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento *</label>
                <select
                  required
                  value={formData.departamento}
                  onChange={(e) => {
                    const dep = e.target.value;
                    const prov = Object.keys(UBICACIONES[dep])[0];
                    setFormData({ ...formData, departamento: dep, provincia: prov, distrito: UBICACIONES[dep][prov][0] });
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Object.keys(UBICACIONES).map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provincia *</label>
                <select
                  required
                  value={formData.provincia}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setFormData({ ...formData, provincia: prov, distrito: UBICACIONES[formData.departamento][prov][0] });
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Object.keys(UBICACIONES[formData.departamento]).map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Distrito *</label>
                <select
                  required
                  value={formData.distrito}
                  onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {UBICACIONES[formData.departamento][formData.provincia].map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección de la Tienda Física</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej. Av. Garcilaso de la Vega 1348, C.C. CyberPlaza Int. 204"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aceptaTerminos}
                onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-slate-600 leading-snug">
                Acepto los <strong className="text-blue-700">Términos y Condiciones</strong> y la{' '}
                <strong className="text-blue-700">Política de Privacidad</strong> de ComparaPC, y declaro que la información brindada es verídica.
              </span>
            </label>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={cerrarYLimpiar}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-medium bg-[#56d991] hover:brightness-95 text-slate-950 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Enviar código de verificación
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
