import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="absolute w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-5 h-5 ${index < Math.floor(product.rating)
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
              <span className="text-gray-600">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div>
            <p className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-gray-600 mt-4">{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${selectedSize === size
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

          {/* Color Selection */}
          {product.colors && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md ${selectedColor === color
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

          {/* Quantity Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 border rounded-md hover:border-primary"
              >
                -
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 border rounded-md hover:border-primary"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-4 rounded-lg text-lg font-semibold ${product.inStock
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {isAdded
                ? "✓ Added to Cart"
                : product.inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
            </button>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Product Details</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Category: {product.category}</li>
                {product.sizes && (
                  <li>Available Sizes: {product.sizes.join(", ")}</li>
                )}
                {product.colors && (
                  <li>Available Colors: {product.colors.join(", ")}</li>
                )}
                <li>
                  Stock Status: {product.inStock ? "In Stock" : "Out of Stock"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
