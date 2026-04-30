import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import JSZip from 'jszip';
import LeftSidebar from '../components/configurator/LeftSidebar';
import RightSidebar from '../components/configurator/RightSidebar';
import CanvasWorkspace from '../components/configurator/CanvasWorkspace';
import CheckoutModal from '../components/configurator/CheckoutModal';
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProductById } from '../data/products';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

// ← Replace with your actual WhatsApp number (digits only, with country code)
const WHATSAPP_NUMBER = '77760701412';

export default function ConfiguratorPage() {
  const { productId } = useParams<{ productId: string }>();
  const { setProduct, activeProduct, selectedSize, selectedColor, engine, deliveryAddress, activeView } = useConfiguratorStore();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [designUrl, setDesignUrl] = useState('');
  const { language } = useAppStore();
  const t = translations[language].config;
  const navT = translations[language].nav;

  useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) setProduct(product);
    }
  }, [productId, setProduct]);

  const handleCheckout = () => {
    if (!engine || !activeProduct) return;
    
    // Export design and open checkout modal
    const designDataUrl = engine.exportDesign();
    setDesignUrl(designDataUrl);
    setShowCheckout(true);
  };

  const handleConfirmOrder = async () => {
    if (!engine || !activeProduct || !designUrl) return;
    setLoading(true);

    try {
      // Convert data URL to Blob
      const res = await fetch(designUrl);
      const designBlob = await res.blob();

      // Build a ZIP with design image + order info text
      const zip = new JSZip();
      zip.file('design.png', designBlob);
      zip.file(
        'order-info.txt',
        [
          `Product : ${activeProduct.name}`,
          `Size    : ${selectedSize}`,
          `Color   : ${selectedColor}`,
          `Price   : ${activeProduct.basePrice.toLocaleString()} ₸`,
          `View    : ${activeView}`,
          `Date    : ${new Date().toLocaleString()}`,
          ``,
          `--- Delivery Address ---`,
          `Name:    ${deliveryAddress.fullName}`,
          `Phone:   ${deliveryAddress.phone}`,
          `Address: ${deliveryAddress.street} ${deliveryAddress.building} ${deliveryAddress.apartment || ''}`,
          `City:    ${deliveryAddress.city || 'Aktau'}, Kazakhstan`,
          `Notes:   ${deliveryAddress.notes || 'None'}`,
        ].join('\n')
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download the ZIP
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `rux-order-${activeProduct.id}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);

      // Open WhatsApp with pre-filled order message
      const giftText = activeProduct.category === 'tops' ? '\n🎁 Stain remover powder included (FREE)' : '';
      const msg = encodeURIComponent(
        `Hello! I'd like to order:\n` +
        `• Product: ${activeProduct.name}\n` +
        `• Size: ${selectedSize}\n` +
        `• Color: ${selectedColor}\n` +
        `• Price: ${activeProduct.basePrice.toLocaleString()} ₸${giftText}\n\n` +
        `📍 Delivery to:\n` +
        `${deliveryAddress.fullName}\n` +
        `${deliveryAddress.street} ${deliveryAddress.building} ${deliveryAddress.apartment || ''}\n` +
        `${deliveryAddress.city || 'Aktau'}\n\n` +
        `I'm attaching my design in the ZIP file I just downloaded.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');

      setShowCheckout(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Order error:', err);
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
            onClick={handleCheckout}
            disabled={loading}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg hover:shadow-brand-500/25 flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              /* Checkout icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
            Order Now
          </button>
        </div>
      </nav>

      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Order placed! Check WhatsApp.
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        designUrl={designUrl}
        onConfirm={handleConfirmOrder}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <CanvasWorkspace />
        <RightSidebar />
      </div>
    </div>
  );
}
