/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { YapeLogo, PlinLogo, MastercardLogo, TransferenciaLogo } from './PaymentLogos';
import {
  X,
  ShieldCheck,
  Truck,
  Store as StoreIcon,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    cart,
    loadCart,
    currentUser,
    showToast,
    setActiveView,
  } = useApp();

  const [metodoEntrega, setMetodoEntrega] = useState<'recojo_en_tienda' | 'envio_domicilio'>('recojo_en_tienda');
  const [distrito, setDistrito] = useState('Miraflores');
  const [direccion, setDireccion] = useState('Av. Larco 743, Dpto 402');
  const [referencia, setReferencia] = useState('Frente al parque Kennedy');
  const [processing, setProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);

  const [step, setStep] = useState<'datos' | 'pago'>('datos');
  const [metodoPago, setMetodoPago] = useState<'yape' | 'tarjeta' | 'transferencia'>('yape');
  const [celular, setCelular] = useState('987654321');
  const [codigoAprobacion, setCodigoAprobacion] = useState('');
  const [numTarjeta, setNumTarjeta] = useState('');
  const [titular, setTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [nroOperacion, setNroOperacion] = useState('');
  const [pasarelaMensaje, setPasarelaMensaje] = useState('');

  const luhnValido = (num: string) => {
    const digitos = num.replace(/\D/g, '');
    if (digitos.length < 13 || digitos.length > 19) return false;
    let suma = 0;
    let par = false;
    for (let i = digitos.length - 1; i >= 0; i--) {
      let d = parseInt(digitos[i], 10);
      if (par) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      suma += d;
      par = !par;
    }
    return suma % 10 === 0;
  };

  const marcaTarjeta = (num: string) => {
    const n = num.replace(/\D/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
    return 'Tarjeta';
  };

  const formatearTarjeta = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const pagoValido = (() => {
    if (metodoPago === 'yape') return celular.replace(/\D/g, '').length === 9 && codigoAprobacion.replace(/\D/g, '').length === 6;
    if (metodoPago === 'tarjeta')
      return luhnValido(numTarjeta) && titular.trim().length >= 4 && /^\d{2}\/\d{2}$/.test(vencimiento) && cvv.replace(/\D/g, '').length >= 3;
    return nroOperacion.trim().length >= 6;
  })();

  const continuarAPago = () => {
    if (metodoEntrega === 'envio_domicilio' && (!distrito.trim() || !direccion.trim())) {
      showToast('Completa la direccion de despacho');
      return;
    }
    setStep('pago');
  };

  if (!checkoutModalOpen) return null;

  // Tiendas únicas en el carrito
  const tiendasUnicas = Array.from(new Set(cart?.items.map((i) => i.tiendaNombre) || []));
  const costoEnvioPorTienda = 15.0;
  const costoTotalEnvio = metodoEntrega === 'envio_domicilio' ? tiendasUnicas.length * costoEnvioPorTienda : 0;
  const totalFinal = (cart?.totalGeneral || 0) + costoTotalEnvio;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!pagoValido) {
      showToast('Completa correctamente los datos de pago');
      return;
    }

    setProcessing(true);
    setPasarelaMensaje('Conectando con la pasarela de pago...');
    try {
      const direccionCompleta =
        metodoEntrega === 'envio_domicilio'
          ? `${distrito}, ${direccion} (Ref: ${referencia})`

          : undefined;

      let refPago = '';
      if (metodoPago === 'yape') {
        setPasarelaMensaje(`Validando codigo ${codigoAprobacion} en Yape/Plin...`);
        refPago = `YP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      } else if (metodoPago === 'tarjeta') {
        setPasarelaMensaje(`Autorizando tarjeta ${marcaTarjeta(numTarjeta)} ****${numTarjeta.replace(/\D/g, '').slice(-4)}...`);
        refPago = `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      } else {
        setPasarelaMensaje(`Verificando transferencia ${nroOperacion}...`);
        refPago = `TR-${nroOperacion.slice(0, 8)}`;
      }

      await new Promise((r) => setTimeout(r, 1600));

      setPasarelaMensaje('Confirmando transaccion y bloqueando stock...');
      const result = await api.procesarCheckout(
        currentUser.id,
        metodoEntrega,
        direccionCompleta,
        { metodo: metodoPago, referencia: refPago }
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setOrderCompleted(result);
      await loadCart();
      showToast('✓ Pago aprobado y orden generada');
    } catch (err: any) {
      showToast(`Error al procesar: ${err.message}`);
      setPasarelaMensaje('');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCheckoutModalOpen(false);
    setOrderCompleted(null);
    setStep('datos');
    setCodigoAprobacion('');
    setNroOperacion('');
    setPasarelaMensaje('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Checkout Transaccional ACID</h3>
              <p className="text-[11px] text-slate-400">
                Bloqueo SELECT FOR UPDATE y órdenes divididas por tienda
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompleted ? (
          /* RESULTADO DE LA ORDEN GENERADA */
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                TRANSACCIÓN CONFIRMADA
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                ¡Orden Generada Exitosamente!
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Código Maestro: <strong>{orderCompleted.codigoOrden}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>
                  Se han generado {orderCompleted.pedidosGenerados.length} pedidos independientes:
                </span>
              </div>
              {orderCompleted.pedidosGenerados.map((ped: any) => (
                <div key={ped.id} className="flex items-center justify-between py-1 text-slate-700">
                  <span>
                    • <strong>{ped.tiendaNombre}</strong> ({ped.items.length} items)
                  </span>
                  <span className="font-black text-slate-900">
                    S/ {ped.total.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Total Consolidado:</span>
                <span>S/ {orderCompleted.totalMontoPEN.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Los precios han sido congelados. El pago y despacho se coordina individualmente con cada tienda afiliada.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  handleClose();
                  setActiveView('pedidos');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Ver Mis Pedidos
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Continuar Navegando
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE CHECKOUT */
          <form onSubmit={handleConfirmOrder} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 'datos' ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'datos' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                Entrega
              </div>
              <div className="flex-1 h-px bg-slate-200" />
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step === 'pago' ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'pago' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                Pago
              </div>
            </div>

            {step === 'datos' && (
            <>
            {/* Modalidad de Entrega */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Modalidad de Entrega
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodoEntrega('recojo_en_tienda')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    metodoEntrega === 'recojo_en_tienda'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <StoreIcon
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      metodoEntrega === 'recojo_en_tienda' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Recojo en Tienda</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      En locales oficiales de cada tienda (Gratis)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoEntrega('envio_domicilio')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    metodoEntrega === 'envio_domicilio'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Truck
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      metodoEntrega === 'envio_domicilio' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Envío a Domicilio</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Lima Metropolitana y Provincias (S/ 15 por tienda)
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Dirección de Envío si aplica */}
            {metodoEntrega === 'envio_domicilio' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Dirección de Despacho</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Distrito</label>
                    <input
                      type="text"
                      value={distrito}
                      onChange={(e) => setDistrito(e.target.value)}
                      required
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Dirección Exacta</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Referencia</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-xs"
                  />
                </div>
              </div>
            )}

            {/* Desglose de Tiendas en el Carrito */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Desglose por Tienda Proveedora
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                {tiendasUnicas.map((tienda) => {
                  const itemsTienda = cart?.items.filter((i) => i.tiendaNombre === tienda) || [];
                  const subtotal = itemsTienda.reduce((acc, curr) => acc + curr.subtotal, 0);

                  return (
                    <div key={tienda} className="flex items-center justify-between text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">{tienda}</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({itemsTienda.length} productos)
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {metodoEntrega === 'envio_domicilio' && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                    <span>
                      Costo de envío ({tiendasUnicas.length} tiendas × S/ 15.00):
                    </span>
                    <span className="font-semibold text-slate-800">
                      S/ {costoTotalEnvio.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-300 flex items-center justify-between font-black text-sm text-slate-900">
                  <span>Total General (PEN):</span>
                  <span className="text-base text-blue-600">
                    S/ {totalFinal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            </>
            )}

            {step === 'pago' && (
            <>
            {/* Seleccion de Metodo de Pago */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Metodo de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'yape', label: 'Yape / Plin', logo: YapeLogo },
                  { id: 'tarjeta', label: 'Tarjeta', logo: MastercardLogo },
                  { id: 'transferencia', label: 'Transferencia', logo: TransferenciaLogo },
                ] as const).map((m) => {
                  const Logo = m.logo;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoPago(m.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        metodoPago === m.id ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Logo className={`w-7 h-7 ${metodoPago === m.id ? '' : 'opacity-60 grayscale'}`} />
                      <span className="text-[10px] font-bold text-slate-700">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {metodoPago === 'yape' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Celular asociado (9 digitos)</label>
                  <input type="tel" value={celular} onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))} className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Codigo de aprobacion Yape (6 digitos)</label>
                  <input type="text" value={codigoAprobacion} onChange={(e) => setCodigoAprobacion(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-full p-2 bg-white rounded-xl border border-slate-200 font-mono tracking-[0.3em] text-sm" />
                </div>
                <p className="text-[10px] text-slate-400">Abre tu app Yape, aprueba el cobro y coloca el codigo generado.</p>
              </div>
            )}

            {metodoPago === 'tarjeta' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 flex items-center justify-between">
                    <span>Numero de tarjeta</span>
                    <span className="font-bold text-blue-600">{numTarjeta ? marcaTarjeta(numTarjeta) : ''}</span>
                  </label>
                  <input type="text" value={numTarjeta} onChange={(e) => setNumTarjeta(formatearTarjeta(e.target.value))} placeholder="0000 0000 0000 0000" className="w-full p-2 bg-white rounded-xl border border-slate-200 font-mono text-sm" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Titular de la tarjeta</label>
                  <input type="text" value={titular} onChange={(e) => setTitular(e.target.value.toUpperCase())} placeholder="NOMBRE COMO FIGURA EN LA TARJETA" className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Vencimiento (MM/AA)</label>
                    <input type="text" value={vencimiento} onChange={(e) => setVencimiento(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))} placeholder="12/28" className="w-full p-2 bg-white rounded-xl border border-slate-200 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">CVV</label>
                    <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="***" className="w-full p-2 bg-white rounded-xl border border-slate-200 font-mono text-sm" />
                  </div>
                </div>
              </div>
            )}

            {metodoPago === 'transferencia' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Cuentas de abono:</p>
                  <p className="flex justify-between"><span>BCP Soles</span><span className="font-mono">193-2345678-0-15</span></p>
                  <p className="flex justify-between"><span>Interbank</span><span className="font-mono">898-3112345678</span></p>
                  <p className="text-[10px] text-slate-400">Titular: ComparaPC Market SAC — RUC 20601234567</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Numero de operacion / voucher</label>
                  <input type="text" value={nroOperacion} onChange={(e) => setNroOperacion(e.target.value)} placeholder="Ej: 00412345" className="w-full p-2 bg-white rounded-xl border border-slate-200 font-mono text-sm" />
                </div>
              </div>
            )}

            {pasarelaMensaje && (
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{pasarelaMensaje}</span>
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between font-black text-sm text-slate-900">
              <span>Total a pagar (PEN):</span>
              <span className="text-base text-blue-600">S/ {totalFinal.toFixed(2)}</span>
            </div>

            {/* Política Transaccional */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Garantía Transaccional ACID:</strong> Al confirmar el pago, se ejecuta el bloqueo atómico de inventario, se descuentan las existencias y los precios quedan congelados en el contrato digital.
              </span>
            </div>
            </>
            )}

            {/* Boton Final */}
            <div className="pt-2">
              {step === 'datos' ? (
                <button
                  type="button"
                  onClick={continuarAPago}
                  disabled={!cart || cart.items.length === 0}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Continuar a Pago</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('datos')}
                    disabled={processing}
                    className="px-4 py-3.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={processing || !pagoValido || !cart || cart.items.length === 0}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{processing ? 'Procesando pago...' : `Pagar S/ ${totalFinal.toFixed(2)}`}</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
