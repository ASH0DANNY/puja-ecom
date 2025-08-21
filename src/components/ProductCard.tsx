import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types/product";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedSize, selectedColor);
  };

  return (
    <div
      className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl 
        transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
              hover:bg-primary hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Add to wishlist functionality
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
              hover:bg-primary hover:text-white transition-colors"
            onClick={handleAddToCart}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>

        {/* Discount Tag */}
        {product.discountPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {`${Math.round(
              100 - ((product.discountPrice! / product.price) * 100)
            )}% OFF`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-4 h-4 ${index < Math.floor(product.rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
                  }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {product.sizes && (
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size:
            </label>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 text-sm border rounded ${selectedSize === size
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 hover:border-primary"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color:
            </label>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-2 py-1 text-sm border rounded ${selectedColor === color
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 hover:border-primary"
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-lg ${product.inStock
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
