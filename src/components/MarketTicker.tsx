/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { MarketDeal, Product } from '../types';
import { TrendingDown, Tag } from 'lucide-react';

interface Slide {
  key: string;
  tipo: 'rebaja' | 'precio';
  descuento?: string;
  titulo: string;
  precio: string;
}

export const MarketTicker: React.FC = () => {
  const { setActiveView, setSearchFilter, setSelectedCategoryFilter } = useApp();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ rebajas }, productos] = await Promise.all([
          api.getAlertasPrecio(),
          api.getProductos(),
        ]);
        const rebajaSlides: Slide[] = (rebajas || []).slice(0, 6).map((r: MarketDeal) => ({
          key: 'reb-' + r.id,
          tipo: 'rebaja',
          descuento: `-${r.porcentaje}%`,
          titulo: r.productoNombre,
          precio: `S/ ${r.nuevoPrecio.toFixed(0)}`,
        }));
        const precioSlides: Slide[] = (productos || [])
          .filter((p: Product) => p.tiendasDisponibles > 0)
          .sort((a, b) => a.precioMinimo - b.precioMinimo)
          .slice(0, 6)
          .map((p: Product) => ({
            key: 'pre-' + p.id,
            tipo: 'precio',
            titulo: p.nombre,
            precio: `S/ ${p.precioMinimo.toFixed(0)}`,
          }));
        setSlides([...rebajaSlides, ...precioSlides]);
      } catch (err) {
        console.error('Error al cargar el ticker:', err);
      }
    };
    load();
  }, []);

  const VISIBLES = 3;

  useEffect(() => {
    if (slides.length <= VISIBLES) return;
    const maxIndex = slides.length - VISIBLES;
    const t = setInterval(
      () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
      5000
    );
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const irAlCatalogo = () => {
    setSearchFilter('');
    setSelectedCategoryFilter(null);
    setActiveView('catalogo');
  };

  return (
    <div className="w-full overflow-hidden border-t border-slate-200 bg-white">
      <button
        onClick={irAlCatalogo}
        className="relative block w-full text-left cursor-pointer group"
      >
        <div
          className="mx-auto flex transition-transform duration-[1200ms] ease-in-out"
          style={{ transform: `translateX(-${index * (100 / VISIBLES)}%)` }}
        >
          {slides.map((s) => (
            <div
              key={s.key}
              className="min-w-[33.3333%] flex items-center justify-center gap-2.5 px-6 py-2 text-xs border-r border-slate-100"
            >
              {s.tipo === 'rebaja' ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              )}
              {s.descuento && (
                <span className="shrink-0 font-black px-2 py-0.5 rounded-md text-[11px] bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  {s.descuento}
                </span>
              )}
              <span className="font-semibold text-slate-700 truncate">{s.titulo}</span>
              <span className="font-black text-slate-900 shrink-0">{s.precio}</span>
            </div>
          ))}
        </div>
      </button>

      <div className="flex items-center justify-center gap-1 pb-1.5 -mt-0.5">
        {slides.map((s, i) => (
          <span
            key={s.key}
            className={`h-1 rounded-full transition-all ${
              i === index ? 'w-4 bg-blue-500' : 'w-1 bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
