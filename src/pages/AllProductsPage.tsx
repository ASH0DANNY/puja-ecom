import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import { useScrollToTop } from "../utils/scrollToTop";

type ViewType = "featured" | "suggested";

const AllProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>("featured");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
    // Check if type is specified in query params
    const typeParam = searchParams.get("type") as ViewType | null;
    if (typeParam && (typeParam === "featured" || typeParam === "suggested")) {
      fetchProducts(typeParam);
      setViewType(typeParam);
    } else {
      fetchProducts("featured");
    }
  }, [searchParams]);

  const fetchProducts = async (type: ViewType) => {
    try {
      setLoading(true);
      const productsCollection = collection(db, "products");

      let q;
      if (type === "suggested") {
        q = query(productsCollection, where("isSuggested", "==", true));
      } else {
        // Featured products - fetch all and we'll handle the distinction
        q = query(productsCollection);
      }

      const snapshot = await getDocs(q);
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (type: ViewType) => {
    setViewType(type);
    fetchProducts(type);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {viewType === "featured" ? "Featured" : "Suggested"} Products
          </h1>
          <p className="text-gray-600">
            {viewType === "featured"
              ? "Discover our handpicked selection of trending products"
              : "Based on your preferences and shopping history"}
          </p>
        </div>

        {/* View Type Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleViewChange("featured")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              viewType === "featured"
                ? "bg-primary text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-primary"
            }`}
          >
            Featured Products
          </button>
          <button
            onClick={() => handleViewChange("suggested")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              viewType === "suggested"
                ? "bg-primary text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-primary"
            }`}
          >
            Suggested Products
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Results Counter */}
        {!loading && products.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            <p>Showing {products.length} products</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;
