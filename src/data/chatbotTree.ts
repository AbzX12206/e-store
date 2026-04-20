const API_BASE_URL = 'http://localhost:8080';

export interface ChatNode {
  id: string;
  message: string;
  options?: { label: string; nextId: string }[];
  recommendation?: { productId: string; text: string };
}

// Fetch chatbot tree from API with fallback to local
export async function fetchChatTree(): Promise<Record<string, ChatNode>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/tree`);
    if (!response.ok) throw new Error('Failed to fetch chat tree');
    const data = await response.json();
    return data.tree || chatTree;
  } catch (err) {
    console.warn('Using local chat tree fallback:', err);
    return chatTree;
  }
}

// Local fallback chat tree
export const chatTree: Record<string, ChatNode> = {
  start: {
    id: 'start',
    message: "Hi there! 👋 I'm the RUX assistant. I can help you find the perfect item. Who are you shopping for?",
    options: [
      { label: '🙋 Myself', nextId: 'self_type' },
      { label: '🎁 A gift', nextId: 'gift_type' },
      { label: '🏢 My team/company', nextId: 'team_type' },
    ],
  },

  // ── Self path ──
  self_type: {
    id: 'self_type',
    message: "Great taste starts here! What kind of item are you looking for?",
    options: [
      { label: '👕 T-Shirt', nextId: 'rec_tshirt' },
      { label: '🧥 Hoodie', nextId: 'rec_hoodie' },
      { label: '👔 Sweatshirt', nextId: 'rec_sweatshirt' },
      { label: '🧢 Cap', nextId: 'rec_cap' },
      { label: '☕ Mug', nextId: 'rec_mug' },
      { label: '📓 Notebook', nextId: 'rec_notebook' },
    ],
  },

  // ── Gift path ──
  gift_type: {
    id: 'gift_type',
    message: "Awesome, gifts are our specialty! What's the vibe you're going for?",
    options: [
      { label: '😎 Something cool to wear', nextId: 'gift_wearable' },
      { label: '🎨 Something creative & personal', nextId: 'gift_creative' },
      { label: '🤷 Not sure, surprise me!', nextId: 'rec_hoodie' },
    ],
  },
  gift_wearable: {
    id: 'gift_wearable',
    message: 'Nice! Wearables are always a hit. What fits best?',
    options: [
      { label: '👕 Classic T-Shirt', nextId: 'rec_tshirt' },
      { label: '🧥 Cozy Hoodie', nextId: 'rec_hoodie' },
      { label: '🧢 Stylish Cap', nextId: 'rec_cap' },
    ],
  },
  gift_creative: {
    id: 'gift_creative',
    message: 'Creative gifts are the best! Something for the desk or the kitchen?',
    options: [
      { label: '☕ Custom Mug', nextId: 'rec_mug' },
      { label: '📓 Custom Notebook', nextId: 'rec_notebook' },
    ],
  },

  // ── Team path ──
  team_type: {
    id: 'team_type',
    message: "Team merch! 🔥 Matching outfits or branded accessories?",
    options: [
      { label: '👕 Team T-Shirts', nextId: 'rec_tshirt' },
      { label: '🧥 Team Hoodies', nextId: 'rec_hoodie' },
      { label: '☕ Branded Mugs', nextId: 'rec_mug' },
    ],
  },

  // ── Recommendations ──
  rec_tshirt: {
    id: 'rec_tshirt',
    message: "Perfect pick! Our Classic Tee is a bestseller — soft cotton, vivid prints.",
    recommendation: { productId: 'tshirt-classic', text: '👕 Customize Classic Tee — 10 990 ₸' },
  },
  rec_hoodie: {
    id: 'rec_hoodie',
    message: "The Premium Hoodie is chef's kiss 🤌 — heavyweight, comfy, and looks amazing with custom designs.",
    recommendation: { productId: 'hoodie-premium', text: '🧥 Customize Premium Hoodie — 18 990 ₸' },
  },
  rec_cap: {
    id: 'rec_cap',
    message: "Snapback Cap — structured, bold, and fully customizable. A real head-turner!",
    recommendation: { productId: 'cap-snapback', text: '🧢 Customize Snapback Cap — 5 990 ₸' },
  },
  rec_mug: {
    id: 'rec_mug',
    message: "Our Ceramic Mug is a daily dose of your creativity. Glossy finish, dishwasher safe!",
    recommendation: { productId: 'mug-ceramic', text: '☕ Customize Ceramic Mug — 4 990 ₸' },
  },
  rec_notebook: {
    id: 'rec_notebook',
    message: "The Hardcover Notebook is perfect for creatives. Your cover, your rules.",
    recommendation: { productId: 'notebook-hardcover', text: '📓 Customize Hardcover Notebook — 2 000 ₸' },
  },
};
