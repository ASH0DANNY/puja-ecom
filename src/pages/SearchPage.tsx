import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../config/firebase";
import ProductGrid from "../components/ProductGrid";
import type { Product } from "../types/product";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useScrollToTop } from "../utils/scrollToTop";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      const results = productsList.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          (product.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          ) ??
            false)
      );

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              const timeoutId = setTimeout(() => {
                handleSearch(e.target.value);
              }, 300);
              return () => clearTimeout(timeoutId);
            }}
            placeholder="Search products by name or category..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoFocus
          />
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {searchResults.length > 0 ? (
        <ProductGrid products={searchResults} />
      ) : searchQuery ? (
        <div className="text-center text-gray-500 py-8">
          No products found matching "{searchQuery}"
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Start typing to search for products
        </div>
      )}
    </div>
  );
};

export default SearchPage;
