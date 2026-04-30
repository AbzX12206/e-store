export interface ProductView {
  photoUrl: string;
  maskUrl?: string; // newmask PNG — same dimensions as photo — used for colour overlay
}

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
    front: ProductView;
    back?: ProductView;
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
      front: { photoUrl: '/mockups/tshirt-front.png', maskUrl: '/mockups/tshirt-front-newmask.png' },
      back:  { photoUrl: '/mockups/tshirt-back.png',  maskUrl: '/mockups/tshirt-back-newmask.png'  },
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
      front: { photoUrl: '/mockups/hoodie-front.png', maskUrl: '/mockups/hoodie-front-newmask.png' },
      back:  { photoUrl: '/mockups/hoodie-back.png',  maskUrl: '/mockups/hoodie-back-newmask.png'  },
    },
  },
  {
    id: 'mug-ceramic',
    name: 'Ceramic Mug',
    description: '11oz ceramic mug with glossy finish. Your morning, your design.',
    basePrice: 4990,
    availableSizes: ['11oz', '15oz'],
    availableColors: ['#ffffff'],
    category: 'accessories',
    emoji: '☕',
    views: {
      front: { photoUrl: '/mockups/mug-front.png', maskUrl: '/mockups/mug-front-newmask.png' },
      back:  { photoUrl: '/mockups/mug-back.png', maskUrl: '/mockups/mug-back-newmask.png'  },
    },
  },
  {
    id: 'cap-snapback',
    name: 'Snapback Cap',
    description: 'Structured snapback cap. Bold statement piece.',
    basePrice: 5990,
    availableSizes: ['One Size'],
    availableColors: ['#000000', '#ffffff', '#2d3436', '#e94560', '#0984e3', '#6c5ce7'],
    category: 'accessories',
    emoji: '🧢',
    views: {
      front: { photoUrl: '/mockups/cap.png', maskUrl: '/mockups/cap-newmask.png' },
    },
  },
  {
    id: 'notebook-hardcover',
    name: 'A5 Notebook',
    description: 'Hardcover A5 notebook, 200 lined pages. Capture every idea.',
    basePrice: 2000,
    availableSizes: ['A5'],
    availableColors: ['#000000', '#1a1a2e', '#2d3436', '#dfe6e9', '#6c5ce7'],
    category: 'accessories',
    emoji: '📓',
    views: {
      front: { photoUrl: '/mockups/notebook-shadow.png', maskUrl: '/mockups/notebook-newmask.png' },
    },
  },
];

export function getProductById(id: string): BaseProduct | undefined {
  return products.find((p) => p.id === id);
}
