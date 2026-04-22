import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import JSZip from 'jszip';
import LeftSidebar from '../components/configurator/LeftSidebar';
import RightSidebar from '../components/configurator/RightSidebar';
import CanvasWorkspace from '../components/configurator/CanvasWorkspace';
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProductById } from '../data/products';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

// ← Replace with your actual WhatsApp number (digits only, with country code)
const WHATSAPP_NUMBER = '77760701412';

export default function ConfiguratorPage() {
  const { productId } = useParams<{ productId: string }>();
  const { setProduct, activeProduct, selectedSize, selectedColor, engine } = useConfiguratorStore();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { language } = useAppStore();
  const t = translations[language].config;
  const navT = translations[language].nav;

  useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) setProduct(product);
    }
  }, [productId, setProduct]);

  const handleAddToCart = async () => {
    if (!engine || !activeProduct) return;
    setLoading(true);

    try {
      // 1. Export the canvas design as a PNG data URL
      const designDataUrl = engine.exportDesign();

      // Convert data URL to Blob
      const res = await fetch(designDataUrl);
      const designBlob = await res.blob();

      // 2. Build a ZIP with design image + order info text
      const zip = new JSZip();
      zip.file('design.png', designBlob);
      zip.file(
        'order-info.txt',
        [
          `Product : ${activeProduct.name}`,
          `Size    : ${selectedSize}`,
          `Color   : ${selectedColor}`,
          `Price   : ${activeProduct.basePrice.toLocaleString()} ₸`,
          `Date    : ${new Date().toLocaleString()}`,
        ].join('\n')
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // 3. Download the ZIP
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `rux-order-${activeProduct.id}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);

      // 4. Open WhatsApp with pre-filled order message
      const msg = encodeURIComponent(
        `Hello! I'd like to order:\n` +
        `• Product: ${activeProduct.name}\n` +
        `• Size: ${selectedSize}\n` +
        `• Color: ${selectedColor}\n` +
        `• Price: ${activeProduct.basePrice.toLocaleString()} ₸\n\n` +
        `I'm attaching my design in the ZIP file I just downloaded.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeProduct) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">
        {t.loadingProduct}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden transition-colors duration-300">

      {/* Top Navbar */}
      <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm group-hover:bg-brand-500 group-hover:text-white transition-colors">
            ←
          </div>
          <span className="font-display font-medium text-gray-700 dark:text-gray-200">
            {navT.backToCatalog}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">{t.total}</span>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">
              {activeProduct.basePrice.toLocaleString()} ₸
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              /* WhatsApp icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            )}
            {t.addToCart}
          </button>
        </div>
      </nav>

      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          ZIP downloaded · WhatsApp opened!
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
