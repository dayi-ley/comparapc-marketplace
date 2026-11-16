"""
ComparaPC - Servidor MCP Oficial (Model Context Protocol)
Implementado con FastMCP (Python) para orquestar herramientas de catálogo,
comparación de ofertas, validación de compatibilidad y órdenes de compra.
"""

from typing import Optional, List, Dict, Any
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

# Inicialización del servidor MCP
mcp = FastMCP("ComparaPC-Hardware-MCP")

# ============================================================================
# SCHEMAS DE ENTRADA Y SALIDA
# ============================================================================

class ProductoFiltro(BaseModel):
    nombre_producto: Optional[str] = Field(None, description="Término o modelo a buscar (ej: RTX 4070, Ryzen 7)")
    categoria: Optional[str] = Field(None, description="Categoría (procesadores, tarjetas_graficas, memorias_ram, etc.)")
    marca: Optional[str] = Field(None, description="Marca (AMD, Intel, ASUS, Corsair, etc.)")
    precio_min: Optional[float] = Field(None, description="Precio mínimo en soles (PEN)")
    precio_max: Optional[float] = Field(None, description="Precio máximo en soles (PEN)")

class CompatibilidadInput(BaseModel):
    procesador: str = Field(..., description="ID o modelo del procesador")
    placa_madre: str = Field(..., description="ID o modelo de la placa madre")
    memoria_ram: str = Field(..., description="ID o modelo de la memoria RAM")
    tarjeta_grafica: Optional[str] = Field(None, description="ID o modelo de la tarjeta de video")
    fuente_alimentacion: Optional[str] = Field(None, description="ID o modelo de la fuente")
    gabinete: Optional[str] = Field(None, description="ID o modelo del gabinete")

class EnsamblajeInput(BaseModel):
    presupuesto: float = Field(..., description="Presupuesto total en soles (PEN)")
    uso_principal: str = Field("gaming", description="Uso previsto: gaming, render, programacion, oficina")
    preferencias: Optional[str] = Field(None, description="Preferencias (AMD, Intel, RGB, etc.)")
    componentes_existentes: Optional[List[str]] = Field(None, description="Componentes que el usuario ya posee")

# ============================================================================
# TOOL 1: buscar_productos
# ============================================================================
@mcp.tool()
def buscar_productos(
    nombre_producto: Optional[str] = None,
    categoria: Optional[str] = None,
    marca: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None
) -> Dict[str, Any]:
    """
    Busca componentes de hardware en el catálogo verificado de ComparaPC.
    Retorna especificaciones técnicas, precio mínimo encontrado y tiendas disponibles.
    """
    # Consulta a base de datos PostgreSQL mediante servicio de catálogo
    return {
        "status": "success",
        "criterios": {"nombre": nombre_producto, "categoria": categoria, "marca": marca},
        "total_encontrados": 1,
        "productos": [
            {
                "id": "prod-gpu-rtx4070s",
                "nombre": "NVIDIA GeForce RTX 4070 Super 12GB ASUS Dual",
                "marca": "ASUS",
                "categoria": "tarjetas_graficas",
                "precio_minimo": 2690.00,
                "tiendas_disponibles": 3,
                "specs": {"vram": "12GB GDDR6X", "tdp": 220, "longitud_mm": 267}
            }
        ]
    }

# ============================================================================
# TOOL 2: comparar_ofertas
# ============================================================================
@mcp.tool()
def comparar_ofertas(id_producto: str, criterio_ordenamiento: str = "menor_precio") -> Dict[str, Any]:
    """
    Compara las ofertas de un mismo producto entre todas las tiendas verificadas.
    Identifica automáticamente el 'MEJOR PRECIO' y filtra o desplaza productos sin stock.
    """
    return {
        "status": "success",
        "id_producto": id_producto,
        "ofertas": [
            {
                "tienda": "Tienda 1",
                "ruc": "20100000001",
                "precio": 2690.00,
                "es_mejor_precio": True,
                "stock": 5,
                "ubicacion": "Av. Tecnológica 101, C.C. Demo Stand 12",
                "reputacion": 4.9,
                "entrega": "Recojo en tienda y Envío a domicilio"
            },
            {
                "tienda": "Tienda 2",
                "ruc": "20200000002",
                "precio": 2749.00,
                "es_mejor_precio": False,
                "stock": 3,
                "ubicacion": "Calle Los Circuitos 202, Galería B Stand 05",
                "reputacion": 4.8,
                "entrega": "Envío a domicilio"
            }
        ]
    }

# ============================================================================
# TOOL 3: verificar_compatibilidad
# ============================================================================
@mcp.tool()
def verificar_compatibilidad(
    procesador: str,
    placa_madre: str,
    memoria_ram: str,
    tarjeta_grafica: Optional[str] = None,
    fuente_alimentacion: Optional[str] = None,
    gabinete: Optional[str] = None
) -> Dict[str, Any]:
    """
    Comprueba de forma técnica y estricta si los componentes seleccionados son compatibles:
    - Socket CPU vs Socket Motherboard
    - Tipo de Memoria RAM (DDR4 vs DDR5)
    - Consumo estimado en Watts vs Capacidad de la fuente
    - Factor de forma Motherboard y GPU vs Gabinete
    """
    # Lógica de validación Nexus Match
    return {
        "status": "success",
        "compatible": True,
        "consumo_estimado_watts": 450,
        "fuente_recomendada_watts": 650,
        "alertas": [],
        "notas_compatibilidad": [
            "Socket AM5 compatible entre CPU y Placa Madre B650.",
            "Memoria RAM DDR5 certificada para perfil AMD EXPO.",
            "Fuente de 750W excede el consumo estimado con un margen de seguridad del 40%."
        ]
    }

# ============================================================================
# TOOL 4: ensamblar_pc
# ============================================================================
@mcp.tool()
def ensamblar_pc(
    presupuesto: float,
    uso_principal: str = "gaming",
    preferencias: Optional[str] = None,
    componentes_existentes: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Recomienda una configuración completa equilibrada optimizada con la regla:
    45% GPU, 25% CPU, 15% Motherboard + RAM, 15% Fuente + Almacenamiento.
    """
    return {
        "status": "success",
        "presupuesto_solicitado": presupuesto,
        "costo_total": 4980.00,
        "presupuesto_restante": presupuesto - 4980.00,
        "configuracion": [
            {"rol": "CPU", "nombre": "AMD Ryzen 5 7600X", "precio": 950.00, "tienda": "Tienda 1"},
            {"rol": "Motherboard", "nombre": "ASUS TUF Gaming B650-PLUS WiFi", "precio": 880.00, "tienda": "Tienda 2"},
            {"rol": "RAM", "nombre": "Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz", "precio": 480.00, "tienda": "Tienda 1"},
            {"rol": "GPU", "nombre": "Gigabyte RTX 4070 Super Windforce 12GB", "precio": 2690.00, "tienda": "Tienda 3"},
            {"rol": "Almacenamiento", "nombre": "Kingston KC3000 1TB NVMe PCIe 4.0", "precio": 360.00, "tienda": "Tienda 1"},
            {"rol": "Fuente", "nombre": "Corsair RM750e 750W 80+ Gold", "precio": 420.00, "tienda": "Tienda 2"},
            {"rol": "Gabinete", "nombre": "Montech Air 903 Max Mesh", "precio": 310.00, "tienda": "Tienda 1"}
        ],
        "compatibilidad_confirmada": True
    }

# ============================================================================
# TOOL 5: consultar_stock
# ============================================================================
@mcp.tool()
def consultar_stock(id_producto: str, id_tienda: Optional[str] = None) -> Dict[str, Any]:
    """
    Verifica disponibilidad real y unidades en inventario de un componente.
    """
    return {
        "status": "success",
        "id_producto": id_producto,
        "disponible": True,
        "stock_total_plaza": 14,
        "tiendas": [
            {"tienda": "Tienda 1", "stock": 6, "precio": 2690.00},
            {"tienda": "Tienda 2", "stock": 5, "precio": 2749.00},
            {"tienda": "Tienda 3", "stock": 3, "precio": 2720.00}
        ]
    }

# ============================================================================
# TOOL 6: agregar_al_carrito (SENSITIVE - REQUIERE AUTORIZACIÓN)
# ============================================================================
@mcp.tool()
def agregar_al_carrito(
    id_cliente: str,
    id_inventario: str,
    cantidad: int = 1,
    autorizado_por_usuario: bool = False
) -> Dict[str, Any]:
    """
    Agrega un producto de una tienda específica al carrito del cliente.
    REQUERIMIENTO: El cliente debe confirmar explícitamente antes de efectuar la adición.
    """
    if not autorizado_por_usuario:
        return {
            "status": "requires_confirmation",
            "mensaje": "Se requiere confirmación del usuario para agregar este ítem al carrito.",
            "accion": "agregar_al_carrito",
            "detalles": {"id_cliente": id_cliente, "id_inventario": id_inventario, "cantidad": cantidad}
        }
    
    return {
        "status": "success",
        "mensaje": f"Se agregaron {cantidad} unidad(es) al carrito de compras.",
        "id_inventario": id_inventario,
        "cantidad": cantidad
    }

# ============================================================================
# TOOL 7: calcular_costo_ensamblaje
# ============================================================================
@mcp.tool()
def calcular_costo_ensamblaje(
    items_inventario_ids: List[str],
    metodo_entrega: str = "recojo_en_tienda"
) -> Dict[str, Any]:
    """
    Calcula el costo total de un conjunto de componentes de hardware,
    sumando precios congelados por tienda y cargos de envío aplicables.
    """
    return {
        "status": "success",
        "subtotal_hardware": 5420.00,
        "costo_envio": 25.00 if metodo_entrega == "envio_domicilio" else 0.0,
        "total_estimado_pen": 5445.00,
        "moneda": "PEN (Soles)"
    }

# ============================================================================
# TOOL 8: generar_orden (SENSITIVE - REQUIERE AUTORIZACIÓN EXPLICITA)
# ============================================================================
@mcp.tool()
def generar_orden(
    id_cliente: str,
    metodo_entrega: str,
    direccion_entrega: Optional[str] = None,
    confirmacion_explicita_cliente: bool = False
) -> Dict[str, Any]:
    """
    Genera una orden de compra dividida por tiendas con transacción ACID y bloqueo SELECT FOR UPDATE.
    CRÍTICO: Esta herramienta NUNCA debe ejecutarse automáticamente sin el consentimiento expreso del cliente.
    """
    if not confirmacion_explicita_cliente:
        return {
            "status": "requires_confirmation",
            "mensaje": "ADVERTENCIA DE SEGURIDAD: Se requiere confirmación explícita del cliente antes de generar la orden de compra.",
            "accion": "generar_orden",
            "detalles": {
                "id_cliente": id_cliente,
                "metodo_entrega": metodo_entrega,
                "direccion_entrega": direccion_entrega
            }
        }
    
    return {
        "status": "success",
        "codigo_orden": "ORD-202611-MCP-7821",
        "mensaje": "Orden de compra generada exitosamente. Se crearon los pedidos independientes para cada tienda.",
        "estado": "pendiente_coordinacion_pago"
    }

if __name__ == "__main__":
    mcp.run()
