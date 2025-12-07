import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

const RelatedProducts = ({
  currentProductId,
  category,
}: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Query all products in the same category
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("category", "==", category));
        const querySnapshot = await getDocs(q);

        // Map documents and filter out the current product
        const products = querySnapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Product)
          )
          .filter((product) => product.id !== currentProductId);

        setRelatedProducts(products);
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, category]);

  // Hide section if no related products
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't render anything if no related products
  }

  return (
    <div className="mt-16 border-t border-gray-200 pt-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
        Related Products
      </h2>

      {/* Horizontal Scrollable Container */}
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 min-w-min">
          {relatedProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[170px] sm:w-[220px] md:w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RelatedProducts;
