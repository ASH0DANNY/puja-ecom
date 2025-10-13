import type { Product } from "../types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Radha Krishna Idol",
    description: "Beautiful brass Radha Krishna idol with antique finish",
    price: 2999,
    category: "idols",
    image: "/assets/images/products/radha-krishna.jpg",
    stock: 10,
    rating: 4.5,
    reviews: 25,
    featured: true
  },
  {
    id: "2",
    name: "Silk Deity Dress Set",
    description: "Pure silk dress set for deities with elegant embroidery",
    price: 1599,
    category: "dresses",
    image: "/assets/images/products/deity-dress.jpg",
    stock: 15,
    rating: 4.8,
    reviews: 18,
    featured: true
  },
  {
    id: "3",
    name: "Temple Jewelry Set",
    description: "Traditional temple jewelry set with pearls and stones",
    price: 3999,
    category: "jewelry",
    image: "/assets/images/products/temple-jewelry.jpg",
    stock: 8,
    rating: 4.7,
    reviews: 12,
    featured: true
  },
  {
    id: "4",
    name: "Brass Diya Stand",
    description: "Decorative brass diya stand with intricate designs",
    price: 899,
    category: "decorative",
    image: "/assets/images/products/diya-stand.jpg",
    stock: 20,
    rating: 4.3,
    reviews: 15
  },
  {
    id: "5",
    name: "Puja Thali Set",
    description: "Complete brass puja thali set with all accessories",
    price: 1299,
    category: "puja-items",
    image: "/assets/images/products/puja-thali.jpg",
    stock: 25,
    rating: 4.6,
    reviews: 30,
    featured: true
  },
  {
    id: "6",
    name: "Deity Crown",
    description: "Handcrafted golden deity crown with stones",
    price: 2499,
    category: "accessories",
    image: "/assets/images/products/deity-crown.jpg",
    stock: 12,
    rating: 4.9,
    reviews: 22
  }
];