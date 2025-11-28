import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReduxCart } from "../redux/useReduxCart";
import type { Product, CustomDimensions } from "../types/product";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useScrollToTop } from "../utils/scrollToTop";
import CustomSizeSelector from "../components/CustomSizeSelector";
import RelatedProducts from "../components/RelatedProducts";
import FeaturesSection from "../components/FeaturesSection";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedCustomDimensions, setSelectedCustomDimensions] =
    useState<CustomDimensions>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useReduxCart();
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoChanging, setIsAutoChanging] = useState(true);
  const scrollToTop = useScrollToTop();

  // Get all product images including main image and additional images
  const getProductImages = (product: Product): string[] => {
    if (product.images && product.images.length > 0) {
      // Return images array if it already includes the main image
      if (product.images.includes(product.image)) {
        return product.images;
      }
      // Otherwise return main image followed by additional images
      return [product.image, ...product.images];
    }
    // If no additional images, return array with just the main image
    return [product.image];
  };

  useEffect(() => {
    scrollToTop();
  }, []);

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

  // Auto-change images
  useEffect(() => {
    if (!product || !isAutoChanging) return;

    const images = getProductImages(product);
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [product, isAutoChanging]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  // const discountPercentage = hasDiscount
  //   ? Math.round(
  //       ((product.price - product.discountPrice!) / product.price) * 100
  //     )
  //   : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor, selectedCustomDimensions);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoChanging(false);
    // Resume auto-changing after 10 seconds of inactivity
    setTimeout(() => setIsAutoChanging(true), 10000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 shadow-lg">
            <img
              src={images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    handleImageChange(
                      currentImageIndex === 0
                        ? images.length - 1
                        : currentImageIndex - 1
                    )
                  }
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    handleImageChange(
                      currentImageIndex === images.length - 1
                        ? 0
                        : currentImageIndex + 1
                    )
                  }
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-primary shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Auto-change Toggle */}
          {images.length > 1 && (
            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isAutoChanging}
                  onChange={(e) => setIsAutoChanging(e.target.checked)}
                  className="rounded"
                />
                <span>Auto-change images</span>
              </label>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                {product.brand}
              </p>
              <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {/* <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(product.rating)
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
              <span className="text-sm text-gray-600 font-medium">
                {product.rating}
              </span>
              <span className="text-sm text-gray-500">
                ({product.reviews || 0} reviews)
              </span>
            </div> */}

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <p className="text-3xl lg:text-2xl font-bold text-gray-700 ">
                ₹
                {selectedSize && product.sizesWithPrices && product.sizesWithPrices.length > 0
                  ? product.sizesWithPrices.find(s => s.size === selectedSize)?.price.toFixed(2) || product.price.toFixed(2)
                  : product.price.toFixed(2)}
              </p>
              {hasDiscount && !selectedSize && (
                <p className="text-xl text-gray-500 line-through">
                  {product.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.stock && product.stock > 0
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  product.stock && product.stock > 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {product.stock && product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-full overflow-hidden">
            <p className="text-gray-700 leading-relaxed break-words whitespace-normal">
              {product.description}
            </p>
          </div>

          {/* Size Selection with Prices */}
          {product.sizesWithPrices && product.sizesWithPrices.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Size
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.sizesWithPrices.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`relative p-4 border-2 rounded-lg transition-all text-center ${
                      selectedSize === sizeOption.size
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-gray-300 hover:border-primary hover:shadow-sm"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {sizeOption.size}
                    </div>
                    <div className="text-primary font-bold mt-1">
                      ₹{sizeOption.price.toFixed(2)}
                    </div>
                    {sizeOption.weight && (
                      <div className="text-xs text-gray-600 mt-2">
                        {sizeOption.weight}
                      </div>
                    )}
                    {sizeOption.dimensions && (
                      <div className="text-xs text-gray-600">
                        {sizeOption.dimensions}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : product.sizes && product.sizes.length > 0 ? (
            <CustomSizeSelector
              product={product}
              onSelectSize={(size, customDimensions) => {
                setSelectedSize(size);
                setSelectedCustomDimensions(customDimensions);
              }}
              selectedSize={selectedSize}
              selectedCustomDimensions={selectedCustomDimensions}
            />
          ) : null}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border-2 rounded-lg font-medium transition-all capitalize ${
                      selectedColor === color
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-gray-300 hover:border-primary hover:shadow-sm"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-semibold text-lg"
              >
                −
              </button>
              <span className="text-2xl font-semibold min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={quantity >= product.stock}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock <= 0}
              className={`w-full py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] ${
                product.stock && product.stock > 0
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              {isAdded
                ? "✓ Added to Cart"
                : product.stock && product.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          </div>

          {/* Product Information */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Product Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600 capitalize">
                    {product.category}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Brand:</span>
                  <span className="ml-2 text-gray-600">{product.brand}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Material:</span>
                  <span className="ml-2 text-gray-600">{product.material}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Weight:</span>
                  <span className="ml-2 text-gray-600">
                    {selectedSize && product.sizesWithPrices && product.sizesWithPrices.length > 0
                      ? product.sizesWithPrices.find(s => s.size === selectedSize)?.weight || product.weight || "N/A"
                      : product.weight || "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Dimensions:</span>
                  <span className="ml-2 text-gray-600">
                    {selectedSize && product.sizesWithPrices && product.sizesWithPrices.length > 0
                      ? product.sizesWithPrices.find(s => s.size === selectedSize)?.dimensions || product.dimensions || "N/A"
                      : product.dimensions || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-600 font-mono">
                    {product.sku}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-gray-700 block mb-2">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection variant="product-details" />

      {/* Related Products Section */}
      {product && (
        <RelatedProducts
          currentProductId={product.id}
          category={product.category}
        />
      )}
    </div>
  );
};

export default ProductDetails;
