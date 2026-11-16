/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbStore } from './store.ts';

// ============================================================================
// DEFINICIÓN DE HERRAMIENTAS MCP (MODEL CONTEXT PROTOCOL)
// ============================================================================

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'buscar_productos',
    description:
      'Busca componentes de hardware en el catálogo verificado de ComparaPC por término, categoría, marca y rangos de precio en PEN (Soles). Retorna especificaciones técnicas, precio mínimo encontrado y tiendas disponibles.',
    inputSchema: {
      type: 'object',
      properties: {
        nombre_producto: {
          type: 'string',
          description: 'Nombre o modelo del producto (ej: RTX 4070, Ryzen 7, Kingston 1TB).',
        },
        categoria: {
          type: 'string',
          description:
            'Slug de categoría: procesadores, tarjetas_graficas, placas_madre, memorias_ram, almacenamiento, fuentes_alimentacion, gabinetes, refrigeracion.',
        },
        marca: {
          type: 'string',
          description: 'Marca del componente (ej: AMD, Intel, ASUS, Corsair, Kingston, MSI).',
        },
        precio_min: {
          type: 'number',
          description: 'Precio mínimo en soles (PEN).',
        },
        precio_max: {
          type: 'number',
          description: 'Precio máximo en soles (PEN).',
        },
      },
    },
  },
  {
    name: 'comparar_ofertas',
    description:
      'Compara las ofertas de un mismo producto de hardware entre distintas tiendas verificadas de ComparaPC. Identifica la oferta más económica con "MEJOR PRECIO", stock disponible, ubicación y garantía.',
    inputSchema: {
      type: 'object',
      properties: {
        id_producto: {
          type: 'string',
          description: 'ID único del producto en el catálogo base (ej: prod-gpu-rtx4070s).',
        },
        criterio_ordenamiento: {
          type: 'string',
          enum: ['menor_precio', 'reputacion', 'stock'],
          description: 'Criterio para ordenar las ofertas recibidas.',
        },
      },
      required: ['id_producto'],
    },
  },
  {
    name: 'verificar_compatibilidad',
    description:
      'Comprueba con el motor Nexus Match si los componentes seleccionados son técnicamente compatibles: Socket CPU vs Socket Motherboard, RAM DDR4 vs DDR5, Watts de Fuente vs TDP total y dimensiones físicas de GPU vs Gabinete.',
    inputSchema: {
      type: 'object',
      properties: {
        procesador_id: { type: 'string', description: 'ID del procesador' },
        placa_madre_id: { type: 'string', description: 'ID de la placa madre' },
        memoria_ram_id: { type: 'string', description: 'ID de la memoria RAM' },
        tarjeta_grafica_id: { type: 'string', description: 'ID de la tarjeta gráfica' },
        fuente_alimentacion_id: { type: 'string', description: 'ID de la fuente' },
        gabinete_id: { type: 'string', description: 'ID del gabinete' },
        refrigeracion_id: { type: 'string', description: 'ID del cooler' },
      },
      required: ['procesador_id', 'placa_madre_id', 'memoria_ram_id'],
    },
  },
  {
    name: 'ensamblar_pc',
    description:
      'Recomienda una configuración completa y balanceada de computadora según un presupuesto en Soles (PEN) y caso de uso, aplicando la distribución 45% GPU, 25% CPU, 15% Placa+RAM, 15% Fuente+Almacenamiento.',
    inputSchema: {
      type: 'object',
      properties: {
        presupuesto: {
          type: 'number',
          description: 'Presupuesto total en soles (PEN), ej: 5500.',
        },
        uso_principal: {
          type: 'string',
          enum: ['gaming', 'creacion_contenido', 'desarrollo', 'oficina'],
          description: 'Uso primario de la máquina.',
        },
        preferencias: {
          type: 'string',
          description: 'Preferencias del usuario como marcas o estética (AMD, Intel, RGB, etc.).',
        },
      },
      required: ['presupuesto'],
    },
  },
  {
    name: 'consultar_stock',
    description:
      'Verifica la disponibilidad y cantidad de stock en tiempo real de un componente en las tiendas afiliadas.',
    inputSchema: {
      type: 'object',
      properties: {
        id_producto: {
          type: 'string',
          description: 'ID del producto en catálogo.',
        },
        id_tienda: {
          type: 'string',
          description: 'Opcional: ID de una tienda en particular.',
        },
      },
      required: ['id_producto'],
    },
  },
  {
    name: 'agregar_al_carrito',
    description:
      'Agrega un componente seleccionado desde una tienda al carrito de compras del cliente. REQUERIMIENTO CRÍTICO: Debe solicitar autorización explícita al usuario antes de ejecutar la acción si no ha sido confirmada.',
    inputSchema: {
      type: 'object',
      properties: {
        id_cliente: {
          type: 'string',
          description: 'ID del usuario autenticado (ej: usr-cli-1).',
        },
        id_inventario: {
          type: 'string',
          description: 'ID del artículo de inventario de la tienda elegida.',
        },
        cantidad: {
          type: 'number',
          description: 'Cantidad a agregar (por defecto 1).',
        },
        autorizado_por_usuario: {
          type: 'boolean',
          description:
            'Indica si el usuario final ya dio su confirmación expresa en la interfaz para agregar este ítem.',
        },
      },
      required: ['id_cliente', 'id_inventario'],
    },
  },
  {
    name: 'calcular_costo_ensamblaje',
    description:
      'Calcula el costo total consolidado de una lista de componentes de hardware considerando las mejores ofertas disponibles y tarifas de entrega aplicables.',
    inputSchema: {
      type: 'object',
      properties: {
        items_inventario_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de IDs de inventario seleccionados.',
        },
        metodo_entrega: {
          type: 'string',
          enum: ['recojo_en_tienda', 'envio_domicilio'],
          description: 'Método de entrega seleccionado.',
        },
      },
      required: ['items_inventario_ids'],
    },
  },
  {
    name: 'generar_orden',
    description:
      'Genera una orden de compra formal transaccional dividida por cada tienda proveedora. SEGURIDAD: Nunca ejecutar automáticamente; requiere confirmación explícita previa del cliente.',
    inputSchema: {
      type: 'object',
      properties: {
        id_cliente: {
          type: 'string',
          description: 'ID del cliente que genera la orden.',
        },
        metodo_entrega: {
          type: 'string',
          enum: ['recojo_en_tienda', 'envio_domicilio'],
          description: 'Modalidad de entrega.',
        },
        direccion_entrega: {
          type: 'string',
          description: 'Dirección física si es envío a domicilio.',
        },
        confirmacion_explicita_cliente: {
          type: 'boolean',
          description:
            'Debe ser TRUE únicamente cuando el cliente ha hecho clic en el botón de confirmación final.',
        },
      },
      required: ['id_cliente', 'metodo_entrega'],
    },
  },
];

// ============================================================================
// EJECUTOR DE HERRAMIENTAS MCP
// ============================================================================

export async function executeMCPTool(toolName: string, args: Record<string, any>) {
  const startTime = Date.now();

  try {
    let result: any;

    switch (toolName) {
      case 'buscar_productos': {
        const productos = dbStore.getProductos({
          search: args.nombre_producto,
          categoria: args.categoria,
          marca: args.marca,
          precioMin: args.precio_min,
          precioMax: args.precio_max,
        });
        result = {
          totalEncontrados: productos.length,
          productos: productos.slice(0, 10).map((p) => ({
            id: p.id,
            nombre: p.nombre,
            marca: p.marca,
            modelo: p.modelo,
            categoria: p.categoriaNombre,
            precioMinimo: p.precioMinimo,
            tiendasDisponibles: p.tiendasDisponibles,
            especificaciones: p.especificaciones,
            imagenUrl: p.imagenUrl,
          })),
        };
        break;
      }

      case 'comparar_ofertas': {
        const ofertasData = dbStore.getOfertasProducto(args.id_producto);
        if (!ofertasData) {
          result = { error: `Producto no encontrado con ID: ${args.id_producto}` };
        } else {
          result = {
            producto: {
              id: ofertasData.producto.id,
              nombre: ofertasData.producto.nombre,
              marca: ofertasData.producto.marca,
              imagenUrl: ofertasData.producto.imagenUrl,
            },
            mejorPrecio: ofertasData.mejorPrecio,
            totalTiendas: ofertasData.totalTiendas,
            ofertas: ofertasData.ofertas.map((o) => ({
              inventarioId: o.inventarioId,
              tienda: o.tiendaNombre,
              ruc: o.ruc,
              precio: o.precio,
              stock: o.stock,
              esMejorPrecio: o.esMejorPrecio,
              ubicacion: `${o.distrito}, ${o.direccion}`,
              reputacion: o.reputacion,
              entrega: o.metodoEntrega,
              disponible: o.disponible,
            })),
          };
        }
        break;
      }

      case 'verificar_compatibilidad': {
        const compat = dbStore.verificarCompatibilidad({
          cpuId: args.procesador_id,
          moboId: args.placa_madre_id,
          ramId: args.memoria_ram_id,
          gpuId: args.tarjeta_grafica_id,
          psuId: args.fuente_alimentacion_id,
          caseId: args.gabinete_id,
          coolId: args.refrigeracion_id,
        });
        result = compat;
        break;
      }

      case 'ensamblar_pc': {
        const presupuesto = Number(args.presupuesto) || 5000;
        const ensamble = dbStore.ensamblarPC(
          presupuesto,
          args.uso_principal || 'gaming',
          args.preferencias
        );
        result = ensamble;
        break;
      }

      case 'consultar_stock': {
        const ofertasData = dbStore.getOfertasProducto(args.id_producto);
        if (!ofertasData) {
          result = { error: 'Producto no encontrado' };
        } else {
          let lista = ofertasData.ofertas;
          if (args.id_tienda) {
            lista = lista.filter((o) => o.tiendaId === args.id_tienda);
          }
          result = {
            idProducto: args.id_producto,
            nombre: ofertasData.producto.nombre,
            stockTotal: ofertasData.totalStock,
            disponible: ofertasData.totalStock > 0,
            tiendas: lista.map((o) => ({
              tiendaId: o.tiendaId,
              tienda: o.tiendaNombre,
              stock: o.stock,
              precio: o.precio,
              estado: o.stock > 0 ? 'En Stock' : 'Agotado',
            })),
          };
        }
        break;
      }

      case 'agregar_al_carrito': {
        // Política de seguridad para operaciones sensibles
        if (!args.autorizado_por_usuario) {
          result = {
            status: 'requires_confirmation',
            mensaje:
              'Se requiere autorización expresa del usuario antes de añadir este ítem al carrito.',
            accion: 'agregar_al_carrito',
            detalles: {
              idCliente: args.id_cliente,
              idInventario: args.id_inventario,
              cantidad: args.cantidad || 1,
            },
          };
        } else {
          const cart = dbStore.agregarAlCarrito(
            args.id_cliente,
            args.id_inventario,
            args.cantidad || 1
          );
          result = {
            status: 'success',
            mensaje: `Producto agregado correctamente al carrito de compras.`,
            resumenCarrito: {
              itemsTotales: cart.cantidadTotal,
              totalGeneralPEN: cart.totalGeneral,
            },
          };
        }
        break;
      }

      case 'calcular_costo_ensamblaje': {
        const ids = args.items_inventario_ids || [];
        let subtotal = 0;
        const desglose: any[] = [];
        const tiendasInvolucradas = new Set<string>();

        for (const id of ids) {
          const inv = dbStore.inventario.find((i) => i.id === id);
          if (inv) {
            const prod = dbStore.productos.find((p) => p.id === inv.productoId);
            const tienda = dbStore.tiendas.find((t) => t.id === inv.tiendaId);
            tiendasInvolucradas.add(inv.tiendaId);
            subtotal += inv.precio;
            desglose.push({
              producto: prod?.nombre,
              tienda: tienda?.nombreComercial,
              precio: inv.precio,
            });
          }
        }

        const costoEnvio =
          args.metodo_entrega === 'envio_domicilio' ? tiendasInvolucradas.size * 15.0 : 0.0;

        result = {
          itemsCount: desglose.length,
          tiendasInvolucradas: tiendasInvolucradas.size,
          subtotalHardwarePEN: subtotal,
          costoEnvioPEN: costoEnvio,
          totalEstimadoPEN: subtotal + costoEnvio,
          desglose,
        };
        break;
      }

      case 'generar_orden': {
        // Validación de confirmación explícita
        if (!args.confirmacion_explicita_cliente) {
          result = {
            status: 'requires_confirmation',
            mensaje:
              'ADVERTENCIA: Por seguridad y política de ComparaPC, la orden requiere confirmación explícita del cliente.',
            accion: 'generar_orden',
            detalles: {
              idCliente: args.id_cliente,
              metodoEntrega: args.metodo_entrega,
              direccionEntrega: args.direccion_entrega,
            },
          };
        } else {
          const checkoutResult = dbStore.procesarCheckout(
            args.id_cliente,
            args.metodo_entrega,
            args.direccion_entrega
          );
          result = {
            status: 'success',
            mensaje:
              'Orden generada exitosamente. Se han generado los pedidos separados por tienda.',
            orden: checkoutResult,
          };
        }
        break;
      }

      default:
        throw new Error(`Herramienta MCP desconocida: ${toolName}`);
    }

    const durationMs = Date.now() - startTime;
    dbStore.mcpLogs.push({
      id: 'mcp-log-' + Date.now(),
      timestamp: new Date().toISOString(),
      tool: toolName,
      params: args,
      result,
      durationMs,
    });

    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const errorResult = { error: error.message };
    dbStore.mcpLogs.push({
      id: 'mcp-log-' + Date.now(),
      timestamp: new Date().toISOString(),
      tool: toolName,
      params: args,
      result: errorResult,
      durationMs,
    });
    throw error;
  }
}

// ============================================================================
// PROCESADOR DEL PROTOCOLO JSON-RPC 2.0 (Streamable HTTP MCP)
// ============================================================================

export async function handleMCPJsonRpcRequest(rpcRequest: any) {
  const { jsonrpc, id, method, params } = rpcRequest || {};

  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id: id || null,
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
    };
  }

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: false },
            resources: {},
            prompts: {},
          },
          serverInfo: {
            name: 'ComparaPC-Hardware-MCP',
            version: '1.0.0',
            description:
              'Servidor MCP oficial de ComparaPC para catálogo, ofertas multi-tienda y checkout transaccional.',
          },
        },
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS,
        },
      };

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      const toolDef = MCP_TOOLS.find((t) => t.name === toolName);
      if (!toolDef) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Herramienta MCP no encontrada: ${toolName}` },
        };
      }

      try {
        const executionResult = await executeMCPTool(toolName, toolArgs);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(executionResult, null, 2),
              },
            ],
            isError: false,
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: err.message }),
              },
            ],
            isError: true,
          },
        };
      }
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: [
            {
              uri: 'comparapc://catalogo/resumen',
              name: 'Resumen de Catálogo ComparaPC',
              mimeType: 'application/json',
            },
          ],
        },
      };

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: [
            {
              name: 'asesor_hardware',
              description:
                'Asesor especializado en hardware y optimización de ensambles para ComparaPC.',
            },
          ],
        },
      };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Método JSON-RPC no soportado: ${method}` },
      };
  }
}
