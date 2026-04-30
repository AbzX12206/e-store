import { Link } from 'react-router-dom';
import { products } from '../data/products';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

export default function HomePage() {
  const { language } = useAppStore();
  const t = translations[language].home;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      {/* ══════ Hero Section ══════ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent-500/10 dark:bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-700/50 to-transparent" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img src="/logo.png" alt="RUX Collection" className="h-20 mx-auto" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            {t.nowWith}
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight text-gray-900 dark:text-white animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t.designYourOwn}{' '}
            <span className="bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_linear_infinite]">
              {t.merch}
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.heroDesc}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/customize/tshirt-classic"
              className="px-8 py-3.5 rounded-full text-base font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 transition-all duration-300 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5"
            >
              {t.startDesigning}
            </Link>
            <a
              href="#catalog"
              className="px-8 py-3.5 rounded-full text-base font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300"
            >
              {t.browseProducts}
            </a>
            <Link
              to="/reviews"
              className="px-8 py-3.5 rounded-full text-base font-semibold border border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-500 transition-all duration-300"
            >
              ⭐ Reviews
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex items-center justify-center gap-10 md:gap-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '6+', label: t.stats.types },
              { value: '∞', label: t.stats.colors },
              { value: '2.5D', label: t.stats.preview },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Catalog Section ══════ */}
      <section id="catalog" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-500 tracking-widest uppercase mb-3">{t.catalogSubtitle}</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
              {t.catalogTitle}
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              {t.catalogDesc}
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <Link
                key={product.id}
                to={`/customize/${product.id}`}
                className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-500 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Card glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Emoji Preview */}
                <div className="relative h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-500 group-hover:animate-float">
                    {product.emoji}
                  </span>
                  {/* Price tag */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {product.basePrice.toLocaleString()} ₸
                  </div>
                </div>

                {/* Card body */}
                <div className="relative p-5">
                  <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Color dots */}
                  <div className="mt-4 flex items-center gap-1.5">
                    {product.availableColors.slice(0, 5).map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {product.availableColors.length > 5 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        +{product.availableColors.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-500 dark:text-brand-400">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ About Section ══════ */}
      <section id="about" className="py-20 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-brand-500 tracking-widest uppercase mb-3">{t.aboutSubtitle}</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
            {t.aboutTitle}
          </h2>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {t.aboutDesc}
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: t.feature1Title,
                desc: t.feature1Desc,
              },
              {
                icon: '👁️',
                title: t.feature2Title,
                desc: t.feature2Desc,
              },
              {
                icon: '✨',
                title: t.feature3Title,
                desc: t.feature3Desc,
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 text-lg font-display font-semibold text-gray-800 dark:text-gray-100">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer id="contact" className="py-12 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RUX Collection" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a href="mailto:ruxcollection.com" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                ruxcollection@mail.com
              </a>
              <span className="hidden md:inline">•</span>
              <span>Aktau, Kazakhstan</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* WhatsApp */}
            <a
              href="https://wa.me/77760701412"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 hover:scale-110 transition-all duration-300"
              title="WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
              </svg>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/ErkezhanSerikova"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 hover:scale-110 transition-all duration-300"
              title="Telegram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/custom.lab.kz?utm_source=ig_contact_invite"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
              title="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} RUX Collection. {t.rightsReserved}
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
}
