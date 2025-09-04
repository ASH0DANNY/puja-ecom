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
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If product has sizes or colors and we're on mobile, show modal
    if ((product.sizes?.length || product.colors?.length) && window.innerWidth < 768) {
      setShowModal(true);
    } else {
      // On desktop or products without variants, add directly
      addToCart(product, 1, selectedSize, selectedColor);
    }
  };

  const handleModalAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedSize, selectedColor);
    setShowModal(false);
  };

  return (
    <>
      <div
        className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md 
          transition-all duration-300 transform hover:-translate-y-1 cursor-pointer w-full"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden" style={{ height: "180px" }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-gray-600 text-xs line-clamp-1">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-3 h-3 ${index < Math.floor(product.rating)
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

          {/* Size & Color Selection - Only visible on desktop */}
          <div className="hidden md:block">
            {product.sizes && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size:
                </label>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(color);
                      }}
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
          </div>

          <div className="flex flex-col mt-auto">
            <div className="mb-1 md:mb-2">
              <span className="text-base md:text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="ml-1 md:ml-2 text-xs md:text-sm line-through text-gray-400">
                  ${product.discountPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-1.5 md:py-2 rounded text-xs md:text-sm font-medium ${product.inStock
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Selection Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {product.sizes && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 text-sm border rounded-lg ${selectedSize === size
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Color:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 text-sm border rounded-lg ${selectedColor === color
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

            <button
              onClick={handleModalAddToCart}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
