import { useConfiguratorStore } from '../../store/configuratorStore';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../data/translations';

export default function RightSidebar() {
  const { activeProduct, selectedColor, setColor, selectedSize, setSize } = useConfiguratorStore();
  const { language } = useAppStore();
  const t = translations[language].config;

  if (!activeProduct) return null;

  return (
    <aside className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0 relative z-10 overflow-y-auto scrollbar-thin transition-colors duration-300">
      <div className="p-6">
        <div>
           <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{activeProduct.name}</h2>
           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{activeProduct.description}</p>
        </div>

        {/* Hide color picker for mug */}
        {activeProduct.id !== 'mug-ceramic' && (
          <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t.colorTitle}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{selectedColor}</span>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                 {activeProduct.availableColors.map((color) => (
                     <button
                       key={color}
                       onClick={() => setColor(color)}
                       className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === selectedColor ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-300 dark:border-gray-600'}`}
                       style={{ backgroundColor: color }}
                       title={color}
                     />
                 ))}
              </div>
              
              <div className="mt-4 flex gap-2">
                  <input 
                    type="color" 
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-700 p-0 cursor-pointer bg-transparent" 
                    value={selectedColor}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500 transition-colors uppercase" 
                    value={selectedColor}
                    onChange={(e) => setColor(e.target.value)}
                  />
              </div>
          </div>
        )}

        <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.sizeTitle}
                </p>
                <button className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400">{t.sizeGuide}</button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
                {activeProduct.availableSizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => setSize(size)}
                        className={`py-2 text-sm font-medium rounded-lg border transition-colors ${size === selectedSize ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </aside>
  );
}
