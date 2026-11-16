/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Percent,
  Clock,
  Zap,
} from 'lucide-react';

interface Pasarela {
  id: string;
  nombre: string;
  tipo: string;
  comision: string;
  tiempoAbono: string;
  activo: boolean;
  icono: React.ElementType;
  color: string;
}

const PASARELAS: Pasarela[] = [
  { id: 'yape', nombre: 'Yape', tipo: 'Billetera digital', comision: '0%', tiempoAbono: 'Inmediato', activo: true, icono: Smartphone, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'plin', nombre: 'Plin', tipo: 'Billetera digital', comision: '0%', tiempoAbono: 'Inmediato', activo: true, icono: Smartphone, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 'visa', nombre: 'Visa', tipo: 'Tarjeta credito / debito', comision: '3.5%', tiempoAbono: '1 - 2 dias', activo: true, icono: CreditCard, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'mastercard', nombre: 'Mastercard', tipo: 'Tarjeta credito / debito', comision: '3.5%', tiempoAbono: '1 - 2 dias', activo: true, icono: CreditCard, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'pagoefectivo', nombre: 'PagoEfectivo', tipo: 'Efectivo en agentes', comision: '2.5%', tiempoAbono: '24 horas', activo: true, icono: Banknote, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'transferencia', nombre: 'Transferencia BCP / Interbank', tipo: 'Transferencia bancaria', comision: '0%', tiempoAbono: '1 dia util', activo: true, icono: Landmark, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'paypal', nombre: 'PayPal', tipo: 'Billetera internacional', comision: '4.4%', tiempoAbono: '3 - 5 dias', activo: false, icono: CreditCard, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
];

export const PagosView: React.FC = () => {
  const activas = PASARELAS.filter((p) => p.activo).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ComparaPC</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 font-semibold">Pagos</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pasarelas y Metodos de Pago
          </h1>
          <p className="text-xs text-slate-500">
            Canales habilitados para las tiendas afiliadas. Comision y tiempo de abono por transaccion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {activas} activas
          </span>
          <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
            {PASARELAS.length} registradas
          </span>
        </div>
      </div>

      {/* Grid de pasarelas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {PASARELAS.map((p) => {
          const Icono = p.icono;
          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${p.color}`}>
                    <Icono className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{p.nombre}</h3>
                    <span className="text-[11px] text-slate-500">{p.tipo}</span>
                  </div>
                </div>
                {p.activo ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Activa
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1 shrink-0">
                    <XCircle className="w-3 h-3" /> Inactiva
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Comision
                  </span>
                  <span className="text-sm font-black text-slate-900">{p.comision}</span>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Abono
                  </span>
                  <span className="text-xs font-bold text-slate-900">{p.tiempoAbono}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Transacciones protegidas
          </p>
          <p>
            Las comisiones son referenciales y las asume cada tienda afiliada. El cobro y despacho se coordina de forma individual con la tienda proveedora.
          </p>
        </div>
      </div>
    </div>
  );
};
