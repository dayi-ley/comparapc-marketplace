/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Product } from '../types';
import {
  Store,
  DollarSign,
  PackageCheck,
  AlertCircle,
  TrendingUp,
  Boxes,
  CheckCircle2,
  Clock,
  Truck,
  Edit2,
  Save,
  Building2,
  ShieldAlert,
  Plus,
  X,
  PlusCircle,
} from 'lucide-react';

export const StoreDashboardView: React.FC = () => {
  const { currentUser, showToast, setRegisterStoreModalOpen, setCreateProductModalOpen } = useApp();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Modal para agregar producto al inventario
  const [addInventoryModalOpen, setAddInventoryModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newInvPrice, setNewInvPrice] = useState('');
  const [newInvStock, setNewInvStock] = useState('10');
  const [newInvWarranty, setNewInvWarranty] = useState('12');
  const [newInvDelivery, setNewInvDelivery] = useState('ambos');
  const [publishing, setPublishing] = useState(false);

  // Determinar tienda del usuario actual
  const tiendaId = currentUser?.tiendaId || '';

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getTiendaDashboard(tiendaId);
      setData(res);
    } catch (err: any) {
      showToast(`Error al cargar tienda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [tiendaId, currentUser]);

  const openAddInventoryModal = async () => {
    try {
      const prods = await api.getProductos();
      setCatalogProducts(prods);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
        setNewInvPrice(String(prods[0].precioReferencial || 200));
      }
      setAddInventoryModalOpen(true);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handlePublishInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.tienda?.id || !selectedProductId) return;

    setPublishing(true);
    try {
      await api.agregarInventarioTienda(data.tienda.id, {
        productoId: selectedProductId,
        precio: Number(newInvPrice) || 100,
        stock: Number(newInvStock) || 1,
        garantiaMeses: Number(newInvWarranty) || 12,
        metodoEntrega: newInvDelivery,
      });
      showToast('✓ Producto publicado en el inventario de la tienda');
      setAddInventoryModalOpen(false);
      await loadDashboard();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleStartEdit = (inv: any) => {
    setEditingInvId(inv.id);
    setEditPrice(inv.precio);
    setEditStock(inv.stock);
  };

  const handleSaveInventory = async (invId: string) => {
    if (!data?.tienda?.id) return;
    try {
      await api.actualizarInventarioTienda(data.tienda.id, invId, {
        precio: editPrice,
        stock: editStock,
      });
      setEditingInvId(null);
      await loadDashboard();
      showToast('✓ Precio y stock actualizados en base de datos');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (inv: any) => {
    if (!data?.tienda?.id) return;
    try {
      await api.actualizarInventarioTienda(data.tienda.id, inv.id, {
        activo: !inv.activo,
      });
      await loadDashboard();
      showToast(
        inv.activo
          ? 'Oferta dada de baja lógica'
          : 'Oferta reactivada en catálogo'
      );
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleChangeOrderStatus = async (pedId: string, nuevoEstado: string) => {
    if (!data?.tienda?.id) return;
    try {
      await api.actualizarEstadoPedidoTienda(data.tienda.id, pedId, nuevoEstado);
      await loadDashboard();
      showToast(`✓ Estado del pedido actualizado a: ${nuevoEstado}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Cargando Panel de Tienda...</p>
      </div>
    );
  }

  // CASO: ESTADO LIMPIO O SIN TIENDA ASOCIADA
  if (!data || !data.tienda) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-5 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              No tienes una Tienda Registrada
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              La plataforma se encuentra en estado limpio sin tiendas precargadas, o la cuenta activa no está vinculada a una tienda. Puedes afiliar una nueva tienda con RUC de 11 dígitos.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setRegisterStoreModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Registrar Tienda con RUC de 11 Dígitos</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { tienda, metricas, inventario, pedidos } = data;

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER DE LA TIENDA */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={tienda.logoUrl}
            alt={tienda.nombreComercial}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-white p-1 border border-slate-700 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  tienda.estadoVerificacion === 'verificada'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                }`}
              >
                {tienda.estadoVerificacion === 'verificada'
                  ? '✓ Tienda Verificada'
                  : '⚠ Pendiente de Aprobación por Admin'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                RUC: {tienda.ruc}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{tienda.nombreComercial}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {tienda.direccion} • Tel: {tienda.telefono}
            </p>
          </div>
        </div>

        <div className="text-right bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <span className="text-[11px] text-slate-400 font-medium block">
            Ventas Registradas
          </span>
          <span className="text-2xl font-black text-amber-400">
            S/ {metricas.ventasTotalesSoles.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Reputación: {tienda.reputacion} ⭐
          </span>
        </div>
      </div>

      {/* METRICAS DEL DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Boxes className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-500 block">Productos Publicados</span>
          <span className="text-2xl font-black text-slate-900">
            {metricas.totalProductos}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <PackageCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-500 block">Ofertas Activas</span>
          <span className="text-2xl font-black text-emerald-600">
            {metricas.ofertasActivas}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-500 block">Productos Agotados</span>
          <span className="text-2xl font-black text-red-600">
            {metricas.productosAgotados}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-500 block">Pedidos Recibidos</span>
          <span className="text-2xl font-black text-slate-900">
            {metricas.pedidosRecibidos}
          </span>
        </div>
      </div>

      {/* GESTIÓN DE INVENTARIO Y PRECIOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Gestión de Catálogo e Inventario de Tienda
            </h3>
            <p className="text-xs text-slate-500">
              Modifica precios y stock en tiempo real. Aplica baja lógica para ocultar ofertas.
            </p>
          </div>

          <button
            onClick={openAddInventoryModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Oferta en Inventario</span>
          </button>
        </div>

        {inventario.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Inventario Vacío (0 publicaciones)</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Aún no has publicado ningún componente de hardware. Selecciona un producto del catálogo base y define tu precio y stock.
              </p>
            </div>
            <button
              onClick={openAddInventoryModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Primer Producto</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3">Marca</th>
                  <th className="py-3 px-3">Precio (PEN)</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Garantía</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventario.map((item: any) => {
                  const isEditing = editingInvId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productoImagen}
                            alt={item.productoNombre}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 p-0.5 border border-slate-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                            {item.productoNombre}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-semibold">
                        {item.productoMarca}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-24 p-1 rounded border border-blue-400 bg-white font-bold"
                          />
                        ) : (
                          <span className="font-black text-slate-900 text-sm">
                            S/ {item.precio.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                            className="w-16 p-1 rounded border border-blue-400 bg-white font-bold"
                          />
                        ) : (
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              item.stock > 5
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.stock > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.stock > 0 ? `${item.stock} unidades` : 'Agotado'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        {item.garantiaMeses} meses
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-colors ${
                            item.activo
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {item.activo ? 'Público' : 'Oculto (Baja Lógica)'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveInventory(item.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Guardar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PEDIDOS RECIBIDOS POR ESTA TIENDA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">
            Pedidos Recibidos para esta Tienda
          </h3>
          <p className="text-xs text-slate-500">
            Actualiza el ciclo de despacho y entrega de las compras de los clientes.
          </p>
        </div>

        {pedidos.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No hay pedidos registrados para esta tienda todavía.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pedidos.map((pedido: any) => (
              <div key={pedido.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {pedido.codigoOrden}
                    </span>
                    <span className="text-xs text-slate-400">• Pedido {pedido.id}</span>
                  </div>
                  <div className="text-xs text-slate-700">
                    {pedido.items.map((i: any) => (
                      <span key={i.id} className="inline-block mr-3">
                        {i.cantidad}x {i.productoNombre} (S/ {i.precioUnitarioCongelado.toFixed(2)})
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Entrega: {pedido.metodoEntrega === 'recojo_en_tienda' ? 'Recojo en Local' : 'Envío a Domicilio'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total:</span>
                    <span className="text-base font-black text-slate-900">
                      S/ {pedido.total.toFixed(2)}
                    </span>
                  </div>

                  <select
                    value={pedido.estado}
                    onChange={(e) => handleChangeOrderStatus(pedido.id, e.target.value)}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_preparacion">En Preparación</option>
                    <option value="listo_entrega">Listo para Entrega</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelar Pedido</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PARA PUBLICAR EN INVENTARIO */}
      {addInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Boxes className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">Publicar Oferta en Inventario</h3>
              </div>
              <button
                onClick={() => setAddInventoryModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catalogProducts.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <p className="text-xs text-slate-600">
                  No hay productos registrados en el catálogo base. Primero debes crear un producto de hardware.
                </p>
                <button
                  onClick={() => {
                    setAddInventoryModalOpen(false);
                    setCreateProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                >
                  + Crear Producto Base
                </button>
              </div>
            ) : (
              <form onSubmit={handlePublishInventory} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seleccionar Producto del Catálogo *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = catalogProducts.find((x) => x.id === e.target.value);
                      if (p) setNewInvPrice(String(p.precioReferencial || 200));
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.marca} - {p.nombre} (Ref: S/ {p.precioReferencial})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Precio de Venta (PEN) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={newInvPrice}
                      onChange={(e) => setNewInvPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stock Disponible *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newInvStock}
                      onChange={(e) => setNewInvStock(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Garantía (Meses)
                    </label>
                    <input
                      type="number"
                      value={newInvWarranty}
                      onChange={(e) => setNewInvWarranty(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Método de Entrega
                    </label>
                    <select
                      value={newInvDelivery}
                      onChange={(e) => setNewInvDelivery(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="ambos">Ambos (Recojo y Envío)</option>
                      <option value="recojo_en_tienda">Solo Recojo en Tienda</option>
                      <option value="envio_domicilio">Solo Envío a Domicilio</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddInventoryModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50"
                  >
                    {publishing ? 'Publicando...' : 'Publicar Oferta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
