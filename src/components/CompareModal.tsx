/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ProductOffersResponse } from '../types';
import {
  X,
  Scale,
  Star,
  MapPin,
  Truck,
  Building2,
  CheckCircle2,
  ShoppingCart,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Bell,
} from 'lucide-react';
import { PriceHistorySection } from './PriceHistorySection';

export const CompareModal: React.FC = () => {
  const { selectedProductForCompare, closeCompareModal, addToCart, openPriceAlertModal } = useApp();
  const [data, setData] = useState<ProductOffersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ofertas' | 'historial'>('ofertas');
  const [selectedTiendaForHistory, setSelectedTiendaForHistory] = useState<string>('todas');

  useEffect(() => {
    if (!selectedProductForCompare) return;

    const fetchOffers = async () => {
      setLoading(true);
      try {
        const response = await api.getOfertasProducto(selectedProductForCompare.id);
        setData(response);
      } catch (err) {
        console.error('Error al cargar ofertas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [selectedProductForCompare]);

  if (!selectedProductForCompare) return null;

  const handleAdd = async (inventarioId: string) => {
    setAddingId(inventarioId);
    await addToCart(inventarioId, 1);
    setAddingId(null);
  };

  const handleVerHistorialTienda = (tiendaId: string) => {
    setSelectedTiendaForHistory(tiendaId);
    setActiveTab('historial');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedProductForCompare.imagenUrl}
              alt={selectedProductForCompare.nombre}
              className="w-12 h-12 rounded-xl object-cover bg-white p-1 border border-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedProductForCompare.marca}
                </span>
                <span className="text-[10px] text-slate-400">
                  Catálogo Oficial ComparaPC
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold leading-tight mt-0.5 line-clamp-1">
                {selectedProductForCompare.nombre}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-300">
                <span>
                  Mejor Precio:{' '}
                  <strong className="text-emerald-400 text-xs">
                    {data?.mejorPrecio
                      ? `S/ ${data.mejorPrecio.toFixed(2)}`
                      : 'Consultando...'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Tiendas: <strong>{data?.totalTiendas || 0}</strong>
                </span>
                <span>•</span>
                <span>
                  Stock: <strong>{data?.totalStock || 0}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={closeCompareModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: Ofertas vs Historial de Precios */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 sm:px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ofertas')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ofertas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Comparativa por Tiendas</span>
            {data?.ofertas && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'ofertas'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {data.ofertas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setSelectedTiendaForHistory('todas');
              setActiveTab('historial');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'historial'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Historial de Precios</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold tracking-wide">
              Evolución y Gráfico
            </span>
          </button>
        </div>

        {/* Modal Body / Contenido según pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'historial' ? (
            <PriceHistorySection
              productoId={selectedProductForCompare.id}
              initialTiendaId={selectedTiendaForHistory}
            />
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-700">
                    MÓDULO 3: TABLA COMPARATIVA DE OFERTAS
                  </span>
                </div>
                <span>Ordenado por menor precio. Ofertas agotadas al final.</span>
              </div>

              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 font-medium">
                    Consultando inventarios en PostgreSQL...
                  </p>
                </div>
              ) : !data || data.ofertas.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No hay ofertas activas en este momento.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/80">
                        <th className="py-3 px-4">Tienda / Local</th>
                        <th className="py-3 px-3">Ubicación</th>
                        <th className="py-3 px-3 text-center">Calificación</th>
                        <th className="py-3 px-3 text-center">Stock</th>
                        <th className="py-3 px-3">Entrega</th>
                        <th className="py-3 px-4 text-right">Precio</th>
                        <th className="py-3 px-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.ofertas.map((oferta) => (
                        <tr
                          key={oferta.inventarioId}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            oferta.esMejorPrecio ? 'bg-blue-50/30' : ''
                          } ${!oferta.disponible ? 'opacity-60 bg-slate-50/50' : ''}`}
                        >
                          {/* Tienda */}
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span>{oferta.tiendaNombre}</span>
                                  {oferta.esMejorPrecio && (
                                    <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                                      MEJOR PRECIO
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    RUC: {oferta.ruc}
                                  </span>
                                  <span>•</span>
                                  <button
                                    onClick={() => handleVerHistorialTienda(oferta.tiendaId)}
                                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Ver Historial</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Ubicación */}
                          <td className="py-3.5 px-3 text-slate-600 text-xs">
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate max-w-[170px]" title={oferta.direccion}>
                                {oferta.distrito}
                              </span>
                            </div>
                          </td>

                          {/* Calificación */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{oferta.reputacion}</span>
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-3.5 px-3 text-center">
                            {oferta.stock > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {oferta.stock} disp.
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                Agotado
                              </span>
                            )}
                          </td>

                          {/* Entrega */}
                          <td className="py-3.5 px-3 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {oferta.metodoEntrega === 'recojo_y_envio'
                                  ? 'Recojo & Envío'
                                  : oferta.metodoEntrega === 'recojo_en_tienda'
                                  ? 'Solo Recojo'
                                  : 'Envío Domicilio'}
                              </span>
                            </div>
                          </td>

                          {/* Precio */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-base sm:text-lg font-black text-slate-900">
                              S/ {oferta.precio.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Garantía {oferta.garantiaMeses}m
                            </span>
                          </td>

                          {/* Acción */}
                          <td className="py-3.5 px-4 text-center">
                            {oferta.disponible ? (
                              <button
                                onClick={() => handleAdd(oferta.inventarioId)}
                                disabled={addingId === oferta.inventarioId}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>{addingId === oferta.inventarioId ? 'Agregando...' : 'Comprar'}</span>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed mx-auto"
                              >
                                Sin Stock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Precios congelados durante la generación de órdenes en el checkout transaccional.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openPriceAlertModal(selectedProductForCompare)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl transition-colors cursor-pointer border border-amber-200 flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Crear Alerta de Precio</span>
            </button>
            <button
              onClick={closeCompareModal}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cerrar Comparador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
