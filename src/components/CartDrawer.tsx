/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { CartItem } from '../types';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartItem,
    removeFromCart,
    setCheckoutModalOpen,
  } = useApp();

  if (!cartDrawerOpen) return null;

  // Agrupar items por tienda
  const itemsByStore: Record<string, CartItem[]> = {};
  if (cart) {
    for (const item of cart.items) {
      const storeName = item.tiendaNombre || 'Tienda Asociada';
      if (!itemsByStore[storeName]) itemsByStore[storeName] = [];
      itemsByStore[storeName].push(item);
    }
  }

  const handleProceedToCheckout = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Carrito Multi-Tienda</h3>
              <p className="text-[11px] text-slate-400">
                {cart?.cantidadTotal || 0} artículo(s) seleccionados
              </p>
            </div>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
          {!cart || cart.items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Tu carrito está vacío</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explora el catálogo, compara las ofertas de hardware o utiliza el ensamblador para agregar componentes.
              </p>
            </div>
          ) : (
            Object.entries(itemsByStore).map(([storeName, items]) => {
              const subtotalStore = items.reduce((acc, curr) => acc + curr.subtotal, 0);

              return (
                <div
                  key={storeName}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                >
                  {/* Store Header */}
                  <div className="px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{storeName}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      S/ {subtotalStore.toFixed(2)}
                    </span>
                  </div>

                  {/* Items de la tienda */}
                  <div className="divide-y divide-slate-100 p-2 space-y-1">
                    {items.map((item) => (
                      <div key={item.id} className="p-2 flex items-center gap-3">
                        <img
                          src={item.productoImagen}
                          alt={item.productoNombre}
                          className="w-12 h-12 rounded-xl object-cover bg-white p-0.5 border border-slate-200 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-slate-900 text-xs truncate">
                            {item.productoNombre}
                          </h5>
                          <span className="text-[11px] font-bold text-blue-600">
                            S/ {item.precio.toFixed(2)}
                          </span>

                          <div className="flex items-center gap-2 mt-1">
                            {/* Control Cantidad */}
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                              <button
                                onClick={() => updateCartItem(item.id, item.cantidad - 1)}
                                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-slate-800">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateCartItem(item.id, item.cantidad + 1)}
                                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                              title="Eliminar ítem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900">
                            S/ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {cart && cart.items.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Hardware:</span>
                <span className="font-bold text-slate-800">
                  S/ {cart.totalGeneral.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total General (PEN):</span>
                <span className="text-xl font-black text-blue-600">
                  S/ {cart.totalGeneral.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transacciones ACID con bloqueo SELECT FOR UPDATE</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continuar al Checkout Transaccional</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
