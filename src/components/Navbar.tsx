import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

export default function Navbar() {
  const { language, setLanguage, theme, setTheme } = useAppStore();
  const t = translations[language].nav;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="RUX Collection" 
            className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#catalog" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200">
            {t.products}
          </a>
          <a href="#about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200">
            {t.about}
          </a>
          <a href="#contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200">
            {t.contact}
          </a>
        </div>

        {/* CTA & Toggles */}
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="kk">KK</option>
          </select>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link
            to="/customize/tshirt-classic"
            className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25"
          >
            {t.startDesigning}
          </Link>
        </div>
      </div>
    </nav>
  );
}
