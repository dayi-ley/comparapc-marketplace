/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/store.ts';
import { handleMCPJsonRpcRequest, MCP_TOOLS, executeMCPTool } from './server/mcp.ts';
import { processAgentChat } from './server/gemini.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// 1. ENDPOINTS DE AUTENTICACIÓN Y ROLES (RBAC)
// ============================================================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = dbStore.usuarios.find((u) => u.email.toLowerCase() === email?.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
  }

  // En demo aceptamos o validamos rol
  const { passwordHash, ...userData } = user;
  const tienda = user.rol === 'tienda' ? dbStore.tiendas.find((t) => t.usuarioId === user.id) : null;

  return res.json({
    token: `token_jwt_${user.id}_${Date.now()}`,
    usuario: userData,
    tienda: tienda || undefined,
  });
});

app.post('/api/auth/registro', (req: Request, res: Response) => {
  const { email, password, nombreCompleto, telefono, rol, nombreTienda, razonSocial, ruc, dni, direccion, departamento, provincia, distrito } = req.body;

  if (dbStore.usuarios.some((u) => u.email.toLowerCase() === email?.toLowerCase())) {
    return res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo.' });
  }

  const nuevoUsuario = {
    id: 'usr-' + Date.now(),
    email,
    passwordHash: '$2b$10$hashed_registered',
    nombreCompleto,
    telefono: telefono || '',
    rol: (rol as any) || 'cliente',
    activo: true,
    fechaRegistro: new Date().toISOString(),
  };
  dbStore.usuarios.push(nuevoUsuario);

  let nuevaTienda = null;
  if (rol === 'tienda') {
    if (!ruc || ruc.length !== 11) {
      return res.status(400).json({ error: 'El RUC debe contar con exactamente 11 dígitos numéricos.' });
    }
    nuevaTienda = {
      id: 'tie-' + Date.now(),
      usuarioId: nuevoUsuario.id,
      nombreComercial: nombreTienda || 'Nueva Tienda Hardware',
      ruc,
      razonSocial: razonSocial || nombreTienda + ' S.A.C.',
      dniRepresentante: dni || '',
      direccion: direccion || 'Av. Garcilaso de la Vega, Lima',
      distrito: distrito || 'Cercado de Lima',
      provincia: provincia || 'Lima',
      departamento: departamento || 'Lima',
      ciudad: departamento || 'Lima',
      telefono: telefono || '',
      reputacion: 5.0,
      totalVentas: 0,
      estadoVerificacion: 'pendiente' as const, // Debe ser verificada por el admin
      logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=160&q=80',
      fechaRegistro: new Date().toISOString(),
    };
    dbStore.tiendas.push(nuevaTienda);
  }

  const { passwordHash, ...safeUser } = nuevoUsuario;
  return res.json({
    mensaje: 'Registro exitoso.',
    usuario: safeUser,
    tienda: nuevaTienda || undefined,
  });
});

app.get('/api/auth/usuarios-demo', (req: Request, res: Response) => {
  const demos = dbStore.usuarios.map(({ passwordHash, ...u }) => {
    const tienda = u.rol === 'tienda' ? dbStore.tiendas.find((t) => t.usuarioId === u.id) : null;
    return {
      ...u,
      tiendaNombre: tienda?.nombreComercial,
      tiendaId: tienda?.id,
    };
  });
  return res.json(demos);
});

// ============================================================================
// 2. CATÁLOGO, CATEGORÍAS Y BÚSQUEDA
// ============================================================================

app.get('/api/categorias', (req: Request, res: Response) => {
  return res.json(dbStore.categorias);
});

app.get('/api/productos', (req: Request, res: Response) => {
  const { categoria, marca, search, precioMin, precioMax, socket, ramType, sortBy } = req.query;

  const productos = dbStore.getProductos({
    categoria: categoria as string,
    marca: marca as string,
    search: search as string,
    precioMin: precioMin ? Number(precioMin) : undefined,
    precioMax: precioMax ? Number(precioMax) : undefined,
    socket: socket as string,
    ramType: ramType as string,
    sortBy: sortBy as any,
  });

  return res.json(productos);
});

app.post('/api/productos', (req: Request, res: Response) => {
  try {
    const nuevo = dbStore.crearProducto(req.body);
    return res.status(201).json(nuevo);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/productos/:id/ofertas', (req: Request, res: Response) => {
  const data = dbStore.getOfertasProducto(req.params.id);
  if (!data) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  return res.json(data);
});

app.get('/api/productos/:id/historial-precios', (req: Request, res: Response) => {
  try {
    const { tiendaId, dias } = req.query;
    const rangoDias = dias ? Number(dias) : 30;
    const historial = dbStore.getHistorialPreciosProducto(
      req.params.id,
      tiendaId as string,
      rangoDias
    );
    return res.json(historial);
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

app.get('/api/tiendas', (req: Request, res: Response) => {
  return res.json(dbStore.tiendas);
});

// ============================================================================
// ALERTAS DE PRECIO AL BORDE DE LA WEB Y REBAJAS DE MERCADO
// ============================================================================

app.get('/api/alertas-precio', (req: Request, res: Response) => {
  const usuarioId = req.query.usuarioId as string;
  const alertas = dbStore.getAlertasPrecio(usuarioId);
  const rebajas = dbStore.getRebajasRecientes();
  return res.json({ alertas, rebajas });
});

app.post('/api/alertas-precio', (req: Request, res: Response) => {
  try {
    const { productoId, precioObjetivo, email, usuarioId } = req.body;
    if (!productoId || !precioObjetivo) {
      return res.status(400).json({ error: 'Producto y precio objetivo requeridos' });
    }
    const nuevaAlerta = dbStore.crearAlertaPrecio({
      productoId,
      precioObjetivo: Number(precioObjetivo),
      email: email || 'cliente@comparapc.pe',
      usuarioId,
    });
    return res.json(nuevaAlerta);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/alertas-precio/:id', (req: Request, res: Response) => {
  const result = dbStore.eliminarAlertaPrecio(req.params.id);
  return res.json(result);
});

app.post('/api/alertas-precio/simular-baja', (req: Request, res: Response) => {
  try {
    const { productoId, porcentaje } = req.body;
    const result = dbStore.simularBajaPrecio(productoId, porcentaje ? Number(porcentaje) : 15);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 3. ENSAMBLADOR INTELIGENTE Y VALIDADOR NEXUS MATCH
// ============================================================================

app.post('/api/compatibilidad', (req: Request, res: Response) => {
  const { cpuId, moboId, ramId, gpuId, psuId, caseId, coolId, ssdId } = req.body;
  const result = dbStore.verificarCompatibilidad({
    cpuId,
    moboId,
    ramId,
    gpuId,
    psuId,
    caseId,
    coolId,
    ssdId,
  });
  return res.json(result);
});

app.post('/api/ensamblar', (req: Request, res: Response) => {
  const { presupuesto, uso, preferencias } = req.body;
  const result = dbStore.ensamblarPC(Number(presupuesto) || 5000, uso, preferencias);
  return res.json(result);
});

// ============================================================================
// 4. CARRITO DE COMPRAS Y CHECKOUT TRANSACCIONAL ACID
// ============================================================================

app.get('/api/carrito', (req: Request, res: Response) => {
  const usuarioId = (req.query.usuarioId as string) || 'usr-cli-1';
  const cart = dbStore.getCarrito(usuarioId);
  return res.json(cart);
});

app.post('/api/carrito/items', (req: Request, res: Response) => {
  const { usuarioId = 'usr-cli-1', inventarioId, cantidad = 1 } = req.body;
  try {
    const cart = dbStore.agregarAlCarrito(usuarioId, inventarioId, Number(cantidad));
    return res.json(cart);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/carrito/items/:id', (req: Request, res: Response) => {
  const { usuarioId = 'usr-cli-1', cantidad } = req.body;
  try {
    const cart = dbStore.modificarCantidadCarrito(usuarioId, req.params.id, Number(cantidad));
    return res.json(cart);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/carrito/items/:id', (req: Request, res: Response) => {
  const usuarioId = (req.query.usuarioId as string) || 'usr-cli-1';
  const cart = dbStore.eliminarDelCarrito(usuarioId, req.params.id);
  return res.json(cart);
});

app.post('/api/ordenes', (req: Request, res: Response) => {
  const { usuarioId = 'usr-cli-1', metodoEntrega = 'recojo_en_tienda', direccionEnvio, metodoPago, referenciaPago } = req.body;
  try {
    const result = dbStore.procesarCheckout(
      usuarioId,
      metodoEntrega,
      direccionEnvio,
      metodoPago ? { metodo: metodoPago, referencia: referenciaPago || '' } : undefined
    );
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/pedidos', (req: Request, res: Response) => {
  const usuarioId = req.query.usuarioId as string;
  let pedidos = dbStore.pedidos;
  if (usuarioId) {
    pedidos = pedidos.filter((p) => p.usuarioId === usuarioId);
  }
  return res.json(pedidos);
});

// ============================================================================
// 5. PANEL DE TIENDA Y ADMINISTRACIÓN
// ============================================================================

app.get('/api/tienda/:id/dashboard', (req: Request, res: Response) => {
  try {
    const data = dbStore.getDashboardTienda(req.params.id);
    return res.json(data);
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});

app.patch('/api/tienda/:id/inventario/:invId', (req: Request, res: Response) => {
  try {
    const item = dbStore.actualizarInventario(req.params.id, req.params.invId, req.body);
    return res.json(item);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/tienda/:id/pedidos/:pedId/estado', (req: Request, res: Response) => {
  try {
    const pedido = dbStore.actualizarEstadoPedido(req.params.id, req.params.pedId, req.body.estado);
    return res.json(pedido);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/tienda/:id/inventario', (req: Request, res: Response) => {
  try {
    const item = dbStore.agregarInventarioTienda(req.params.id, req.body);
    return res.status(201).json(item);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  return res.json(dbStore.getDashboardAdmin());
});

app.patch('/api/admin/tiendas/:id/verificar', (req: Request, res: Response) => {
  try {
    const tienda = dbStore.cambiarEstadoVerificacionTienda(req.params.id, req.body.estado);
    return res.json(tienda);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/limpiar-todo', (req: Request, res: Response) => {
  dbStore.limpiarTodo();
  return res.json({ exito: true, mensaje: 'Base de datos restablecida a estado limpio (0 registros).' });
});

app.post('/api/admin/seed-demo', (req: Request, res: Response) => {
  dbStore.seedDemo();
  return res.json({ exito: true, mensaje: 'Datos de prueba cargados exitosamente.' });
});

// ============================================================================
// 6. SERVIDOR MCP OFICIAL (STREAMABLE HTTP JSON-RPC 2.0)
// ============================================================================

// Manejo del protocolo JSON-RPC 2.0 estándar en /api/mcp y /mcp
const mcpHandler = async (req: Request, res: Response) => {
  try {
    const response = await handleMCPJsonRpcRequest(req.body);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32603, message: 'Internal MCP Server Error: ' + err.message },
    });
  }
};

app.post('/api/mcp', mcpHandler);
app.post('/mcp', mcpHandler);

app.get('/api/mcp/tools', (req: Request, res: Response) => {
  return res.json({
    protocol: 'mcp-2024-11-05',
    server: 'ComparaPC-Hardware-MCP',
    toolsCount: MCP_TOOLS.length,
    tools: MCP_TOOLS,
  });
});

app.get('/api/mcp/health', (req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    server: 'ComparaPC-Hardware-MCP',
    version: '1.0.0',
    transport: 'Streamable HTTP (JSON-RPC 2.0)',
    toolsDisponibles: MCP_TOOLS.map((t) => t.name),
    logsRegistrados: dbStore.mcpLogs.length,
  });
});

// ============================================================================
// 7. AGENTE INTELIGENTE COMPARAPC (GEMINI 3.8 FLASH + MCP)
// ============================================================================

app.post('/api/agent/chat', async (req: Request, res: Response) => {
  const { messages, usuarioId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Array de mensajes inválido.' });
  }

  try {
    const agentResponse = await processAgentChat(messages, { usuarioId });
    return res.json(agentResponse);
  } catch (err: any) {
    console.error('Error en agente:', err);
    return res.status(500).json({
      reply: 'Ocurrió un error al consultar el agente MCP. Por favor intenta nuevamente.',
      error: err.message,
    });
  }
});

// ============================================================================
// 8. CONFIGURACIÓN DE FRONTEND Y SERVIDOR VITE
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  ComparaPC Servidor Activo en http://localhost:${PORT}`);
    console.log(`  Servidor MCP JSON-RPC disponible en /api/mcp y /mcp`);
    console.log(`====================================================`);
  });
}

startServer();
