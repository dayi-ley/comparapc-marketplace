/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { PriceHistoryResponse, PricePoint } from '../types';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Store,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  RefreshCw,
  Info,
  Scale,
  Sparkles,
} from 'lucide-react';

interface PriceHistorySectionProps {
  productoId: string;
  initialTiendaId?: string;
}

export const PriceHistorySection: React.FC<PriceHistorySectionProps> = ({
  productoId,
  initialTiendaId = 'todas',
}) => {
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros: 7 días, 30 días, 3 meses (90d), 6 meses (180d), 1 año (365d)
  const [selectedRango, setSelectedRango] = useState<number>(30);
  const [selectedTiendaId, setSelectedTiendaId] = useState<string>(initialTiendaId);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistorialPrecios(
        productoId,
        selectedTiendaId === 'todas' ? undefined : selectedTiendaId,
        selectedRango
      );
      setData(res);
      setHoveredPointId(null);
    } catch (err: any) {
      console.error('Error al cargar historial de precios:', err);
      setError(err.message || 'Error al cargar el historial de precios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [productoId, selectedTiendaId, selectedRango]);

  const rangosDisponibles = [
    { label: '7 días', dias: 7 },
    { label: '30 días', dias: 30 },
    { label: '3 meses', dias: 90 },
    { label: '6 meses', dias: 180 },
    { label: '1 año', dias: 365 },
  ];

  // Cálculo de coordenadas para el gráfico SVG (una serie por tienda)
  const chartConfig = useMemo(() => {
    if (!data || !data.puntos || data.puntos.length === 0) return null;

    const puntos = data.puntos;
    const precios = puntos.map((p) => p.precio);
    const minVal = Math.min(...precios);
    const maxVal = Math.max(...precios);

    const spread = maxVal - minVal;
    const marginY = spread === 0 ? maxVal * 0.1 || 10 : spread * 0.15;
    const yMin = Math.max(0, minVal - marginY);
    const yMax = maxVal + marginY;

    const width = 760;
    const height = 240;
    const padding = { top: 25, right: 30, bottom: 35, left: 75 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const times = puntos.map((p) => new Date(p.fecha).getTime());
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);

    const PALETA = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#DB2777', '#65A30D'];

    const grupos = new Map<string, PricePoint[]>();
    for (const p of puntos) {
      const key = p.tiendaId || p.tiendaNombre;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(p);
    }

    const series = Array.from(grupos.entries()).map(([tiendaId, pts], si) => {
      const ordenados = [...pts].sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
      const coords = ordenados.map((p) => {
        const t = new Date(p.fecha).getTime();
        const x = tMax === tMin ? padding.left + plotWidth / 2 : padding.left + ((t - tMin) / (tMax - tMin)) * plotWidth;
        const normY = yMax === yMin ? 0.5 : (p.precio - yMin) / (yMax - yMin);
        const y = padding.top + plotHeight - normY * plotHeight;
        return { x, y, point: p };
      });

      let pathD = '';
      if (coords.length === 1) {
        pathD = `M ${coords[0].x - 40} ${coords[0].y} L ${coords[0].x + 40} ${coords[0].y}`;
      } else {
        coords.forEach((c, idx) => {
          pathD += idx === 0 ? `M ${c.x} ${c.y}` : ` L ${c.x} ${c.y}`;
        });
      }

      let areaD = '';
      if (coords.length > 1) {
        areaD = `${pathD} L ${coords[coords.length - 1].x} ${padding.top + plotHeight} L ${coords[0].x} ${padding.top + plotHeight} Z`;
      }

      return {
        tiendaId,
        tiendaNombre: ordenados[0].tiendaNombre,
        color: PALETA[si % PALETA.length],
        coords,
        pathD,
        areaD,
      };
    });

    const refLevels = [
      { label: `S/ ${minVal.toFixed(0)}`, y: padding.top + plotHeight - ((minVal - yMin) / (yMax - yMin)) * plotHeight },
      { label: `S/ ${maxVal.toFixed(0)}`, y: padding.top + plotHeight - ((maxVal - yMin) / (yMax - yMin)) * plotHeight },
    ];

    return {
      width,
      height,
      padding,
      plotWidth,
      plotHeight,
      series,
      refLevels,
      minVal,
      maxVal,
      yMin,
      yMax,
      primeroFecha: new Date(tMin).toISOString(),
      medioFecha: new Date((tMin + tMax) / 2).toISOString(),
      ultimoFecha: new Date(tMax).toISOString(),
      esMultiTienda: series.length > 1,
    };
  }, [data]);

  const activeHoverPoint = useMemo(() => {
    if (!chartConfig) return null;
    const allCoords = chartConfig.series.flatMap((s) => s.coords);
    if (allCoords.length === 0) return null;
    if (hoveredPointId) {
      const found = allCoords.find((c) => c.point.id === hoveredPointId);
      if (found) return found;
    }
    return allCoords.reduce((a, b) =>
      new Date(b.point.fecha).getTime() > new Date(a.point.fecha).getTime() ? b : a
    );
  }, [hoveredPointId, chartConfig]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" ref={containerRef}>
      {/* BARRA SUPERIOR DE FILTROS */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Tienda */}
        <div className="flex items-center gap-2.5">
          <Store className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Filtrar por Tienda:
            </span>
            <select
              value={selectedTiendaId}
              onChange={(e) => setSelectedTiendaId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              <option value="todas">Todas las tiendas (Evolución de Mercado)</option>
              {data?.tiendasDisponibles.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} (Actual: S/ {t.precioActual.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros de Rango Temporal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          {rangosDisponibles.map((r) => {
            const isSelected = selectedRango === r.dias;
            return (
              <button
                key={r.dias}
                onClick={() => setSelectedRango(r.dias)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/90'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-600 font-semibold">
            Consultando historial de precios en la base de datos...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 text-red-700 rounded-3xl border border-red-200 text-xs">
          <p className="font-bold mb-1">No se pudo cargar el historial</p>
          <p>{error}</p>
        </div>
      ) : !data || data.puntos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Sin Historial en este Período</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No se han registrado variaciones de precio para este producto en el rango de {selectedRango} días.
            Cuando los distribuidores actualicen sus precios, se almacenarán y graficarán aquí.
          </p>
        </div>
      ) : (
        <>
          {/* TARJETAS DE MÉTRICAS CLAVE (PRECIO ACTUAL, MÍNIMO, MÁXIMO, PROMEDIO) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Precio Actual */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                  Precio Actual
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-200">
                  En Vivo
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                S/ {data.precioActual.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 truncate">
                {selectedTiendaId === 'todas' ? 'Mejor oferta activa' : 'Tienda seleccionada'}
              </span>
            </div>

            {/* Precio Mínimo */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Precio Mínimo
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                  Punto Bajo
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1.5">
                <ArrowDownRight className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>S/ {data.precioMinimo.toFixed(2)}</span>
              </div>
              <span className="text-[11px] text-emerald-700/80 mt-1">
                Menor valor registrado en {selectedRango}d
              </span>
            </div>

            {/* Precio Máximo */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                  Precio Máximo
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[9px] border border-amber-200">
                  Pico
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1 flex items-center gap-1.5">
                <ArrowUpRight className="w-5 h-5 text-amber-500 shrink-0" />
                <span>S/ {data.precioMaximo.toFixed(2)}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                Mayor valor registrado en {selectedRango}d
              </span>
            </div>

            {/* Precio Promedio */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                  Precio Promedio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[9px] border border-indigo-200">
                  Media
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-1">
                S/ {data.precioPromedio.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                {data.puntos.length} puntos analizados
              </span>
            </div>
          </div>

          {/* GRÁFICO INTERACTIVO DE EVOLUCIÓN */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>Gráfica de Evolución Temporal de Precios</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pasa el cursor o presiona sobre los puntos para inspeccionar precio, fecha y tienda
                </p>
              </div>

              {activeHoverPoint && (
                <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-blue-900 font-black text-sm">
                    S/ {activeHoverPoint.point.precio.toFixed(2)}
                  </span>
                  <span className="text-slate-400 text-[10px]">•</span>
                  <span className="text-slate-600 font-medium text-[11px]">
                    {formatDate(activeHoverPoint.point.fecha)}
                  </span>
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                    {activeHoverPoint.point.tiendaNombre}
                  </span>
                </div>
              )}
            </div>

            {chartConfig && (
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                  className="w-full h-auto overflow-visible select-none"
                  style={{ maxHeight: '280px' }}
                >
                  <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Leyenda de tiendas (solo si hay mas de una serie) */}
                {chartConfig.esMultiTienda && (
                  <g>
                    {chartConfig.series.map((s, i) => (
                      <g key={s.tiendaId} transform={`translate(${chartConfig.padding.left + i * 130}, 10)`}>
                        <circle cx="0" cy="0" r="4" fill={s.color} />
                        <text x="9" y="4" className="text-[10px] fill-slate-600 font-semibold">
                          {s.tiendaNombre.length > 14 ? s.tiendaNombre.slice(0, 13) + '…' : s.tiendaNombre}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* Líneas de cuadrícula horizontal de referencia */}
                {chartConfig.refLevels.map((lvl, i) => (
                  <g key={i}>
                    <line
                      x1={chartConfig.padding.left}
                      y1={lvl.y}
                      x2={chartConfig.width - chartConfig.padding.right}
                      y2={lvl.y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={chartConfig.padding.left - 10}
                      y={lvl.y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono font-medium"
                    >
                      {lvl.label}
                    </text>
                  </g>
                ))}

                {/* Series: una linea por tienda */}
                {chartConfig.series.map((s) => (
                  <g key={s.tiendaId}>
                    {!chartConfig.esMultiTienda && s.areaD && (
                      <path d={s.areaD} fill="url(#priceGradient)" />
                    )}
                    <path
                      d={s.pathD}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={chartConfig.esMultiTienda ? 2.5 : 3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}

                {/* Puntos de datos interactivos */}
                {chartConfig.series.map((s) =>
                  s.coords.map((c) => {
                    const isHovered = hoveredPointId === c.point.id;
                    return (
                      <g
                        key={c.point.id}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointId(c.point.id)}
                        onClick={() => setHoveredPointId(c.point.id)}
                      >
                        <circle cx={c.x} cy={c.y} r="14" fill="transparent" />
                        {isHovered && (
                          <circle cx={c.x} cy={c.y} r="8" fill={s.color} opacity="0.5" className="animate-ping" />
                        )}
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={isHovered ? 6 : 3.5}
                          fill="#FFFFFF"
                          stroke={s.color}
                          strokeWidth={isHovered ? 3.5 : 2.5}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })
                )}

                {/* Fechas en el eje X */}
                <text
                  x={chartConfig.padding.left}
                  y={chartConfig.height - 8}
                  textAnchor="start"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {formatDate(chartConfig.primeroFecha)}
                </text>
                <text
                  x={chartConfig.padding.left + chartConfig.plotWidth / 2}
                  y={chartConfig.height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {formatDate(chartConfig.medioFecha)}
                </text>
                <text
                  x={chartConfig.width - chartConfig.padding.right}
                  y={chartConfig.height - 8}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {formatDate(chartConfig.ultimoFecha)}
                </text>
                </svg>
              </div>
            )}
          </div>

          {/* TABLA / HISTORIAL DE FECHAS EN LAS QUE CAMBIARON LOS PRECIOS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Registro Cronológico de Variaciones de Precio</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fechas exactas, tiendas y montos donde se registraron modificaciones de precio
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                {data.cambios.length} variaciones
              </span>
            </div>

            {data.cambios.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No se registraron cambios de precio en el período seleccionado. El precio se ha mantenido constante.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-3">Tienda</th>
                      <th className="py-3 px-3 text-right">Precio Anterior</th>
                      <th className="py-3 px-3 text-right">Nuevo Precio</th>
                      <th className="py-3 px-3 text-center">Variación</th>
                      <th className="py-3 px-4">Motivo / Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.cambios.map((c) => {
                      const esRebaja = c.diferencia < 0;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-700 font-semibold whitespace-nowrap">
                            {formatDateTime(c.fecha)}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900">{c.tiendaNombre}</span>
                          </td>

                          <td className="py-3 px-3 text-right text-slate-400 line-through">
                            S/ {c.precioAnterior.toFixed(2)}
                          </td>

                          <td className="py-3 px-3 text-right font-black text-slate-900">
                            S/ {c.precio.toFixed(2)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                esRebaja
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {esRebaja ? (
                                <ArrowDownRight className="w-3 h-3" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3" />
                              )}
                              <span>
                                {esRebaja ? '' : '+'}
                                S/ {c.diferencia.toFixed(2)} ({c.porcentaje}%)
                              </span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <span className="text-[11px] font-medium capitalize">
                              {c.motivo?.replace(/_/g, ' ') || 'Actualización de precio'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
