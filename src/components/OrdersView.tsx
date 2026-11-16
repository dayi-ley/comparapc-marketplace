/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Order } from '../types';
import {
  Package,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store as StoreIcon,
  ChevronRight,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { currentUser, setActiveView } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await api.getPedidos(currentUser?.id);
        setOrders(data);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'entregado':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> En Preparación
          </span>
        );
      case 'listo_entrega':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Listo para Entrega
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ComparaPC</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 font-semibold">Historial de Compras</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Mis Pedidos Generados
          </h1>
          <p className="text-xs text-slate-500">
            Cada compra se divide de forma independiente para cada tienda proveedora.
          </p>
        </div>

        <button
          onClick={() => setActiveView('catalogo')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Explorar Más Componentes
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Cargando tus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aún no tienes pedidos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando generes una orden a través del carrito o mediante el asistente IA, podrás rastrear aquí el estado de cada tienda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{order.tiendaNombre}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Orden: {order.codigoOrden} • Pedido: {order.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.estado)}
                  <span className="text-[11px] text-slate-500">
                    {new Date(order.fechaCreacion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-5 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productoImagen}
                        alt={item.productoNombre}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 p-0.5 border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          {item.marca}
                        </span>
                        <h4 className="font-bold text-slate-900 line-clamp-1">
                          {item.productoNombre}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {item.cantidad} × S/ {item.precioUnitarioCongelado.toFixed(2)} (Precio Congelado)
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-900">
                        S/ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-2">
                  {order.metodoEntrega === 'recojo_en_tienda' ? (
                    <>
                      <StoreIcon className="w-4 h-4 text-slate-400" />
                      <span>Recojo presencial en local de la tienda</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="truncate max-w-sm">
                        Envío a: {order.direccionEnvio || 'Dirección registrada'}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500">Total Pedido:</span>
                  <span className="text-base font-black text-slate-900">
                    S/ {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
