# Protocolo Model Context Protocol (MCP) en ComparaPC

## 1. Visión General
ComparaPC implementa el estándar **Model Context Protocol (MCP)** mediante transporte Streamable HTTP (JSON-RPC 2.0). Este protocolo permite a los modelos de lenguaje (LLMs) y agentes inteligentes interactuar de forma segura con el catálogo de hardware, comparador de tiendas, validador de compatibilidad Nexus Match y motor transaccional de órdenes.

Endpoints activos en ComparaPC:
- `POST /api/mcp` o `POST /mcp`: Transporte JSON-RPC 2.0 estándar (soporta `initialize`, `tools/list`, `tools/call`, `resources/list`).
- `GET /api/mcp/health`: Verificación de salud y estado del servidor MCP.
- `POST /api/agent/chat`: Orquestador cognitivo de ComparaPC AI que invoca las herramientas MCP y gestiona la interacción en lenguaje natural.

---

## 2. Herramientas MCP Implementadas (Tools Specification)

| Tool ID | Nombre | Descripción | Nivel de Seguridad |
|---|---|---|---|
| 1 | `buscar_productos` | Búsqueda por modelo, categoría, marca y rangos de precio en PEN | Lectura pública |
| 2 | `comparar_ofertas` | Compara ofertas de tiendas verificadas para un componente | Lectura pública |
| 3 | `verificar_compatibilidad` | Valida compatibilidad técnica (Socket, DDR, Watts, Dimensiones) | Lectura / Lógica |
| 4 | `ensamblar_pc` | Ensambla configuración según presupuesto (45/25/15/15) | Lectura / Algoritmo |
| 5 | `consultar_stock` | Consulta stock en tiempo real por producto y tienda | Lectura en tiempo real |
| 6 | `agregar_al_carrito` | Añade ítem de tienda al carrito del usuario | **Sensible (Requiere Confirmación)** |
| 7 | `calcular_costo_ensamblaje`| Suma subtotales por tienda y fletes de envío | Lectura / Cálculo |
| 8 | `generar_orden` | Ejecuta checkout transaccional ACID con bloqueo de stock | **Crítico (Confirmación Explícita)** |

---

## 3. Formato de Solicitud y Respuesta JSON-RPC 2.0

### Descubrimiento de Herramientas (`tools/list`)
**Solicitud:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

**Respuesta:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "buscar_productos",
        "description": "Busca componentes de hardware computacional...",
        "inputSchema": {
          "type": "object",
          "properties": {
            "nombre_producto": { "type": "string" },
            "categoria": { "type": "string" },
            "marca": { "type": "string" },
            "precio_min": { "type": "number" },
            "precio_max": { "type": "number" }
          }
        }
      }
    ]
  }
}
```

### Invocación de Herramienta (`tools/call`)
**Solicitud:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "comparar_ofertas",
    "arguments": {
      "id_producto": "prod-gpu-rtx4070s"
    }
  }
}
```

**Respuesta:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"id_producto\":\"prod-gpu-rtx4070s\",\"mejor_precio\":2690,\"ofertas\":[...]}"
      }
    ]
  }
}
```

---

## 4. Política de Seguridad para Operaciones Sensibles
Las herramientas `agregar_al_carrito` y `generar_orden` incorporan un guardián de autorización:
- Si el LLM o cliente intenta invocar la herramienta sin el flag `confirmacion_explicita_cliente: true` o `autorizado_por_usuario: true`, la herramienta devuelve `{ "status": "requires_confirmation" }`.
- El agente detiene la ejecución automática y solicita en la interfaz web la aprobación del usuario antes de alterar el carrito o descontar stock en la base de datos.
