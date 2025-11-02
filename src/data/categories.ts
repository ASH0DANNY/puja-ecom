export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: "idols",
    name: "Idols",
    description: "Sacred idols for worship and decoration",
    image: "src/assets/images/categories/idols.jpg",
    slug: "idols",
  },
  {
    id: "dresses",
    name: "Deity Dresses",
    description: "Beautiful and sacred dresses for deities",
    image: "src/assets/images/categories/dresses.jpg",
    slug: "deity-dresses",
  },
  {
    id: "jewelry",
    name: "Divine Jewelry",
    description: "Ornate jewelry and accessories for deities",
    image: "src/assets/images/categories/jewelry.jpg",
    slug: "divine-jewelry",
  },
  {
    id: "decorative",
    name: "Decorative Items",
    description: "Decorative items for shrine and altar",
    image: "src/assets/images/categories/decorative.jpg",
    slug: "decorative-items",
  },
  {
    id: "puja-items",
    name: "Puja Items",
    description: "Essential items for puja and ceremonies",
    image: "src/assets/images/categories/puja-items.jpg",
    slug: "puja-items",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Various accessories for idols and shrine",
    image: "src/assets/images/categories/accessories.jpg",
    slug: "accessories",
  },
];
