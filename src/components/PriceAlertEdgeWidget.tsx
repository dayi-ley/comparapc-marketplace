/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PriceAlert, MarketDeal, Product } from '../types';
import {
  Bell,
  X,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  ArrowRight,
  Flame,
  Percent,
  Mail,
  Zap,
  ExternalLink,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export const PriceAlertEdgeWidget: React.FC = () => {
  const {
    priceAlertDrawerOpen,
    setPriceAlertDrawerOpen,
    selectedProductForAlert,
    closePriceAlertModal,
    openCompareModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rebajas' | 'mis_alertas' | 'crear'>('rebajas');
  const [alertas, setAlertas] = useState<PriceAlert[]>([]);
  const [rebajas, setRebajas] = useState<MarketDeal[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulario de nueva alerta
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [precioObjetivo, setPrecioObjetivo] = useState<number | ''>('');
  const [userEmail, setUserEmail] = useState<string>('cliente@comparapc.pe');
  const [creating, setCreating] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Cargar alertas y productos
  const loadAlertData = async () => {
    try {
      setLoading(true);
      const res = await api.getAlertasPrecio();
      setAlertas(res.alertas || []);
      setRebajas(res.rebajas || []);

      const prodRes = await api.getProductos();
      setProductos(prodRes);
    } catch (err) {
      console.error('Error al cargar alertas de precio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertData();
  }, []);

  // Si se abre el modal con un producto seleccionado, activar la pestaña 'crear'
  useEffect(() => {
    if (selectedProductForAlert) {
      setSelectedProductId(selectedProductForAlert.id);
      const precioBase = selectedProductForAlert.precioMinimo || selectedProductForAlert.precioReferencial;
      // Sugerir un 10% de descuento
      setPrecioObjetivo(Math.round(precioBase * 0.9));
      setActiveTab('crear');
    }
  }, [selectedProductForAlert]);

  const handleCrearAlerta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !precioObjetivo) {
      showToast('Por favor selecciona un producto y especifica el precio objetivo');
      return;
    }

    try {
      setCreating(true);
      const nueva = await api.crearAlertaPrecio({
        productoId: selectedProductId,
        precioObjetivo: Number(precioObjetivo),
        email: userEmail,
      });

      setAlertas((prev) => [nueva, ...prev]);
      showToast(`¡Alerta creada con éxito para ${nueva.productoNombre}!`);
      setActiveTab('mis_alertas');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar alerta');
    } finally {
      setCreating(false);
    }
  };

  const handleEliminarAlerta = async (id: string) => {
    try {
      await api.eliminarAlertaPrecio(id);
      setAlertas((prev) => prev.filter((a) => a.id !== id));
      showToast('Alerta eliminada');
    } catch (err: any) {
      showToast('Error al eliminar alerta');
    }
  };

  const handleSimularBaja = async (prodId: string) => {
    try {
      setSimulating(true);
      const res = await api.simularBajaPrecio(prodId, 15);
      showToast(`⚡ ¡Rebaja aplicada! ${res.productoNombre} bajó S/ ${res.ahorro} (-15%)`);
      await loadAlertData();
      setActiveTab('rebajas');
    } catch (err: any) {
      showToast(err.message || 'Error al simular rebaja');
    } finally {
      setSimulating(false);
    }
  };

  const handleVerEnComparador = (productoId: string) => {
    const prod = productos.find((p) => p.id === productoId);
    if (prod) {
      closePriceAlertModal();
      openCompareModal(prod);
    }
  };

  const selectedProduct = productos.find((p) => p.id === selectedProductId);
  const alertasAlcanzadasCount = alertas.filter((a) => a.alcanzado).length;
  const totalBadges = alertasAlcanzadasCount + (rebajas.length > 0 ? 1 : 0);

  return (
    <>
      {/* BOTÓN / PESTAÑA ANCLADA AL BORDE DERECHO DE LA WEB */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex">
        <button
          onClick={() => setPriceAlertDrawerOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-l-2xl shadow-2xl border-l-2 border-y border-amber-300 p-3 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:pr-4 group"
          title="Ver Alertas de Precio y Rebajas de Mercado"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-950 animate-bounce" />
            {totalBadges > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-amber-400">
                {totalBadges}
              </span>
            )}
          </div>
          <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-bold tracking-wider uppercase text-slate-950 group-hover:text-black">
            Alertas de Precio
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      </div>

      {/* BOTÓN FLOTANTE MÓVIL EN LA ESQUINA INFERIOR DERECHA */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <button
          onClick={() => setPriceAlertDrawerOpen(true)}
          className="bg-amber-400 text-slate-950 p-3.5 rounded-full shadow-2xl border border-amber-300 flex items-center gap-2 cursor-pointer hover:bg-amber-300 transition-all"
        >
          <Bell className="w-5 h-5 text-slate-950" />
          {totalBadges > 0 && (
            <span className="bg-emerald-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">
              {totalBadges}
            </span>
          )}
        </button>
      </div>

      {/* PANEL LATERAL DESPLEGABLE DESDE EL BORDE (DRAWER) */}
      {priceAlertDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Panel */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-amber-400">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Radar de Alertas de Precio</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                      En Vivo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Monitoreo y avisos automáticos de rebajas en hardware
                  </p>
                </div>
              </div>

              <button
                onClick={closePriceAlertModal}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Navegación del Drawer */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('rebajas')}
                className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'rebajas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Rebajas de Hoy</span>
                {rebajas.length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                    {rebajas.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('mis_alertas')}
                className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'mis_alertas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-blue-500" />
                <span>Mis Alertas</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                  {alertas.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('crear')}
                className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'crear'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Crear Alerta</span>
              </button>
            </div>

            {/* Cuerpo del Drawer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: REBAJAS DE HOY */}
              {activeTab === 'rebajas' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Hardware con bajadas de precio detectadas en tiendas verificadas.
                      </span>
                    </div>
                    <button
                      onClick={loadAlertData}
                      disabled={loading}
                      className="p-1 hover:bg-amber-200/60 rounded-lg transition-colors cursor-pointer text-amber-800"
                      title="Refrescar rebajas"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {rebajas.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No hay rebajas recientes reportadas.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {rebajas.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                        >
                          <img
                            src={deal.productoImagen}
                            alt={deal.productoNombre}
                            className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                              {deal.marca} • {deal.tiendaNombre}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs truncate" title={deal.productoNombre}>
                              {deal.productoNombre}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-slate-400 line-through text-[11px]">
                                S/ {deal.precioAnterior.toFixed(2)}
                              </span>
                              <span className="text-emerald-600 font-black text-sm">
                                S/ {deal.nuevoPrecio.toFixed(2)}
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                -{deal.porcentaje}%
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleVerEnComparador(deal.productoId)}
                            className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-colors cursor-pointer shrink-0"
                            title="Ver comparativa de tiendas"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón de simulación para probar el radar en vivo */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 mb-2">
                      ¿Quieres comprobar el sistema de alertas en tiempo real?
                    </p>
                    <button
                      onClick={() => handleSimularBaja('prod-gpu-rtx4070s')}
                      disabled={simulating}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{simulating ? 'Simulando rebaja...' : '⚡ Probar Simulación de Descuento Flash (-15%)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MIS ALERTAS */}
              {activeTab === 'mis_alertas' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                    <span>Alertas configuradas ({alertas.length})</span>
                    <span>Avisos por correo & web</span>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-xs">No tienes alertas guardadas</p>
                      <p className="text-[11px] text-slate-500">
                        Configura un precio objetivo para ser avisado cuando baje.
                      </p>
                      <button
                        onClick={() => setActiveTab('crear')}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-500 transition-colors cursor-pointer"
                      >
                        Crear mi primera alerta
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {alertas.map((alt) => {
                        const diferencia = alt.precioActual - alt.precioObjetivo;
                        return (
                          <div
                            key={alt.id}
                            className={`rounded-2xl border p-3.5 transition-all shadow-sm ${
                              alt.alcanzado
                                ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/40'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={alt.productoImagen}
                                  alt={alt.productoNombre}
                                  className="w-12 h-12 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 text-xs truncate" title={alt.productoNombre}>
                                    {alt.productoNombre}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    Objetivo: S/ {alt.precioObjetivo.toFixed(2)} • Actual: S/{' '}
                                    {alt.precioActual.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleEliminarAlerta(alt.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Eliminar alerta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Estado de la meta */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                              {alt.alcanzado ? (
                                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px]">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>🎯 ¡Meta Alcanzada! Listo para comprar</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-medium">
                                  <TrendingDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Faltan S/ {diferencia.toFixed(2)} para tu objetivo</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleVerEnComparador(alt.productoId)}
                                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-500 transition-colors cursor-pointer"
                                >
                                  Ver Ofertas
                                </button>
                                {!alt.alcanzado && (
                                  <button
                                    onClick={() => handleSimularBaja(alt.productoId)}
                                    disabled={simulating}
                                    title="Simular que el producto baja de precio"
                                    className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold hover:bg-amber-200 transition-colors cursor-pointer"
                                  >
                                    ⚡ Simular
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CREAR ALERTA */}
              {activeTab === 'crear' && (
                <form onSubmit={handleCrearAlerta} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Selecciona el Producto a Monitorear
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const p = productos.find((item) => item.id === e.target.value);
                        if (p) {
                          setPrecioObjetivo(Math.round((p.precioMinimo || p.precioReferencial) * 0.9));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Elige un componente del catálogo --</option>
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          [{prod.marca}] {prod.nombre} (Desde S/ {(prod.precioMinimo || prod.precioReferencial).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center gap-3">
                      <img
                        src={selectedProduct.imagenUrl}
                        alt={selectedProduct.nombre}
                        className="w-12 h-12 object-cover rounded-xl bg-white border border-blue-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-blue-700 uppercase">
                          {selectedProduct.marca}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {selectedProduct.nombre}
                        </h4>
                        <span className="text-[11px] text-slate-600 block">
                          Mejor precio actual:{' '}
                          <strong className="text-slate-900">
                            S/ {(selectedProduct.precioMinimo || selectedProduct.precioReferencial).toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Precio Objetivo Deseado (S/)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                        S/
                      </span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={precioObjetivo}
                        onChange={(e) => setPrecioObjetivo(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Ej. 1650"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Botones de sugerencias rápidas de descuento */}
                    {selectedProduct && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 font-medium">Sugerido:</span>
                        {[5, 10, 15, 20].map((pct) => {
                          const base = selectedProduct.precioMinimo || selectedProduct.precioReferencial;
                          const sugerido = Math.round(base * ((100 - pct) / 100));
                          return (
                            <button
                              type="button"
                              key={pct}
                              onClick={() => setPrecioObjetivo(sugerido)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              -{pct}% (S/ {sugerido})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Correo Electrónico para Notificación
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="tu-correo@ejemplo.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creating || !selectedProductId || !precioObjetivo}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{creating ? 'Guardando alerta...' : 'Activar Alerta de Precio'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Footer del Drawer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>El radar escanea cotizaciones de tiendas en tiempo real.</span>
              <button
                onClick={closePriceAlertModal}
                className="text-slate-700 font-bold hover:underline cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
