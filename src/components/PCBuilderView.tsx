/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Product, CompatibilityCheck } from '../types';

const PCBuilder3DCanvas = lazy(() =>
  import('./PCBuilder3DCanvas').then((m) => ({ default: m.PCBuilder3DCanvas }))
);
import {
  Wrench,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Plus,
  Trash2,
  DollarSign,
  Info,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Tv,
  CircuitBoard,
  Layers,
  HardDrive,
  Box,
  Fan,
} from 'lucide-react';

interface ComponentSlot {
  key: string;
  label: string;
  categoryId: string;
  icon: any;
  product?: Product;
  selectedInventarioId?: string;
  selectedStorePrice?: number;
  selectedStoreName?: string;
}

export const PCBuilderView: React.FC = () => {
  const { addToCart, showToast, openAiWithPrompt, setCreateProductModalOpen } = useApp();

  const [presupuestoInput, setPresupuestoInput] = useState<number>(5500);
  const [usoSeleccionado, setUsoSeleccionado] = useState<string>('gaming');
  const [loadingAutoBuild, setLoadingAutoBuild] = useState(false);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);
  const [compatibility, setCompatibility] = useState<CompatibilityCheck | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [activePickerSlot, setActivePickerSlot] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);
  const [modo3D, setModo3D] = useState(false);

  // Inicializar los 8 slots requeridos
  const [slots, setSlots] = useState<ComponentSlot[]>([
    { key: 'cpu', label: 'Procesador (CPU)', categoryId: 'cat-cpu', icon: Cpu },
    { key: 'mobo', label: 'Placa Madre (Motherboard)', categoryId: 'cat-mobo', icon: CircuitBoard },
    { key: 'ram', label: 'Memoria RAM', categoryId: 'cat-ram', icon: Layers },
    { key: 'gpu', label: 'Tarjeta Gráfica (GPU)', categoryId: 'cat-gpu', icon: Tv },
    { key: 'ssd', label: 'Almacenamiento SSD NVMe', categoryId: 'cat-ssd', icon: HardDrive },
    { key: 'psu', label: 'Fuente de Alimentación (PSU)', categoryId: 'cat-psu', icon: Zap },
    { key: 'case', label: 'Gabinete (Chasis)', categoryId: 'cat-case', icon: Box },
    { key: 'cool', label: 'Refrigeración / Cooler', categoryId: 'cat-cool', icon: Fan },
  ]);

  // Cargar productos del catálogo para el selector
  useEffect(() => {
    const loadProds = async () => {
      try {
        const prods = await api.getProductos();
        setAvailableProducts(prods);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };
    loadProds();
  }, []);

  // Ejecutar verificación de compatibilidad cada vez que cambien componentes clave
  useEffect(() => {
    const checkCompat = async () => {
      const cpu = slots.find((s) => s.key === 'cpu')?.product?.id;
      const mobo = slots.find((s) => s.key === 'mobo')?.product?.id;
      const ram = slots.find((s) => s.key === 'ram')?.product?.id;
      const gpu = slots.find((s) => s.key === 'gpu')?.product?.id;
      const psu = slots.find((s) => s.key === 'psu')?.product?.id;
      const caseItem = slots.find((s) => s.key === 'case')?.product?.id;
      const cool = slots.find((s) => s.key === 'cool')?.product?.id;

      if (!cpu && !mobo && !ram) {
        setCompatibility(null);
        return;
      }

      try {
        const res = await api.verificarCompatibilidad({
          cpuId: cpu,
          moboId: mobo,
          ramId: ram,
          gpuId: gpu,
          psuId: psu,
          caseId: caseItem,
          coolId: cool,
        });
        setCompatibility(res);
      } catch (err) {
        console.error('Error al verificar compatibilidad:', err);
      }
    };
    checkCompat();
  }, [slots]);

  // Auto-Ensamblaje con IA y algoritmo ComparaPC
  const handleAutoAssemble = async () => {
    setLoadingAutoBuild(true);
    try {
      const ensamble = await api.ensamblarPC(presupuestoInput, usoSeleccionado);
      
      // Mapear componentes devueltos a los slots
      const updatedSlots = [...slots];
      for (const item of ensamble.componentes) {
        let targetKey = 'cpu';
        if (item.rol === 'Procesador') targetKey = 'cpu';
        else if (item.rol === 'Placa Madre') targetKey = 'mobo';
        else if (item.rol === 'Memoria RAM') targetKey = 'ram';
        else if (item.rol === 'Tarjeta Gráfica') targetKey = 'gpu';
        else if (item.rol === 'Almacenamiento SSD') targetKey = 'ssd';
        else if (item.rol === 'Fuente de Alimentación') targetKey = 'psu';
        else if (item.rol === 'Gabinete') targetKey = 'case';
        else if (item.rol === 'Refrigeración') targetKey = 'cool';

        const prod = availableProducts.find((p) => p.id === item.productoId);
        const slotIdx = updatedSlots.findIndex((s) => s.key === targetKey);
        if (slotIdx >= 0) {
          updatedSlots[slotIdx] = {
            ...updatedSlots[slotIdx],
            product: prod,
            selectedInventarioId: item.inventarioId,
            selectedStorePrice: item.precio,
            selectedStoreName: item.tiendaNombre,
          };
        }
      }

      setSlots(updatedSlots);
      setCompatibility(ensamble.compatibilidad);
      showToast('✓ Configuración ensamblada y optimizada con la regla 45/25/15/15');
    } catch (err: any) {
      showToast(`Error al ensamblar: ${err.message}`);
    } finally {
      setLoadingAutoBuild(false);
    }
  };

  const handleSelectProductForSlot = async (slotKey: string, product: Product) => {
    try {
      const offersData = await api.getOfertasProducto(product.id);
      const bestOffer = offersData.ofertas.find((o) => o.stock > 0) || offersData.ofertas[0];

      setSlots((prev) =>
        prev.map((s) =>
          s.key === slotKey
            ? {
                ...s,
                product,
                selectedInventarioId: bestOffer?.inventarioId,
                selectedStorePrice: bestOffer?.precio || product.precioMinimo,
                selectedStoreName: bestOffer?.tiendaNombre || 'Tienda Asociada',
              }
            : s
        )
      );
      setActivePickerSlot(null);
    } catch (err) {
      console.error('Error al seleccionar producto:', err);
    }
  };

  const handleRemoveSlot = (slotKey: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.key === slotKey
          ? {
              ...s,
              product: undefined,
              selectedInventarioId: undefined,
              selectedStorePrice: undefined,
              selectedStoreName: undefined,
            }
          : s
      )
    );
  };

  const handleAddAllToCart = async () => {
    setAddingAll(true);
    let count = 0;
    try {
      for (const slot of slots) {
        if (slot.selectedInventarioId) {
          await addToCart(slot.selectedInventarioId, 1);
          count++;
        }
      }
      showToast(`✓ Se agregaron ${count} componentes al carrito`);
    } catch (err: any) {
      showToast(`Error al agregar ensamble: ${err.message}`);
    } finally {
      setAddingAll(false);
    }
  };

  // Cálculos de costo acumulado
  const costoTotal = slots.reduce((acc, curr) => acc + (curr.selectedStorePrice || 0), 0);
  const presupuestoRestante = presupuestoInput - costoTotal;
  const componentesSeleccionadosCount = slots.filter((s) => s.product).length;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER ENSAMBLADOR INTELIGENTE */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>MÓDULO 4: MOTOR DE COMPATIBILIDAD NEXUS MATCH</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Ensamblador Inteligente de PC
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Construye tu computadora seleccionando componente por componente. Nuestro motor algorítmico verifica socket, bus de memoria, tolerancias térmicas y tamaño físico en tiempo real.
          </p>
        </div>

        {/* Panel Presupuesto & Auto-Build */}
        <div className="bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-inner flex flex-col gap-3 min-w-[320px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase">
              Presupuesto Objetivo:
            </span>
            <span className="text-lg font-black text-emerald-400">
              S/ {presupuestoInput.toLocaleString('es-PE')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="2500"
              max="20000"
              step="250"
              value={presupuestoInput}
              onChange={(e) => setPresupuestoInput(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={usoSeleccionado}
              onChange={(e) => setUsoSeleccionado(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-medium"
            >
              <option value="gaming">Gaming Competitivo / AAA</option>
              <option value="creacion_contenido">Edición de Video y 3D</option>
              <option value="desarrollo">Desarrollo de Software</option>
              <option value="oficina">Hogar y Oficina</option>
            </select>

            <button
              onClick={handleAutoAssemble}
              disabled={loadingAutoBuild}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{loadingAutoBuild ? 'Optimizando...' : 'Auto-Ensamblar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setModo3D((v) => !v)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                modo3D
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{modo3D ? 'Vista 3D activa' : 'Vista 3D'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REGLA DE DISTRIBUCIÓN RECOMENDADA (45/25/15/15) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            Distribución Referencial para PC Gamer (45% GPU / 25% CPU / 15% Mobo+RAM / 15% Fuente+SSD)
          </span>
          <span className="font-mono text-slate-500">
            {componentesSeleccionadosCount} de 8 seleccionados
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold text-center">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
            <span className="block font-black text-blue-600">45% GPU</span>
            <span className="text-[10px] text-blue-700 font-mono">
              ~S/ {(presupuestoInput * 0.45).toFixed(0)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900">
            <span className="block font-black text-indigo-600">25% CPU</span>
            <span className="text-[10px] text-indigo-700 font-mono">
              ~S/ {(presupuestoInput * 0.25).toFixed(0)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
            <span className="block font-black text-amber-600">15% Placa & RAM</span>
            <span className="text-[10px] text-amber-700 font-mono">
              ~S/ {(presupuestoInput * 0.15).toFixed(0)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
            <span className="block font-black text-emerald-600">15% Fuente & SSD</span>
            <span className="text-[10px] text-emerald-700 font-mono">
              ~S/ {(presupuestoInput * 0.15).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* PROTOTIPO 3D (BETA) */}
      {modo3D && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ensamblaje 3D (Beta) — haz clic en cada pieza y el gabinete gira hacia su ubicacion</span>
          </div>
          <Suspense
            fallback={
              <div className="h-[420px] rounded-3xl bg-slate-950 border border-slate-800 grid place-items-center">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-blue-400 animate-spin" />
                  Cargando motor 3D...
                </div>
              </div>
            }
          >
            <PCBuilder3DCanvas
              onSelectPieza={(key) => setActivePickerSlot(key)}
              piezasConProducto={
                new Set(slots.filter((s) => s.product).map((s) => s.key))
              }
              onReiniciar={() => setSlots((prev) => prev.map((s) => ({
                ...s,
                product: undefined,
                selectedInventarioId: undefined,
                selectedStorePrice: undefined,
                selectedStoreName: undefined,
              })))}
            />
          </Suspense>
        </div>
      )}

      {/* GRID DE COMPONENTES + RESUMEN FLOTANTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LISTA DE LOS 8 SLOTS */}
        <div className="lg:col-span-2 space-y-3">
          {slots.map((slot) => {
            const Icon = slot.icon;
            const hasProduct = !!slot.product;

            return (
              <div
                key={slot.key}
                className={`p-4 rounded-2xl border transition-all ${
                  hasProduct
                    ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400'
                    : 'bg-slate-50/70 border-dashed border-slate-300 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        hasProduct
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {slot.label}
                      </span>

                      {hasProduct ? (
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {slot.product!.nombre}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-semibold text-blue-600">
                              {slot.selectedStoreName}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-900">
                              S/ {slot.selectedStorePrice?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium">
                          No seleccionado todavía
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones por Slot */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasProduct ? (
                      <>
                        <button
                          onClick={() => setActivePickerSlot(slot.key)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cambiar
                        </button>
                        <button
                          onClick={() => handleRemoveSlot(slot.key)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Quitar componente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setActivePickerSlot(slot.key)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Seleccionar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SIDEBAR DE ESTADO, COMPATIBILIDAD Y TOTALES */}
        <div className="space-y-4 sticky top-36">
          {/* Tarjeta de Resumen Presupuestario */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Resumen Financiero del Ensamble
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Presupuesto objetivo:</span>
                <span className="font-semibold text-slate-900">
                  S/ {presupuestoInput.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo acumulado:</span>
                <span className="text-base font-black text-blue-600">
                  S/ {costoTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                <span>Saldo disponible:</span>
                <span
                  className={`font-bold ${
                    presupuestoRestante >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  S/ {presupuestoRestante.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={componentesSeleccionadosCount === 0 || addingAll}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {addingAll
                  ? 'Cargando al Carrito...'
                  : `Cargar ${componentesSeleccionadosCount} componentes al Carrito`}
              </span>
            </button>
          </div>

          {/* Tarjeta de Compatibilidad Técnica Nexus Match */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Nexus Match Compatibilidad
                </h3>
              </div>
              <button
                onClick={() =>
                  openAiWithPrompt(
                    'Verifica detalladamente la compatibilidad de mi ensamble actual y explícame si habrá cuello de botella o incompatibilidades de socket y watts.'
                  )
                }
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Analizar con IA</span>
              </button>
            </div>

            {compatibility ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold ${
                    compatibility.compatible
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {compatibility.compatible ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>100% Compatible y Balanceado</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>Incompatibilidades Detectadas</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Consumo Estimado</span>
                    <span className="font-black text-slate-900">
                      {compatibility.consumoEstimadoWatts} Watts
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Fuente Recomendada</span>
                    <span className="font-black text-blue-600">
                      {compatibility.fuenteRecomendadaWatts}W +30%
                    </span>
                  </div>
                </div>

                {/* Lista de notas y advertencias */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-[11px]">
                  {compatibility.errores.map((err, i) => (
                    <div
                      key={`err-${i}`}
                      className="p-2 rounded-xl bg-red-50 text-red-800 flex items-start gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}

                  {compatibility.advertencias.map((adv, i) => (
                    <div
                      key={`adv-${i}`}
                      className="p-2 rounded-xl bg-amber-50 text-amber-800 flex items-start gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}

                  {compatibility.notasPositivas.map((nota, i) => (
                    <div
                      key={`nota-${i}`}
                      className="p-2 rounded-xl bg-slate-50 text-slate-700 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{nota}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                Selecciona al menos Procesador, Placa y Memoria RAM para ejecutar las comprobaciones técnicas.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PICKER DE COMPONENTES */}
      {activePickerSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  Seleccionar {slots.find((s) => s.key === activePickerSlot)?.label}
                </h3>
                <p className="text-xs text-slate-400">
                  Elige un componente del catálogo para asignarlo a este ensamble
                </p>
              </div>
              <button
                onClick={() => setActivePickerSlot(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
              {(() => {
                const filtered = availableProducts.filter(
                  (p) =>
                    p.categoriaId ===
                    slots.find((s) => s.key === activePickerSlot)?.categoryId
                );

                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-slate-500">
                        No hay componentes registrados en esta categoría aún (Estado Limpio).
                      </p>
                      <button
                        onClick={() => {
                          setActivePickerSlot(null);
                          setCreateProductModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer"
                      >
                        + Registrar Producto en esta Categoría
                      </button>
                    </div>
                  );
                }

                return filtered.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={prod.imagenUrl}
                        alt={prod.nombre}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 p-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          {prod.marca}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {prod.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                          {prod.especificaciones.socket && (
                            <span>Socket {prod.especificaciones.socket}</span>
                          )}
                          {prod.especificaciones.ramType && (
                            <span>• {prod.especificaciones.ramType}</span>
                          )}
                          {prod.especificaciones.tdpWatts && (
                            <span>• {prod.especificaciones.tdpWatts}W TDP</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 block">
                        S/ {prod.precioMinimo.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleSelectProductForSlot(activePickerSlot, prod)}
                        className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Asignar
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
