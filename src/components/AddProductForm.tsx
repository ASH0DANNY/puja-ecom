import React, { useState } from "react";
import { uploadImages } from "../utils/cloudinary";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product } from "../types/product";
import { categories } from "../data/categories";

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  material: string;
  weight: string;
  dimensions: string;
  sku: string;
  stock: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  isFeatured: boolean;
  isSuggested: boolean;
  discountPrice: string;
  shipping: {
    width: string;
    height: string;
    depth: string;
    weight: string;
  };
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
    price: "",
    category: "",
    brand: "",
    material: "",
    weight: "",
    dimensions: "",
    sku: "",
    stock: "1",
    sizes: [],
    colors: [],
    tags: [],
    isFeatured: false,
    isSuggested: false,
    discountPrice: "",
    shipping: {
      width: "",
      height: "",
      depth: "",
      weight: "",
    },
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

    setLoading(true);
    try {
      // Upload product images
      const imageUrls = await uploadImages(productImages);

      const productData: Omit<Product, "id"> = {
        name: formData.name,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: imageUrls[0],
        images: imageUrls,
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        material: formData.material.trim(),
        weight: formData.weight.trim(),
        dimensions: formData.dimensions.trim(),
        sku: formData.sku.trim(),
        stock: Math.max(0, parseInt(formData.stock) || 0),
        isSuggested: formData.isSuggested,
        sales: 0,
        reviews: 0,
        hasCustomSize: formData.hasCustomSize,
      };

      await addDoc(collection(db, "products"), productData);
      onSuccess();

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        material: "",
        weight: "",
        dimensions: "",
        sku: "",
        stock: "1",
        sizes: [],
        colors: [],
        tags: [],
        isFeatured: false,
        isSuggested: false,
        discountPrice: "",
        shipping: {
          width: "",
          height: "",
          depth: "",
          weight: "",
        },
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

  const handleSizesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sizes = e.target.value.split(",").map((size) => size.trim());
    setFormData((prev) => ({ ...prev, sizes }));
  };

  const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colors = e.target.value.split(",").map((color) => color.trim());
    setFormData((prev) => ({ ...prev, colors }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [name]: value,
      },
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

      {/* Pricing and Stock */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Pricing and Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock
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
              htmlFor="dimensions"
              className="block text-sm font-medium text-gray-700"
            >
              Dimensions
            </label>
            <input
              id="dimensions"
              type="text"
              value={formData.dimensions}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dimensions: e.target.value }))
              }
              placeholder="e.g., 30cm x 20cm x 10cm"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700"
            >
              Weight
            </label>
            <input
              id="weight"
              type="text"
              value={formData.weight}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, weight: e.target.value }))
              }
              placeholder="e.g., 500g"
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
              htmlFor="sizes"
              className="block text-sm font-medium text-gray-700"
            >
              Sizes
            </label>
            <input
              id="sizes"
              type="text"
              value={formData.sizes.join(", ")}
              onChange={handleSizesChange}
              placeholder="S, M, L, XL"
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

      {/* Shipping Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Shipping Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="shipping-width"
              className="block text-sm font-medium text-gray-700"
            >
              Width (cm)
            </label>
            <input
              id="shipping-width"
              type="number"
              step="0.1"
              name="width"
              value={formData.shipping.width}
              onChange={handleShippingChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="shipping-height"
              className="block text-sm font-medium text-gray-700"
            >
              Height (cm)
            </label>
            <input
              id="shipping-height"
              type="number"
              step="0.1"
              name="height"
              value={formData.shipping.height}
              onChange={handleShippingChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="shipping-depth"
              className="block text-sm font-medium text-gray-700"
            >
              Depth (cm)
            </label>
            <input
              id="shipping-depth"
              type="number"
              step="0.1"
              name="depth"
              value={formData.shipping.depth}
              onChange={handleShippingChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="shipping-weight"
              className="block text-sm font-medium text-gray-700"
            >
              Weight (kg)
            </label>
            <input
              id="shipping-weight"
              type="number"
              step="0.1"
              name="weight"
              value={formData.shipping.weight}
              onChange={handleShippingChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
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
          When enabled, customers can enter their own custom dimensions (width, height, depth) during checkout. 
          Make sure to include "Custom" as a size option in the "Product Details" section above.
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
