# ComparaPC - Marketplace y Comparador de Hardware con Integración MCP

> **Eslogan:** *"Compara, ensambla y encuentra tu mejor PC"*

ComparaPC es una plataforma web especializada en la comparación de componentes de hardware computacional entre distintas tiendas de tecnología en Lima, Perú (con locales en Av. Garcilaso de la Vega / Wilson, Cyberplaza y Miraflores).

Integra un servidor oficial compatible con **Model Context Protocol (MCP)**, motor de reglas de compatibilidad **Nexus Match**, ensamblador por presupuesto con la regla 45/25/15/15, y gestión transaccional **ACID con SELECT FOR UPDATE**.

---

## 🚀 Características Principales

1. **Catálogo & Comparador de Precios:**
   - Consulta ofertas de tiendas verificadas.
   - Cálculo automático del **MEJOR PRECIO**.
   - Filtros por Socket (AM5, LGA1700), tipo de RAM (DDR4, DDR5), marca y rango de precio en Soles (PEN).
   - Desplazamiento de productos sin stock al final de la lista.

2. **Ensamblador Inteligente con Nexus Match:**
   - 8 slots: CPU, Placa Madre, RAM, Tarjeta Gráfica, Almacenamiento, Fuente, Gabinete, Refrigeración.
   - Distribución referencial: **45% GPU, 25% CPU, 15% Placa/RAM, 15% Fuente/SSD/Gabinete**.
   - Validación estricta de socket, bus de memoria, cálculo de Watts y factor de forma.
   - Botón de análisis con IA y carga total al carrito en 1 clic.

3. **Servidor MCP Oficial (JSON-RPC 2.0 / Streamable HTTP):**
   - Implementa las 8 herramientas obligatorias:
     1. `buscar_productos`
     2. `comparar_ofertas`
     3. `verificar_compatibilidad`
     4. `ensamblar_pc`
     5. `consultar_stock`
     6. `agregar_al_carrito` *(Requiere autorización de seguridad)*
     7. `calcular_costo_ensamblaje`
     8. `generar_orden` *(Requiere confirmación explícita del cliente)*
   - Inspector interactivo integrado en la plataforma para probar llamadas JSON-RPC en vivo.

4. **Transaccionalidad ACID y Carrito Multi-Tienda:**
   - Permite agregar productos de diferentes tiendas en un solo carrito.
   - Checkout transaccional con emulación de `SELECT ... FOR UPDATE`.
   - Congelamiento de precios al momento de la orden.
   - División de pedidos individuales para cada tienda proveedora.

5. **Control de Acceso Basado en Roles (RBAC):**
   - **Cliente:** Búsqueda, comparación, armado, checkout y seguimiento de pedidos.
   - **Tienda / Vendedor:** Gestión de inventario en tiempo real, ajuste de precios, actualización de stock, baja lógica de ofertas y despacho de pedidos.
   - **Administrador:** Verificación y suspensión de tiendas, monitoreo de KPIs y telemetría de llamadas MCP.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **Backend:** Node.js / Express con arquitectura réplica de FastAPI
- **Inteligencia Artificial:** SDK `@google/genai` con modelo `gemini-3.8-flash`
- **Protocolo de Agentes:** Model Context Protocol (MCP) JSON-RPC 2.0 (Streamable HTTP)
- **Base de Datos:** Esquema relacional PostgreSQL de 11 tablas (`/db/comparapc_schema.sql`)
- **Servidor Standalone FastMCP:** Python FastMCP (`/mcp_server/server.py`)

---

## 💻 Ejecución del Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor full-stack (Puerto 3000)
npm run dev

# Compilar para producción
npm run build
```

---

## 🧪 Pruebas del Servidor MCP

Puedes interactuar con el servidor MCP de tres maneras:
1. Desde la interfaz web en la pestaña **"Inspector MCP (8 Tools)"**.
2. Mediante el botón flotante **ComparaPC AI** en la esquina inferior derecha.
3. Mediante llamadas cURL estándar JSON-RPC 2.0:

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "comparar_ofertas",
      "arguments": { "id_producto": "prod-gpu-rtx4070s" }
    }
  }'
```
