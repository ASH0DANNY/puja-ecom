import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  isSuggested?: boolean;
  products?: Product[];
}

const ProductGrid = ({
  title,
  subtitle,
  limit,
  isSuggested,
  products: propProducts,
}: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!propProducts);

  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Apply limit if specified
        const limitedProducts = limit
          ? productsList.slice(0, limit)
          : productsList;

        // Filter suggested products if isSuggested is true
        const filteredProducts = isSuggested
          ? limitedProducts.filter((product) => product.isSuggested)
          : limitedProducts;

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit, isSuggested, propProducts]);

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-2 sm:px-4 md:px-6">
        <div
          className={`grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 ${
            isSuggested
              ? "max-w-4xl mx-auto"
              : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          }`}
        >
          {products.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
