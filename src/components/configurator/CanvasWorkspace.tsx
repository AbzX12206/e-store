import { useEffect, useRef } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CanvasEngine } from '../../engine/CanvasEngine';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../data/translations';

export default function CanvasWorkspace() {
  const { activeView, setView, activeProduct, setEngine, setSelectedLayerId, refreshLayersFromEngine } = useConfiguratorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  
  const { language } = useAppStore();
  const t = translations[language].config;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Engine with selection callback
    const engine = new CanvasEngine(
      canvasRef.current,
      500,
      600,
      (obj) => {
        const id = obj ? (obj as any).id : null;
        setSelectedLayerId(id);
      }
    );
    engineRef.current = engine;
    setEngine(engine);

    if (activeProduct) {
      const views = activeProduct.views[activeView];
      engine.setView(views.maskUrl, views.shadowUrl, views.sheenUrl);
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [activeProduct]); // Re-init if product changes

  // Refresh layers when view changes (since objects persist per view but we're using simple approach)
  useEffect(() => {
    refreshLayersFromEngine();
  }, [activeView]);

  const currentMaskUrl = activeProduct?.views[activeView]?.maskUrl;

  return (
    <div className="flex-1 relative bg-gray-100 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      {/* View Toggles */}
      {activeProduct?.views.back && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 p-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-lg flex gap-1 shadow-sm transition-colors duration-300">
          <button
            onClick={() => setView('front')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeView === 'front'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.front}
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeView === 'back'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.back}
          </button>
        </div>
      )}

      {/* Canvas Area container */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
         <div className="w-[500px] h-[600px] border border-gray-300 dark:border-gray-700 rounded-xl shadow-xl relative bg-white dark:bg-gray-800/50 transition-colors duration-300">
             {/* The visual masking container for the canvas */}
             <div 
               style={{ 
                 width: '100%', 
                 height: '100%',
                 WebkitMaskImage: currentMaskUrl ? `url(${currentMaskUrl})` : 'none',
                 WebkitMaskSize: '100% 100%',
                 WebkitMaskRepeat: 'no-repeat',
                 maskImage: currentMaskUrl ? `url(${currentMaskUrl})` : 'none',
                 maskSize: '100% 100%',
                 maskRepeat: 'no-repeat',
               }}
               className="w-full h-full"
             >
               <canvas ref={canvasRef} />
             </div>
         </div>
      </div>
      
      {/* Zoom / Controls overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
         <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow shadow-gray-300 dark:shadow-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            +
         </button>
         <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow shadow-gray-300 dark:shadow-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            -
         </button>
      </div>
    </div>
  );
}
