/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, Terminal, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-lg">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span>Compara<span className="text-blue-400">PC</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              "Compara, ensambla y encuentra tu mejor PC." Plataforma especializada en la comparación de componentes de hardware computacional entre tiendas de Lima.
            </p>
          </div>

          {/* Navegación */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">Módulos</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setActiveView('inicio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('catalogo')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Catálogo & Comparador
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('ensamblador')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ensamblador Nexus Match
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('pedidos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mis Pedidos
                </button>
              </li>
            </ul>
          </div>

          {/* Herramientas del Sistema */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">Herramientas</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setActiveView('mcp_console')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Consola de Herramientas (8 Tools)</span>
                </button>
              </li>
              <li className="text-slate-400">Cotización Automatizada</li>
              <li className="text-slate-400">Transacciones ACID con Bloqueo</li>
              <li className="text-slate-400">Esquema Relacional PostgreSQL</li>
            </ul>
          </div>

          {/* Tiendas & Locales */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">Tiendas Verificadas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Precios y stock recopilados de tiendas formales afiliadas a la red ComparaPC en Lima.
            </p>
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RUC de 11 dígitos auditado</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} ComparaPC. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Plataforma tecnológica especializada en comparación y ensamble de hardware computacional.
          </p>
        </div>
      </div>
    </footer>
  );
};
