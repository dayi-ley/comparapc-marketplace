/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Scale,
  Wrench,
  ShieldAlert,
  ShoppingCart,
  ChevronDown,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolExecuted?: {
    name: string;
    args: any;
    result: any;
  };
  requiresConfirmation?: {
    action: string;
    details: any;
  };
}

export const AIAssistantWidget: React.FC = () => {
  const {
    aiAssistantOpen,
    setAiAssistantOpen,
    aiInitialPrompt,
    currentUser,
    addToCart,
    loadCart,
    openCompareModal,
    showToast,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        '¡Hola! Soy **ComparaPC AI**, tu asesor inteligente de hardware.\n\nEstoy conectado al catálogo real de tiendas en Lima para comparar precios, validar compatibilidad técnica o armar tu PC gamer óptima. ¿En qué puedo ayudarte?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Si se abre con un prompt inicial (ej. desde un botón)
  useEffect(() => {
    if (aiInitialPrompt && aiAssistantOpen) {
      handleSendMessage(aiInitialPrompt);
    }
  }, [aiInitialPrompt, aiAssistantOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Formato para /api/agent/chat
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.sendChatMessage(chatHistory, currentUser?.id || 'usr-cli-1');

      let confirmation = undefined;
      if (response.toolExecuted?.result?.status === 'requires_confirmation') {
        confirmation = {
          action: response.toolExecuted.result.accion,
          details: response.toolExecuted.result.detalles,
        };
      }

      const assistantMsg: Message = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: response.reply,
        toolExecuted: response.toolExecuted,
        requiresConfirmation: confirmation,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `Lo siento, ocurrió un error al consultar el catálogo: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeAction = async (confirmation: { action: string; details: any }) => {
    setLoading(true);
    try {
      if (confirmation.action === 'agregar_al_carrito') {
        await addToCart(confirmation.details.idInventario, confirmation.details.cantidad || 1);
        await loadCart();
        setMessages((prev) => [
          ...prev,
          {
            id: 'conf-' + Date.now(),
            role: 'assistant',
            content: '✓ ¡Operación autorizada y ejecutada! El componente ha sido agregado exitosamente a tu carrito de compras.',
          },
        ]);
        showToast('✓ Ítem agregado al carrito con autorización');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Quiero armar una PC gamer con presupuesto de S/ 5,500',
    '¿Dónde puedo comprar la RTX 4070 Super más barata?',
    '¿Son compatibles un Ryzen 7800X3D con placa B650 y RAM DDR5?',
    '¿Qué tiendas tienen stock de fuentes 850W Gold?',
  ];

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      {!aiAssistantOpen && (
        <button
          onClick={() => setAiAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer group border border-blue-400/30"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-blue-100 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-left hidden sm:block pr-1">
            <span className="text-xs font-black block leading-none">ComparaPC AI</span>
            <span className="text-[10px] text-blue-200 font-mono">Asistente Virtual</span>
          </div>
        </button>
      )}

      {/* VENTANA DEL ASISTENTE FLOTANTE */}
      {aiAssistantOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">ComparaPC AI</h3>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    En Línea
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Impulsado por Gemini 3.8 Flash & Validador Nexus Match
                </p>
              </div>
            </div>

            <button
              onClick={() => setAiAssistantOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
                  }`}
                >
                  {m.content}
                </div>

                {/* Tarjetas Estructuradas de Herramientas */}
                {m.toolExecuted && (
                  <div className="mt-2 w-full max-w-[90%] bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-blue-600">
                      <span>Tool: {m.toolExecuted.name}()</span>
                      <span className="text-emerald-600 font-sans font-bold">✓ Validado con Stock</span>
                    </div>

                    {/* Si fue ensamblaje */}
                    {m.toolExecuted.name === 'ensamblar_pc' && m.toolExecuted.result?.componentes && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-slate-900 flex justify-between">
                          <span>Costo Total:</span>
                          <span>S/ {m.toolExecuted.result.costoTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 max-h-28 overflow-y-auto divide-y divide-slate-200">
                          {m.toolExecuted.result.componentes.map((c: any, idx: number) => (
                            <div key={idx} className="py-1 flex justify-between">
                              <span className="truncate max-w-[190px]">{c.nombre}</span>
                              <span className="font-bold">S/ {c.precio.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tarjeta de Seguridad (Confirmación requerida) */}
                {m.requiresConfirmation && (
                  <div className="mt-2 w-full max-w-[90%] bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Autorización Requerida</span>
                    </div>
                    <p className="text-[11px] leading-snug">
                      El asistente solicita tu confirmación para agregar este ítem al carrito de compras:
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAuthorizeAction(m.requiresConfirmation!)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Autorizar Acción
                      </button>
                      <button
                        onClick={() =>
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: 'rej-' + Date.now(),
                              role: 'assistant',
                              content: 'Operación cancelada por el usuario.',
                            },
                          ])
                        }
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Consultando catálogo y verificando stock...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[10px] bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-full"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre hardware, precios o ensamble..."
              className="flex-1 bg-slate-50 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
