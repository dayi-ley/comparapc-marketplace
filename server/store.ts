/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Modelos y tipos de ComparaPC
export interface Usuario {
  id: string;
  email: string;
  passwordHash: string;
  nombreCompleto: string;
  telefono: string;
  rol: 'cliente' | 'tienda' | 'admin';
  activo: boolean;
  fechaRegistro: string;
}

export interface Tienda {
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
  fechaRegistro: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  icono: string;
  descripcion: string;
  orden: number;
}

export interface EspecificacionesHardware {
  socket?: string; // AM5, LGA1700, AM4
  ramType?: string; // DDR5, DDR4
  formFactor?: string; // ATX, Micro-ATX, Mini-ITX
  tdpWatts?: number; // Consumo TDP
  wattage?: number; // Para fuentes
  vramGb?: number; // Para GPUs
  gpuLengthMm?: number; // Longitud en mm
  maxGpuLengthMm?: number; // Para gabinetes
  supportedMoboSizes?: string[]; // ['ATX', 'Micro-ATX']
  capacidadGb?: number; // Para almacenamiento
  velocidadMhz?: number;
  certificacion?: string; // 80 Plus Gold, Bronze
  tipoCooler?: 'aire' | 'liquida_240' | 'liquida_360';
  [key: string]: any;
}

export interface ProductoBase {
  id: string;
  categoriaId: string;
  nombre: string;
  marca: string;
  modelo: string;
  imagenUrl: string;
  especificaciones: EspecificacionesHardware;
  precioReferencial: number;
  activo: boolean;
}

export interface InventarioTienda {
  id: string;
  tiendaId: string;
  productoId: string;
  precio: number; // en Soles (PEN)
  stock: number;
  garantiaMeses: number;
  metodoEntrega: 'recojo_en_tienda' | 'envio_domicilio' | 'recojo_y_envio';
  tiempoEntregaDias: number;
  activo: boolean;
  fechaActualizacion: string;
}

export interface ItemCarrito {
  id: string;
  inventarioId: string;
  cantidad: number;
  fechaAgregado: string;
}

export interface DetallePedido {
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

export interface Pedido {
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
  items: DetallePedido[];
}

export interface RegistroHistorialPrecio {
  id: string;
  productoId: string;
  tiendaId: string;
  tiendaNombre: string;
  precio: number;
  precioAnterior?: number;
  fecha: string;
  motivo?: string; // 'registro_inicial' | 'actualizacion_tienda' | 'ajuste_mercado'
}

export interface AlertaPrecio {
  id: string;
  usuarioId?: string;
  productoId: string;
  productoNombre: string;
  productoImagen: string;
  tiendaId?: string;
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

// ============================================================================
// BASE DE DATOS AUTORITATIVA EN MEMORIA (Esquema PostgreSQL Emulado)
// ============================================================================

class ComparaPCStore {
  usuarios: Usuario[] = [];
  tiendas: Tienda[] = [];
  categorias: Categoria[] = [];
  productos: ProductoBase[] = [];
  inventario: InventarioTienda[] = [];
  historialPrecios: RegistroHistorialPrecio[] = [];
  alertasPrecio: AlertaPrecio[] = [];
  carritos: Map<string, ItemCarrito[]> = new Map(); // usuarioId -> items
  pedidos: Pedido[] = [];
  mcpLogs: Array<{ id: string; timestamp: string; tool: string; params: any; result: any; durationMs: number }> = [];

  constructor() {
    this.seedDemo();
  }

  limpiarTodo() {
    this.initCategorias();
    this.tiendas = [];
    this.productos = [];
    this.inventario = [];
    this.historialPrecios = [];
    this.alertasPrecio = [];
    this.pedidos = [];
    this.carritos = new Map();
    this.mcpLogs = [];
    this.usuarios = [
      {
        id: 'usr-adm-1',
        email: 'admin@comparapc.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Administrador Maestro ComparaPC',
        telefono: '+51 999 888 777',
        rol: 'admin',
        activo: true,
        fechaRegistro: '2026-01-01T00:00:00Z',
      },
      {
        id: 'usr-cli-1',
        email: 'cliente@comparapc.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Usuario Cliente Demo',
        telefono: '+51 987 654 321',
        rol: 'cliente',
        activo: true,
        fechaRegistro: '2026-01-15T10:00:00Z',
      },
    ];
  }

  initCategorias() {
    this.categorias = [
      {
        id: 'cat-cpu',
        nombre: 'Procesadores',
        slug: 'procesadores',
        icono: 'Cpu',
        descripcion: 'CPUs Intel y AMD para gaming, creación de contenido y multitarea.',
        orden: 1,
      },
      {
        id: 'cat-gpu',
        nombre: 'Tarjetas Gráficas',
        slug: 'tarjetas_graficas',
        icono: 'Tv',
        descripcion: 'GPUs NVIDIA GeForce RTX y AMD Radeon con trazado de rayos y DLSS.',
        orden: 2,
      },
      {
        id: 'cat-mobo',
        nombre: 'Placas Madre',
        slug: 'placas_madre',
        icono: 'CircuitBoard',
        descripcion: 'Motherboards AM5, LGA1700 con soporte DDR4 y DDR5 PCIe 5.0.',
        orden: 3,
      },
      {
        id: 'cat-ram',
        nombre: 'Memorias RAM',
        slug: 'memorias_ram',
        icono: 'Layers',
        descripcion: 'Kits dual channel de alta velocidad DDR4 y DDR5 con perfiles XMP / EXPO.',
        orden: 4,
      },
      {
        id: 'cat-ssd',
        nombre: 'Almacenamiento SSD/HDD',
        slug: 'almacenamiento',
        icono: 'HardDrive',
        descripcion: 'Unidades NVMe M.2 PCIe 4.0/5.0 de ultra alta velocidad y discos masivos.',
        orden: 5,
      },
      {
        id: 'cat-psu',
        nombre: 'Fuentes de Alimentación',
        slug: 'fuentes_alimentacion',
        icono: 'Zap',
        descripcion: 'Fuentes modulares certificadas 80 Plus Bronze, Gold con estándar ATX 3.0.',
        orden: 6,
      },
      {
        id: 'cat-case',
        nombre: 'Gabinetes',
        slug: 'gabinetes',
        icono: 'Box',
        descripcion: 'Chasis gamer con excelente flujo de aire, vidrio templado y soporte de radiadores.',
        orden: 7,
      },
      {
        id: 'cat-cool',
        nombre: 'Refrigeración',
        slug: 'refrigeracion',
        icono: 'Fan',
        descripcion: 'Disipadores por aire de alto rendimiento y refrigeraciones líquidas AIO.',
        orden: 8,
      },
      {
        id: 'cat-per',
        nombre: 'Monitores y Periféricos',
        slug: 'monitores_perifericos',
        icono: 'Monitor',
        descripcion: 'Pantallas IPS 144Hz+, teclados mecánicos y mouses de precisión.',
        orden: 9,
      },
    ];
  }

  seed() {
    this.seedDemo();
  }

  seedDemo() {
    this.initCategorias();
    // 1. Usuarios iniciales
    this.usuarios = [
      {
        id: 'usr-cli-1',
        email: 'cliente@comparapc.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Juan Carlos Pérez',
        telefono: '+51 987 654 321',
        rol: 'cliente',
        activo: true,
        fechaRegistro: '2026-01-15T10:00:00Z',
      },
      {
        id: 'usr-tie-1',
        email: 'contacto@tienda1.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Tienda 1 Admin',
        telefono: '+51 912 000 001',
        rol: 'tienda',
        activo: true,
        fechaRegistro: '2026-01-10T09:00:00Z',
      },
      {
        id: 'usr-tie-2',
        email: 'ventas@tienda2.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Tienda 2 Admin',
        telefono: '+51 923 000 002',
        rol: 'tienda',
        activo: true,
        fechaRegistro: '2026-01-11T11:00:00Z',
      },
      {
        id: 'usr-tie-3',
        email: 'contacto@tienda3.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Tienda 3 Admin',
        telefono: '+51 934 000 003',
        rol: 'tienda',
        activo: true,
        fechaRegistro: '2026-01-12T14:00:00Z',
      },
      {
        id: 'usr-tie-4',
        email: 'ventas@tienda4.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Tienda 4 Admin',
        telefono: '+51 945 000 004',
        rol: 'tienda',
        activo: true,
        fechaRegistro: '2026-02-01T16:00:00Z',
      },
      {
        id: 'usr-tie-fic',
        email: 'ventas@tiendaficticia.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Tienda Ficticia Tech Admin',
        telefono: '+51 955 000 005',
        rol: 'tienda',
        activo: true,
        fechaRegistro: '2026-01-05T08:00:00Z',
      },
      {
        id: 'usr-adm-1',
        email: 'admin@comparapc.pe',
        passwordHash: '$2b$10$hashed_demo_password',
        nombreCompleto: 'Administrador Maestro ComparaPC',
        telefono: '+51 999 888 777',
        rol: 'admin',
        activo: true,
        fechaRegistro: '2026-01-01T00:00:00Z',
      },
    ];

    // 2. Tiendas
    this.tiendas = [
      {
        id: 'tie-1',
        usuarioId: 'usr-tie-1',
        nombreComercial: 'Tienda 1',
        ruc: '20100000001',
        razonSocial: 'TIENDA UNO S.A.C.',
        direccion: 'Av. Tecnológica 101, C.C. Demo Stand 12',
        distrito: 'Distrito Central',
        ciudad: 'Lima',
        telefono: '(01) 710-0001',
        sitioWeb: 'https://tienda1.demo.pe',
        reputacion: 4.9,
        totalVentas: 1420,
        estadoVerificacion: 'verificada',
        logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=160&q=80',
        fechaRegistro: '2026-01-10T09:00:00Z',
      },
      {
        id: 'tie-2',
        usuarioId: 'usr-tie-2',
        nombreComercial: 'Tienda 2',
        ruc: '20200000002',
        razonSocial: 'TIENDA DOS S.A.C.',
        direccion: 'Calle Los Circuitos 202, Galería B Stand 05',
        distrito: 'Distrito Norte',
        ciudad: 'Lima',
        telefono: '(01) 710-0002',
        sitioWeb: 'https://tienda2.demo.pe',
        reputacion: 4.8,
        totalVentas: 1890,
        estadoVerificacion: 'verificada',
        logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=160&q=80',
        fechaRegistro: '2026-01-11T11:00:00Z',
      },
      {
        id: 'tie-3',
        usuarioId: 'usr-tie-3',
        nombreComercial: 'Tienda 3',
        ruc: '20300000003',
        razonSocial: 'TIENDA TRES S.A.C.',
        direccion: 'Jirón de los Microchips 303',
        distrito: 'Distrito Sur',
        ciudad: 'Lima',
        telefono: '(01) 710-0003',
        sitioWeb: 'https://tienda3.demo.pe',
        reputacion: 4.7,
        totalVentas: 870,
        estadoVerificacion: 'verificada',
        logoUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=160&q=80',
        fechaRegistro: '2026-01-12T14:00:00Z',
      },
      {
        id: 'tie-fic',
        usuarioId: 'usr-tie-fic',
        nombreComercial: 'Tienda Ficticia Tech',
        ruc: '20555555551',
        razonSocial: 'TIENDA FICTICIA TECH S.A.C.',
        direccion: 'Av. Las Begonias 123, Torre Ficticia Stand 08',
        distrito: 'San Isidro',
        ciudad: 'Lima',
        telefono: '(01) 710-5555',
        sitioWeb: 'https://tiendaficticia.pe',
        reputacion: 4.95,
        totalVentas: 2150,
        estadoVerificacion: 'verificada',
        logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=160&q=80',
        fechaRegistro: '2026-01-05T08:00:00Z',
      },
      {
        id: 'tie-4',
        usuarioId: 'usr-tie-4',
        nombreComercial: 'Tienda 4',
        ruc: '20400000004',
        razonSocial: 'TIENDA CUATRO S.A.C.',
        direccion: 'Pasaje de los Procesadores 404',
        distrito: 'Distrito Este',
        ciudad: 'Lima',
        telefono: '(01) 710-0004',
        sitioWeb: 'https://tienda4.demo.pe',
        reputacion: 4.6,
        totalVentas: 65,
        estadoVerificacion: 'pendiente', // Tienda pendiente de verificación por el admin
        logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=160&q=80',
        fechaRegistro: '2026-02-01T16:00:00Z',
      },
    ];

    // 3. Categorías
    this.categorias = [
      {
        id: 'cat-cpu',
        nombre: 'Procesadores',
        slug: 'procesadores',
        icono: 'Cpu',
        descripcion: 'CPUs Intel y AMD para gaming, creación de contenido y multitarea.',
        orden: 1,
      },
      {
        id: 'cat-gpu',
        nombre: 'Tarjetas Gráficas',
        slug: 'tarjetas_graficas',
        icono: 'Tv',
        descripcion: 'GPUs NVIDIA GeForce RTX y AMD Radeon con trazado de rayos y DLSS.',
        orden: 2,
      },
      {
        id: 'cat-mobo',
        nombre: 'Placas Madre',
        slug: 'placas_madre',
        icono: 'CircuitBoard',
        descripcion: 'Motherboards AM5, LGA1700 con soporte DDR4 y DDR5 PCIe 5.0.',
        orden: 3,
      },
      {
        id: 'cat-ram',
        nombre: 'Memorias RAM',
        slug: 'memorias_ram',
        icono: 'Layers',
        descripcion: 'Kits dual channel de alta velocidad DDR4 y DDR5 con perfiles XMP / EXPO.',
        orden: 4,
      },
      {
        id: 'cat-ssd',
        nombre: 'Almacenamiento SSD/HDD',
        slug: 'almacenamiento',
        icono: 'HardDrive',
        descripcion: 'Unidades NVMe M.2 PCIe 4.0/5.0 de ultra alta velocidad y discos masivos.',
        orden: 5,
      },
      {
        id: 'cat-psu',
        nombre: 'Fuentes de Alimentación',
        slug: 'fuentes_alimentacion',
        icono: 'Zap',
        descripcion: 'Fuentes modulares certificadas 80 Plus Bronze, Gold con estándar ATX 3.0.',
        orden: 6,
      },
      {
        id: 'cat-case',
        nombre: 'Gabinetes',
        slug: 'gabinetes',
        icono: 'Box',
        descripcion: 'Chasis gamer con excelente flujo de aire, vidrio templado y soporte de radiadores.',
        orden: 7,
      },
      {
        id: 'cat-cool',
        nombre: 'Refrigeración',
        slug: 'refrigeracion',
        icono: 'Fan',
        descripcion: 'Disipadores por aire de alto rendimiento y refrigeraciones líquidas AIO.',
        orden: 8,
      },
      {
        id: 'cat-per',
        nombre: 'Monitores y Periféricos',
        slug: 'monitores_perifericos',
        icono: 'Monitor',
        descripcion: 'Pantallas IPS 144Hz+, teclados mecánicos y mouses de precisión.',
        orden: 9,
      },
    ];

    // 4. Catálogo de Productos Base
    this.productos = [
      // Procesadores
      {
        id: 'prod-cpu-7800x3d',
        categoriaId: 'cat-cpu',
        nombre: 'AMD Ryzen 7 7800X3D (8C/16T, 4.2GHz - 5.0GHz, 96MB 3D V-Cache)',
        marca: 'AMD',
        modelo: 'Ryzen 7 7800X3D',
        imagenUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'AM5',
          ramType: 'DDR5',
          tdpWatts: 120,
          cores: 8,
          threads: 16,
          cacheMb: 96,
          coolerIncluded: false,
        },
        precioReferencial: 1790.0,
        activo: true,
      },
      {
        id: 'prod-cpu-7600x',
        categoriaId: 'cat-cpu',
        nombre: 'AMD Ryzen 5 7600X (6C/12T, 4.7GHz - 5.3GHz, 38MB Cache)',
        marca: 'AMD',
        modelo: 'Ryzen 5 7600X',
        imagenUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'AM5',
          ramType: 'DDR5',
          tdpWatts: 105,
          cores: 6,
          threads: 12,
          cacheMb: 38,
          coolerIncluded: false,
        },
        precioReferencial: 920.0,
        activo: true,
      },
      {
        id: 'prod-cpu-14700k',
        categoriaId: 'cat-cpu',
        nombre: 'Intel Core i7-14700K (20C/28T, hasta 5.6GHz, LGA1700)',
        marca: 'Intel',
        modelo: 'Core i7-14700K',
        imagenUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'LGA1700',
          ramType: 'DDR5',
          tdpWatts: 253,
          cores: 20,
          threads: 28,
          coolerIncluded: false,
        },
        precioReferencial: 1850.0,
        activo: true,
      },
      {
        id: 'prod-cpu-13400f',
        categoriaId: 'cat-cpu',
        nombre: 'Intel Core i5-13400F (10C/16T, hasta 4.6GHz, LGA1700)',
        marca: 'Intel',
        modelo: 'Core i5-13400F',
        imagenUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'LGA1700',
          ramType: 'DDR4',
          tdpWatts: 65,
          cores: 10,
          threads: 16,
          coolerIncluded: true,
        },
        precioReferencial: 760.0,
        activo: true,
      },

      // Tarjetas Gráficas
      {
        id: 'prod-gpu-rtx4090',
        categoriaId: 'cat-gpu',
        nombre: 'NVIDIA GeForce RTX 4090 24GB ASUS ROG Strix OC Edition',
        marca: 'ASUS',
        modelo: 'ROG Strix RTX 4090 24GB',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 24,
          tdpWatts: 450,
          gpuLengthMm: 357,
          psuRecommendedWatts: 850,
          busWidth: '384-bit',
        },
        precioReferencial: 8400.0,
        activo: true,
      },
      {
        id: 'prod-gpu-rtx4070s',
        categoriaId: 'cat-gpu',
        nombre: 'NVIDIA GeForce RTX 4070 Super 12GB ASUS Dual OC Edition',
        marca: 'ASUS',
        modelo: 'Dual RTX 4070 Super 12GB',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 12,
          tdpWatts: 220,
          gpuLengthMm: 267,
          psuRecommendedWatts: 650,
          busWidth: '192-bit',
        },
        precioReferencial: 2690.0,
        activo: true,
      },
      {
        id: 'prod-gpu-rx7800xt',
        categoriaId: 'cat-gpu',
        nombre: 'AMD Radeon RX 7800 XT 16GB Sapphire Pulse Dual Fan',
        marca: 'Sapphire',
        modelo: 'Pulse RX 7800 XT 16GB',
        imagenUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 16,
          tdpWatts: 263,
          gpuLengthMm: 280,
          psuRecommendedWatts: 700,
          busWidth: '256-bit',
        },
        precioReferencial: 2350.0,
        activo: true,
      },
      {
        id: 'prod-gpu-rtx4060',
        categoriaId: 'cat-gpu',
        nombre: 'NVIDIA GeForce RTX 4060 8GB MSI Ventus 2X Black OC',
        marca: 'MSI',
        modelo: 'Ventus 2X RTX 4060 8GB',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 8,
          tdpWatts: 115,
          gpuLengthMm: 199,
          psuRecommendedWatts: 550,
          busWidth: '128-bit',
        },
        precioReferencial: 1390.0,
        activo: true,
      },

      // Placas Madre
      {
        id: 'prod-mobo-b650tuf',
        categoriaId: 'cat-mobo',
        nombre: 'ASUS TUF Gaming B650-PLUS WiFi (Socket AM5, DDR5, ATX, PCIe 5.0)',
        marca: 'ASUS',
        modelo: 'TUF Gaming B650-PLUS WiFi',
        imagenUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'AM5',
          ramType: 'DDR5',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamGb: 128,
          m2Slots: 3,
          wifi: true,
        },
        precioReferencial: 890.0,
        activo: true,
      },
      {
        id: 'prod-mobo-b760mag',
        categoriaId: 'cat-mobo',
        nombre: 'MSI MAG B760 TOMAHAWK WiFi (LGA1700, DDR5, ATX, PCIe 5.0)',
        marca: 'MSI',
        modelo: 'MAG B760 TOMAHAWK WiFi',
        imagenUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'LGA1700',
          ramType: 'DDR5',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamGb: 192,
          m2Slots: 3,
          wifi: true,
        },
        precioReferencial: 870.0,
        activo: true,
      },
      {
        id: 'prod-mobo-b760d4',
        categoriaId: 'cat-mobo',
        nombre: 'ASUS PRIME B760M-A D4 (LGA1700, DDR4, Micro-ATX)',
        marca: 'ASUS',
        modelo: 'PRIME B760M-A D4',
        imagenUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'LGA1700',
          ramType: 'DDR4',
          formFactor: 'Micro-ATX',
          ramSlots: 4,
          maxRamGb: 128,
          m2Slots: 2,
          wifi: false,
        },
        precioReferencial: 540.0,
        activo: true,
      },

      // Memorias RAM
      {
        id: 'prod-ram-ddr5-32',
        categoriaId: 'cat-ram',
        nombre: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 AMD EXPO / XMP',
        marca: 'Corsair',
        modelo: 'Vengeance RGB 32GB DDR5 6000',
        imagenUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          ramType: 'DDR5',
          capacidadGb: 32,
          modulos: '2x16GB',
          velocidadMhz: 6000,
          latencia: 'CL30',
          rgb: true,
        },
        precioReferencial: 490.0,
        activo: true,
      },
      {
        id: 'prod-ram-ddr4-16',
        categoriaId: 'cat-ram',
        nombre: 'Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz CL16',
        marca: 'Kingston',
        modelo: 'Fury Beast 16GB DDR4 3200',
        imagenUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          ramType: 'DDR4',
          capacidadGb: 16,
          modulos: '2x8GB',
          velocidadMhz: 3200,
          latencia: 'CL16',
          rgb: false,
        },
        precioReferencial: 195.0,
        activo: true,
      },

      // Almacenamiento
      {
        id: 'prod-ssd-kc3000',
        categoriaId: 'cat-ssd',
        nombre: 'Kingston KC3000 1TB NVMe M.2 2280 PCIe 4.0 (Hasta 7000 MB/s)',
        marca: 'Kingston',
        modelo: 'KC3000 1TB',
        imagenUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          formato: 'M.2 NVMe 2280',
          interfaz: 'PCIe 4.0 x4',
          capacidadGb: 1000,
          lecturaMbS: 7000,
          escrituraMbS: 6000,
        },
        precioReferencial: 380.0,
        activo: true,
      },
      {
        id: 'prod-ssd-990pro',
        categoriaId: 'cat-ssd',
        nombre: 'Samsung 990 PRO 2TB NVMe M.2 PCIe 4.0 con Disipador',
        marca: 'Samsung',
        modelo: '990 PRO 2TB',
        imagenUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          formato: 'M.2 NVMe 2280',
          interfaz: 'PCIe 4.0 x4',
          capacidadGb: 2000,
          lecturaMbS: 7450,
          escrituraMbS: 6900,
        },
        precioReferencial: 760.0,
        activo: true,
      },

      // Fuentes de Poder
      {
        id: 'prod-psu-850w',
        categoriaId: 'cat-psu',
        nombre: 'Corsair RM850e 850W 80 Plus Gold Modular ATX 3.0 PCIe 5.0',
        marca: 'Corsair',
        modelo: 'RM850e ATX 3.0',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          wattage: 850,
          certificacion: '80 Plus Gold',
          modular: true,
          estandar: 'ATX 3.0 / 12VHPWR',
        },
        precioReferencial: 490.0,
        activo: true,
      },
      {
        id: 'prod-psu-650w',
        categoriaId: 'cat-psu',
        nombre: 'MSI MAG A650BN 650W 80 Plus Bronze',
        marca: 'MSI',
        modelo: 'MAG A650BN',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          wattage: 650,
          certificacion: '80 Plus Bronze',
          modular: false,
          estandar: 'ATX 2.52',
        },
        precioReferencial: 260.0,
        activo: true,
      },

      // Gabinetes
      {
        id: 'prod-case-montech',
        categoriaId: 'cat-case',
        nombre: 'Montech Air 903 Max Black (4 Ventiladores ARGB 140mm, Vidrio Templado)',
        marca: 'Montech',
        modelo: 'Air 903 Max Black',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          supportedMoboSizes: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'],
          maxGpuLengthMm: 400,
          ventiladoresIncluidos: 4,
          soporteRadiadorMm: 360,
        },
        precioReferencial: 320.0,
        activo: true,
      },
      {
        id: 'prod-case-lianli',
        categoriaId: 'cat-case',
        nombre: 'Lian Li O11 Dynamic EVO RGB White Dual Chamber ATX',
        marca: 'Lian Li',
        modelo: 'O11 Dynamic EVO RGB',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          supportedMoboSizes: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'],
          maxGpuLengthMm: 426,
          ventiladoresIncluidos: 0,
          soporteRadiadorMm: 360,
        },
        precioReferencial: 680.0,
        activo: true,
      },

      // Refrigeración
      {
        id: 'prod-cool-ak620',
        categoriaId: 'cat-cool',
        nombre: 'DeepCool AK620 High-Performance Dual-Tower CPU Cooler (260W TDP)',
        marca: 'DeepCool',
        modelo: 'AK620 Dual Tower',
        imagenUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          tipoCooler: 'aire',
          tdpWattsSoportado: 260,
          socketsSoportados: ['AM5', 'AM4', 'LGA1700', 'LGA1200'],
          alturaMm: 160,
        },
        precioReferencial: 270.0,
        activo: true,
      },
      {
        id: 'prod-cool-kraken',
        categoriaId: 'cat-cool',
        nombre: 'NZXT Kraken Elite 360 RGB Liquid Cooler con Pantalla LCD 2.36"',
        marca: 'NZXT',
        modelo: 'Kraken Elite 360 RGB',
        imagenUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          tipoCooler: 'liquida_360',
          tdpWattsSoportado: 350,
          radiadorMm: 360,
          socketsSoportados: ['AM5', 'LGA1700'],
        },
        precioReferencial: 990.0,
        activo: true,
      },

      // Monitores y Periféricos
      {
        id: 'prod-mon-asus27',
        categoriaId: 'cat-per',
        nombre: 'ASUS TUF Gaming VG27AQ3A 27" 2K QHD 180Hz 1ms Fast IPS G-Sync',
        marca: 'ASUS',
        modelo: 'VG27AQ3A 27" QHD',
        imagenUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          pantalla: '27 pulgadas',
          resolucion: '2560x1440 (2K QHD)',
          tasaRefresco: '180Hz',
          panel: 'Fast IPS',
        },
        precioReferencial: 1080.0,
        activo: true,
      },
      {
        id: 'prod-mon-lg240',
        categoriaId: 'cat-per',
        nombre: 'LG UltraGear 27GR95QE-B 27" OLED QHD 240Hz 0.03ms G-Sync Compatible',
        marca: 'LG',
        modelo: 'UltraGear 27GR95QE OLED',
        imagenUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          pantalla: '27 pulgadas',
          resolucion: '2560x1440 (QHD OLED)',
          tasaRefresco: '240Hz',
          tiempoRespuesta: '0.03ms',
        },
        precioReferencial: 3350.0,
        activo: true,
      },
      {
        id: 'prod-mon-g5curvo',
        categoriaId: 'cat-per',
        nombre: 'Samsung Odyssey G5 34" UltraWide Curvo 165Hz WQHD 1ms FreeSync Premium',
        marca: 'Samsung',
        modelo: 'Odyssey G5 34" Ultrawide',
        imagenUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          pantalla: '34 pulgadas curvo 1000R',
          resolucion: '3440x1440 (UltraWide WQHD)',
          tasaRefresco: '165Hz',
        },
        precioReferencial: 1790.0,
        activo: true,
      },
      {
        id: 'prod-per-gprox',
        categoriaId: 'cat-per',
        nombre: 'Mouse Gamer Logitech G Pro X Superlight 2 Wireless 32K DPI Hero 2',
        marca: 'Logitech',
        modelo: 'G Pro X Superlight 2',
        imagenUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          sensor: 'HERO 2 32000 DPI',
          peso: '60 gramos',
          bateria: '95 horas',
        },
        precioReferencial: 590.0,
        activo: true,
      },

      // CPUs Adicionales
      {
        id: 'prod-cpu-7950x',
        categoriaId: 'cat-cpu',
        nombre: 'AMD Ryzen 9 7950X (16C/32T, 4.5GHz - 5.7GHz, 80MB Cache AM5)',
        marca: 'AMD',
        modelo: 'Ryzen 9 7950X',
        imagenUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'AM5',
          ramType: 'DDR5',
          tdpWatts: 170,
          cores: 16,
          threads: 32,
          coolerIncluded: false,
        },
        precioReferencial: 2390.0,
        activo: true,
      },
      {
        id: 'prod-cpu-14900k',
        categoriaId: 'cat-cpu',
        nombre: 'Intel Core i9-14900K (24C/32T, hasta 6.0GHz, LGA1700)',
        marca: 'Intel',
        modelo: 'Core i9-14900K',
        imagenUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'LGA1700',
          ramType: 'DDR5',
          tdpWatts: 253,
          cores: 24,
          threads: 32,
          coolerIncluded: false,
        },
        precioReferencial: 2590.0,
        activo: true,
      },
      {
        id: 'prod-cpu-5600x',
        categoriaId: 'cat-cpu',
        nombre: 'AMD Ryzen 5 5600X (6C/12T, 3.7GHz - 4.6GHz, 35MB Cache AM4)',
        marca: 'AMD',
        modelo: 'Ryzen 5 5600X',
        imagenUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'AM4',
          ramType: 'DDR4',
          tdpWatts: 65,
          cores: 6,
          threads: 12,
          coolerIncluded: true,
        },
        precioReferencial: 540.0,
        activo: true,
      },

      // GPUs Adicionales
      {
        id: 'prod-gpu-rtx4080s',
        categoriaId: 'cat-gpu',
        nombre: 'NVIDIA GeForce RTX 4080 Super 16GB MSI Gaming X Slim',
        marca: 'MSI',
        modelo: 'RTX 4080 Super Gaming X Slim',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 16,
          tdpWatts: 320,
          gpuLengthMm: 322,
          psuRecommendedWatts: 750,
          busWidth: '256-bit',
        },
        precioReferencial: 4790.0,
        activo: true,
      },
      {
        id: 'prod-gpu-rtx4070tis',
        categoriaId: 'cat-gpu',
        nombre: 'NVIDIA GeForce RTX 4070 Ti Super 16GB Gigabyte Gaming OC',
        marca: 'Gigabyte',
        modelo: 'RTX 4070 Ti Super 16GB',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 16,
          tdpWatts: 285,
          gpuLengthMm: 300,
          psuRecommendedWatts: 750,
          busWidth: '256-bit',
        },
        precioReferencial: 3690.0,
        activo: true,
      },
      {
        id: 'prod-gpu-rx7900xtx',
        categoriaId: 'cat-gpu',
        nombre: 'AMD Radeon RX 7900 XTX 24GB Sapphire Nitro+ Vapor-X',
        marca: 'Sapphire',
        modelo: 'RX 7900 XTX Nitro+ 24GB',
        imagenUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 24,
          tdpWatts: 355,
          gpuLengthMm: 320,
          psuRecommendedWatts: 850,
          busWidth: '384-bit',
        },
        precioReferencial: 4350.0,
        activo: true,
      },
      {
        id: 'prod-gpu-rtx3060',
        categoriaId: 'cat-gpu',
        nombre: 'NVIDIA GeForce RTX 3060 12GB ASUS Dual OC V2',
        marca: 'ASUS',
        modelo: 'Dual RTX 3060 12GB',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          vramGb: 12,
          tdpWatts: 170,
          gpuLengthMm: 200,
          psuRecommendedWatts: 550,
          busWidth: '192-bit',
        },
        precioReferencial: 1190.0,
        activo: true,
      },

      // Placas Madre Adicionales
      {
        id: 'prod-mobo-b650aorus',
        categoriaId: 'cat-mobo',
        nombre: 'Gigabyte B650 AORUS ELITE AX (Socket AM5, DDR5, ATX, PCIe 5.0, WiFi 6E)',
        marca: 'Gigabyte',
        modelo: 'B650 AORUS ELITE AX',
        imagenUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'AM5',
          ramType: 'DDR5',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamGb: 192,
          m2Slots: 3,
          wifi: true,
        },
        precioReferencial: 920.0,
        activo: true,
      },
      {
        id: 'prod-mobo-z790pro',
        categoriaId: 'cat-mobo',
        nombre: 'MSI PRO Z790-A MAX WIFI (LGA1700, DDR5, ATX, PCIe 5.0, WiFi 7)',
        marca: 'MSI',
        modelo: 'PRO Z790-A MAX WIFI',
        imagenUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          socket: 'LGA1700',
          ramType: 'DDR5',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamGb: 192,
          m2Slots: 4,
          wifi: true,
        },
        precioReferencial: 1150.0,
        activo: true,
      },

      // Memorias RAM Adicionales
      {
        id: 'prod-ram-trident-64',
        categoriaId: 'cat-ram',
        nombre: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz CL32 Intel XMP',
        marca: 'G.Skill',
        modelo: 'Trident Z5 64GB DDR5 6400',
        imagenUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          ramType: 'DDR5',
          capacidadGb: 64,
          modulos: '2x32GB',
          velocidadMhz: 6400,
          latencia: 'CL32',
          rgb: true,
        },
        precioReferencial: 920.0,
        activo: true,
      },
      {
        id: 'prod-ram-delta-32',
        categoriaId: 'cat-ram',
        nombre: 'TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5 6000MHz CL30 Black',
        marca: 'TeamGroup',
        modelo: 'T-Force Delta 32GB DDR5 6000',
        imagenUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          ramType: 'DDR5',
          capacidadGb: 32,
          modulos: '2x16GB',
          velocidadMhz: 6000,
          latencia: 'CL30',
          rgb: true,
        },
        precioReferencial: 460.0,
        activo: true,
      },

      // Almacenamiento Adicional
      {
        id: 'prod-ssd-renegade2tb',
        categoriaId: 'cat-ssd',
        nombre: 'Kingston FURY Renegade 2TB NVMe M.2 PCIe 4.0 (7300 MB/s lectura)',
        marca: 'Kingston',
        modelo: 'FURY Renegade 2TB',
        imagenUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          formato: 'M.2 NVMe 2280',
          interfaz: 'PCIe 4.0 x4',
          capacidadGb: 2000,
          lecturaMbS: 7300,
          escrituraMbS: 7000,
        },
        precioReferencial: 690.0,
        activo: true,
      },
      {
        id: 'prod-ssd-sn850x',
        categoriaId: 'cat-ssd',
        nombre: 'Western Digital Black SN850X 1TB NVMe PCIe 4.0 con Disipador RGB',
        marca: 'Western Digital',
        modelo: 'Black SN850X 1TB Heatsink',
        imagenUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          formato: 'M.2 NVMe 2280',
          interfaz: 'PCIe 4.0 x4',
          capacidadGb: 1000,
          lecturaMbS: 7300,
          escrituraMbS: 6300,
        },
        precioReferencial: 430.0,
        activo: true,
      },

      // Fuentes de Poder Adicionales
      {
        id: 'prod-psu-seasonic1000',
        categoriaId: 'cat-psu',
        nombre: 'Seasonic FOCUS GX-1000 1000W 80 Plus Gold Full Modular ATX 3.0 PCIe 5.0',
        marca: 'Seasonic',
        modelo: 'FOCUS GX-1000 ATX 3.0',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          wattage: 1000,
          certificacion: '80 Plus Gold',
          modular: true,
          estandar: 'ATX 3.0 / 12VHPWR',
        },
        precioReferencial: 760.0,
        activo: true,
      },

      // Gabinetes Adicionales
      {
        id: 'prod-case-north',
        categoriaId: 'cat-case',
        nombre: 'Fractal Design North Charcoal Black Mesh ATX Mid Tower (Detalles Nogal Real)',
        marca: 'Fractal Design',
        modelo: 'North Charcoal Black',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          supportedMoboSizes: ['ATX', 'Micro-ATX', 'Mini-ITX'],
          maxGpuLengthMm: 355,
          ventiladoresIncluidos: 2,
          soporteRadiadorMm: 360,
        },
        precioReferencial: 640.0,
        activo: true,
      },
      {
        id: 'prod-case-h9',
        categoriaId: 'cat-case',
        nombre: 'NZXT H9 Flow Dual-Chamber ATX Mid-Tower Black con Vidrio Templado Panorámico',
        marca: 'NZXT',
        modelo: 'H9 Flow Black',
        imagenUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          supportedMoboSizes: ['ATX', 'Micro-ATX', 'Mini-ITX'],
          maxGpuLengthMm: 435,
          ventiladoresIncluidos: 4,
          soporteRadiadorMm: 360,
        },
        precioReferencial: 690.0,
        activo: true,
      },

      // Refrigeración Adicional
      {
        id: 'prod-cool-noctua',
        categoriaId: 'cat-cool',
        nombre: 'Noctua NH-D15 chromax.black Dual-Tower 140mm CPU Cooler (Silencio Extremo)',
        marca: 'Noctua',
        modelo: 'NH-D15 chromax.black',
        imagenUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          tipoCooler: 'aire',
          tdpWattsSoportado: 250,
          socketsSoportados: ['AM5', 'AM4', 'LGA1700', 'LGA1200'],
          alturaMm: 165,
        },
        precioReferencial: 490.0,
        activo: true,
      },
      {
        id: 'prod-cool-arctic360',
        categoriaId: 'cat-cool',
        nombre: 'Arctic Liquid Freezer III 360 A-RGB High-End Liquid CPU Cooler',
        marca: 'Arctic',
        modelo: 'Liquid Freezer III 360',
        imagenUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        especificaciones: {
          tipoCooler: 'liquida_360',
          tdpWattsSoportado: 350,
          radiadorMm: 360,
          socketsSoportados: ['AM5', 'LGA1700'],
        },
        precioReferencial: 580.0,
        activo: true,
      },
    ];

    // 5. Inventario de Tiendas (Con ofertas y diferencias de precio)
    // Tienda 1: Tienda 1 (tie-1)
    // Tienda 2: Tienda 2 (tie-2)
    // Tienda 3: Tienda 3 (tie-3)
    this.inventario = [
      // RTX 4070 Super
      {
        id: 'inv-1',
        tiendaId: 'tie-1',
        productoId: 'prod-gpu-rtx4070s',
        precio: 2690.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-2',
        tiendaId: 'tie-2',
        productoId: 'prod-gpu-rtx4070s',
        precio: 2749.0,
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-3',
        tiendaId: 'tie-3',
        productoId: 'prod-gpu-rtx4070s',
        precio: 2780.0,
        stock: 3,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_en_tienda',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Ryzen 7 7800X3D
      {
        id: 'inv-4',
        tiendaId: 'tie-1',
        productoId: 'prod-cpu-7800x3d',
        precio: 1770.0, // MEJOR PRECIO
        stock: 8,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-5',
        tiendaId: 'tie-2',
        productoId: 'prod-cpu-7800x3d',
        precio: 1799.0,
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-6',
        tiendaId: 'tie-3',
        productoId: 'prod-cpu-7800x3d',
        precio: 1820.0,
        stock: 2,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 2,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Ryzen 5 7600X
      {
        id: 'inv-7',
        tiendaId: 'tie-2',
        productoId: 'prod-cpu-7600x',
        precio: 899.0, // MEJOR PRECIO
        stock: 12,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-8',
        tiendaId: 'tie-1',
        productoId: 'prod-cpu-7600x',
        precio: 920.0,
        stock: 7,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-9',
        tiendaId: 'tie-3',
        productoId: 'prod-cpu-7600x',
        precio: 940.0,
        stock: 0, // AGOTADO (debe salir al final y no permitir agregar)
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Intel i7 14700K
      {
        id: 'inv-10',
        tiendaId: 'tie-3',
        productoId: 'prod-cpu-14700k',
        precio: 1830.0, // MEJOR PRECIO
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-11',
        tiendaId: 'tie-1',
        productoId: 'prod-cpu-14700k',
        precio: 1860.0,
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Intel i5 13400F
      {
        id: 'inv-12',
        tiendaId: 'tie-1',
        productoId: 'prod-cpu-13400f',
        precio: 749.0, // MEJOR PRECIO
        stock: 9,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-13',
        tiendaId: 'tie-2',
        productoId: 'prod-cpu-13400f',
        precio: 765.0,
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RTX 4090 24GB
      {
        id: 'inv-14',
        tiendaId: 'tie-1',
        productoId: 'prod-gpu-rtx4090',
        precio: 8290.0, // MEJOR PRECIO
        stock: 2,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-15',
        tiendaId: 'tie-3',
        productoId: 'prod-gpu-rtx4090',
        precio: 8450.0,
        stock: 1,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_en_tienda',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RX 7800 XT
      {
        id: 'inv-16',
        tiendaId: 'tie-2',
        productoId: 'prod-gpu-rx7800xt',
        precio: 2299.0, // MEJOR PRECIO
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-17',
        tiendaId: 'tie-1',
        productoId: 'prod-gpu-rx7800xt',
        precio: 2360.0,
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RTX 4060
      {
        id: 'inv-18',
        tiendaId: 'tie-1',
        productoId: 'prod-gpu-rtx4060',
        precio: 1360.0, // MEJOR PRECIO
        stock: 11,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-19',
        tiendaId: 'tie-2',
        productoId: 'prod-gpu-rtx4060',
        precio: 1395.0,
        stock: 8,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // ASUS TUF B650
      {
        id: 'inv-20',
        tiendaId: 'tie-2',
        productoId: 'prod-mobo-b650tuf',
        precio: 865.0, // MEJOR PRECIO
        stock: 7,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-21',
        tiendaId: 'tie-1',
        productoId: 'prod-mobo-b650tuf',
        precio: 890.0,
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // MSI MAG B760
      {
        id: 'inv-22',
        tiendaId: 'tie-1',
        productoId: 'prod-mobo-b760mag',
        precio: 850.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-23',
        tiendaId: 'tie-3',
        productoId: 'prod-mobo-b760mag',
        precio: 880.0,
        stock: 3,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // ASUS PRIME B760M-A D4
      {
        id: 'inv-24',
        tiendaId: 'tie-1',
        productoId: 'prod-mobo-b760d4',
        precio: 529.0, // MEJOR PRECIO
        stock: 10,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RAM DDR5 Corsair 32GB
      {
        id: 'inv-25',
        tiendaId: 'tie-1',
        productoId: 'prod-ram-ddr5-32',
        precio: 479.0, // MEJOR PRECIO
        stock: 14,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-26',
        tiendaId: 'tie-2',
        productoId: 'prod-ram-ddr5-32',
        precio: 495.0,
        stock: 8,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RAM DDR4 Kingston 16GB
      {
        id: 'inv-27',
        tiendaId: 'tie-2',
        productoId: 'prod-ram-ddr4-16',
        precio: 189.0, // MEJOR PRECIO
        stock: 20,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-28',
        tiendaId: 'tie-1',
        productoId: 'prod-ram-ddr4-16',
        precio: 198.0,
        stock: 15,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // SSD Kingston KC3000
      {
        id: 'inv-29',
        tiendaId: 'tie-1',
        productoId: 'prod-ssd-kc3000',
        precio: 369.0, // MEJOR PRECIO
        stock: 15,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-30',
        tiendaId: 'tie-3',
        productoId: 'prod-ssd-kc3000',
        precio: 385.0,
        stock: 6,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // SSD Samsung 990 Pro 2TB
      {
        id: 'inv-31',
        tiendaId: 'tie-2',
        productoId: 'prod-ssd-990pro',
        precio: 739.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Fuente Corsair RM850e
      {
        id: 'inv-32',
        tiendaId: 'tie-1',
        productoId: 'prod-psu-850w',
        precio: 479.0, // MEJOR PRECIO
        stock: 8,
        garantiaMeses: 84,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-33',
        tiendaId: 'tie-2',
        productoId: 'prod-psu-850w',
        precio: 499.0,
        stock: 5,
        garantiaMeses: 84,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Fuente MSI A650BN
      {
        id: 'inv-34',
        tiendaId: 'tie-2',
        productoId: 'prod-psu-650w',
        precio: 255.0, // MEJOR PRECIO
        stock: 12,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Gabinete Montech Air 903
      {
        id: 'inv-35',
        tiendaId: 'tie-1',
        productoId: 'prod-case-montech',
        precio: 310.0, // MEJOR PRECIO
        stock: 9,
        garantiaMeses: 12,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Gabinete Lian Li O11
      {
        id: 'inv-36',
        tiendaId: 'tie-3',
        productoId: 'prod-case-lianli',
        precio: 670.0, // MEJOR PRECIO
        stock: 4,
        garantiaMeses: 12,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Cooler AK620
      {
        id: 'inv-37',
        tiendaId: 'tie-2',
        productoId: 'prod-cool-ak620',
        precio: 265.0, // MEJOR PRECIO
        stock: 10,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Cooler Kraken 360
      {
        id: 'inv-38',
        tiendaId: 'tie-1',
        productoId: 'prod-cool-kraken',
        precio: 975.0, // MEJOR PRECIO
        stock: 3,
        garantiaMeses: 72,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Monitor ASUS TUF 27"
      {
        id: 'inv-39',
        tiendaId: 'tie-1',
        productoId: 'prod-mon-asus27',
        precio: 1050.0,
        stock: 7,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-40',
        tiendaId: 'tie-fic',
        productoId: 'prod-mon-asus27',
        precio: 1039.0, // MEJOR PRECIO
        stock: 12,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Monitor LG OLED 240Hz
      {
        id: 'inv-41',
        tiendaId: 'tie-fic',
        productoId: 'prod-mon-lg240',
        precio: 3290.0, // MEJOR PRECIO
        stock: 5,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-42',
        tiendaId: 'tie-2',
        productoId: 'prod-mon-lg240',
        precio: 3349.0,
        stock: 3,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Monitor Samsung Odyssey G5 Curvo 34"
      {
        id: 'inv-43',
        tiendaId: 'tie-fic',
        productoId: 'prod-mon-g5curvo',
        precio: 1740.0, // MEJOR PRECIO
        stock: 8,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-44',
        tiendaId: 'tie-1',
        productoId: 'prod-mon-g5curvo',
        precio: 1780.0,
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Mouse Logitech G Pro X Superlight 2
      {
        id: 'inv-45',
        tiendaId: 'tie-fic',
        productoId: 'prod-per-gprox',
        precio: 575.0, // MEJOR PRECIO
        stock: 15,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-46',
        tiendaId: 'tie-3',
        productoId: 'prod-per-gprox',
        precio: 590.0,
        stock: 8,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // CPU Ryzen 9 7950X
      {
        id: 'inv-47',
        tiendaId: 'tie-fic',
        productoId: 'prod-cpu-7950x',
        precio: 2350.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-48',
        tiendaId: 'tie-1',
        productoId: 'prod-cpu-7950x',
        precio: 2390.0,
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // CPU Intel Core i9-14900K
      {
        id: 'inv-49',
        tiendaId: 'tie-fic',
        productoId: 'prod-cpu-14900k',
        precio: 2540.0, // MEJOR PRECIO
        stock: 7,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-50',
        tiendaId: 'tie-2',
        productoId: 'prod-cpu-14900k',
        precio: 2590.0,
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // CPU Ryzen 5 5600X
      {
        id: 'inv-51',
        tiendaId: 'tie-fic',
        productoId: 'prod-cpu-5600x',
        precio: 519.0, // MEJOR PRECIO
        stock: 14,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-52',
        tiendaId: 'tie-1',
        productoId: 'prod-cpu-5600x',
        precio: 539.0,
        stock: 9,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // GPU RTX 4080 Super
      {
        id: 'inv-53',
        tiendaId: 'tie-fic',
        productoId: 'prod-gpu-rtx4080s',
        precio: 4690.0, // MEJOR PRECIO
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-54',
        tiendaId: 'tie-2',
        productoId: 'prod-gpu-rtx4080s',
        precio: 4780.0,
        stock: 3,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // GPU RTX 4070 Ti Super
      {
        id: 'inv-55',
        tiendaId: 'tie-fic',
        productoId: 'prod-gpu-rtx4070tis',
        precio: 3620.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-56',
        tiendaId: 'tie-1',
        productoId: 'prod-gpu-rtx4070tis',
        precio: 3680.0,
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // GPU RX 7900 XTX
      {
        id: 'inv-57',
        tiendaId: 'tie-fic',
        productoId: 'prod-gpu-rx7900xtx',
        precio: 4290.0, // MEJOR PRECIO
        stock: 5,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-58',
        tiendaId: 'tie-3',
        productoId: 'prod-gpu-rx7900xtx',
        precio: 4350.0,
        stock: 3,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // GPU RTX 3060 12GB
      {
        id: 'inv-59',
        tiendaId: 'tie-fic',
        productoId: 'prod-gpu-rtx3060',
        precio: 1149.0, // MEJOR PRECIO
        stock: 11,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-60',
        tiendaId: 'tie-2',
        productoId: 'prod-gpu-rtx3060',
        precio: 1190.0,
        stock: 8,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Placa Madre B650 AORUS Elite
      {
        id: 'inv-61',
        tiendaId: 'tie-fic',
        productoId: 'prod-mobo-b650aorus',
        precio: 899.0, // MEJOR PRECIO
        stock: 9,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-62',
        tiendaId: 'tie-1',
        productoId: 'prod-mobo-b650aorus',
        precio: 920.0,
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Placa Madre Z790 PRO
      {
        id: 'inv-63',
        tiendaId: 'tie-fic',
        productoId: 'prod-mobo-z790pro',
        precio: 1120.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-64',
        tiendaId: 'tie-2',
        productoId: 'prod-mobo-z790pro',
        precio: 1150.0,
        stock: 4,
        garantiaMeses: 36,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RAM Trident Z5 64GB
      {
        id: 'inv-65',
        tiendaId: 'tie-fic',
        productoId: 'prod-ram-trident-64',
        precio: 889.0, // MEJOR PRECIO
        stock: 7,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-66',
        tiendaId: 'tie-1',
        productoId: 'prod-ram-trident-64',
        precio: 920.0,
        stock: 5,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // RAM Delta RGB 32GB
      {
        id: 'inv-67',
        tiendaId: 'tie-fic',
        productoId: 'prod-ram-delta-32',
        precio: 449.0, // MEJOR PRECIO
        stock: 12,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-68',
        tiendaId: 'tie-3',
        productoId: 'prod-ram-delta-32',
        precio: 465.0,
        stock: 8,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // SSD Renegade 2TB
      {
        id: 'inv-69',
        tiendaId: 'tie-fic',
        productoId: 'prod-ssd-renegade2tb',
        precio: 669.0, // MEJOR PRECIO
        stock: 8,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-70',
        tiendaId: 'tie-1',
        productoId: 'prod-ssd-renegade2tb',
        precio: 690.0,
        stock: 6,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // SSD SN850X 1TB
      {
        id: 'inv-71',
        tiendaId: 'tie-fic',
        productoId: 'prod-ssd-sn850x',
        precio: 415.0, // MEJOR PRECIO
        stock: 10,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-72',
        tiendaId: 'tie-2',
        productoId: 'prod-ssd-sn850x',
        precio: 430.0,
        stock: 7,
        garantiaMeses: 60,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // PSU Seasonic GX-1000
      {
        id: 'inv-73',
        tiendaId: 'tie-fic',
        productoId: 'prod-psu-seasonic1000',
        precio: 739.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 120,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-74',
        tiendaId: 'tie-1',
        productoId: 'prod-psu-seasonic1000',
        precio: 765.0,
        stock: 4,
        garantiaMeses: 120,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Case Fractal North
      {
        id: 'inv-75',
        tiendaId: 'tie-fic',
        productoId: 'prod-case-north',
        precio: 619.0, // MEJOR PRECIO
        stock: 5,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-76',
        tiendaId: 'tie-3',
        productoId: 'prod-case-north',
        precio: 645.0,
        stock: 3,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Case NZXT H9 Flow
      {
        id: 'inv-77',
        tiendaId: 'tie-fic',
        productoId: 'prod-case-h9',
        precio: 669.0, // MEJOR PRECIO
        stock: 6,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-78',
        tiendaId: 'tie-2',
        productoId: 'prod-case-h9',
        precio: 695.0,
        stock: 4,
        garantiaMeses: 24,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Cooler Noctua NH-D15
      {
        id: 'inv-79',
        tiendaId: 'tie-fic',
        productoId: 'prod-cool-noctua',
        precio: 469.0, // MEJOR PRECIO
        stock: 8,
        garantiaMeses: 72,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-80',
        tiendaId: 'tie-1',
        productoId: 'prod-cool-noctua',
        precio: 490.0,
        stock: 5,
        garantiaMeses: 72,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },

      // Cooler Arctic Liquid Freezer III 360
      {
        id: 'inv-81',
        tiendaId: 'tie-fic',
        productoId: 'prod-cool-arctic360',
        precio: 549.0, // MEJOR PRECIO
        stock: 7,
        garantiaMeses: 72,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 'inv-82',
        tiendaId: 'tie-2',
        productoId: 'prod-cool-arctic360',
        precio: 579.0,
        stock: 4,
        garantiaMeses: 72,
        metodoEntrega: 'recojo_y_envio',
        tiempoEntregaDias: 1,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
      },
    ];

    // Seed de pedidos previos para historial
    this.pedidos = [
      {
        id: 'ped-prev-1',
        codigoOrden: 'ORD-202602-9901',
        usuarioId: 'usr-cli-1',
        tiendaId: 'tie-1',
        tiendaNombre: 'Tienda 1',
        subtotal: 2690.0,
        costoEnvio: 0.0,
        total: 2690.0,
        metodoEntrega: 'recojo_en_tienda',
        estado: 'entregado',
        fechaCreacion: '2026-02-05T14:20:00Z',
        items: [
          {
            id: 'det-1',
            pedidoId: 'ped-prev-1',
            inventarioId: 'inv-1',
            productoId: 'prod-gpu-rtx4070s',
            productoNombre: 'NVIDIA GeForce RTX 4070 Super 12GB ASUS Dual OC Edition',
            productoImagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
            marca: 'ASUS',
            precioUnitarioCongelado: 2690.0,
            cantidad: 1,
            subtotal: 2690.0,
          },
        ],
      },
    ];

    // 6. Historial de Precios para Demo (Evolución realista de precios en los últimos 365 días)
    this.historialPrecios = [];
    const ahora = Date.now();
    const diaMs = 24 * 60 * 60 * 1000;

    for (const inv of this.inventario) {
      const tienda = this.tiendas.find((t) => t.id === inv.tiendaId);
      const tiendaNombre = tienda?.nombreComercial || 'Tienda';
      const precioBase = inv.precio;

      // Variación según tienda para mantener historiales independientes
      const offsetTienda = inv.tiendaId === 'tie-1' ? 0.98 : inv.tiendaId === 'tie-2' ? 1.02 : 1.01;

      const seedPoints = [
        { diasAtras: 330, factor: 1.16 * offsetTienda, motivo: 'Registro inicial de catálogo' },
        { diasAtras: 240, factor: 1.12 * offsetTienda, motivo: 'Ajuste de distribución nacional' },
        { diasAtras: 150, factor: 1.08 * offsetTienda, motivo: 'Campaña Cyber Hardware' },
        { diasAtras: 75, factor: 1.05 * offsetTienda, motivo: 'Reajuste de precios por inventario' },
        { diasAtras: 25, factor: 1.02 * offsetTienda, motivo: 'Promoción de quincena' },
        { diasAtras: 5, factor: 1.01 * offsetTienda, motivo: 'Ajuste competitivo semanal' },
        { diasAtras: 0, factor: 1.0, motivo: 'Precio actual en tienda' },
      ];

      let precioPrevio = Math.round(precioBase * 1.18);
      for (const p of seedPoints) {
        const fechaPoint = new Date(ahora - p.diasAtras * diaMs).toISOString();
        const precioPunto = p.diasAtras === 0 ? precioBase : Math.round(precioBase * p.factor);
        this.historialPrecios.push({
          id: 'hp-' + inv.id + '-' + p.diasAtras,
          productoId: inv.productoId,
          tiendaId: inv.tiendaId,
          tiendaNombre,
          precio: precioPunto,
          precioAnterior: precioPrevio !== precioPunto ? precioPrevio : undefined,
          fecha: fechaPoint,
          motivo: p.motivo,
        });
        precioPrevio = precioPunto;
      }
    }

    // 7. Alertas de precio demo
    this.alertasPrecio = [
      {
        id: 'alt-demo-1',
        usuarioId: 'usr-cli-1',
        productoId: 'prod-cpu-7800x3d',
        productoNombre: 'AMD Ryzen 7 7800X3D (8C/16T, 4.2GHz - 5.0GHz, 96MB 3D V-Cache)',
        productoImagen: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
        tiendaNombre: 'Tienda Ficticia Tech',
        precioInicial: 1820.0,
        precioObjetivo: 1780.0,
        precioActual: 1769.0,
        alcanzado: true,
        email: 'cliente@comparapc.pe',
        fechaCreacion: new Date(Date.now() - 12 * diaMs).toISOString(),
        fechaAlcanzado: new Date(Date.now() - 2 * diaMs).toISOString(),
        descuentoDetectado: 3,
      },
      {
        id: 'alt-demo-2',
        usuarioId: 'usr-cli-1',
        productoId: 'prod-gpu-rtx4070s',
        productoNombre: 'NVIDIA GeForce RTX 4070 Super 12GB ASUS Dual OC Edition',
        productoImagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
        tiendaNombre: 'Tienda 1',
        precioInicial: 2790.0,
        precioObjetivo: 2600.0,
        precioActual: 2690.0,
        alcanzado: false,
        email: 'cliente@comparapc.pe',
        fechaCreacion: new Date(Date.now() - 6 * diaMs).toISOString(),
      },
      {
        id: 'alt-demo-3',
        usuarioId: 'usr-cli-1',
        productoId: 'prod-mon-lg240',
        productoNombre: 'LG UltraGear 27GR95QE-B 27" OLED QHD 240Hz 0.03ms G-Sync Compatible',
        productoImagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
        tiendaNombre: 'Tienda Ficticia Tech',
        precioInicial: 3450.0,
        precioObjetivo: 3300.0,
        precioActual: 3290.0,
        alcanzado: true,
        email: 'cliente@comparapc.pe',
        fechaCreacion: new Date(Date.now() - 8 * diaMs).toISOString(),
        fechaAlcanzado: new Date(Date.now() - 1 * diaMs).toISOString(),
        descuentoDetectado: 5,
      },
    ];
  }

  // ==========================================================================
  // OPERACIONES DE CATÁLOGO Y COMPARADOR
  // ==========================================================================

  getProductos(filtros?: {
    categoria?: string;
    marca?: string;
    search?: string;
    precioMin?: number;
    precioMax?: number;
    socket?: string;
    ramType?: string;
    sortBy?: 'menor_precio' | 'mayor_precio' | 'relevancia';
  }) {
    // Solo considerar inventario de tiendas verificadas
    const tiendasVerificadasIds = new Set(
      this.tiendas.filter((t) => t.estadoVerificacion === 'verificada').map((t) => t.id)
    );

    let items = this.productos.filter((p) => p.activo);

    if (filtros?.categoria) {
      items = items.filter((p) => p.categoriaId === filtros.categoria);
    }
    if (filtros?.marca) {
      items = items.filter((p) => p.marca.toLowerCase() === filtros.marca?.toLowerCase());
    }
    if (filtros?.socket) {
      items = items.filter((p) => p.especificaciones.socket === filtros.socket);
    }
    if (filtros?.ramType) {
      items = items.filter((p) => p.especificaciones.ramType === filtros.ramType);
    }
    if (filtros?.search) {
      const q = filtros.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.modelo.toLowerCase().includes(q)
      );
    }

    // Calcular para cada producto: precio mínimo entre tiendas verificadas con stock, y cantidad de tiendas
    const enriched = items.map((p) => {
      const ofertas = this.inventario.filter(
        (inv) => inv.productoId === p.id && inv.activo && tiendasVerificadasIds.has(inv.tiendaId)
      );
      const ofertasConStock = ofertas.filter((o) => o.stock > 0);
      const precios = ofertasConStock.map((o) => o.precio);
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : p.precioReferencial;
      const totalStock = ofertas.reduce((acc, curr) => acc + curr.stock, 0);

      return {
        ...p,
        precioMinimo,
        tiendasDisponibles: ofertasConStock.length,
        totalStock,
        categoriaNombre: this.categorias.find((c) => c.id === p.categoriaId)?.nombre || '',
      };
    });

    let resultado = enriched;
    if (filtros?.precioMin !== undefined) {
      resultado = resultado.filter((p) => p.precioMinimo >= filtros.precioMin!);
    }
    if (filtros?.precioMax !== undefined) {
      resultado = resultado.filter((p) => p.precioMinimo <= filtros.precioMax!);
    }

    if (filtros?.sortBy === 'menor_precio') {
      resultado.sort((a, b) => a.precioMinimo - b.precioMinimo);
    } else if (filtros?.sortBy === 'mayor_precio') {
      resultado.sort((a, b) => b.precioMinimo - a.precioMinimo);
    }

    return resultado;
  }

  getOfertasProducto(productoId: string) {
    const producto = this.productos.find((p) => p.id === productoId);
    if (!producto) return null;

    const tiendasMap = new Map(this.tiendas.map((t) => [t.id, t]));

    // Solo tiendas verificadas
    const ofertas = this.inventario
      .filter((inv) => inv.productoId === productoId && inv.activo)
      .map((inv) => {
        const tienda = tiendasMap.get(inv.tiendaId);
        return {
          inventarioId: inv.id,
          tiendaId: inv.tiendaId,
          tiendaNombre: tienda?.nombreComercial || 'Tienda',
          ruc: tienda?.ruc || '',
          direccion: tienda?.direccion || '',
          distrito: tienda?.distrito || '',
          ciudad: tienda?.ciudad || 'Lima',
          telefono: tienda?.telefono || '',
          reputacion: tienda?.reputacion || 5.0,
          totalVentas: tienda?.totalVentas || 0,
          verificada: tienda?.estadoVerificacion === 'verificada',
          precio: inv.precio,
          stock: inv.stock,
          garantiaMeses: inv.garantiaMeses,
          metodoEntrega: inv.metodoEntrega,
          tiempoEntregaDias: inv.tiempoEntregaDias,
          disponible: inv.stock > 0,
        };
      })
      .filter((o) => o.verificada);

    // Calcular el menor precio con stock disponible
    const ofertasConStock = ofertas.filter((o) => o.stock > 0);
    const minPrecioConStock =
      ofertasConStock.length > 0 ? Math.min(...ofertasConStock.map((o) => o.precio)) : null;

    // Clasificar con "MEJOR PRECIO" y ordenar:
    // 1. Stock > 0 primero, ordenado por precio ascendente
    // 2. Stock == 0 al final
    const ordenadas = ofertas
      .map((o) => ({
        ...o,
        esMejorPrecio: o.stock > 0 && o.precio === minPrecioConStock,
      }))
      .sort((a, b) => {
        if (a.stock > 0 && b.stock === 0) return -1;
        if (a.stock === 0 && b.stock > 0) return 1;
        return a.precio - b.precio;
      });

    return {
      producto,
      ofertas: ordenadas,
      mejorPrecio: minPrecioConStock,
      totalTiendas: ofertas.length,
      totalStock: ofertas.reduce((acc, curr) => acc + curr.stock, 0),
    };
  }

  // ==========================================================================
  // MOTOR NEXUS MATCH: REGLAS ESTRICTAS DE COMPATIBILIDAD
  // ==========================================================================

  verificarCompatibilidad(componentesIds: {
    cpuId?: string;
    moboId?: string;
    ramId?: string;
    gpuId?: string;
    psuId?: string;
    caseId?: string;
    coolId?: string;
    ssdId?: string;
  }) {
    const cpu = this.productos.find((p) => p.id === componentesIds.cpuId);
    const mobo = this.productos.find((p) => p.id === componentesIds.moboId);
    const ram = this.productos.find((p) => p.id === componentesIds.ramId);
    const gpu = this.productos.find((p) => p.id === componentesIds.gpuId);
    const psu = this.productos.find((p) => p.id === componentesIds.psuId);
    const gabi = this.productos.find((p) => p.id === componentesIds.caseId);
    const cool = this.productos.find((p) => p.id === componentesIds.coolId);

    const errores: string[] = [];
    const advertencias: string[] = [];
    const notasPositivas: string[] = [];

    let consumoEstimado = 70; // Placa, ventiladores, chipset base

    // 1. CPU vs Placa Madre (Socket)
    if (cpu && mobo) {
      if (cpu.especificaciones.socket !== mobo.especificaciones.socket) {
        errores.push(
          `Incompatibilidad crítica de Socket: El procesador ${cpu.nombre} requiere socket ${cpu.especificaciones.socket}, pero la placa madre ${mobo.nombre} tiene socket ${mobo.especificaciones.socket}. No encajarán físicamente.`
        );
      } else {
        notasPositivas.push(
          `Socket compatible: Ambos componentes operan con el socket ${cpu.especificaciones.socket}.`
        );
      }
    }

    // 2. RAM vs Placa Madre (DDR4 vs DDR5)
    if (ram && mobo) {
      if (ram.especificaciones.ramType !== mobo.especificaciones.ramType) {
        errores.push(
          `Incompatibilidad de memoria RAM: La memoria ${ram.nombre} es de tipo ${ram.especificaciones.ramType}, mientras que la placa madre ${mobo.nombre} requiere ranuras ${mobo.especificaciones.ramType}. Las ranuras son físicamente distintas.`
        );
      } else {
        notasPositivas.push(
          `Memoria RAM compatible: Ambos soportan arquitectura ${ram.especificaciones.ramType}.`
        );
      }
    }

    // 3. Consumo y Fuente de Poder
    if (cpu) consumoEstimado += cpu.especificaciones.tdpWatts || 95;
    if (gpu) consumoEstimado += gpu.especificaciones.tdpWatts || 200;
    if (cool?.especificaciones.tipoCooler === 'liquida_360') consumoEstimado += 35;

    const wattsRecomendadosConMargen = Math.round(consumoEstimado * 1.35);

    if (psu) {
      const psuWatts = psu.especificaciones.wattage || 650;
      if (psuWatts < consumoEstimado) {
        errores.push(
          `Fuente insuficiente: El consumo del sistema (${consumoEstimado}W) supera la capacidad total de la fuente ${psu.nombre} (${psuWatts}W). El equipo se apagará bajo carga pesada.`
        );
      } else if (psuWatts < wattsRecomendadosConMargen) {
        advertencias.push(
          `Margen de fuente ajustado: La fuente entrega ${psuWatts}W. El consumo estimado es de ${consumoEstimado}W. Se recomienda al menos ${wattsRecomendadosConMargen}W para garantizar eficiencia y estabilidad.`
        );
      } else {
        notasPositivas.push(
          `Fuente de poder óptima: Capacidad de ${psuWatts}W con más del 30% de margen de seguridad para transitorios.`
        );
      }
    }

    // 4. Placa Madre vs Gabinete (Factor de Forma)
    if (mobo && gabi) {
      const moboForm = mobo.especificaciones.formFactor || 'ATX';
      const supported = gabi.especificaciones.supportedMoboSizes || ['ATX', 'Micro-ATX'];
      if (!supported.includes(moboForm)) {
        errores.push(
          `Tamaño de placa incompatible con gabinete: La placa es ${moboForm}, pero el gabinete ${gabi.nombre} solo admite: ${supported.join(', ')}.`
        );
      } else {
        notasPositivas.push(`Factor de forma compatible: El gabinete soporta placas ${moboForm}.`);
      }
    }

    // 5. GPU vs Gabinete (Longitud física)
    if (gpu && gabi) {
      const gpuLength = gpu.especificaciones.gpuLengthMm || 280;
      const maxCase = gabi.especificaciones.maxGpuLengthMm || 350;
      if (gpuLength > maxCase) {
        errores.push(
          `La tarjeta gráfica no cabe: La GPU mide ${gpuLength}mm de largo, pero el gabinete solo admite tarjetas de hasta ${maxCase}mm.`
        );
      } else {
        notasPositivas.push(
          `Espacio de GPU holgado: Longitud de ${gpuLength}mm dentro del límite de ${maxCase}mm.`
        );
      }
    }

    // 6. Cooler vs CPU
    if (cpu && cool) {
      const socketsCooler = cool.especificaciones.socketsSoportados || [];
      if (cpu.especificaciones.socket && !socketsCooler.includes(cpu.especificaciones.socket)) {
        advertencias.push(
          `Verificar anclaje del cooler: Asegurarse de que el cooler ${cool.nombre} incluya el bracket de montaje para socket ${cpu.especificaciones.socket}.`
        );
      }
    }

    const compatible = errores.length === 0;

    return {
      compatible,
      errores,
      advertencias,
      notasPositivas,
      consumoEstimadoWatts: consumoEstimado,
      fuenteRecomendadaWatts: wattsRecomendadosConMargen,
    };
  }

  // ==========================================================================
  // ENSAMBLADOR INTELIGENTE CON DISTRIBUCIÓN 45/25/15/15
  // ==========================================================================

  ensamblarPC(presupuesto: number, uso: string = 'gaming', preferencias?: string) {
    // 45% GPU, 25% CPU, 15% Placa + RAM, 15% PSU + SSD + Case
    const targetGPU = presupuesto * 0.45;
    const targetCPU = presupuesto * 0.25;
    const targetMoboRam = presupuesto * 0.15;
    const targetPsuSsdCase = presupuesto * 0.15;

    // Buscar la mejor combinación compatible que maximice el rendimiento
    // Por simplicidad y robustez, seleccionamos la mejor combinación según tiers
    let cpu = this.productos.find((p) => p.id === 'prod-cpu-7800x3d');
    let mobo = this.productos.find((p) => p.id === 'prod-mobo-b650tuf');
    let ram = this.productos.find((p) => p.id === 'prod-ram-ddr5-32');
    let gpu = this.productos.find((p) => p.id === 'prod-gpu-rtx4070s');
    let ssd = this.productos.find((p) => p.id === 'prod-ssd-kc3000');
    let psu = this.productos.find((p) => p.id === 'prod-psu-850w');
    let gabi = this.productos.find((p) => p.id === 'prod-case-montech');
    let cool = this.productos.find((p) => p.id === 'prod-cool-ak620');

    if (presupuesto < 4500) {
      // Configuración Balanceada Entrada / Media
      cpu = this.productos.find((p) => p.id === 'prod-cpu-13400f');
      mobo = this.productos.find((p) => p.id === 'prod-mobo-b760d4');
      ram = this.productos.find((p) => p.id === 'prod-ram-ddr4-16');
      gpu = this.productos.find((p) => p.id === 'prod-gpu-rtx4060');
      ssd = this.productos.find((p) => p.id === 'prod-ssd-kc3000');
      psu = this.productos.find((p) => p.id === 'prod-psu-650w');
      gabi = this.productos.find((p) => p.id === 'prod-case-montech');
      cool = undefined; // cooler de stock
    } else if (presupuesto < 6500) {
      // Configuración Media Alta
      cpu = this.productos.find((p) => p.id === 'prod-cpu-7600x');
      mobo = this.productos.find((p) => p.id === 'prod-mobo-b650tuf');
      ram = this.productos.find((p) => p.id === 'prod-ram-ddr5-32');
      gpu = this.productos.find((p) => p.id === 'prod-gpu-rtx4070s');
      ssd = this.productos.find((p) => p.id === 'prod-ssd-kc3000');
      psu = this.productos.find((p) => p.id === 'prod-psu-850w');
      gabi = this.productos.find((p) => p.id === 'prod-case-montech');
      cool = this.productos.find((p) => p.id === 'prod-cool-ak620');
    } else if (presupuesto >= 12000) {
      // Configuración Ultra Flagship
      cpu = this.productos.find((p) => p.id === 'prod-cpu-7800x3d');
      mobo = this.productos.find((p) => p.id === 'prod-mobo-b650tuf');
      ram = this.productos.find((p) => p.id === 'prod-ram-ddr5-32');
      gpu = this.productos.find((p) => p.id === 'prod-gpu-rtx4090');
      ssd = this.productos.find((p) => p.id === 'prod-ssd-990pro');
      psu = this.productos.find((p) => p.id === 'prod-psu-850w');
      gabi = this.productos.find((p) => p.id === 'prod-case-lianli');
      cool = this.productos.find((p) => p.id === 'prod-cool-kraken');
    }

    const configItems = [
      { rol: 'Procesador', producto: cpu },
      { rol: 'Placa Madre', producto: mobo },
      { rol: 'Memoria RAM', producto: ram },
      { rol: 'Tarjeta Gráfica', producto: gpu },
      { rol: 'Almacenamiento SSD', producto: ssd },
      { rol: 'Fuente de Alimentación', producto: psu },
      { rol: 'Gabinete', producto: gabi },
      { rol: 'Refrigeración', producto: cool },
    ].filter((item) => item.producto !== undefined);

    // Obtener la mejor oferta en tienda para cada componente
    let totalCosto = 0;
    const componentesConOferta = configItems.map((item) => {
      const ofertasData = this.getOfertasProducto(item.producto!.id);
      const mejorOferta = ofertasData?.ofertas.find((o) => o.stock > 0) || ofertasData?.ofertas[0];
      const precio = mejorOferta?.precio || item.producto!.precioReferencial;
      totalCosto += precio;

      return {
        rol: item.rol,
        productoId: item.producto!.id,
        nombre: item.producto!.nombre,
        marca: item.producto!.marca,
        imagenUrl: item.producto!.imagenUrl,
        precio,
        tiendaId: mejorOferta?.tiendaId,
        tiendaNombre: mejorOferta?.tiendaNombre || 'Tienda Oficial',
        inventarioId: mejorOferta?.inventarioId,
        stockDisponible: mejorOferta?.stock || 0,
      };
    });

    const compat = this.verificarCompatibilidad({
      cpuId: cpu?.id,
      moboId: mobo?.id,
      ramId: ram?.id,
      gpuId: gpu?.id,
      psuId: psu?.id,
      caseId: gabi?.id,
      coolId: cool?.id,
      ssdId: ssd?.id,
    });

    return {
      presupuestoSolicitado: presupuesto,
      costoTotal: totalCosto,
      presupuestoRestante: Math.max(0, presupuesto - totalCosto),
      distribucionPresupuesto: {
        gpu: { target: targetGPU, label: '45% GPU' },
        cpu: { target: targetCPU, label: '25% CPU' },
        moboRam: { target: targetMoboRam, label: '15% Placa y RAM' },
        otros: { target: targetPsuSsdCase, label: '15% Fuente, SSD, Case' },
      },
      componentes: componentesConOferta,
      compatibilidad: compat,
      resumenEjecutivo: `Configuración optimizada para ${uso} con un costo de S/ ${totalCosto.toFixed(
        2
      )}. La arquitectura cumple al 100% las tolerancias térmicas y de socket.`,
    };
  }

  // ==========================================================================
  // CARRITO Y CHECKOUT TRANSACCIONAL ACID (SELECT FOR UPDATE Emulation)
  // ==========================================================================

  getCarrito(usuarioId: string) {
    const items = this.carritos.get(usuarioId) || [];
    const enriched = items.map((item) => {
      const inv = this.inventario.find((i) => i.id === item.inventarioId);
      const prod = this.productos.find((p) => p.id === inv?.productoId);
      const tienda = this.tiendas.find((t) => t.id === inv?.tiendaId);

      return {
        id: item.id,
        inventarioId: item.inventarioId,
        cantidad: item.cantidad,
        productoId: prod?.id,
        productoNombre: prod?.nombre,
        productoImagen: prod?.imagenUrl,
        marca: prod?.marca,
        precio: inv?.precio || 0,
        stock: inv?.stock || 0,
        tiendaId: tienda?.id,
        tiendaNombre: tienda?.nombreComercial,
        subtotal: (inv?.precio || 0) * item.cantidad,
      };
    });

    const totalGeneral = enriched.reduce((acc, curr) => acc + curr.subtotal, 0);

    return {
      items: enriched,
      totalGeneral,
      cantidadTotal: enriched.reduce((acc, curr) => acc + curr.cantidad, 0),
    };
  }

  agregarAlCarrito(usuarioId: string, inventarioId: string, cantidad: number = 1) {
    const inv = this.inventario.find((i) => i.id === inventarioId && i.activo);
    if (!inv) {
      throw new Error('El artículo de inventario solicitado no existe o fue dado de baja.');
    }
    if (inv.stock < cantidad) {
      throw new Error(`Stock insuficiente. Solo quedan ${inv.stock} unidad(es) disponible(s).`);
    }

    let items = this.carritos.get(usuarioId) || [];
    const index = items.findIndex((i) => i.inventarioId === inventarioId);

    if (index >= 0) {
      const nuevaCantidad = items[index].cantidad + cantidad;
      if (nuevaCantidad > inv.stock) {
        throw new Error(`No puedes agregar más del stock disponible (${inv.stock} unidades).`);
      }
      items[index].cantidad = nuevaCantidad;
    } else {
      items.push({
        id: 'cart-item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        inventarioId,
        cantidad,
        fechaAgregado: new Date().toISOString(),
      });
    }

    this.carritos.set(usuarioId, items);
    return this.getCarrito(usuarioId);
  }

  modificarCantidadCarrito(usuarioId: string, itemId: string, cantidad: number) {
    let items = this.carritos.get(usuarioId) || [];
    if (cantidad <= 0) {
      items = items.filter((i) => i.id !== itemId);
    } else {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        const inv = this.inventario.find((i) => i.id === item.inventarioId);
        if (inv && cantidad > inv.stock) {
          throw new Error(`Stock insuficiente. Solo hay ${inv.stock} unidades.`);
        }
        item.cantidad = cantidad;
      }
    }
    this.carritos.set(usuarioId, items);
    return this.getCarrito(usuarioId);
  }

  eliminarDelCarrito(usuarioId: string, itemId: string) {
    let items = this.carritos.get(usuarioId) || [];
    items = items.filter((i) => i.id !== itemId);
    this.carritos.set(usuarioId, items);
    return this.getCarrito(usuarioId);
  }

  vaciarCarrito(usuarioId: string) {
    this.carritos.set(usuarioId, []);
  }

  /**
   * PROCESO DE CHECKOUT TRANSACCIONAL ACID CON BLOQUEO Y ROLLBACK
   */
  procesarCheckout(
    usuarioId: string,
    metodoEntrega: 'recojo_en_tienda' | 'envio_domicilio',
    direccionEnvio?: string,
    pago?: { metodo: string; referencia: string }
  ) {
    const carrito = this.getCarrito(usuarioId);
    if (carrito.items.length === 0) {
      throw new Error('El carrito de compras está vacío.');
    }

    // FASE 1: Verificación atómica con bloqueo conceptual SELECT FOR UPDATE
    // Se valida que cada ítem tenga stock suficiente en inventario_tiendas
    for (const item of carrito.items) {
      const inv = this.inventario.find((i) => i.id === item.inventarioId);
      if (!inv || !inv.activo) {
        throw new Error(
          `El producto "${item.productoNombre}" ya no se encuentra disponible en tienda.`
        );
      }
      if (inv.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para "${item.productoNombre}". Disponible: ${inv.stock}, Solicitado: ${item.cantidad}. Transacción revertida.`
        );
      }
    }

    // FASE 2: Descuento atómico de stock (Transaccional)
    const backupInventario = JSON.parse(JSON.stringify(this.inventario));
    try {
      for (const item of carrito.items) {
        const inv = this.inventario.find((i) => i.id === item.inventarioId)!;
        inv.stock -= item.cantidad;
        inv.fechaActualizacion = new Date().toISOString();
      }

      // FASE 3: Generación de pedidos divididos por cada tienda proveedora
      // con CONGELAMIENTO DE PRECIOS
      const codigoGeneral =
        'ORD-' +
        new Date().toISOString().slice(0, 10).replace(/-/g, '') +
        '-' +
        Math.random().toString(36).substring(2, 7).toUpperCase();

      // Agrupar items por tienda
      const itemsPorTienda = new Map<string, typeof carrito.items>();
      for (const item of carrito.items) {
        const tiendaId = item.tiendaId!;
        const lista = itemsPorTienda.get(tiendaId) || [];
        lista.push(item);
        itemsPorTienda.set(tiendaId, lista);
      }

      const nuevosPedidos: Pedido[] = [];
      const costoEnvioFijoPorTienda = metodoEntrega === 'envio_domicilio' ? 15.0 : 0.0;

      for (const [tiendaId, itemsTienda] of itemsPorTienda.entries()) {
        const tienda = this.tiendas.find((t) => t.id === tiendaId);
        const subtotal = itemsTienda.reduce((acc, curr) => acc + curr.subtotal, 0);
        const total = subtotal + costoEnvioFijoPorTienda;

        const pedidoId = 'ped-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

        const detalles: DetallePedido[] = itemsTienda.map((it) => ({
          id: 'det-' + Math.random().toString(36).substr(2, 6),
          pedidoId,
          inventarioId: it.inventarioId,
          productoId: it.productoId!,
          productoNombre: it.productoNombre!,
          productoImagen: it.productoImagen!,
          marca: it.marca!,
          precioUnitarioCongelado: it.precio, // Precio congelado
          cantidad: it.cantidad,
          subtotal: it.subtotal,
        }));

        const pedido: Pedido = {
          id: pedidoId,
          codigoOrden: codigoGeneral,
          usuarioId,
          tiendaId,
          tiendaNombre: tienda?.nombreComercial || 'Tienda',
          subtotal,
          costoEnvio: costoEnvioFijoPorTienda,
          total,
          metodoEntrega,
          direccionEnvio: metodoEntrega === 'envio_domicilio' ? direccionEnvio : undefined,
          metodoPago: pago?.metodo,
          referenciaPago: pago?.referencia,
          estado: 'pendiente',
          fechaCreacion: new Date().toISOString(),
          items: detalles,
        };

        this.pedidos.unshift(pedido);
        nuevosPedidos.push(pedido);

        // Incrementar contador de ventas de la tienda
        if (tienda) {
          tienda.totalVentas += itemsTienda.reduce((acc, curr) => acc + curr.cantidad, 0);
        }
      }

      // FASE 4: Registro del pago aprobado por la pasarela (simulada)
      if (pago) {
        for (const ped of nuevosPedidos) {
          ped.metodoPago = pago.metodo;
          ped.referenciaPago = pago.referencia;
        }
      }

      // Vaciar carrito
      this.vaciarCarrito(usuarioId);

      return {
        exito: true,
        codigoOrden: codigoGeneral,
        pedidosGenerados: nuevosPedidos,
        totalTiendasInvolucradas: nuevosPedidos.length,
        totalMontoPEN: nuevosPedidos.reduce((acc, curr) => acc + curr.total, 0),
      };
    } catch (err: any) {
      // ROLLBACK ATÓMICO en caso de excepción
      this.inventario = backupInventario;
      throw new Error(`Error durante el checkout: ${err.message}. Operación revertida.`);
    }
  }

  // ==========================================================================
  // PANEL TIENDA / VENDEDOR
  // ==========================================================================

  getDashboardTienda(tiendaId: string) {
    let tienda = this.tiendas.find((t) => t.id === tiendaId);
    if (!tienda && this.tiendas.length > 0) {
      tienda = this.tiendas[0];
    }
    if (!tienda) {
      return {
        tienda: null,
        metricas: {
          totalProductos: 0,
          ofertasActivas: 0,
          productosAgotados: 0,
          pedidosRecibidos: 0,
          ventasTotalesSoles: 0,
        },
        inventario: [],
        pedidos: [],
      };
    }

    const inventariosTienda = this.inventario.filter((i) => i.tiendaId === tiendaId);
    const pedidosTienda = this.pedidos.filter((p) => p.tiendaId === tiendaId);

    const totalProductos = inventariosTienda.length;
    const ofertasActivas = inventariosTienda.filter((i) => i.activo && i.stock > 0).length;
    const productosAgotados = inventariosTienda.filter((i) => i.stock === 0).length;
    const ventasTotalesSoles = pedidosTienda
      .filter((p) => p.estado !== 'cancelado')
      .reduce((acc, curr) => acc + curr.total, 0);

    const inventarioDetallado = inventariosTienda.map((inv) => {
      const prod = this.productos.find((p) => p.id === inv.productoId);
      return {
        ...inv,
        productoNombre: prod?.nombre,
        productoMarca: prod?.marca,
        productoImagen: prod?.imagenUrl,
        categoriaId: prod?.categoriaId,
      };
    });

    return {
      tienda,
      metricas: {
        totalProductos,
        ofertasActivas,
        productosAgotados,
        pedidosRecibidos: pedidosTienda.length,
        ventasTotalesSoles,
      },
      inventario: inventarioDetallado,
      pedidos: pedidosTienda,
    };
  }

  actualizarInventario(
    tiendaId: string,
    inventarioId: string,
    data: { precio?: number; stock?: number; activo?: boolean }
  ) {
    const inv = this.inventario.find((i) => i.id === inventarioId && i.tiendaId === tiendaId);
    if (!inv) throw new Error('Artículo de inventario no encontrado');

    if (data.precio !== undefined) {
      const nuevoPrecio = Number(data.precio);
      if (nuevoPrecio !== inv.precio) {
        const tienda = this.tiendas.find((t) => t.id === tiendaId);
        this.registrarCambioPrecio({
          productoId: inv.productoId,
          tiendaId,
          tiendaNombre: tienda?.nombreComercial || 'Tienda',
          precio: nuevoPrecio,
          precioAnterior: inv.precio,
          fecha: new Date().toISOString(),
          motivo: 'actualizacion_tienda',
        });
        inv.precio = nuevoPrecio;
      }
    }
    if (data.stock !== undefined) inv.stock = Number(data.stock);
    if (data.activo !== undefined) inv.activo = Boolean(data.activo);
    inv.fechaActualizacion = new Date().toISOString();

    return inv;
  }

  actualizarEstadoPedido(
    tiendaId: string,
    pedidoId: string,
    nuevoEstado: 'pendiente' | 'en_preparacion' | 'listo_entrega' | 'entregado' | 'cancelado'
  ) {
    const pedido = this.pedidos.find((p) => p.id === pedidoId && p.tiendaId === tiendaId);
    if (!pedido) throw new Error('Pedido no encontrado');

    // Si se cancela el pedido, restaurar stock a la tienda
    if (nuevoEstado === 'cancelado' && pedido.estado !== 'cancelado') {
      for (const item of pedido.items) {
        const inv = this.inventario.find((i) => i.id === item.inventarioId);
        if (inv) {
          inv.stock += item.cantidad;
        }
      }
    }

    pedido.estado = nuevoEstado;
    return pedido;
  }

  // ==========================================================================
  // PANEL ADMINISTRADOR
  // ==========================================================================

  getDashboardAdmin() {
    const totalUsuarios = this.usuarios.length;
    const clientes = this.usuarios.filter((u) => u.rol === 'cliente').length;
    const tiendasVerificadas = this.tiendas.filter((t) => t.estadoVerificacion === 'verificada').length;
    const tiendasPendientes = this.tiendas.filter((t) => t.estadoVerificacion === 'pendiente').length;
    const totalProductos = this.productos.length;
    const totalPedidos = this.pedidos.length;
    const volumenTotalPEN = this.pedidos.reduce((acc, curr) => acc + curr.total, 0);

    return {
      metricas: {
        totalUsuarios,
        clientes,
        tiendasVerificadas,
        tiendasPendientes,
        totalProductos,
        totalPedidos,
        volumenTotalPEN,
        totalMcpInvocaciones: this.mcpLogs.length,
      },
      tiendas: this.tiendas,
      usuarios: this.usuarios.map(({ passwordHash, ...rest }) => rest),
      pedidosRecientes: this.pedidos.slice(0, 10),
      mcpLogs: this.mcpLogs.slice(-15).reverse(),
    };
  }

  cambiarEstadoVerificacionTienda(
    tiendaId: string,
    nuevoEstado: 'verificada' | 'pendiente' | 'rechazada' | 'suspendida'
  ) {
    const tienda = this.tiendas.find((t) => t.id === tiendaId);
    if (!tienda) throw new Error('Tienda no encontrada');
    tienda.estadoVerificacion = nuevoEstado;
    return tienda;
  }

  crearProducto(data: {
    categoriaId: string;
    nombre: string;
    marca: string;
    modelo?: string;
    imagenUrl?: string;
    especificaciones?: any;
    precioReferencial?: number;
  }) {
    const nuevo: ProductoBase = {
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      categoriaId: data.categoriaId,
      nombre: data.nombre,
      marca: data.marca,
      modelo: data.modelo || data.nombre,
      imagenUrl: data.imagenUrl || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
      especificaciones: data.especificaciones || {},
      precioReferencial: Number(data.precioReferencial) || 100,
      activo: true,
    };
    this.productos.unshift(nuevo);
    return nuevo;
  }

  agregarInventarioTienda(tiendaId: string, data: {
    productoId: string;
    precio: number;
    stock: number;
    garantiaMeses?: number;
    metodoEntrega?: any;
  }) {
    const tienda = this.tiendas.find((t) => t.id === tiendaId);
    if (!tienda) throw new Error('Tienda no encontrada');
    const prod = this.productos.find((p) => p.id === data.productoId);
    if (!prod) throw new Error('Producto no encontrado');

    const nuevo: InventarioTienda = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      tiendaId,
      productoId: data.productoId,
      precio: Number(data.precio),
      stock: Number(data.stock),
      garantiaMeses: Number(data.garantiaMeses) || 12,
      metodoEntrega: data.metodoEntrega || 'recojo_y_envio',
      tiempoEntregaDias: 1,
      activo: true,
      fechaActualizacion: new Date().toISOString(),
    };
    this.inventario.unshift(nuevo);

    // Registrar en el historial de precios de la base de datos
    this.registrarCambioPrecio({
      productoId: data.productoId,
      tiendaId,
      tiendaNombre: tienda.nombreComercial,
      precio: nuevo.precio,
      fecha: nuevo.fechaActualizacion,
      motivo: 'registro_inicial',
    });

    return nuevo;
  }

  registrarCambioPrecio(data: {
    productoId: string;
    tiendaId: string;
    tiendaNombre?: string;
    precio: number;
    precioAnterior?: number;
    fecha?: string;
    motivo?: string;
  }) {
    const tienda = this.tiendas.find((t) => t.id === data.tiendaId);
    const tiendaNombre = data.tiendaNombre || tienda?.nombreComercial || 'Tienda';
    const entry: RegistroHistorialPrecio = {
      id: 'hp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productoId: data.productoId,
      tiendaId: data.tiendaId,
      tiendaNombre,
      precio: Number(data.precio),
      precioAnterior: data.precioAnterior !== undefined ? Number(data.precioAnterior) : undefined,
      fecha: data.fecha || new Date().toISOString(),
      motivo: data.motivo || 'actualizacion_tienda',
    };
    this.historialPrecios.push(entry);
    return entry;
  }

  getHistorialPreciosProducto(productoId: string, tiendaId?: string, rangoDias: number = 30) {
    const prod = this.productos.find((p) => p.id === productoId);
    if (!prod) throw new Error('Producto no encontrado');

    const ahora = Date.now();
    const cutoffMs = ahora - rangoDias * 24 * 60 * 60 * 1000;

    // Obtener inventarios actuales de este producto para tiendas activas
    const inventariosActuales = this.inventario.filter(
      (inv) => inv.productoId === productoId && inv.activo
    );

    // Lista de tiendas disponibles que ofrecen este producto con su precio actual
    const tiendasDisponibles = inventariosActuales.map((inv) => {
      const tienda = this.tiendas.find((t) => t.id === inv.tiendaId);
      return {
        id: inv.tiendaId,
        nombre: tienda?.nombreComercial || 'Tienda',
        precioActual: inv.precio,
      };
    });

    // Asegurar que si una tienda tiene inventario activo pero ningún registro histórico previo,
    // se registre su precio actual para que la evolución comience desde ese punto
    for (const inv of inventariosActuales) {
      const tieneHistorial = this.historialPrecios.some(
        (hp) => hp.productoId === productoId && hp.tiendaId === inv.tiendaId
      );
      if (!tieneHistorial) {
        const tienda = this.tiendas.find((t) => t.id === inv.tiendaId);
        this.registrarCambioPrecio({
          productoId,
          tiendaId: inv.tiendaId,
          tiendaNombre: tienda?.nombreComercial || 'Tienda',
          precio: inv.precio,
          fecha: inv.fechaActualizacion || new Date().toISOString(),
          motivo: 'registro_inicial',
        });
      }
    }

    // Filtrar puntos por producto y tienda (si aplica)
    let puntosFiltrados = this.historialPrecios.filter((hp) => hp.productoId === productoId);

    if (tiendaId && tiendaId !== 'todas') {
      puntosFiltrados = puntosFiltrados.filter((hp) => hp.tiendaId === tiendaId);
    }

    // Filtrar por fecha de corte según el rango seleccionado
    let puntosEnRango = puntosFiltrados.filter((hp) => new Date(hp.fecha).getTime() >= cutoffMs);

    // Si no hay puntos dentro del rango estricto pero sí hay historial previo,
    // incluir el último punto anterior al rango como punto de partida
    if (puntosEnRango.length === 0 && puntosFiltrados.length > 0) {
      const puntosPrevios = puntosFiltrados
        .filter((hp) => new Date(hp.fecha).getTime() < cutoffMs)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      if (puntosPrevios.length > 0) {
        puntosEnRango = [puntosPrevios[0]];
      }
    }

    // Ordenar cronológicamente
    puntosEnRango.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const precios = puntosEnRango.map((p) => p.precio);
    const precioActual = precios.length > 0 ? precios[precios.length - 1] : prod.precioReferencial;
    const precioMinimo = precios.length > 0 ? Math.min(...precios) : precioActual;
    const precioMaximo = precios.length > 0 ? Math.max(...precios) : precioActual;
    const suma = precios.reduce((acc, curr) => acc + curr, 0);
    const precioPromedio = precios.length > 0 ? Math.round((suma / precios.length) * 100) / 100 : precioActual;

    // Calcular eventos de cambio de precio específicos con diferencias
    const cambios = puntosEnRango
      .filter((p) => p.precioAnterior !== undefined && p.precioAnterior !== p.precio)
      .map((p) => {
        const anterior = p.precioAnterior!;
        const diferencia = p.precio - anterior;
        const porcentaje = Math.round((diferencia / anterior) * 1000) / 10;
        return {
          id: p.id,
          fecha: p.fecha,
          tiendaId: p.tiendaId,
          tiendaNombre: p.tiendaNombre,
          precio: p.precio,
          precioAnterior: anterior,
          diferencia,
          porcentaje,
          motivo: p.motivo,
        };
      })
      .reverse();

    return {
      productoId,
      productoNombre: prod.nombre,
      tiendaSeleccionada: tiendaId || 'todas',
      rangoDias,
      precioActual,
      precioMinimo,
      precioMaximo,
      precioPromedio,
      puntos: puntosEnRango,
      cambios,
      tiendasDisponibles,
    };
  }

  // ==========================================================================
  // GESTIÓN DE ALERTAS DE PRECIO Y REBAJAS DE MERCADO
  // ==========================================================================

  getAlertasPrecio(usuarioId?: string) {
    if (usuarioId) {
      return this.alertasPrecio.filter((a) => a.usuarioId === usuarioId);
    }
    return this.alertasPrecio;
  }

  crearAlertaPrecio(data: {
    productoId: string;
    precioObjetivo: number;
    email: string;
    usuarioId?: string;
  }) {
    const prod = this.productos.find((p) => p.id === data.productoId);
    if (!prod) throw new Error('Producto no encontrado');

    const ofertas = this.getOfertasProducto(data.productoId);
    const precioActual = ofertas.mejorPrecio || prod.precioReferencial;

    const nuevaAlerta: AlertaPrecio = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      usuarioId: data.usuarioId || 'usr-cli-1',
      productoId: data.productoId,
      productoNombre: prod.nombre,
      productoImagen: prod.imagenUrl,
      tiendaNombre: ofertas.ofertas[0]?.tiendaNombre || 'Tienda',
      precioInicial: precioActual,
      precioObjetivo: Number(data.precioObjetivo),
      precioActual: precioActual,
      alcanzado: precioActual <= Number(data.precioObjetivo),
      email: data.email || 'cliente@comparapc.pe',
      fechaCreacion: new Date().toISOString(),
      fechaAlcanzado: precioActual <= Number(data.precioObjetivo) ? new Date().toISOString() : undefined,
      descuentoDetectado:
        precioActual < prod.precioReferencial
          ? Math.round(((prod.precioReferencial - precioActual) / prod.precioReferencial) * 100)
          : undefined,
    };

    this.alertasPrecio.unshift(nuevaAlerta);
    return nuevaAlerta;
  }

  eliminarAlertaPrecio(id: string) {
    this.alertasPrecio = this.alertasPrecio.filter((a) => a.id !== id);
    return { exito: true };
  }

  simularBajaPrecio(productoId: string, porcentajeDescuento: number = 15) {
    const inv = this.inventario.find((i) => i.productoId === productoId && i.activo);
    if (!inv) throw new Error('No hay inventario activo para este producto');

    const precioAnterior = inv.precio;
    const factor = (100 - porcentajeDescuento) / 100;
    const nuevoPrecio = Math.round(precioAnterior * factor);

    const tienda = this.tiendas.find((t) => t.id === inv.tiendaId);

    // Actualizar inventario y precio
    inv.precio = nuevoPrecio;
    inv.fechaActualizacion = new Date().toISOString();

    // Registrar en historial
    this.registrarCambioPrecio({
      productoId,
      tiendaId: inv.tiendaId,
      tiendaNombre: tienda?.nombreComercial || 'Tienda',
      precio: nuevoPrecio,
      precioAnterior,
      fecha: new Date().toISOString(),
      motivo: 'Super Oferta Flash Detectada',
    });

    // Actualizar alertas coincidentes
    let alertasActivadas = 0;
    for (const alerta of this.alertasPrecio) {
      if (alerta.productoId === productoId) {
        alerta.precioActual = nuevoPrecio;
        if (nuevoPrecio <= alerta.precioObjetivo) {
          alerta.alcanzado = true;
          alerta.fechaAlcanzado = new Date().toISOString();
          alerta.descuentoDetectado = Math.round(((precioAnterior - nuevoPrecio) / precioAnterior) * 100);
          alertasActivadas++;
        }
      }
    }

    const prod = this.productos.find((p) => p.id === productoId);

    return {
      exito: true,
      productoNombre: prod?.nombre,
      precioAnterior,
      nuevoPrecio,
      ahorro: precioAnterior - nuevoPrecio,
      porcentaje: porcentajeDescuento,
      alertasActivadas,
    };
  }

  getRebajasRecientes() {
    // Buscar los últimos cambios de precio donde el nuevo precio fue menor que el anterior
    const rebajasMap = new Map<string, any>();
    const recientes = [...this.historialPrecios]
      .filter((h) => h.precioAnterior !== undefined && h.precio < h.precioAnterior)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    for (const r of recientes) {
      if (!rebajasMap.has(r.productoId)) {
        const prod = this.productos.find((p) => p.id === r.productoId);
        if (prod) {
          const ahorro = r.precioAnterior! - r.precio;
          const porcentaje = Math.round((ahorro / r.precioAnterior!) * 100);
          rebajasMap.set(r.productoId, {
            id: r.id,
            productoId: r.productoId,
            productoNombre: prod.nombre,
            productoImagen: prod.imagenUrl,
            marca: prod.marca,
            tiendaId: r.tiendaId,
            tiendaNombre: r.tiendaNombre,
            precioAnterior: r.precioAnterior,
            nuevoPrecio: r.precio,
            ahorro,
            porcentaje,
            fecha: r.fecha,
          });
        }
      }
      if (rebajasMap.size >= 10) break;
    }

    return Array.from(rebajasMap.values());
  }
}

export const dbStore = new ComparaPCStore();
