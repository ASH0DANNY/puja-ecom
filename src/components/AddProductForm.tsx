import React, { useState } from "react";
import { uploadImages } from "../utils/cloudinary";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product, SizeWithPrice } from "../types/product";
import { categories } from "../data/categories";
import { Trash2, Plus } from "lucide-react";

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
      // Upload product images
      const imageUrls = await uploadImages(productImages);

      // Use the first size's price as the base price
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

      // Create image previews
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="sku"
              className="block text-sm font-medium text-gray-700"
            >
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700"
            >
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
              className="block text-sm font-medium text-gray-700"
            >
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
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock Quantity
            </label>
            <input
              id="stock"
              type="number"
              required
              min="1"
              defaultValue="1"
              value={formData.stock}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setFormData((prev) => ({
                  ...prev,
                  stock: Math.max(0, value).toString(),
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Product Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="material"
              className="block text-sm font-medium text-gray-700"
            >
              Material
            </label>
            <input
              id="material"
              type="text"
              value={formData.material}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, material: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags.join(", ")}
              onChange={handleTagsChange}
              placeholder="Fashion, Summer, New"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="colors"
              className="block text-sm font-medium text-gray-700"
            >
              Colors
            </label>
            <input
              id="colors"
              type="text"
              value={formData.colors.join(", ")}
              onChange={handleColorsChange}
              placeholder="Red, Blue, Green"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Sizes with Different Rates */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Product Sizes with Rates & Dimensions
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add different sizes with their respective prices, dimensions, and
          weight
        </p>

        {formData.sizesWithPrices.length > 0 && (
          <div className="space-y-4 mb-4">
            {formData.sizesWithPrices.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={item.size}
                      onChange={(e) =>
                        handleSizeChange(index, "size", e.target.value)
                      }
                      placeholder="e.g., S, M, L, XL, Custom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={item.dimensions || ""}
                      onChange={(e) =>
                        handleSizeChange(index, "dimensions", e.target.value)
                      }
                      placeholder="e.g., 30cm x 20cm x 10cm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={item.weight || ""}
                      onChange={(e) =>
                        handleSizeChange(index, "weight", e.target.value)
                      }
                      placeholder="e.g., 500g"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSizeWithPrice(index)}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Size & Rate
        </button>
      </div>

      {/* Custom Size Feature */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Custom Size Feature
        </h3>
        <div className="flex items-center">
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
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label
            htmlFor="hasCustomSize"
            className="ml-2 block text-sm font-medium text-gray-900"
          >
            Allow customers to specify custom dimensions for this product
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          When enabled, customers can enter their own custom dimensions (width,
          height, depth) during checkout. Make sure to include "Custom" as a
          size option in the "Product Sizes with Rates" section above.
        </p>
      </div>

      {/* Image Upload */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Product Image
        </h3>
        <div className="space-y-4">
          <input
            id="image"
            type="file"
            accept="image/*"
            multiple
            required
            onChange={handleImageChange}
            className="mb-2"
          />
          <p className="text-sm text-gray-500 mb-4">
            Upload a high-quality image of your product
          </p>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
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
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Product Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
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
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="isFeatured"
              className="ml-2 block text-sm text-gray-900"
            >
              Featured Product
            </label>
          </div>

          <div className="flex items-center">
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
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="isSuggested"
              className="ml-2 block text-sm text-gray-900"
            >
              Suggested Product
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          }`}
      >
        {loading ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
};

export default AddProductForm;
