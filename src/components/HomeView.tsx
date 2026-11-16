/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Product } from '../types';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Scale,
  Zap,
  TrendingDown,
  Cpu,
  Tv,
  Layers,
  CircuitBoard,
  HardDrive,
  Box,
  Fan,
  CheckCircle2,
  ArrowRight,
  Store as StoreIcon,
  Star,
  MapPin,
  Bell,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    setActiveView,
    setSelectedCategoryFilter,
    setSearchFilter,
    openCompareModal,
    openPriceAlertModal,
    openAiWithPrompt,
    setRegisterStoreModalOpen,
    setCreateProductModalOpen,
    cargarDatosDemo,
  } = useApp();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await api.getProductos();
        setFeaturedProducts(prods.slice(0, 6));
        const tiendas = await api.getTiendas();
        setStores(tiendas);
      } catch (err) {
        console.error('Error al cargar inicio:', err);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchFilter(localSearch.trim());
      setSelectedCategoryFilter(null);
      setActiveView('catalogo');
    }
  };

  const handleQuickTag = (tag: string) => {
    setSearchFilter(tag);
    setSelectedCategoryFilter(null);
    setActiveView('catalogo');
  };

  const categoryCards = [
    { id: 'cat-cpu', name: 'Procesadores', icon: Cpu, desc: 'Intel Core & AMD Ryzen' },
    { id: 'cat-gpu', name: 'Tarjetas Gráficas', icon: Tv, desc: 'RTX 40 Series & RX 7000' },
    { id: 'cat-mobo', name: 'Placas Madre', icon: CircuitBoard, desc: 'AM5, LGA1700, DDR5' },
    { id: 'cat-ram', name: 'Memorias RAM', icon: Layers, desc: 'Kits DDR4 & DDR5 Dual' },
    { id: 'cat-ssd', name: 'Almacenamiento', icon: HardDrive, desc: 'NVMe M.2 PCIe 4.0' },
    { id: 'cat-psu', name: 'Fuentes de Poder', icon: Zap, desc: 'Certificadas 80+ Gold' },
    { id: 'cat-case', name: 'Gabinetes', icon: Box, desc: 'Chasis High-Airflow' },
    { id: 'cat-cool', name: 'Refrigeración', icon: Fan, desc: 'AIO Líquidas & Torres' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Badge de Tecnología */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Marketplace Inteligente de Hardware & Validador Nexus Match</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Compara, ensambla y encuentra <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">tu mejor PC</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Compara precios de hardware en tiempo real entre tiendas afiliadas en Perú. Verifica compatibilidad técnica y ensambla según tu presupuesto.
          </p>

          {/* Gran Buscador de Inicio */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Busca por modelo: ej. RTX 4070 Super, Ryzen 7 7800X3D, B650..."
                className="w-full bg-slate-800/95 text-white pl-12 pr-32 py-4 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-xl placeholder:text-slate-400"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer hover:shadow-blue-500/30"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Más buscados:</span>
            {['RTX 4070 Super', 'Ryzen 7 7800X3D', 'i7 14700K', 'DDR5 6000MHz', 'NVMe 1TB'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              )
            )}
          </div>

          {/* Botones de Acción Directa */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveView('ensamblador')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Probar Ensamblador Inteligente</span>
            </button>
            <button
              onClick={() => openAiWithPrompt('Quiero armar una PC gamer con un presupuesto de S/ 5,500')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer hover:border-slate-600"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Consultar al Agente IA</span>
            </button>
          </div>
        </div>
      </section>

      {/* BENEFICIOS DE LA PLATAFORMA */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">Comparador Multi-Tienda</h3>
          <p className="text-xs text-slate-600">
            Identifica el <strong>MEJOR PRECIO</strong> con stock real garantizado en tiendas verificadas de Lima.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">Nexus Match Algorítmico</h3>
          <p className="text-xs text-slate-600">
            Valida socket de CPU, tipo de RAM, factor de forma y margen de Watts de fuente antes de comprar.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">Transacciones ACID Seguras</h3>
          <p className="text-xs text-slate-600">
            Bloqueo SELECT FOR UPDATE de stock, pedidos divididos por tienda y congelamiento de precios.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">Cotizador en Tiempo Real</h3>
          <p className="text-xs text-slate-600">
            8 herramientas conectadas al catálogo para cotizar y ensamblar con precisión y sin inventar datos.
          </p>
        </div>
      </section>

      {/* CATEGORÍAS PRINCIPALES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Categorías de Hardware</h2>
            <p className="text-xs text-slate-500">Explora componentes para armar o repotenciar tu máquina</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setSearchFilter('');
              setActiveView('catalogo');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Ver catálogo completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryFilter(cat.id);
                  setSearchFilter('');
                  setActiveView('catalogo');
                }}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center transition-colors mb-2">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-xs truncate">{cat.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* OFERTAS DESTACADAS Y COMPARATIVAS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1">
              <span>MEJOR PRECIO EN LIMA</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Ofertas Más Buscadas con Comparador</h2>
          </div>
          <button
            onClick={() => setActiveView('catalogo')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Ver más ofertas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Cpu className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">Catálogo Inicial Limpio (0 productos)</h3>
              <p className="text-xs text-slate-500 mt-1">
                La base de datos se encuentra completamente limpia sin registros de prueba. Puedes agregar nuevos componentes de hardware o poblar datos de demostración en un clic.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCreateProductModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Registrar Primer Producto</span>
              </button>
              <button
                onClick={async () => {
                  await cargarDatosDemo();
                  const prods = await api.getProductos();
                  setFeaturedProducts(prods.slice(0, 6));
                  const tiendas = await api.getTiendas();
                  setStores(tiendas);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Cargar Datos de Demostración</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {prod.marca}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                    {prod.tiendasDisponibles} tiendas con stock
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {prod.nombre}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {prod.especificaciones.socket && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                          Socket {prod.especificaciones.socket}
                        </span>
                      )}
                      {prod.especificaciones.ramType && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                          {prod.especificaciones.ramType}
                        </span>
                      )}
                      {prod.especificaciones.vramGb && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-medium">
                          {prod.especificaciones.vramGb}GB VRAM
                        </span>
                      )}
                      {prod.especificaciones.wattage && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-medium">
                          {prod.especificaciones.wattage}W
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Desde</span>
                      <span className="text-lg font-black text-slate-900">
                        S/ {prod.precioMinimo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPriceAlertModal(prod)}
                        title="Crear alerta de precio"
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openCompareModal(prod)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Comparar Precios</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TIENDAS PARTICIPANTES */}
      <section className="bg-slate-100/70 p-6 sm:p-8 rounded-3xl border border-slate-200">
        <div className="max-w-3xl mb-6">
          <h2 className="text-xl font-bold text-slate-900">Tiendas Afiliadas y Verificadas</h2>
          <p className="text-xs text-slate-600">
            Garantizamos la transparencia de precios, RUC de 11 dígitos y stock verificado en tiendas afiliadas del marketplace.
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">No hay tiendas registradas aún</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                La plataforma está limpia. Puedes dar de alta una tienda con su RUC de 11 dígitos para comenzar a ofertar hardware.
              </p>
            </div>
            <button
              onClick={() => setRegisterStoreModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer transition-all inline-flex items-center gap-1.5"
            >
              <StoreIcon className="w-4 h-4" />
              <span>Registrar Tienda Distribuidora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        store.estadoVerificacion === 'verificada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {store.estadoVerificacion === 'verificada' ? '✓ Verificada' : 'Pendiente'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{store.reputacion}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={store.logoUrl}
                      alt={store.nombreComercial}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{store.nombreComercial}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">RUC: {store.ruc}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{store.direccion}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>{store.totalVentas} ventas</span>
                  <span className="font-medium text-blue-600">{store.distrito}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
