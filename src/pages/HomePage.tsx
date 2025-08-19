import FeaturedCategories from "../components/FeaturedCategories";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import ProductGrid from "../components/ProductGrid";
import { products } from "../data/products";

const HomePage = () => {
  const suggestedProducts = products.filter((product) => product.isSuggested);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
