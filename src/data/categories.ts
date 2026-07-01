import IdolsImage from "../assets/images/categories/idols.jpg";
import DressImage from "../assets/images/categories/dresses.jpg";
import JewelryImage from "../assets/images/categories/jewelry.jpg";
import DecorativeImage from "../assets/images/categories/decorative.jpg";
import PujaItemsImage from "../assets/images/categories/puja-items.jpg";
import AccessoriesImage from "../assets/images/categories/accessories.jpg";
import FurnitureImage from "../assets/images/categories/laddu-gopal-furniture.png";
import ladduGopalBisterImage from "../assets/images/categories/Laddu Gopal Bister.png";
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
    name: "laddu gopal dresss",
    description: "Sacred idols for worship and decoration",
    image: IdolsImage,
    slug: "idols",
  },
  {
    id: "dresses",
    name: "laddu gopal pagdi",
    description: "Beautiful and sacred dresses for deities",
    image: DressImage,
    slug: "deity-dresses",
  },
  {
    id: "jewelry",
    name: "laddu gopal jewelry",
    description: "Ornate jewelry and accessories for deities",
    image: JewelryImage,
    slug: "jewelry",
  },
  {
    id: "decorative",
    name: "God Dresses",
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
  {
    id: "laddu-gopal-bister",
    name: "Laddu Gopal Bister",
    description: "Bister and related items for Laddu Gopal",
    image: ladduGopalBisterImage,
    slug: "laddu-gopal-bister",
  },
  {
    id: "laddu-gopal-furniture",
    name: "Laddu Gopal Furniture",
    description: "Furniture and decorative items for Laddu Gopal",
    image: FurnitureImage,
    slug: "laddu-gopal-furniture",
  },
];
