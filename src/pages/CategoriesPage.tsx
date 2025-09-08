import { useEffect } from "react";
import { useScrollToTop } from "../utils/scrollToTop";
import {
  Grid3X3,
  ArrowRight,
  Baby,
  Gem,
  Shirt,
  Crown,
  Heart,
  Star,
} from "lucide-react";

const CategoriesPage = () => {
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

  const categories = [
    {
      id: 1,
      name: "Women's Fashion",
      description: "Dresses, tops, shoes, and accessories for women",
      icon: Crown,
      itemCount: 245,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      hoverColor: "hover:bg-pink-100",
    },
    {
      id: 2,
      name: "Men's Fashion",
      description: "Shirts, pants, shoes, and accessories for men",
      icon: Shirt,
      itemCount: 189,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
    },
    {
      id: 3,
      name: "Kids' Fashion",
      description: "Clothing and accessories for children",
      icon: Baby,
      itemCount: 156,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
    },
    {
      id: 4,
      name: "Accessories",
      description: "Bags, jewelry, watches, and more",
      icon: Gem,
      itemCount: 298,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
    },
    {
      id: 5,
      name: "Footwear",
      description: "Shoes, boots, sneakers for all occasions",
      icon: Star,
      itemCount: 167,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
    },
    {
      id: 6,
      name: "Premium Collection",
      description: "Luxury items and exclusive designs",
      icon: Heart,
      itemCount: 89,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
    },
  ];

  const featuredCategories = [
    {
      name: "New Arrivals",
      description: "Fresh styles just in",
      items: 45,
      badge: "NEW",
    },
    {
      name: "Sale Items",
      description: "Up to 70% off",
      items: 120,
      badge: "SALE",
    },
    {
      name: "Trending Now",
      description: "Most popular items",
      items: 78,
      badge: "HOT",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Grid3X3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Shop by Categories
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Discover our complete collection organized by category
              </p>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredCategories.map((category, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg p-4 hover:from-primary/20 hover:to-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      category.badge === "NEW"
                        ? "bg-green-100 text-green-800"
                        : category.badge === "SALE"
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {category.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {category.description}
                </p>
                <p className="text-xs text-gray-500">{category.items} items</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Categories */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            All Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`${category.bgColor} rounded-xl p-6 border border-gray-100 ${category.hoverColor} transition-all duration-200 cursor-pointer group hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${category.color} p-3 rounded-lg shadow-sm`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.itemCount} items
                  </span>
                  <button className="text-primary font-medium text-sm hover:text-primary/80 transition-colors">
                    Explore →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {categories.reduce((sum, cat) => sum + cat.itemCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-gray-600">New Arrivals</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">Free</div>
              <div className="text-sm text-gray-600">Shipping</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
