import IdolsImage from "../assets/images/categories/idols.jpg";
import DressImage from "../assets/images/categories/dresses.jpg";
import JewelryImage from "../assets/images/categories/jewelry.jpg";
import DecorativeImage from "../assets/images/categories/decorative.jpg";
import PujaItemsImage from "../assets/images/categories/puja-items.jpg";
import AccessoriesImage from "../assets/images/categories/accessories.jpg";

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
    image: IdolsImage,
    slug: "idols",
  },
  {
    id: "dresses",
    name: "Deity Dresses",
    description: "Beautiful and sacred dresses for deities",
    image: DressImage,
    slug: "deity-dresses",
  },
  {
    id: "jewelry",
    name: "Divine Jewelry",
    description: "Ornate jewelry and accessories for deities",
    image: JewelryImage,
    slug: "divine-jewelry",
  },
  {
    id: "decorative",
    name: "Decorative Items",
    description: "Decorative items for shrine and altar",
    image: DecorativeImage,
    slug: "decorative-items",
  },
  {
    id: "puja-items",
    name: "Puja Items",
    description: "Essential items for puja and ceremonies",
    image: PujaItemsImage,
    slug: "puja-items",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Various accessories for idols and shrine",
    image: AccessoriesImage,
    slug: "accessories",
  },
];
