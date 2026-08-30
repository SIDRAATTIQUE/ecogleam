export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  weight: string;
  ingredients: string[];
  image: string;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "pine-cedarwood",
    name: "Pine & Cedarwood",
    tagline: "Forest-inspired purification and balance",
    price: 350,
    weight: "125g",
    ingredients: ["Saponified Oils", "Pine Extract", "Cedarwood Oil", "Green Clay"],
    image: "/images/pine-cedarwood.jpg",
    badge: "Bestseller",
  },
  {
    id: "lavender-chamomile",
    name: "Lavender & Chamomile",
    tagline: "Gentle relaxation for sensitive skin",
    price: 350,
    weight: "125g",
    ingredients: ["Colloidal Oats", "Lavender Oil", "Chamomile Extract", "Shea Butter"],
    image: "/images/lavender-chamomile.jpg",
  },
  {
    id: "honey-oat",
    name: "Honey & Organic Oat",
    tagline: "Nourishing, gentle daily exfoliation",
    price: 350,
    weight: "125g",
    ingredients: ["Raw Honey", "Rolled Oats", "Sweet Almond Oil", "Jojoba Oil"],
    image: "/images/honey-oat.jpg",
    badge: "Popular",
  },
  {
    id: "activated-charcoal",
    name: "Activated Charcoal",
    tagline: "Deep pore detox with peppermint cooling",
    price: 350,
    weight: "125g",
    ingredients: ["Bamboo Charcoal", "Peppermint Oil", "Tea Tree Extract"],
    image: "/images/charcoal.jpg",
  },
  {
    id: "rose-pink-clay",
    name: "Rose & Pink Clay",
    tagline: "Hydrating and restorative care for delicate skin",
    price: 350,
    weight: "125g",
    ingredients: ["French Pink Clay", "Rosehip Oil", "Rose Petals", "Cocoa Butter"],
    image: "/images/rose-clay.jpg",
    badge: "New",
  },
  {
    id: "eucalyptus-sea-salt",
    name: "Eucalyptus & Sea Salt",
    tagline: "Mineralizing exfoliation and skin recovery",
    price: 350,
    weight: "125g",
    ingredients: ["Pacific Sea Salt", "Eucalyptus Oil", "Spirulina", "Coconut Oil"],
    image: "/images/eucalyptus-salt.jpg",
  },
];