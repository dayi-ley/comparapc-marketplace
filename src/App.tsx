/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { PCBuilderView } from './components/PCBuilderView';
import { OrdersView } from './components/OrdersView';
import { PagosView } from './components/PagosView';
import { MyAccountView } from './components/myAccount';
import { StoreDashboardView } from './components/StoreDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { MCPConsoleView } from './components/MCPConsoleView';
import { CompareModal } from './components/CompareModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { RegisterStoreModal } from './components/RegisterStoreModal';
import { CreateProductModal } from './components/CreateProductModal';
import { PriceAlertEdgeWidget } from './components/PriceAlertEdgeWidget';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';

const AppContent: React.FC = () => {
  const { activeView, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100] bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header />

      {/* Dynamic Content Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === 'inicio' && <HomeView />}
        {activeView === 'catalogo' && <CatalogView />}
        {activeView === 'ensamblador' && <PCBuilderView />}
        {activeView === 'pedidos' && <OrdersView />}
        {activeView === 'pagos' && <PagosView />}
        {activeView === 'mi_cuenta' && <MyAccountView />}
        {activeView === 'tienda' && <StoreDashboardView seccion="resumen" />}
        {activeView === 'tienda_inventario' && <StoreDashboardView seccion="inventario" />}
        {activeView === 'tienda_pedidos' && <StoreDashboardView seccion="pedidos" />}
        {activeView === 'admin' && <AdminDashboardView />}
        {activeView === 'mcp_console' && <MCPConsoleView />}
      </main>

      {/* Persistent Modals & Drawers */}
      <CompareModal />
      <CartDrawer />
      <CheckoutModal />
      <AIAssistantWidget />
      <RegisterStoreModal />
      <LoginModal />
      <CreateProductModal />
      <PriceAlertEdgeWidget />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
