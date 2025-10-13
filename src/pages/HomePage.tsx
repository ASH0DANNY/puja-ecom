import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import FeaturedCategories from "../components/FeaturedCategories";
import Carousel from "../components/Carousel";
import ProductCard from "../components/ProductCard";
import ProductGrid from "../components/ProductGrid";
import type { Product } from "../types/product";
import { useScrollToTop } from "../utils/scrollToTop";

const HomePage = () => {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

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
      <Carousel />

      {/* Featured Categories */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-gray-900">
                <span className="text-primary">Shop</span> by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
                Explore our diverse collection of products organized by
                categories
              </p>
            </div>
            <FeaturedCategories />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          {/* <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8"> */}
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-gray-900">
              Featured <span className="text-primary">Products</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
              Discover our handpicked selection of trending products, carefully
              chosen to match your style and preferences.
            </p>
          </div>
          <ProductGrid />
          {/* </div> */}
        </div>
      </section>

      {/* Suggested Products */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-gray-900">
                Suggested <span className="text-primary">For You</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
                Based on your preferences and shopping history, we think you'll
                love these items.
              </p>
            </div>

            {loading ? (
              <div className="w-full h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600 text-sm lg:text-base">
                    Loading suggestions...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {suggestedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl shadow-sm p-6 lg:p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-gray-900">
                Stay Updated
              </h2>
              <p className="text-gray-600 mb-8 text-sm lg:text-base">
                Subscribe to our newsletter and be the first to know about new
                products and exclusive offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 
                    transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
