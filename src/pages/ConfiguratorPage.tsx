import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LeftSidebar from '../components/configurator/LeftSidebar';
import RightSidebar from '../components/configurator/RightSidebar';
import CanvasWorkspace from '../components/configurator/CanvasWorkspace';
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProductById } from '../data/products';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

export default function ConfiguratorPage() {
  const { productId } = useParams<{ productId: string }>();
  const { setProduct, activeProduct, engine, addToCart, getCartCount } = useConfiguratorStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const { language } = useAppStore();
  const t = translations[language].config;
  const navT = translations[language].nav;

  useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setProduct(product);
      }
    }
  }, [productId, setProduct]);

  const handleAddToCart = () => {
    if (!engine || !activeProduct) return;

    // Export design
    const designUrl = engine.exportDesign();
    
    // Add to cart
    addToCart(designUrl);
    
    // Show success and trigger download
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    // Download the design
    const link = document.createElement('a');
    link.download = `rux-design-${activeProduct.id}-${Date.now()}.png`;
    link.href = designUrl;
    link.click();
  };

  const cartCount = getCartCount();

  if (!activeProduct) {
     return <div className="h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">{t.loadingProduct}</div>
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm group-hover:bg-brand-500 group-hover:text-white transition-colors">
            ←
          </div>
          <span className="font-display font-medium text-gray-700 dark:text-gray-200">{navT.backToCatalog}</span>
        </Link>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400 block">{t.total}</span>
                <span className="font-display font-bold text-lg text-gray-900 dark:text-white">{activeProduct.basePrice.toLocaleString()} ₸</span>
            </div>
            <div className="relative">
              <button 
                onClick={handleAddToCart}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {t.addToCart}
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
        </div>
      </nav>

      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          {t.addedToCart}
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <CanvasWorkspace />
        <RightSidebar />
      </div>
    </div>
  );
}
