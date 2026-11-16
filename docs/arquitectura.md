# Arquitectura de ComparaPC

## 1. Diagrama de Bloques de la Plataforma

```
[ Usuario Navegador / Flutter Web / React SPA ]
      |
      +---> HTTP/REST API (FastAPI / Express Server en Puerto 3000)
      |         |
      |         +---> Controladores RBAC (Cliente / Tienda / Administrador)
      |         +---> Motor de Agregación de Ofertas ("MEJOR PRECIO")
      |         +---> Ensamblador Nexus Match (Compatibilidad CPU/Mobo/RAM/PSU/Case)
      |         +---> Gestor Transaccional ACID (SELECT FOR UPDATE)
      |         +---> Base de Datos PostgreSQL (11 Tablas Relacionales)
      |
      +---> Servidor MCP (Model Context Protocol JSON-RPC 2.0 / Streamable HTTP)
                |
                +---> Descubrimiento de 8 Herramientas MCP
                +---> Validador de Parámetros y Schemas JSON
                +---> Agente IA ComparaPC (Gemini 3.8 Flash)
                +---> Capa de Confirmación Humana para Acciones Sensibles
```

## 2. Base de Datos Relacional (11 Tablas)
1. `usuarios`: Autenticación, roles ('cliente', 'tienda', 'admin'), hashing de passwords.
2. `tiendas`: Perfil comercial, RUC 11 dígitos, reputación, estado de verificación.
3. `categorias`: Categorías de hardware (Procesadores, GPUs, RAM, Placas, Fuentes, etc.).
4. `productos_base`: Catálogo unificado con especificaciones técnicas en JSONB e índices GIN.
5. `inventario_tiendas`: Ofertas por tienda, precios en PEN, stock, garantía, entrega.
6. `direcciones_cliente`: Libreta de direcciones para envíos en Lima y provincias.
7. `carritos`: Carrito de compras unificado del usuario.
8. `items_carrito`: Ítems asociados a inventarios específicos de tiendas.
9. `pedidos`: Órdenes atomizadas por cada tienda proveedora tras el checkout.
10. `detalle_pedido`: Ítems congelando precio y nombre al momento de la compra.
11. `calificaciones_tienda`: Reseñas y puntuación de 1 a 5 estrellas.

## 3. Reglas de Negocio Clave
- **Distribución de Presupuesto para PC Gamer**: 45% GPU, 25% CPU, 15% Placa Madre y RAM, 15% Fuente certificada y Almacenamiento NVMe.
- **Nexus Match**:
  1. Socket CPU = Socket Placa Madre (ej: AM5 con AM5, LGA1700 con LGA1700).
  2. Tipo de RAM = Tipo soportado por Placa (DDR5 vs DDR4).
  3. Fuente Watts >= Consumo Total Estimado + 30% margen.
  4. Factor de forma Placa (ATX, Micro-ATX) <= Gabinete.
  5. Longitud GPU (mm) <= Espacio máximo de Gabinete.
- **Transaccionalidad**: El checkout bloquea el stock de cada tienda con `SELECT ... FOR UPDATE`, descuenta inventario atómicamente y genera pedidos individuales por tienda.
