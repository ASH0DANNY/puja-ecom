import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import FeaturedCategories from "../components/FeaturedCategories";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import ProductGrid from "../components/ProductGrid";
import type { Product } from "../types/product";

const HomePage = () => {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isSuggested", "==", true)
        );
        const suggestedSnapshot = await getDocs(q);
        const suggestedData = suggestedSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Product)
        );
        setSuggestedProducts(suggestedData);
      } catch (error) {
        console.error("Error fetching suggested products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, []);

  return (
    <div className="space-y-12">
      <Hero />
      <FeaturedCategories />
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <ProductGrid />
      </div>
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-3xl font-bold mb-8">Suggested Products For You</h2>
        {loading ? (
          <div className="w-full h-48 flex items-center justify-center">
            Loading suggested products...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
