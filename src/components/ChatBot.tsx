import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchChatTree, chatTree, type ChatNode } from '../data/chatbotTree';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  options?: ChatNode['options'];
  recommendation?: ChatNode['recommendation'];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [chatTreeData, setChatTreeData] = useState<Record<string, ChatNode>>(chatTree);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { language } = useAppStore();
  const t = translations[language].chatbot;

  // Load chat tree from API on mount
  useEffect(() => {
    setIsLoading(true);
    fetchChatTree().then(tree => {
      setChatTreeData(tree);
      setIsLoading(false);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = () => {
    if (hasStarted) return;
    setHasStarted(true);
    const node = chatTreeData['start'];
    if (!node) return;
    setMessages([
      {
        id: Date.now(),
        text: node.message,
        sender: 'bot',
        options: node.options,
      },
    ]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasStarted) {
      setTimeout(startChat, 300);
    }
  };

  const handleOptionClick = (nextId: string, label: string) => {
    const node = chatTreeData[nextId];
    if (!node) return;

    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, options: undefined })), // hide previous options
      { id: Date.now(), text: label, sender: 'user' as const },
      {
        id: Date.now() + 1,
        text: node.message,
        sender: 'bot' as const,
        options: node.options,
        recommendation: node.recommendation,
      },
    ]);
  };

  const handleRecommendationClick = (productId: string) => {
    setIsOpen(false);
    navigate(`/customize/${productId}`);
  };

  const handleRestart = () => {
    setHasStarted(false);
    setMessages([]);
    setTimeout(() => {
      setHasStarted(true);
      const node = chatTreeData['start'];
      if (!node) return;
      setMessages([
        {
          id: Date.now(),
          text: node.message,
          sender: 'bot',
          options: node.options,
        },
      ]);
    }, 100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" id="chatbot-widget">
      {/* Chat Panel */}
      <div
        className={`absolute bottom-16 right-0 w-[370px] transition-all duration-500 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl shadow-gray-400/40 dark:shadow-gray-900/40 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.assistant}</p>
                <p className="text-xs text-white/80">{t.status}</p>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              title="Restart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-gray-50 dark:bg-gray-800">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 dark:text-gray-400 text-sm">{t.loading}</div>
              </div>
            )}
            {!isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 dark:text-gray-400 text-sm">{t.start}</div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-500 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Options */}
                {msg.options && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.nextId}
                        onClick={() => handleOptionClick(opt.nextId, opt.label)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-brand-500/40 text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:border-brand-500 transition-all duration-200"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {msg.recommendation && (
                  <div className="mt-3 pl-1">
                    <button
                      onClick={() => handleRecommendationClick(msg.recommendation!.productId)}
                      className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:from-brand-500 hover:to-accent-500 transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
                    >
                      {msg.recommendation.text}
                    </button>
                    <button
                      onClick={handleRestart}
                      className="mt-2 w-full px-3 py-2 text-xs text-surface-400 hover:text-surface-200 transition-colors"
                    >
                      {t.startOver}
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${
          isOpen
            ? 'bg-surface-700 dark:bg-surface-600 hover:bg-surface-600 dark:hover:bg-surface-500 rotate-0'
            : 'bg-gradient-to-br from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 animate-pulse-glow'
        }`}
        id="chatbot-toggle"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
