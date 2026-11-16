/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  Store,
  Boxes,
  Package,
  Terminal,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    showToast,
    limpiarBaseDatos,
    cargarDatosDemo,
    setCreateProductModalOpen,
    setRegisterStoreModalOpen,
  } = useApp();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err: any) {
      showToast(`Error al cargar datos de admin: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStoreStatus = async (tiendaId: string, nuevoEstado: string) => {
    try {
      await api.verificarTiendaAdmin(tiendaId, nuevoEstado);
      await loadAdminData();
      showToast(`✓ Estado de tienda actualizado a: ${nuevoEstado.toUpperCase()}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Cargando Dashboard de Administración...</p>
      </div>
    );
  }

  if (!data) return null;

  const { metricas, tiendas, usuarios, mcpLogs } = data;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER DE ADMINISTRACIÓN */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-purple-900/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>MÓDULO 7: CONTROL GLOBAL Y SUPERVISIÓN DEL SISTEMA</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Panel Administrativo ComparaPC</h1>
          <p className="text-xs text-slate-300">
            Supervisión integral de usuarios, verificación de tiendas, catálogo e inspector de herramientas del asistente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={async () => {
              await limpiarBaseDatos();
              await loadAdminData();
            }}
            className="px-3.5 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Restablecer base de datos a 0 registros"
          >
            🗑️ Limpiar Todo (0 Registros)
          </button>

          <button
            onClick={async () => {
              await cargarDatosDemo();
              await loadAdminData();
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Cargar datos de prueba de hardware"
          >
            🌱 Cargar Datos Demo
          </button>

          <button
            onClick={() => setCreateProductModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            + Producto Base
          </button>

          <button
            onClick={() => setRegisterStoreModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            + Registrar Tienda
          </button>

          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* METRICAS GLOBALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Usuarios</span>
          <span className="text-xl font-black text-slate-900">{metricas.totalUsuarios}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Tiendas Verificadas</span>
          <span className="text-xl font-black text-emerald-600">{metricas.tiendasVerificadas}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Tiendas Pendientes</span>
          <span className="text-xl font-black text-amber-600">{metricas.tiendasPendientes}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Boxes className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Catálogo Base</span>
          <span className="text-xl font-black text-slate-900">{metricas.totalProductos}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Pedidos Creados</span>
          <span className="text-xl font-black text-slate-900">{metricas.totalPedidos}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Llamadas al Sistema</span>
          <span className="text-xl font-black text-purple-600">{metricas.totalMcpInvocaciones}</span>
        </div>
      </div>

      {/* VERIFICACIÓN DE TIENDAS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Verificación y Aprobación de Tiendas
            </h3>
            <p className="text-xs text-slate-500">
              Solo las tiendas en estado "Verificada" publican ofertas visibles para los clientes.
            </p>
          </div>
        </div>

        {tiendas.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-xs text-slate-500">
              No hay tiendas registradas en la base de datos (Estado Limpio).
            </p>
            <button
              onClick={() => setRegisterStoreModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer"
            >
              + Registrar Nueva Tienda
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Tienda Comercial</th>
                  <th className="py-3 px-3">RUC (11 Dígitos)</th>
                  <th className="py-3 px-3">Ubicación</th>
                  <th className="py-3 px-3">Reputación</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones de Verificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tiendas.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.logoUrl}
                          alt={t.nombreComercial}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 p-0.5 border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{t.nombreComercial}</span>
                          <span className="text-[10px] text-slate-400">{t.razonSocial}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {t.ruc}
                    </td>

                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                      {t.direccion}
                    </td>

                    <td className="py-3 px-3 font-bold text-amber-600">
                      {t.reputacion} ⭐ ({t.totalVentas} ventas)
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.estadoVerificacion === 'verificada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.estadoVerificacion === 'pendiente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.estadoVerificacion.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {t.estadoVerificacion !== 'verificada' && (
                          <button
                            onClick={() => handleUpdateStoreStatus(t.id, 'verificada')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Aprobar Tienda
                          </button>
                        )}
                        {t.estadoVerificacion === 'verificada' && (
                          <button
                            onClick={() => handleUpdateStoreStatus(t.id, 'suspendida')}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Suspender
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUPERVISIÓN DEL AGENTE EN TIEMPO REAL */}
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Telemetría y Registro de Operaciones
              </h3>
              <p className="text-[11px] text-slate-400">
                Últimas operaciones ejecutadas por el asistente virtual en tiempo real
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-500/30">
            Servicio Activo
          </span>
        </div>

        {mcpLogs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Aún no se han ejecutado llamadas a herramientas en esta sesión. Abre el Asistente IA para probarlas.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto text-xs font-mono">
            {mcpLogs.map((log: any) => (
              <div
                key={log.id}
                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">[{log.tool}]</span>
                  <span className="text-slate-400 truncate max-w-sm">
                    {JSON.stringify(log.params)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                  <span className="text-purple-300 font-bold">{log.durationMs}ms</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
