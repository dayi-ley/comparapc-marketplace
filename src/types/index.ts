/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'cliente' | 'tienda' | 'admin';

export interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  telefono: string;
  rol: UserRole;
  activo: boolean;
  fechaRegistro: string;
  tiendaNombre?: string;
  tiendaId?: string;
}

export interface Store {
  id: string;
  usuarioId: string;
  nombreComercial: string;
  ruc: string;
  razonSocial: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  telefono: string;
  sitioWeb?: string;
  reputacion: number;
  totalVentas: number;
  estadoVerificacion: 'verificada' | 'pendiente' | 'rechazada' | 'suspendida';
  logoUrl: string;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  icono: string;
  descripcion: string;
  orden: number;
}

export interface HardwareSpecs {
  socket?: string;
  ramType?: string;
  formFactor?: string;
  tdpWatts?: number;
  wattage?: number;
  vramGb?: number;
  gpuLengthMm?: number;
  maxGpuLengthMm?: number;
  supportedMoboSizes?: string[];
  capacidadGb?: number;
  velocidadMhz?: number;
  certificacion?: string;
  tipoCooler?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  categoriaId: string;
  categoriaNombre?: string;
  nombre: string;
  marca: string;
  modelo: string;
  imagenUrl: string;
  especificaciones: HardwareSpecs;
  precioReferencial: number;
  precioMinimo: number;
  tiendasDisponibles: number;
  totalStock: number;
  activo: boolean;
}

export interface StoreOffer {
  inventarioId: string;
  tiendaId: string;
  tiendaNombre: string;
  ruc: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  telefono: string;
  reputacion: number;
  totalVentas: number;
  verificada: boolean;
  precio: number;
  stock: number;
  garantiaMeses: number;
  metodoEntrega: 'recojo_en_tienda' | 'envio_domicilio' | 'recojo_y_envio';
  tiempoEntregaDias: number;
  disponible: boolean;
  esMejorPrecio: boolean;
}

export interface ProductOffersResponse {
  producto: Product;
  ofertas: StoreOffer[];
  mejorPrecio: number | null;
  totalTiendas: number;
  totalStock: number;
}

export interface CartItem {
  id: string;
  inventarioId: string;
  cantidad: number;
  productoId?: string;
  productoNombre?: string;
  productoImagen?: string;
  marca?: string;
  precio: number;
  stock: number;
  tiendaId?: string;
  tiendaNombre?: string;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  totalGeneral: number;
  cantidadTotal: number;
}

export interface OrderItem {
  id: string;
  pedidoId: string;
  inventarioId: string;
  productoId: string;
  productoNombre: string;
  productoImagen: string;
  marca: string;
  precioUnitarioCongelado: number;
  cantidad: number;
  subtotal: number;
}

export interface Order {
  id: string;
  codigoOrden: string;
  usuarioId: string;
  tiendaId: string;
  tiendaNombre: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoEntrega: 'recojo_en_tienda' | 'envio_domicilio';
  direccionEnvio?: string;
  metodoPago?: string;
  referenciaPago?: string;
  estado: 'pendiente' | 'en_preparacion' | 'listo_entrega' | 'entregado' | 'cancelado';
  fechaCreacion: string;
  items: OrderItem[];
}

export interface CompatibilityCheck {
  compatible: boolean;
  errores: string[];
  advertencias: string[];
  notasPositivas: string[];
  consumoEstimadoWatts: number;
  fuenteRecomendadaWatts: number;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface PricePoint {
  id: string;
  productoId: string;
  tiendaId: string;
  tiendaNombre: string;
  precio: number;
  precioAnterior?: number;
  fecha: string;
  motivo?: string;
}

export interface PriceChangeRecord {
  id: string;
  fecha: string;
  tiendaId: string;
  tiendaNombre: string;
  precio: number;
  precioAnterior: number;
  diferencia: number;
  porcentaje: number;
  motivo?: string;
}

export interface PriceHistoryResponse {
  productoId: string;
  productoNombre: string;
  tiendaSeleccionada: string;
  rangoDias: number;
  precioActual: number;
  precioMinimo: number;
  precioMaximo: number;
  precioPromedio: number;
  puntos: PricePoint[];
  cambios: PriceChangeRecord[];
  tiendasDisponibles: Array<{ id: string; nombre: string; precioActual: number }>;
}

export interface PriceAlert {
  id: string;
  usuarioId?: string;
  productoId: string;
  productoNombre: string;
  productoImagen: string;
  tiendaNombre?: string;
  precioInicial: number;
  precioObjetivo: number;
  precioActual: number;
  alcanzado: boolean;
  email: string;
  fechaCreacion: string;
  fechaAlcanzado?: string;
  descuentoDetectado?: number;
}

export interface MarketDeal {
  id: string;
  productoId: string;
  productoNombre: string;
  productoImagen: string;
  marca: string;
  tiendaId: string;
  tiendaNombre: string;
  precioAnterior: number;
  nuevoPrecio: number;
  ahorro: number;
  porcentaje: number;
  fecha: string;
}

export interface PriceAlertsResponse {
  alertas: PriceAlert[];
  rebajas: MarketDeal[];
}
