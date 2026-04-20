export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  availableSizes: string[];
  availableColors: string[];
  category: string;
  emoji: string;
  views: {
    front: { maskUrl: string; shadowUrl: string; sheenUrl?: string };
    back?: { maskUrl: string; shadowUrl: string; sheenUrl?: string };
  };
}

export const products: BaseProduct[] = [
  {
    id: 'tshirt-classic',
    name: 'Classic Tee',
    description: 'Premium cotton crew neck t-shirt. Perfect canvas for your designs.',
    basePrice: 10990,
    availableSizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    availableColors: ['#ffffff', '#000000', '#1a1a2e', '#e94560', '#0f3460', '#533483', '#2b2d42', '#f8f9fa'],
    category: 'tops',
    emoji: '👕',
    views: {
      front: { maskUrl: '/mockups/tshirt-front-newmask.png', shadowUrl: '/mockups/tshirt-front.png', sheenUrl: '' },
      back: { maskUrl: '/mockups/tshirt-back-newmask.png', shadowUrl: '/mockups/tshirt-back.png', sheenUrl: '' },
    },
  },
  {
    id: 'hoodie-premium',
    name: 'Premium Hoodie',
    description: 'Heavyweight fleece hoodie with kangaroo pocket. Stay warm, stay styled.',
    basePrice: 18990,
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    availableColors: ['#000000', '#1a1a2e', '#2d3436', '#636e72', '#dfe6e9', '#6c5ce7', '#e17055'],
    category: 'tops',
    emoji: '🧥',
    views: {
      front: { maskUrl: '/mockups/hoodie-front-newmask.png', shadowUrl: '/mockups/hoodie-front.png', sheenUrl: '' },
      back: { maskUrl: '/mockups/hoodie-back-newmask.png', shadowUrl: '/mockups/hoodie-back.png', sheenUrl: '' },
    },
  },
  {
    id: 'cap-snapback',
    name: 'Snapback Cap',
    description: 'Structured snapback with flat brim. Bold statement piece.',
    basePrice: 5990,
    availableSizes: ['One Size'],
    availableColors: ['#000000', '#ffffff', '#2d3436', '#e84393', '#0984e3', '#6c5ce7'],
    category: 'accessories',
    emoji: '🧢',
    views: {
      front: { maskUrl: '/mockups/cap-front-mask.png', shadowUrl: '/mockups/cap-front-shadow.png', sheenUrl: '/mockups/cap-front-sheen.png' },
    },
  },
  {
    id: 'mug-ceramic',
    name: 'Ceramic Mug',
    description: '11oz ceramic mug with glossy finish. Your morning, your design.',
    basePrice: 4990,
    availableSizes: ['11oz', '15oz'],
    availableColors: ['#ffffff', '#000000', '#f8f9fa'],
    category: 'accessories',
    emoji: '☕',
    views: {
      front: { maskUrl: '/mockups/mug-front-newmask.png', shadowUrl: '/mockups/mug-front.png', sheenUrl: '' },
      back: { maskUrl: '/mockups/mug-back-newmask.png', shadowUrl: '/mockups/mug-back.png', sheenUrl: '' },
    },
  },
  {
    id: 'notebook-hardcover',
    name: 'Hardcover Notebook',
    description: '200-page lined notebook with custom hardcover. Capture every idea.',
    basePrice: 2000,
    availableSizes: ['A5'],
    availableColors: ['#000000', '#1a1a2e', '#2d3436', '#dfe6e9', '#6c5ce7'],
    category: 'accessories',
    emoji: '📓',
    views: {
      front: { maskUrl: '/mockups/notebook-newmask.png', shadowUrl: '/mockups/notebook-shadow.png', sheenUrl: '' },
    },
  },
];

export function getProductById(id: string): BaseProduct | undefined {
  return products.find((p) => p.id === id);
}
