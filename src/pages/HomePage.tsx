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
    <div className="min-h-screen bg-gray-50">
      <Hero />

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="text-primary">Shop</span> by Category
          </h2>
          <FeaturedCategories />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-primary">Products</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of trending products, carefully chosen to match your style and preferences.
            </p>
          </div>
          <ProductGrid />
        </div>
      </section>

      {/* Suggested Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Suggested <span className="text-primary">For You</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Based on your preferences and shopping history, we think you'll love these items.
            </p>
          </div>

          {loading ? (
            <div className="w-full h-48 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <span className="text-gray-600">Loading suggestions...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter and be the first to know about new products and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full border focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 
                  transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
