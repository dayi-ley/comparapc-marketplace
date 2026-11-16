-- ============================================================================
-- ComparaPC - Esquema Relacional de Base de Datos PostgreSQL
-- Plataforma de comparación de hardware y marketplace multi-tienda con agente MCP
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(50) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'tienda', 'admin')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: tiendas
CREATE TABLE IF NOT EXISTS tiendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_comercial VARCHAR(255) NOT NULL,
    ruc VARCHAR(11) UNIQUE NOT NULL CHECK (length(ruc) = 11),
    razon_social VARCHAR(255),
    direccion VARCHAR(255) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Lima',
    telefono VARCHAR(50) NOT NULL,
    sitio_web VARCHAR(255),
    reputacion NUMERIC(3,2) NOT NULL DEFAULT 5.0 CHECK (reputacion >= 0 AND reputacion <= 5),
    total_ventas INTEGER NOT NULL DEFAULT 0,
    estado_verificacion VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado_verificacion IN ('pendiente', 'verificada', 'rechazada', 'suspendida')),
    logo_url VARCHAR(500),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(50) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 0
);

-- 4. TABLA: productos_base
CREATE TABLE IF NOT EXISTS productos_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    especificaciones JSONB NOT NULL DEFAULT '{}'::jsonb,
    precio_referencial NUMERIC(10,2),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda de productos y especificaciones técnicas JSONB
CREATE INDEX IF NOT EXISTS idx_productos_base_categoria ON productos_base(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_base_marca ON productos_base(marca);
CREATE INDEX IF NOT EXISTS idx_productos_base_specs_gin ON productos_base USING GIN (especificaciones);
CREATE INDEX IF NOT EXISTS idx_productos_base_nombre_trgm ON productos_base USING GIN (nombre gin_trgm_ops);

-- 5. TABLA: inventario_tiendas
CREATE TABLE IF NOT EXISTS inventario_tiendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos_base(id) ON DELETE RESTRICT,
    precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    garantia_meses INTEGER NOT NULL DEFAULT 12 CHECK (garantia_meses >= 0),
    metodo_entrega VARCHAR(100) NOT NULL DEFAULT 'recojo_y_envio' CHECK (metodo_entrega IN ('recojo_en_tienda', 'envio_domicilio', 'recojo_y_envio')),
    tiempo_entrega_dias INTEGER NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tienda_producto UNIQUE (tienda_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_inventario_producto_precio ON inventario_tiendas(producto_id, precio) WHERE activo = TRUE AND stock > 0;

-- 6. TABLA: direcciones_cliente
CREATE TABLE IF NOT EXISTS direcciones_cliente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    destinatario VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(50) NOT NULL,
    departamento VARCHAR(100) NOT NULL DEFAULT 'Lima',
    provincia VARCHAR(100) NOT NULL DEFAULT 'Lima',
    distrito VARCHAR(100) NOT NULL,
    direccion_linea TEXT NOT NULL,
    referencia TEXT,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: carritos
CREATE TABLE IF NOT EXISTS carritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: items_carrito
CREATE TABLE IF NOT EXISTS items_carrito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrito_id UUID NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
    inventario_id UUID NOT NULL REFERENCES inventario_tiendas(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    fecha_agregado TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_carrito_item UNIQUE (carrito_id, inventario_id)
);

-- 9. TABLA: pedidos (Órdenes por tienda)
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_orden VARCHAR(50) NOT NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    costo_envio NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (costo_envio >= 0),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    metodo_entrega VARCHAR(50) NOT NULL CHECK (metodo_entrega IN ('recojo_en_tienda', 'envio_domicilio')),
    direccion_envio TEXT,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_preparacion', 'listo_entrega', 'entregado', 'cancelado')),
    notas_cliente TEXT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tienda ON pedidos(tienda_id);

-- 10. TABLA: detalle_pedido
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    inventario_id UUID REFERENCES inventario_tiendas(id) ON DELETE SET NULL,
    producto_id UUID NOT NULL REFERENCES productos_base(id) ON DELETE RESTRICT,
    producto_nombre VARCHAR(255) NOT NULL,
    precio_unitario_congelado NUMERIC(10,2) NOT NULL CHECK (precio_unitario_congelado >= 0),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- 11. TABLA: calificaciones_tienda
CREATE TABLE IF NOT EXISTS calificaciones_tienda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID UNIQUE NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
    puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FUNCIÓN TRANSACCIONAL CON BLOQUEO SELECT FOR UPDATE (ACID Checkout)
-- ============================================================================
CREATE OR REPLACE FUNCTION procesar_checkout_transaccional(
    p_usuario_id UUID,
    p_metodo_entrega VARCHAR(50),
    p_direccion_envio TEXT,
    p_costo_envio_fijo NUMERIC(10,2)
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_carrito_id UUID;
    v_item RECORD;
    v_inv RECORD;
    v_orden_codigo VARCHAR(50);
    v_tienda_id UUID;
    v_pedido_id UUID;
    v_subtotal_tienda NUMERIC(10,2);
    v_pedidos_creados JSONB := '[]'::jsonb;
BEGIN
    -- Obtener carrito
    SELECT id INTO v_carrito_id FROM carritos WHERE usuario_id = p_usuario_id;
    IF v_carrito_id IS NULL THEN
        RAISE EXCEPTION 'Carrito no encontrado para el usuario %', p_usuario_id;
    END IF;

    -- Validar que existan ítems en el carrito
    IF NOT EXISTS (SELECT 1 FROM items_carrito WHERE carrito_id = v_carrito_id) THEN
        RAISE EXCEPTION 'El carrito se encuentra vacío.';
    END IF;

    v_orden_codigo := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);

    -- Bloquear y validar filas de inventario usando SELECT ... FOR UPDATE
    FOR v_item IN (
        SELECT ic.inventario_id, ic.cantidad, it.stock, it.precio, it.tienda_id, pb.nombre AS prod_nombre, pb.id AS prod_id
        FROM items_carrito ic
        JOIN inventario_tiendas it ON it.id = ic.inventario_id
        JOIN productos_base pb ON pb.id = it.producto_id
        WHERE ic.carrito_id = v_carrito_id
        FOR UPDATE OF it
    ) LOOP
        -- Verificar stock
        IF v_item.stock < v_item.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para % (Disponible: %, Solicitado: %)',
                v_item.prod_nombre, v_item.stock, v_item.cantidad;
        END IF;

        -- Descontar inventario atómicamente
        UPDATE inventario_tiendas
        SET stock = stock - v_item.cantidad,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = v_item.inventario_id;
    END LOOP;

    -- Generar pedidos agrupados por tienda
    FOR v_tienda_id IN (
        SELECT DISTINCT it.tienda_id
        FROM items_carrito ic
        JOIN inventario_tiendas it ON it.id = ic.inventario_id
        WHERE ic.carrito_id = v_carrito_id
    ) LOOP
        -- Calcular subtotal de la tienda
        SELECT SUM(it.precio * ic.cantidad) INTO v_subtotal_tienda
        FROM items_carrito ic
        JOIN inventario_tiendas it ON it.id = ic.inventario_id
        WHERE ic.carrito_id = v_carrito_id AND it.tienda_id = v_tienda_id;

        -- Insertar pedido congelando los precios
        INSERT INTO pedidos (
            codigo_orden, usuario_id, tienda_id, subtotal, costo_envio, total,
            metodo_entrega, direccion_envio, estado
        ) VALUES (
            v_orden_codigo, p_usuario_id, v_tienda_id, v_subtotal_tienda, 
            CASE WHEN p_metodo_entrega = 'envio_domicilio' THEN p_costo_envio_fijo ELSE 0 END,
            v_subtotal_tienda + CASE WHEN p_metodo_entrega = 'envio_domicilio' THEN p_costo_envio_fijo ELSE 0 END,
            p_metodo_entrega, p_direccion_envio, 'pendiente'
        ) RETURNING id INTO v_pedido_id;

        -- Insertar detalle congelando nombre y precio
        INSERT INTO detalle_pedido (
            pedido_id, inventario_id, producto_id, producto_nombre,
            precio_unitario_congelado, cantidad, subtotal
        )
        SELECT 
            v_pedido_id, it.id, pb.id, pb.nombre, it.precio, ic.cantidad, (it.precio * ic.cantidad)
        FROM items_carrito ic
        JOIN inventario_tiendas it ON it.id = ic.inventario_id
        JOIN productos_base pb ON pb.id = it.producto_id
        WHERE ic.carrito_id = v_carrito_id AND it.tienda_id = v_tienda_id;

        v_pedidos_creados := v_pedidos_creados || jsonb_build_object(
            'pedido_id', v_pedido_id,
            'tienda_id', v_tienda_id,
            'subtotal', v_subtotal_tienda
        );
    END LOOP;

    -- Vaciar carrito tras confirmación
    DELETE FROM items_carrito WHERE carrito_id = v_carrito_id;

    RETURN jsonb_build_object(
        'exito', TRUE,
        'codigo_orden', v_orden_codigo,
        'pedidos', v_pedidos_creados
    );
END;
$$;
