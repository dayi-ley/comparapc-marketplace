/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartResponse, Product, Category } from '../types';
import { api } from '../services/api';

export type ActiveView =
  | 'inicio'
  | 'catalogo'
  | 'ensamblador'
  | 'pedidos'
  | 'pagos'
  | 'mi_cuenta'
  | 'tienda'
  | 'admin'
  | 'mcp_console';

interface AppContextType {
  currentUser: User | null;
  demoUsers: User[];
  switchUser: (user: User) => void;
  cerrarSesion: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cart: CartResponse | null;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  loadCart: () => Promise<void>;
  addToCart: (inventarioId: string, cantidad?: number) => Promise<void>;
  updateCartItem: (itemId: string, cantidad: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  selectedProductForCompare: Product | null;
  openCompareModal: (product: Product) => void;
  closeCompareModal: () => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  aiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;
  aiInitialPrompt: string | null;
  openAiWithPrompt: (prompt: string) => void;
  categories: Category[];
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (catId: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  registerStoreModalOpen: boolean;
  setRegisterStoreModalOpen: (open: boolean) => void;
  createProductModalOpen: boolean;
  setCreateProductModalOpen: (open: boolean) => void;
  priceAlertDrawerOpen: boolean;
  setPriceAlertDrawerOpen: (open: boolean) => void;
  selectedProductForAlert: Product | null;
  openPriceAlertModal: (product?: Product) => void;
  closePriceAlertModal: () => void;
  limpiarBaseDatos: () => Promise<void>;
  cargarDatosDemo: () => Promise<void>;
  reloadUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('inicio');
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedProductForCompare, setSelectedProductForCompare] = useState<Product | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [registerStoreModalOpen, setRegisterStoreModalOpen] = useState(false);
  const [createProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [priceAlertDrawerOpen, setPriceAlertDrawerOpen] = useState(false);
  const [selectedProductForAlert, setSelectedProductForAlert] = useState<Product | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const reloadUserData = async () => {
    try {
      const users = await api.getDemoUsers();
      setDemoUsers(users);
      if (users.length > 0 && !currentUser) {
        setCurrentUser(users[0]);
      }
    } catch (err) {
      console.error('Error al recargar usuarios:', err);
    }
  };

  const limpiarBaseDatos = async () => {
    try {
      await api.limpiarBaseDatos();
      await reloadUserData();
      setCart({ items: [], totalGeneral: 0, cantidadTotal: 0 });
      showToast('✓ Base de datos restablecida a estado limpio (0 registros)');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const cargarDatosDemo = async () => {
    try {
      await api.seedDemo();
      await reloadUserData();
      showToast('✓ Datos de prueba cargados exitosamente');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Carga inicial de usuarios demo y categorías
  useEffect(() => {
    const init = async () => {
      try {
        const users = await api.getDemoUsers();
        setDemoUsers(users);
        if (users.length > 0) {
          // Iniciar por defecto con el primer usuario disponible
          setCurrentUser(users[0]);
        }
        const cats = await api.getCategorias();
        setCategories(cats);
      } catch (err) {
        console.error('Error al inicializar datos:', err);
      }
    };
    init();
  }, []);

  // Cargar carrito cuando cambia el usuario
  const loadCart = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getCarrito(currentUser.id);
      setCart(data);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCart();
    }
  }, [currentUser]);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Sesión cambiada a: ${user.nombreCompleto} (${user.rol.toUpperCase()})`);
    if (user.rol === 'tienda') {
      setActiveView('tienda');
    } else if (user.rol === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('catalogo');
    }
  };

  const cerrarSesion = () => {
    setCurrentUser(null);
    setActiveView('inicio');
    showToast('Sesión cerrada');
  };

  const addToCart = async (inventarioId: string, cantidad: number = 1) => {
    if (!currentUser) return;
    try {
      const updated = await api.agregarAlCarrito(currentUser.id, inventarioId, cantidad);
      setCart(updated);
      showToast('✓ Producto agregado al carrito');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const updateCartItem = async (itemId: string, cantidad: number) => {
    if (!currentUser) return;
    try {
      const updated = await api.actualizarCantidadCarrito(currentUser.id, itemId, cantidad);
      setCart(updated);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!currentUser) return;
    try {
      const updated = await api.eliminarItemCarrito(currentUser.id, itemId);
      setCart(updated);
      showToast('Ítem eliminado del carrito');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const openCompareModal = (product: Product) => {
    setSelectedProductForCompare(product);
  };

  const closeCompareModal = () => {
    setSelectedProductForCompare(null);
  };

  const openAiWithPrompt = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setAiAssistantOpen(true);
  };

  const openPriceAlertModal = (product?: Product) => {
    setSelectedProductForAlert(product || null);
    setPriceAlertDrawerOpen(true);
  };

  const closePriceAlertModal = () => {
    setPriceAlertDrawerOpen(false);
    setSelectedProductForAlert(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        demoUsers,
        switchUser,
        cerrarSesion,
        activeView,
        setActiveView,
        cart,
        cartDrawerOpen,
        setCartDrawerOpen,
        loadCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        selectedProductForCompare,
        openCompareModal,
        closeCompareModal,
        checkoutModalOpen,
        setCheckoutModalOpen,
        aiAssistantOpen,
        setAiAssistantOpen,
        aiInitialPrompt,
        openAiWithPrompt,
        categories,
        searchFilter,
        setSearchFilter,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        toastMessage,
        showToast,
        registerStoreModalOpen,
        setRegisterStoreModalOpen,
        createProductModalOpen,
        setCreateProductModalOpen,
        priceAlertDrawerOpen,
        setPriceAlertDrawerOpen,
        selectedProductForAlert,
        openPriceAlertModal,
        closePriceAlertModal,
        limpiarBaseDatos,
        cargarDatosDemo,
        reloadUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
