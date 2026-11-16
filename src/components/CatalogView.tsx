/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Product } from '../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Scale,
  RefreshCw,
  Building2,
  ChevronRight,
  ArrowUpDown,
  Tag,
  Bell,
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const {
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    searchFilter,
    setSearchFilter,
    openCompareModal,
    openPriceAlertModal,
    setCreateProductModalOpen,
    cargarDatosDemo,
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSocket, setSelectedSocket] = useState<string>('');
  const [selectedRamType, setSelectedRamType] = useState<string>('');
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<'menor_precio' | 'mayor_precio' | 'relevancia'>('menor_precio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProductos({
        categoria: selectedCategoryFilter || undefined,
        marca: selectedBrand || undefined,
        search: searchFilter || undefined,
        socket: selectedSocket || undefined,
        ramType: selectedRamType || undefined,
        precioMin: precioMin ? Number(precioMin) : undefined,
        precioMax: precioMax ? Number(precioMax) : undefined,
        sortBy,
      });
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [
    selectedCategoryFilter,
    selectedBrand,
    searchFilter,
    selectedSocket,
    selectedRamType,
    sortBy,
  ]);

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const handleResetFilters = () => {
    setSelectedCategoryFilter(null);
    setSelectedBrand('');
    setSelectedSocket('');
    setSelectedRamType('');
    setPrecioMin('');
    setPrecioMax('');
    setSearchFilter('');
    setSortBy('menor_precio');
  };

  const brands = [
    'AMD',
    'Intel',
    'ASUS',
    'MSI',
    'Corsair',
    'Kingston',
    'Sapphire',
    'Samsung',
    'Montech',
    'Lian Li',
    'DeepCool',
    'NZXT',
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ComparaPC</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 font-semibold">Catálogo y Comparador de Hardware</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Catálogo Oficial de Componentes
          </h1>
          <p className="text-xs text-slate-500">
            Mostrando ofertas en tiempo real de tiendas verificadas en Lima.
          </p>
        </div>

        {/* Barra de Ordenamiento y Toggle Mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="menor_precio">Menor Precio Primero</option>
              <option value="mayor_precio">Mayor Precio</option>
              <option value="relevancia">Relevancia</option>
            </select>
          </div>

          <button
            onClick={() => setCreateProductModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>+ Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* SIDEBAR FILTERS */}
        <aside
          className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 ${
            sidebarOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Filtros de Búsqueda</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>

          {/* Categorías */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Categoría
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  selectedCategoryFilter === null
                    ? 'bg-blue-50 font-bold text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Todas las categorías</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-blue-50 font-bold text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Marca */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Marca</h4>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              <button
                onClick={() => setSelectedBrand('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedBrand === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedBrand === b
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Socket CPU */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Socket Procesador
            </h4>
            <div className="flex gap-2">
              {['', 'AM5', 'LGA1700'].map((soc) => (
                <button
                  key={soc}
                  onClick={() => setSelectedSocket(soc)}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                    selectedSocket === soc
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {soc === '' ? 'Todos' : soc}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro RAM Type */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tipo de RAM
            </h4>
            <div className="flex gap-2">
              {['', 'DDR5', 'DDR4'].map((ram) => (
                <button
                  key={ram}
                  onClick={() => setSelectedRamType(ram)}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                    selectedRamType === ram
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ram === '' ? 'Todos' : ram}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de Precios */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Precio en Soles (PEN)
            </h4>
            <form onSubmit={handleApplyPriceFilter} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Aplicar Rango
              </button>
            </form>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="md:col-span-3 space-y-4">
          {/* Active filter badges */}
          {(searchFilter ||
            selectedBrand ||
            selectedCategoryFilter ||
            selectedSocket ||
            selectedRamType) && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Filtros aplicados:
              </span>
              {searchFilter && (
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-medium">
                  Búsqueda: "{searchFilter}"
                </span>
              )}
              {selectedBrand && (
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-medium">
                  Marca: {selectedBrand}
                </span>
              )}
              {selectedSocket && (
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-medium">
                  Socket: {selectedSocket}
                </span>
              )}
              {selectedRamType && (
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-medium">
                  RAM: {selectedRamType}
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="ml-auto text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Cargando catálogo ComparaPC...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              {selectedBrand || selectedCategoryFilter || searchFilter || selectedSocket || selectedRamType || precioMin || precioMax ? (
                <>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      No se encontraron productos con estos filtros
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Prueba modificando la marca, el rango de precio o el término de búsqueda.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Catálogo Inicial Limpio (0 productos registrados)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      La base de datos está vacía. Puedes registrar productos de hardware o cargar el set de prueba cuando lo desees.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      onClick={() => setCreateProductModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
                    >
                      + Registrar Producto Base
                    </button>
                    <button
                      onClick={async () => {
                        await cargarDatosDemo();
                        fetchFilteredProducts();
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Cargar Datos Demo
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={product.imagenUrl}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                      {product.marca}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
                      {product.tiendasDisponibles} tiendas disp.
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">
                        {product.categoriaNombre}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {product.nombre}
                      </h3>

                      {/* Especificaciones */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {product.especificaciones.socket && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                            {product.especificaciones.socket}
                          </span>
                        )}
                        {product.especificaciones.ramType && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                            {product.especificaciones.ramType}
                          </span>
                        )}
                        {product.especificaciones.vramGb && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-medium">
                            {product.especificaciones.vramGb}GB VRAM
                          </span>
                        )}
                        {product.especificaciones.wattage && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-medium">
                            {product.especificaciones.wattage}W
                          </span>
                        )}
                        {product.especificaciones.capacidadGb && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                            {product.especificaciones.capacidadGb >= 1000
                              ? `${product.especificaciones.capacidadGb / 1000}TB`
                              : `${product.especificaciones.capacidadGb}GB`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Desde</span>
                        <span className="text-base font-black text-slate-900">
                          S/ {product.precioMinimo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openPriceAlertModal(product)}
                          title="Crear alerta de precio"
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openCompareModal(product)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Comparar ({product.tiendasDisponibles})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
