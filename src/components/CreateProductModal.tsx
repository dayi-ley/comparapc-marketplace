import React, { useState } from 'react';
import { X, Cpu, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const CreateProductModal: React.FC<{ onProductCreated?: () => void }> = ({ onProductCreated }) => {
  const { createProductModalOpen, setCreateProductModalOpen, categories, showToast } = useApp();

  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: categories[0]?.id || 'cat-cpu',
    marca: '',
    modelo: '',
    descripcion: '',
    precioReferencial: '',
    imagenUrl: '',
    socket: '',
    ramType: 'DDR4',
    formFactor: 'ATX',
    tdpWatts: '',
  });

  const [loading, setLoading] = useState(false);

  if (!createProductModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.marca || !formData.modelo) {
      showToast('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const especificaciones: Record<string, any> = {};
      if (formData.socket) especificaciones.socket = formData.socket;
      if (formData.ramType) especificaciones.tipoMemoria = formData.ramType;
      if (formData.formFactor) especificaciones.factorForma = formData.formFactor;
      if (formData.tdpWatts) especificaciones.tdpWatts = Number(formData.tdpWatts);

      await api.crearProducto({
        nombre: formData.nombre,
        categoriaId: formData.categoriaId,
        marca: formData.marca,
        modelo: formData.modelo,
        descripcion: formData.descripcion || `${formData.marca} ${formData.modelo} de alto rendimiento.`,
        precioReferencial: Number(formData.precioReferencial) || 100,
        imagenUrl: formData.imagenUrl || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
        especificaciones,
      });

      showToast('✓ Producto agregado exitosamente al catálogo.');
      setCreateProductModalOpen(false);
      setFormData({
        nombre: '',
        categoriaId: categories[0]?.id || 'cat-cpu',
        marca: '',
        modelo: '',
        descripcion: '',
        precioReferencial: '',
        imagenUrl: '',
        socket: '',
        ramType: 'DDR4',
        formFactor: 'ATX',
        tdpWatts: '',
      });
      if (onProductCreated) onProductCreated();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isCpuOrMobo = formData.categoriaId === 'cat-cpu' || formData.categoriaId === 'cat-mobo';
  const isRamOrMobo = formData.categoriaId === 'cat-ram' || formData.categoriaId === 'cat-mobo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Cpu className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Agregar Producto al Catálogo</h3>
              <p className="text-xs text-blue-100">Registra un nuevo componente de hardware base</p>
            </div>
          </div>
          <button
            onClick={() => setCreateProductModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo del Producto *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. AMD Ryzen 7 7800X3D"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría *</label>
              <select
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marca *</label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ej. AMD, Intel, ASUS, Corsair"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo / Referencia *</label>
              <input
                type="text"
                required
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ej. 7800X3D / B650 / RTX 4070"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Precio Referencial (S/.) *</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.precioReferencial}
                onChange={(e) => setFormData({ ...formData, precioReferencial: e.target.value })}
                placeholder="1500.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL de Imagen (Opcional)</label>
            <input
              type="url"
              value={formData.imagenUrl}
              onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Especificaciones de compatibilidad */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Especificaciones para Validación de Compatibilidad (Nexus Match)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isCpuOrMobo && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Socket (ej. AM5, LGA1700)</label>
                  <input
                    type="text"
                    value={formData.socket}
                    onChange={(e) => setFormData({ ...formData, socket: e.target.value })}
                    placeholder="AM5 / LGA1700"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              )}

              {isRamOrMobo && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Tipo de RAM Soportada</label>
                  <select
                    value={formData.ramType}
                    onChange={(e) => setFormData({ ...formData, ramType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="DDR4">DDR4</option>
                    <option value="DDR5">DDR5</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Factor de Forma</label>
                <select
                  value={formData.formFactor}
                  onChange={(e) => setFormData({ ...formData, formFactor: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ATX">ATX</option>
                  <option value="Micro-ATX">Micro-ATX</option>
                  <option value="Mini-ITX">Mini-ITX</option>
                  <option value="E-ATX">E-ATX</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Consumo TDP Estimado (Watts)</label>
                <input
                  type="number"
                  value={formData.tdpWatts}
                  onChange={(e) => setFormData({ ...formData, tdpWatts: e.target.value })}
                  placeholder="Ej. 120"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCreateProductModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
