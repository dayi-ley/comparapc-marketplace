/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Order } from '../types';
import {
  LayoutDashboard,
  Package,
  Download,
  MapPin,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Inbox,
} from 'lucide-react';

type AccountSection =
  | 'panel'
  | 'pedidos'
  | 'descargas'
  | 'direcciones'
  | 'consultas'
  | 'detalles';

const MENU: Array<{ id: AccountSection; label: string; icon: React.ElementType }> = [
  { id: 'panel', label: 'Panel', icon: LayoutDashboard },
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'descargas', label: 'Descargas', icon: Download },
  { id: 'direcciones', label: 'Direcciones', icon: MapPin },
  { id: 'consultas', label: 'Consultas', icon: MessageSquare },
  { id: 'detalles', label: 'Detalles de la cuenta', icon: UserIcon },
];

const EmptyState: React.FC<{ icon: React.ElementType; title: string; desc: string }> = ({
  icon: Icon,
  title,
  desc,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-slate-200">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
      <Icon className="w-7 h-7 text-slate-400" />
    </div>
    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
    <p className="text-xs text-slate-500 mt-1 max-w-xs">{desc}</p>
  </div>
);

export const MyAccountView: React.FC = () => {
  const { currentUser, cerrarSesion } = useApp();
  const [section, setSection] = useState<AccountSection>('panel');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section !== 'pedidos' && section !== 'panel') return;
    const run = async () => {
      setLoading(true);
      try {
        setOrders(await api.getPedidos(currentUser?.id));
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentUser, section]);

  const initials =
    currentUser?.nombreCompleto
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CL';

  const renderContent = () => {
    switch (section) {
      case 'pedidos':
        return (
          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-slate-500">Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <EmptyState icon={Package} title="Sin pedidos" desc="Aun no registras pedidos en ComparaPC." />
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 font-mono">{o.id}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {o.tiendaNombre || 'Tienda'} · S/ {o.total?.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 shrink-0">
                    {o.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      case 'descargas':
        return (
          <EmptyState
            icon={Download}
            title="Sin descargas"
            desc="Aqui apareceran tus facturas y boletas cuando esten disponibles."
          />
        );
      case 'direcciones':
        return (
          <EmptyState
            icon={MapPin}
            title="Sin direcciones"
            desc="Aun no has registrado direcciones de entrega."
          />
        );
      case 'consultas':
        return (
          <EmptyState
            icon={MessageSquare}
            title="Sin consultas"
            desc="No tienes consultas o incidencias registradas."
          />
        );
      case 'detalles':
        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Detalles de la cuenta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { l: 'Nombre completo', v: currentUser?.nombreCompleto },
                { l: 'Correo electronico', v: currentUser?.email },
                { l: 'Telefono', v: currentUser?.telefono || 'No registrado' },
                { l: 'Rol', v: currentUser?.rol },
                {
                  l: 'Fecha de registro',
                  v: currentUser?.fechaRegistro
                    ? new Date(currentUser.fechaRegistro).toLocaleDateString()
                    : '-',
                },
              ].map((f) => (
                <div key={f.l}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{f.l}</p>
                  <p className="text-sm text-slate-800 font-medium capitalize">{f.v}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { l: 'Pedidos totales', v: orders.length },
              { l: 'En proceso', v: orders.filter((o) => o.estado !== 'entregado').length },
              { l: 'Entregados', v: orders.filter((o) => o.estado === 'entregado').length },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-2xl font-black text-slate-800">{s.v}</p>
                <p className="text-[11px] text-slate-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-10">
      <aside className="lg:w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600 font-bold text-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {currentUser?.nombreCompleto}
            </p>
            <p className="text-[10px] text-blue-600 font-semibold uppercase">
              {currentUser?.rol}
            </p>
          </div>
        </div>

        <nav className="mt-3 bg-white rounded-2xl border border-slate-200 p-2 flex flex-col gap-1">
          {MENU.map((m) => {
            const Icon = m.icon;
            const active = section === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSection(m.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer mt-1 border-t border-slate-100 pt-3"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </button>
        </nav>
      </aside>

      <section className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <Inbox className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            Mi Cuenta
          </h2>
        </div>
        {renderContent()}
      </section>
    </div>
  );
};
