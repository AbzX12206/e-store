import { useState } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../data/translations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  designUrl: string;
  onConfirm: () => void;
}

// Aktau coordinates for map
const AKTAU_LAT = 43.6568;
const AKTAU_LNG = 51.1835;

export default function CheckoutModal({ isOpen, onClose, designUrl, onConfirm }: CheckoutModalProps) {
  const { 
    activeProduct, 
    selectedSize, 
    selectedColor, 
    deliveryAddress, 
    setDeliveryAddress,
    activeView,
    backCanvasState
  } = useConfiguratorStore();
  const { language } = useAppStore();
  const t = translations[language].checkout;
  
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isOpen || !activeProduct) return null;
  

  const hasBackDesign = activeProduct.views.back && backCanvasState && backCanvasState !== '[]' && backCanvasState !== '';
  
  // Calculate total
  const basePrice = activeProduct.basePrice;
  const deliveryPrice = 1500; // Fixed delivery fee
  const totalPrice = basePrice + deliveryPrice;
  
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryAddress.fullName && deliveryAddress.phone && deliveryAddress.street) {
      setStep('payment');
    }
  };
  
  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onConfirm();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 'address' ? t.deliveryAddress : t.payment}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Left Column - Order Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t.orderSummary}</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-4">
                {designUrl && (
                  <img 
                    src={designUrl} 
                    alt="Design" 
                    className="w-20 h-20 object-contain rounded-lg bg-white dark:bg-gray-700"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activeProduct.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeView === 'front' ? t.frontDesign : t.backDesign}
                    {hasBackDesign && ` + ${t.backDesign}`}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t.size}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedSize}</span>
                </div>
                {activeProduct.id !== 'mug-ceramic' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t.color}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedColor}</span>
                  </div>
                )}
              </div>
            </div>
            

            
            {/* Price Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.product}</span>
                <span className="text-gray-900 dark:text-white">{basePrice.toLocaleString()} ₸</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.delivery}</span>
                <span className="text-gray-900 dark:text-white">{deliveryPrice.toLocaleString()} ₸</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-lg">
                <span className="text-gray-900 dark:text-white">{t.total}</span>
                <span className="text-brand-600 dark:text-brand-400">{totalPrice.toLocaleString()} ₸</span>
              </div>
            </div>
            
            {/* Map */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{t.deliveryLocation}</h4>
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${AKTAU_LNG - 0.1}%2C${AKTAU_LAT - 0.1}%2C${AKTAU_LNG + 0.1}%2C${AKTAU_LAT + 0.1}&layer=mapnik&marker=${AKTAU_LAT}%2C${AKTAU_LNG}`}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t.deliveryCitywide}
              </p>
            </div>
          </div>
          
          {/* Right Column - Address Form or Payment */}
          <div>
            {step === 'address' ? (
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t.enterDetails}</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress.fullName}
                    onChange={(e) => setDeliveryAddress({ fullName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({ phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ city: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 outline-none"
                      placeholder="Aktau"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.postalCode}
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.postalCode}
                      onChange={(e) => setDeliveryAddress({ postalCode: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 outline-none"
                      placeholder="130000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.streetAddress}
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ street: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.building}
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.building}
                      onChange={(e) => setDeliveryAddress({ building: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 outline-none"
                      placeholder="Building 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.apartment}
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.apartment}
                      onChange={(e) => setDeliveryAddress({ apartment: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 outline-none"
                      placeholder="Apt 42"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.deliveryNotes}
                  </label>
                  <textarea
                    value={deliveryAddress.notes}
                    onChange={(e) => setDeliveryAddress({ notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 outline-none resize-none"
                    rows={3}
                    placeholder={t.notesPlaceholder}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
                >
                  {t.continueToPay}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t.selectPayment}</h3>
                
                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/20 rounded-xl cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-brand-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{t.cashOnDelivery}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.cashOnDeliveryDesc}</p>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer opacity-60">
                    <input type="radio" name="payment" disabled className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{t.kaspiPay}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.comingSoon}</p>
                    </div>
                    <span className="text-2xl text-yellow-500">K</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer opacity-60">
                    <input type="radio" name="payment" disabled className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{t.cardPayment}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.comingSoon}</p>
                    </div>
                    <span className="text-2xl">💳</span>
                  </label>
                </div>
                
                {/* Delivery Address Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{t.deliveryAddress}</h4>
                    <button 
                      onClick={() => setStep('address')}
                      className="text-sm text-brand-500 hover:text-brand-600"
                    >
                      {t.edit}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deliveryAddress.fullName}<br />
                    {deliveryAddress.phone}<br />
                    {deliveryAddress.street} {deliveryAddress.building} {deliveryAddress.apartment && `, ${deliveryAddress.apartment}`}<br />
                    {deliveryAddress.city || 'Aktau'}, Kazakhstan
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('address')}
                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {t.processing}
                      </>
                    ) : (
                      `${t.pay} ${totalPrice.toLocaleString()} ₸`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
