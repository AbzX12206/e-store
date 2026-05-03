import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  const { language } = useAppStore();
  const t = translations[language].reviews;

  useEffect(() => {
    const saved = localStorage.getItem('rux-reviews');
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default dummy reviews
      setReviews([
        {
          id: 1,
          name: 'Azamat Q.',
          rating: 5,
          text: t.defaultReview1,
          date: new Date().toISOString().split('T')[0],
        },
        {
          id: 2,
          name: 'Madina B.',
          rating: 4,
          text: t.defaultReview2,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        }
      ]);
    }
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const newReview: Review = {
      id: Date.now(),
      name: name.trim(),
      rating,
      text: text.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('rux-reviews', JSON.stringify(updated));

    setName('');
    setText('');
    setRating(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      <Navbar />

      <section className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t.title}
        </h1>

        {/* Add Review Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-6">
            {t.writeReview}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.yourName}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-brand-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.rating}
                </label>
                <div className="flex gap-2 h-[42px] items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl hover:scale-110 transition-transform ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.yourReview}
              </label>
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-brand-500 transition-colors resize-none"
                placeholder={t.placeholder}
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full transition-colors shadow-lg shadow-brand-500/25 inline-flex items-center gap-2"
            >
              {t.submit}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{review.name}</h3>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
