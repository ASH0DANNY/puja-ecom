import React, { useState } from "react";
import { uploadImages } from "../utils/cloudinary";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product, SizeWithPrice } from "../types/product";
import { categories } from "../data/categories";
import {
  Trash2,
  Plus,
  Package,
  FileText,
  Settings,
  Tag,
  Ruler,
  Palette,
  Hash,
  Box,
  Loader2,
} from "lucide-react";

interface FormData {
  name: string;
  description: string;
  category: string;
  brand: string;
  material: string;
  sku: string;
  stock: string;
  sizesWithPrices: SizeWithPrice[];
  colors: string[];
  tags: string[];
  isFeatured: boolean;
  isSuggested: boolean;
  hasCustomSize: boolean;
}

interface AddProductFormProps {
  onSuccess: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    brand: "",
    material: "",
    sku: "",
    stock: "1",
    sizesWithPrices: [],
    colors: [],
    tags: [],
    isFeatured: false,
    isSuggested: false,
    hasCustomSize: false,
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productImages.length === 0) {
      alert("Please select at least one product image");
      return;
    }

    if (formData.sizesWithPrices.length === 0) {
      alert("Please add at least one size with price");
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImages(productImages);
      const basePrice = formData.sizesWithPrices[0].price || 0;

      const productData: Omit<Product, "id"> = {
        name: formData.name,
        description: formData.description.trim(),
        price: basePrice,
        image: imageUrls[0],
        images: imageUrls,
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        material: formData.material.trim(),
        sku: formData.sku.trim(),
        stock: Math.max(0, parseInt(formData.stock) || 0),
        isSuggested: formData.isSuggested,
        sales: 0,
        reviews: 0,
        hasCustomSize: formData.hasCustomSize,
        sizesWithPrices: formData.sizesWithPrices,
      };

      await addDoc(collection(db, "products"), productData);
      onSuccess();

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        brand: "",
        material: "",
        sku: "",
        stock: "1",
        sizesWithPrices: [],
        colors: [],
        tags: [],
        isFeatured: false,
        isSuggested: false,
        hasCustomSize: false,
      });
      setProductImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files);
      setProductImages((prevImages) => [...prevImages, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prevPreviews) => [
            ...prevPreviews,
            reader.result as string,
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colors = e.target.value.split(",").map((color) => color.trim());
    setFormData((prev) => ({ ...prev, colors }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData((prev) => ({ ...prev, tags }));
  };

  const addSizeWithPrice = () => {
    setFormData((prev) => ({
      ...prev,
      sizesWithPrices: [...prev.sizesWithPrices, { size: "", price: 0 }],
    }));
  };

  const removeSizeWithPrice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizesWithPrices: prev.sizesWithPrices.filter((_, i) => i !== index),
    }));
  };

  const handleSizeChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      sizesWithPrices: prev.sizesWithPrices.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "price" ? parseFloat(String(value)) || 0 : value,
            }
          : item
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-3">
        <div className="max-w-4xl mx-auto space-y-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-6">
              <Package className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <FileText className="w-4 h-4" />
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Hash className="w-4 h-4" />
                  SKU
                </label>
                <input
                  id="sku"
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Tag className="w-4 h-4" />
                  Brand
                </label>
                <input
                  id="brand"
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Box className="w-4 h-4" />
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <FileText className="w-4 h-4" />
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-6">
              <Package className="w-5 h-5" />
              Stock Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="stock"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Package className="w-4 h-4" />
                  Stock Quantity
                </label>
                <input
                  id="stock"
                  type="number"
                  required
                  min="1"
                  value={formData.stock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      stock: Math.max(0, value).toString(),
                    }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter stock quantity"
                />
              </div>

              <div>
                <label
                  htmlFor="material"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Box className="w-4 h-4" />
                  Material
                </label>
                <input
                  id="material"
                  type="text"
                  value={formData.material}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      material: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="e.g., Cotton, Polyester"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-6">
              <Palette className="w-5 h-5" />
              Product Variants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="colors"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Palette className="w-4 h-4" />
                  Colors
                </label>
                <input
                  id="colors"
                  type="text"
                  value={formData.colors.join(", ")}
                  onChange={handleColorsChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Red, Blue, Green"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Fashion, Summer, New"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate with commas
                </p>
              </div>
            </div>
          </div>

          {/* Sizes with Prices */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
              <Ruler className="w-5 h-5" />
              Product Sizes & Pricing
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Add different sizes with their respective prices, dimensions, and
              weight
            </p>

            {formData.sizesWithPrices.length > 0 && (
              <div className="space-y-4 mb-6">
                {formData.sizesWithPrices.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size
                        </label>
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) =>
                            handleSizeChange(index, "size", e.target.value)
                          }
                          placeholder="e.g., S, M, L, XL, Custom"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            handleSizeChange(index, "price", e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          value={item.dimensions || ""}
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "dimensions",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 30cm x 20cm x 10cm"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight
                        </label>
                        <input
                          type="text"
                          value={item.weight || ""}
                          onChange={(e) =>
                            handleSizeChange(index, "weight", e.target.value)
                          }
                          placeholder="e.g., 500g"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSizeWithPrice(index)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Size
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addSizeWithPrice}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Size & Rate
            </button>
          </div>

          {/* Custom Size Feature */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
              <Ruler className="w-5 h-5" />
              Custom Size Option
            </h2>
            <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="hasCustomSize"
                checked={formData.hasCustomSize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hasCustomSize: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary mt-1"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Allow custom dimensions
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  Customers can enter their own custom dimensions (width,
                  height, depth) during checkout
                </span>
              </div>
            </label>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
              <Package className="w-5 h-5" />
              Product Images
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="image"
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit"
                >
                  <Plus className="w-5 h-5" />
                  Choose Images
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  required
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload high-quality images of your product
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProductImages((prevImages) =>
                            prevImages.filter((_, i) => i !== index)
                          );
                          setImagePreviews((prevPreviews) =>
                            prevPreviews.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Settings */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-4">
              <Settings className="w-5 h-5" />
              Product Settings
            </h2>
            <div className="space-y-3">
              <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary mt-1"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    Featured Product
                  </span>
                  <span className="block text-sm text-gray-600 mt-1">
                    Display this product in the featured section
                  </span>
                </div>
              </label>

              <label className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  id="isSuggested"
                  checked={formData.isSuggested}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isSuggested: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary mt-1"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    Suggested Product
                  </span>
                  <span className="block text-sm text-gray-600 mt-1">
                    Show this product in recommendations
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
