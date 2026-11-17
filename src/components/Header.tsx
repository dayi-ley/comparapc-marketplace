/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MarketTicker } from './MarketTicker';
import {
  Search,
  ShoppingCart,
  Cpu,
  Terminal,
  UserCheck,
  ChevronDown,
  LogOut,
  LogIn,
} from 'lucide-react';

const NavBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  activeClass?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ active, onClick, activeClass = 'bg-blue-600 text-white', className = '', children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
      active ? `${activeClass} font-semibold` : `hover:bg-slate-800 hover:text-white ${className}`
    }`}
  >
    {children}
  </button>
);

export const Header: React.FC = () => {
  const {
    currentUser,
    cerrarSesion,
    activeView,
    setActiveView,
    cart,
    setCartDrawerOpen,
    searchFilter,
    setSearchFilter,
    setSelectedCategoryFilter,
    setRegisterStoreModalOpen,
    setLoginModalOpen,
    setCreateProductModalOpen,
    limpiarBaseDatos,
    cargarDatosDemo,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchFilter);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFilter(searchInput);
    setSelectedCategoryFilter(null);
    setActiveView('catalogo');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo y Eslogan */}
          <div
            onClick={() => {
              setActiveView('inicio');
              setSearchFilter('');
              setSelectedCategoryFilter(null);
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">Compara<span className="text-blue-400">PC</span></span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Compara, ensambla y encuentra tu mejor PC
              </p>
            </div>
          </div>

          {/* Buscador Central */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-2 hidden md:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar procesadores, tarjetas gráficas, placas madre..."
                className="w-full bg-slate-800/90 text-white text-sm pl-10 pr-24 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg text-white transition-all shadow cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Acciones & Perfil */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Carrito */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Ver Carrito de Compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart && cart.cantidadTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cart.cantidadTotal}
                </span>
              )}
            </button>

            {/* Switcher de Roles (RBAC Demo) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {!currentUser
                    ? '?'
                    : currentUser.rol === 'admin'
                    ? 'AD'
                    : currentUser.rol === 'tienda'
                    ? 'TD'
                    : 'CL'}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-white leading-tight truncate max-w-[110px]">
                    {currentUser?.nombreCompleto || 'Iniciar Sesion'}
                  </div>
                  <div className="text-[10px] text-blue-400 font-medium capitalize">
                    {currentUser ? `Rol: ${currentUser.rol}` : 'Selecciona una cuenta'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-700/80">
                    <p className="text-xs font-semibold text-slate-300">
                      {currentUser ? `Sesion activa: ${currentUser.rol.toUpperCase()}` : 'Sin sesion activa'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {currentUser ? currentUser.email : 'Inicia sesion para ver tus modulos'}
                    </p>
                  </div>
                  <div className="pt-2 px-2">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setLoginModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-blue-300 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{currentUser ? 'Cambiar de cuenta' : 'Iniciar Sesion'}</span>
                    </button>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-700/80 px-2 space-y-1">
                    {currentUser?.rol === 'cliente' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveView('mi_cuenta');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-300 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Mi Cuenta</span>
                      </button>
                    )}

                    {(currentUser?.rol === 'tienda' || currentUser?.rol === 'admin') && (
                      <>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setCreateProductModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>+ Agregar Producto Base</span>
                        </button>
                      </>
                    )}

                    {currentUser?.rol === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setActiveView('mcp_console');
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Herramientas MCP</span>
                        </button>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await limpiarBaseDatos();
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <span>🗑️ Limpiar Base de Datos</span>
                        </button>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await cargarDatosDemo();
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <span>🌱 Cargar Datos Demo</span>
                        </button>
                      </>
                    )}

                    {currentUser && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          cerrarSesion();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesion</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Navegación de Módulos */}
        <nav className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-center gap-1 overflow-x-auto text-xs font-medium text-slate-300 scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {(currentUser?.rol === 'tienda') ? (
              <>
                <NavBtn active={activeView === 'tienda'} onClick={() => setActiveView('tienda')} activeClass="bg-amber-600 text-white" className="text-amber-300">PANEL TIENDA</NavBtn>
                <NavBtn active={activeView === 'tienda_inventario'} onClick={() => setActiveView('tienda_inventario')} activeClass="bg-amber-600 text-white" className="text-amber-300">GESTIONAR INVENTARIO</NavBtn>
                <NavBtn active={activeView === 'tienda_pedidos'} onClick={() => setActiveView('tienda_pedidos')} activeClass="bg-amber-600 text-white" className="text-amber-300">PEDIDOS DE TIENDA</NavBtn>
                <NavBtn active={activeView === 'mi_cuenta'} onClick={() => setActiveView('mi_cuenta')}>MI CUENTA</NavBtn>
              </>
            ) : currentUser?.rol === 'admin' ? (
              <>
                <NavBtn active={activeView === 'admin'} onClick={() => setActiveView('admin')} activeClass="bg-purple-600 text-white" className="text-purple-300">PANEL ADMIN</NavBtn>
                <NavBtn active={activeView === 'mcp_console'} onClick={() => setActiveView('mcp_console')} activeClass="bg-purple-600 text-white" className="text-purple-300">HERRAMIENTAS MCP</NavBtn>
                <NavBtn active={activeView === 'catalogo'} onClick={() => setActiveView('catalogo')}>CATÁLOGO</NavBtn>
              </>
            ) : (
              <>
                <NavBtn active={activeView === 'inicio'} onClick={() => setActiveView('inicio')}>INICIO</NavBtn>
                <NavBtn active={activeView === 'catalogo'} onClick={() => setActiveView('catalogo')}>CATÁLOGO & COMPARADOR</NavBtn>
                <NavBtn active={activeView === 'ensamblador'} onClick={() => setActiveView('ensamblador')}>ENSAMBLADOR INTELIGENTE</NavBtn>
                <NavBtn active={activeView === 'pedidos'} onClick={() => setActiveView('pedidos')}>MIS PEDIDOS</NavBtn>
                <NavBtn active={activeView === 'pagos'} onClick={() => setActiveView('pagos')}>PAGOS</NavBtn>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Carrusel automatico de ofertas y mejores precios (solo en Inicio) */}
      {activeView === 'inicio' && <MarketTicker />}
    </header>
  );
};
