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
    image:
      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/idol_d7ng8h.jpg",
    slug: "idols",
  },
  {
    id: "dresses",
    name: "Deity Dresses",
    description: "Beautiful and sacred dresses for deities",
    image:
      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/deity-dress_kngtmq.jpg",
    slug: "deity-dresses",
  },
  {
    id: "jewelry",
    name: "Divine Jewelry",
    description: "Ornate jewelry and accessories for deities",
    image:
      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/jewellery_nkwcut.jpg",
    slug: "divine-jewelry",
  },
  {
    id: "decorative",
    name: "Decorative Items",
    description: "Decorative items for shrine and altar",
    image:
      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/decorative_eznsk7.jpg",
    slug: "decorative-items",
  },
  {
    id: "puja-items",
    name: "Puja Items",
    description: "Essential items for puja and ceremonies",
    image:
      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/puja-items_hxwdfm.jpg",
    slug: "puja-items",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Various accessories for idols and shrine",
    image:
      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/accessories_fyxkbt.jpg",
    slug: "accessories",
  },
];
