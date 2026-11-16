# Documentación de la API REST de ComparaPC

## 1. Módulos de Endpoints

### Autenticación y Cuentas (RBAC)
- `POST /api/auth/registro`: Registro de nuevos clientes o tiendas (RUC de 11 dígitos obligatorio para tiendas).
- `POST /api/auth/login`: Autenticación con generación de token JWT.
- `GET /api/auth/usuarios-demo`: Listado de cuentas para alternar roles (Cliente, Tienda, Admin).

### Catálogo y Tiendas
- `GET /api/categorias`: Listado de categorías de hardware con iconos y slugs.
- `GET /api/productos`: Búsqueda y filtrado multicriterio (categoría, marca, precio min/max, socket, tipo de RAM, ordenamiento).
- `GET /api/productos/:id/ofertas`: Tabla comparativa de ofertas en tiendas verificadas con cálculo del "MEJOR PRECIO", stock y condiciones de entrega.
- `GET /api/tiendas`: Directorio de tiendas asociadas con RUC, ubicación y calificación.

### Ensamblador y Motor Nexus Match
- `POST /api/compatibilidad`: Validador técnico de componentes (Socket CPU vs Placa, RAM DDR4 vs DDR5, TDP y margen de fuente, factor de forma de gabinete).
- `POST /api/ensamblar`: Generación algorítmica de ensamble con presupuesto según la regla 45% GPU, 25% CPU, 15% Placa/RAM, 15% Fuente/Almacenamiento.

### Carrito y Órdenes ACID
- `GET /api/carrito?usuarioId=:id`: Obtener el carrito multi-tienda del usuario.
- `POST /api/carrito/items`: Agregar artículo de inventario al carrito con validación de stock.
- `PATCH /api/carrito/items/:id`: Modificar cantidades.
- `DELETE /api/carrito/items/:id`: Eliminar artículo.
- `POST /api/ordenes`: Checkout transaccional con bloqueo `SELECT FOR UPDATE`, congelamiento de precios al momento de la compra y división de pedidos por cada tienda proveedora.
- `GET /api/pedidos`: Historial de pedidos divididos por tienda.

### Panel de Tienda
- `GET /api/tienda/:id/dashboard`: Métricas de la tienda (ventas, pedidos, stock).
- `PATCH /api/tienda/:id/inventario/:invId`: Actualización en tiempo real de precios y stock, o baja lógica.
- `PATCH /api/tienda/:id/pedidos/:pedId/estado`: Transición de estados de pedidos ('pendiente', 'en_preparacion', 'listo_entrega', 'entregado', 'cancelado').

### Panel de Administrador
- `GET /api/admin/dashboard`: KPIs globales y registros de telemetría MCP.
- `PATCH /api/admin/tiendas/:id/verificar`: Aprobación o suspensión de tiendas.

### Servidor MCP (Model Context Protocol)
- `POST /api/mcp` o `POST /mcp`: Endpoint de transporte Streamable HTTP con JSON-RPC 2.0 (métodos `initialize`, `tools/list`, `tools/call`, `resources/list`).
- `GET /api/mcp/tools`: Descubrimiento rápido de herramientas y esquemas.
- `GET /api/mcp/health`: Estado del servidor y herramientas activas.

### Agente Cognitivo
- `POST /api/agent/chat`: Orquestador con Gemini 3.8 Flash y herramientas MCP para recomendaciones y cotizaciones.
