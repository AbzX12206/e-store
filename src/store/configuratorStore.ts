import { create } from 'zustand';
import type { BaseProduct } from '../data/products';
import { CanvasEngine } from '../engine/CanvasEngine';

export interface Layer {
  id: string;
  type: 'image' | 'text';
  name: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  designUrl: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

interface ConfiguratorState {
  activeProduct: BaseProduct | null;
  selectedColor: string;
  selectedSize: string;
  activeView: 'front' | 'back';
  layers: Layer[];
  frontLayers: Layer[];
  backLayers: Layer[];
  frontCanvasState: string;  // Serialized canvas JSON
  backCanvasState: string;
  engine: CanvasEngine | null;
  cart: CartItem[];
  selectedLayerId: string | null;
  deliveryAddress: DeliveryAddress;
  
  // Actions
  setProduct: (product: BaseProduct) => void;
  setColor: (hex: string) => void;
  setSize: (size: string) => void;
  setView: (view: 'front' | 'back') => void;
  setEngine: (engine: CanvasEngine) => void;
  setSelectedLayerId: (id: string | null) => void;
  setDeliveryAddress: (address: Partial<DeliveryAddress>) => void;
  
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  clearLayers: () => void;
  refreshLayersFromEngine: () => void;
  saveViewState: (view: 'front' | 'back') => void;
  loadViewState: (view: 'front' | 'back') => Promise<void>;
  
  // Cart
  addToCart: (designUrl: string) => void;
  getCartCount: () => number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  postalCode: string;
  notes: string;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  activeProduct: null,
  selectedColor: '#ffffff',
  selectedSize: 'M',
  activeView: 'front',
  layers: [],
  frontLayers: [],
  backLayers: [],
  frontCanvasState: '',
  backCanvasState: '',
  engine: null,
  cart: [],
  selectedLayerId: null,
  deliveryAddress: {
    fullName: '',
    phone: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: '',
    notes: '',
  },

  setProduct: (product) => {
    set({ 
      activeProduct: product, 
      activeView: 'front',
      layers: [],
      frontLayers: [],
      backLayers: [],
      frontCanvasState: '',
      backCanvasState: '',
    });
  },
  
  setColor: (hex) => {
    set({ selectedColor: hex });
  },
  
  setSize: (size) => set({ selectedSize: size }),
  
  setView: async (view) => {
    const state = get();
    const engine = state.engine;
    if (!engine) return;
    
    // Save current view's state before switching
    const currentCanvasJson = engine.serializeCanvas();
    if (state.activeView === 'front') {
      set({ 
        frontLayers: [...state.layers],
        frontCanvasState: currentCanvasJson 
      });
    } else {
      set({ 
        backLayers: [...state.layers],
        backCanvasState: currentCanvasJson 
      });
    }
    
    // Switch view
    set({ activeView: view });
    
    // Load new view's canvas state
    const canvasJson = view === 'front' ? state.frontCanvasState : state.backCanvasState;
    await engine.loadCanvas(canvasJson);
    
    // Update layers from loaded canvas
    const newLayers = engine.getAllLayers();
    set({ layers: newLayers });
  },
  
  setDeliveryAddress: (address) => {
    set((state) => ({ 
      deliveryAddress: { ...state.deliveryAddress, ...address } 
    }));
  },
  
  saveViewState: (view) => {
    const state = get();
    const engine = state.engine;
    if (!engine) return;
    
    const canvasJson = engine.serializeCanvas();
    if (view === 'front') {
      set({ 
        frontLayers: [...state.layers],
        frontCanvasState: canvasJson 
      });
    } else {
      set({ 
        backLayers: [...state.layers],
        backCanvasState: canvasJson 
      });
    }
  },
  
  loadViewState: async (view) => {
    const state = get();
    const engine = state.engine;
    if (!engine) return;
    
    const canvasJson = view === 'front' ? state.frontCanvasState : state.backCanvasState;
    await engine.loadCanvas(canvasJson);
    
    const newLayers = engine.getAllLayers();
    set({ layers: newLayers });
  },
  
  setEngine: (engine) => set({ engine }),
  
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  addLayer: (layer) => set((state) => ({ layers: [layer, ...state.layers] })),
  
  removeLayer: (id) => {
    const engine = get().engine;
    if (engine) {
      engine.removeObject(id);
    }
    set((state) => ({ 
      layers: state.layers.filter(l => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
    }));
  },
  
  reorderLayers: (fromIndex: number, toIndex: number) => {
    const engine = get().engine;
    if (!engine) return;
    
    const layers = [...get().layers];
    const [moved] = layers.splice(fromIndex, 1);
    layers.splice(toIndex, 0, moved);
    
    // Update engine layer order
    engine.moveLayer(moved.id, toIndex);
    
    set({ layers });
  },
  
  clearLayers: () => {
    const engine = get().engine;
    if (engine) {
      engine.clearDesign();
    }
    set({ layers: [], selectedLayerId: null });
  },
  
  refreshLayersFromEngine: () => {
    const engine = get().engine;
    if (!engine) return;
    
    const layers = engine.getAllLayers();
    set({ layers });
  },
  
  addToCart: (designUrl: string) => {
    const state = get();
    const product = state.activeProduct;
    if (!product) return;
    
    const cartItem: CartItem = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      designUrl,
      color: state.selectedColor,
      size: state.selectedSize,
      price: product.basePrice,
      quantity: 1
    };
    
    set((state) => ({ cart: [...state.cart, cartItem] }));
  },
  
  getCartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}));

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
