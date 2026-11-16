/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MCPTool } from '../types';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  RefreshCw,
  Server,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MCPConsoleView: React.FC = () => {
  const { showToast, loadCart } = useApp();
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [serverHealth, setServerHealth] = useState<any | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('buscar_productos');
  const [paramsJson, setParamsJson] = useState<string>('{\n  "nombre_producto": "rtx 4070"\n}');
  const [responseJson, setResponseJson] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tester' | 'schema' | 'health'>('tester');

  // Cargar herramientas registradas
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await api.getMCPTools();
        setTools(data.tools);
        const health = await api.getMCPHealth();
        setServerHealth(health);
      } catch (err) {
        console.error('Error al cargar MCP:', err);
      }
    };
    fetchTools();
  }, []);

  // Presets para probar rápidamente cada herramienta
  const toolPresets: Record<string, any> = {
    buscar_productos: {
      nombre_producto: 'rtx 4070',
      categoria: 'tarjetas_graficas',
      marca: 'ASUS',
    },
    comparar_ofertas: {
      id_producto: 'prod-gpu-rtx4070s',
      criterio_ordenamiento: 'menor_precio',
    },
    verificar_compatibilidad: {
      procesador_id: 'prod-cpu-7800x3d',
      placa_madre_id: 'prod-mobo-b650tuf',
      memoria_ram_id: 'prod-ram-ddr5-32',
      tarjeta_grafica_id: 'prod-gpu-rtx4070s',
      fuente_alimentacion_id: 'prod-psu-850w',
      gabinete_id: 'prod-case-montech',
    },
    ensamblar_pc: {
      presupuesto: 5500,
      uso_principal: 'gaming',
      preferencias: 'AMD AM5 con GPU RTX',
    },
    consultar_stock: {
      id_producto: 'prod-gpu-rtx4070s',
    },
    agregar_al_carrito: {
      id_cliente: 'usr-cli-1',
      id_inventario: 'inv-1',
      cantidad: 1,
      autorizado_por_usuario: true, // Cambia a false para probar el guardián de seguridad
    },
    calcular_costo_ensamblaje: {
      items_inventario_ids: ['inv-1', 'inv-4', 'inv-20', 'inv-25'],
      metodo_entrega: 'envio_domicilio',
    },
    generar_orden: {
      id_cliente: 'usr-cli-1',
      metodo_entrega: 'recojo_en_tienda',
      confirmacion_explicita_cliente: true, // Cambia a false para probar el guardián de seguridad
    },
  };

  const handleSelectTool = (toolName: string) => {
    setSelectedTool(toolName);
    const preset = toolPresets[toolName] || {};
    setParamsJson(JSON.stringify(preset, null, 2));
  };

  const handleExecuteTool = async () => {
    setLoading(true);
    setResponseJson('// Enviando solicitud JSON-RPC 2.0 al servidor de herramientas...');
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(paramsJson);
      } catch (e: any) {
        setResponseJson(`// Error de sintaxis en JSON:\n${e.message}`);
        setLoading(false);
        return;
      }

      // Llamada real al protocolo JSON-RPC 2.0: tools/call
      const res = await api.executeMCPJsonRpc('tools/call', {
        name: selectedTool,
        arguments: parsedArgs,
      });

      setResponseJson(JSON.stringify(res, null, 2));
      showToast('✓ Solicitud ejecutada correctamente');

      // Si se alteró el carrito o checkout, recargar carrito
      if (selectedTool === 'agregar_al_carrito' || selectedTool === 'generar_orden') {
        await loadCart();
      }
    } catch (err: any) {
      setResponseJson(
        JSON.stringify(
          {
            jsonrpc: '2.0',
            error: { code: -32603, message: err.message },
          },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(responseJson);
    showToast('JSON copiado al portapapeles');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER DE LA CONSOLA MCP */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-900/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>BANCO DE PRUEBAS & API JSON-RPC 2.0</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Inspector & Banco de Pruebas de Herramientas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-mono">
            Endpoint: <code className="text-emerald-400">POST /api/mcp</code> | Streamable HTTP | 8 Herramientas Registradas
          </p>
        </div>

        {/* Status Chip */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div className="text-xs">
            <span className="font-bold text-white block">Servidor de Herramientas: Activo</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {tools.length} herramientas disponibles
            </span>
          </div>
        </div>
      </div>

      {/* TABS DE LA CONSOLA */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('tester')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'tester'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ejecutor Interactivo de Herramientas
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'schema'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Catálogo de Esquemas JSON (Discovery tools/list)
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'health'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Estado y Seguridad del Protocolo
        </button>
      </div>

      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SELECTOR DE HERRAMIENTAS (Columna Izquierda) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              Seleccionar Herramienta:
            </h3>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto">
              {tools.map((t, idx) => {
                const isSelected = selectedTool === t.name;
                const isSensitive =
                  t.name === 'agregar_al_carrito' || t.name === 'generar_orden';

                return (
                  <button
                    key={t.name}
                    onClick={() => handleSelectTool(t.name)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold truncate">
                          {t.name}
                        </span>
                        {isSensitive && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            SEGURIDAD
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] line-clamp-2 mt-0.5 ${
                          isSelected ? 'text-emerald-100' : 'text-slate-500'
                        }`}
                      >
                        {t.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDITOR DE PARÁMETROS Y RESPUESTA (Columna Derecha) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Editor de Entrada */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono">
                    Argumentos JSON de Entrada para <code>{selectedTool}</code>:
                  </span>
                </div>
                <button
                  onClick={handleExecuteTool}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>{loading ? 'Ejecutando...' : 'Invocar Herramienta'}</span>
                </button>
              </div>

              <textarea
                value={paramsJson}
                onChange={(e) => setParamsJson(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 text-emerald-300 font-mono text-xs p-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Visor de Respuesta JSON-RPC */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-5 shadow-xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold font-mono">
                    Respuesta del Protocolo JSON-RPC 2.0 (Streamable HTTP):
                  </span>
                </div>
                {responseJson && (
                  <button
                    onClick={handleCopyJson}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>
                )}
              </div>

              <pre className="w-full bg-slate-900/90 text-slate-200 font-mono text-xs p-4 rounded-2xl border border-slate-800 overflow-x-auto max-h-[360px] leading-relaxed">
                {responseJson || '// Presiona "Invocar Herramienta" para disparar la llamada JSON-RPC real'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Catálogo Oficial de Herramientas Registradas (tools/list)
            </h3>
            <p className="text-xs text-slate-500">
              Esquemas Pydantic y JSON Schema descubiertos para integración en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((t) => (
              <div
                key={t.name}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-blue-600">
                    {t.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    JSON Schema
                  </span>
                </div>
                <p className="text-xs text-slate-600">{t.description}</p>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(t.inputSchema, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Políticas de Seguridad y Estado del Servicio
              </h2>
              <p className="text-xs text-slate-500">
                Cumplimiento de las especificaciones de seguridad del Prompt Maestro
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Transporte</span>
              <p className="text-sm font-black text-slate-900">Streamable HTTP</p>
              <span className="text-[10px] text-slate-500 font-mono">POST /api/mcp</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Protocolo</span>
              <p className="text-sm font-black text-slate-900">JSON-RPC 2.0</p>
              <span className="text-[10px] text-slate-500 font-mono">Versión 2024-11-05</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Guardián Transaccional</span>
              <p className="text-sm font-black text-emerald-600">ACID + SELECT FOR UPDATE</p>
              <span className="text-[10px] text-slate-500">Precios Congelados</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Reglas de Seguridad para Operaciones Sensibles (Tool 6 y Tool 8)</span>
            </div>
            <p>
              Por diseño de ComparaPC, el agente de inteligencia artificial <strong>NUNCA</strong> puede ejecutar directamente compras ni generar órdenes sin la confirmación explícita del cliente. Si una llamada a <code>generar_orden</code> se realiza con <code>confirmacion_explicita_cliente: false</code>, el servidor responde con <code>status: "requires_confirmation"</code>, impidiendo cualquier cobro o reserva no autorizada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
