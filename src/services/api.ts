/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Product,
  Category,
  ProductOffersResponse,
  CartResponse,
  Order,
  CompatibilityCheck,
  User,
  MCPTool,
  PriceHistoryResponse,
  PriceAlert,
  PriceAlertsResponse,
} from '../types';

export const api = {
  // Autenticación
  async getDemoUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/usuarios-demo');
    return res.json();
  },

  async login(email: string): Promise<{ token: string; usuario: User; tienda?: any }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al iniciar sesión');
    }
    return res.json();
  },

  // Catálogo
  async getCategorias(): Promise<Category[]> {
    const res = await fetch('/api/categorias');
    return res.json();
  },

  async getProductos(params?: Record<string, any>): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`/api/productos?${query.toString()}`);
    return res.json();
  },

  async getOfertasProducto(productoId: string): Promise<ProductOffersResponse> {
    const res = await fetch(`/api/productos/${productoId}/ofertas`);
    if (!res.ok) throw new Error('Producto no encontrado');
    return res.json();
  },

  async getHistorialPrecios(
    productoId: string,
    tiendaId?: string,
    dias: number = 30
  ): Promise<PriceHistoryResponse> {
    const params = new URLSearchParams();
    if (tiendaId && tiendaId !== 'todas') params.append('tiendaId', tiendaId);
    if (dias) params.append('dias', String(dias));
    const res = await fetch(`/api/productos/${productoId}/historial-precios?${params.toString()}`);
    if (!res.ok) throw new Error('Error al consultar historial de precios');
    return res.json();
  },

  async getTiendas(): Promise<any[]> {
    const res = await fetch('/api/tiendas');
    return res.json();
  },

  // Ensamblador y Nexus Match
  async verificarCompatibilidad(componentesIds: Record<string, string | undefined>): Promise<CompatibilityCheck> {
    const res = await fetch('/api/compatibilidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(componentesIds),
    });
    return res.json();
  },

  async ensamblarPC(presupuesto: number, uso: string = 'gaming', preferencias?: string): Promise<any> {
    const res = await fetch('/api/ensamblar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presupuesto, uso, preferencias }),
    });
    return res.json();
  },

  // Carrito y Checkout
  async getCarrito(usuarioId: string): Promise<CartResponse> {
    const res = await fetch(`/api/carrito?usuarioId=${usuarioId}`);
    return res.json();
  },

  async agregarAlCarrito(usuarioId: string, inventarioId: string, cantidad: number = 1): Promise<CartResponse> {
    const res = await fetch('/api/carrito/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, inventarioId, cantidad }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al agregar al carrito');
    }
    return res.json();
  },

  async actualizarCantidadCarrito(usuarioId: string, itemId: string, cantidad: number): Promise<CartResponse> {
    const res = await fetch(`/api/carrito/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, cantidad }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al modificar cantidad');
    }
    return res.json();
  },

  async eliminarItemCarrito(usuarioId: string, itemId: string): Promise<CartResponse> {
    const res = await fetch(`/api/carrito/items/${itemId}?usuarioId=${usuarioId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async procesarCheckout(
    usuarioId: string,
    metodoEntrega: 'recojo_en_tienda' | 'envio_domicilio',
    direccionEnvio?: string,
    pago?: { metodo: string; referencia: string }
  ): Promise<any> {
    const res = await fetch('/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, metodoEntrega, direccionEnvio, metodoPago: pago?.metodo, referenciaPago: pago?.referencia }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error en checkout transaccional');
    }
    return res.json();
  },

  async getPedidos(usuarioId?: string): Promise<Order[]> {
    const url = usuarioId ? `/api/pedidos?usuarioId=${usuarioId}` : '/api/pedidos';
    const res = await fetch(url);
    return res.json();
  },

  // Tienda y Admin
  async getTiendaDashboard(tiendaId: string): Promise<any> {
    const res = await fetch(`/api/tienda/${tiendaId}/dashboard`);
    return res.json();
  },

  async actualizarInventarioTienda(tiendaId: string, invId: string, data: any): Promise<any> {
    const res = await fetch(`/api/tienda/${tiendaId}/inventario/${invId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async actualizarEstadoPedidoTienda(tiendaId: string, pedId: string, estado: string): Promise<any> {
    const res = await fetch(`/api/tienda/${tiendaId}/pedidos/${pedId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    return res.json();
  },

  async getAdminDashboard(): Promise<any> {
    const res = await fetch('/api/admin/dashboard');
    return res.json();
  },

  async verificarTiendaAdmin(tiendaId: string, estado: string): Promise<any> {
    const res = await fetch(`/api/admin/tiendas/${tiendaId}/verificar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    return res.json();
  },

  async crearProducto(data: any): Promise<Product> {
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al crear producto');
    }
    return res.json();
  },

  async agregarInventarioTienda(tiendaId: string, data: any): Promise<any> {
    const res = await fetch(`/api/tienda/${tiendaId}/inventario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al agregar inventario');
    }
    return res.json();
  },

  async limpiarBaseDatos(): Promise<any> {
    const res = await fetch('/api/admin/limpiar-todo', {
      method: 'POST',
    });
    return res.json();
  },

  async seedDemo(): Promise<any> {
    const res = await fetch('/api/admin/seed-demo', {
      method: 'POST',
    });
    return res.json();
  },

  async registrarTienda(data: any): Promise<any> {
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, rol: 'tienda' }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al registrar tienda');
    }
    return res.json();
  },

  // Servidor MCP (JSON-RPC 2.0 y Discovery)
  async getMCPTools(): Promise<{ tools: MCPTool[]; server: string; protocol: string }> {
    const res = await fetch('/api/mcp/tools');
    return res.json();
  },

  async getMCPHealth(): Promise<any> {
    const res = await fetch('/api/mcp/health');
    return res.json();
  },

  async executeMCPJsonRpc(method: string, params: any = {}): Promise<any> {
    const rpcPayload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload),
    });
    return res.json();
  },

  // Agente Inteligente ComparaPC
  async sendChatMessage(messages: Array<{ role: string; content: string }>, usuarioId: string): Promise<any> {
    const res = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, usuarioId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error en comunicación con el asistente virtual');
    }
    return res.json();
  },

  // Alertas de Precio al Borde de la Web
  async getAlertasPrecio(usuarioId?: string): Promise<PriceAlertsResponse> {
    const url = usuarioId ? `/api/alertas-precio?usuarioId=${usuarioId}` : '/api/alertas-precio';
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al obtener alertas de precio');
    }
    return res.json();
  },

  async crearAlertaPrecio(data: {
    productoId: string;
    precioObjetivo: number;
    email: string;
    usuarioId?: string;
  }): Promise<PriceAlert> {
    const res = await fetch('/api/alertas-precio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al crear alerta de precio');
    }
    return res.json();
  },

  async eliminarAlertaPrecio(id: string): Promise<{ exito: boolean }> {
    const res = await fetch(`/api/alertas-precio/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async simularBajaPrecio(productoId: string, porcentaje?: number): Promise<any> {
    const res = await fetch('/api/alertas-precio/simular-baja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId, porcentaje }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al simular baja de precio');
    }
    return res.json();
  },
};
