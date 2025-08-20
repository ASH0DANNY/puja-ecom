import { useState } from 'react';
import { uploadImage } from '../utils/cloudinary';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Product } from '../types/product';

interface AddProductFormProps {
  onSuccess: () => void;
}

export const AddProductForm = ({ onSuccess }: AddProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    sizes: [] as string[],
    colors: [] as string[],
  });
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image');
      return;
    }

    setLoading(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImage(image);

      // Create product in Firestore
      const productData: Omit<Product, 'id'> = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        inStock: parseInt(formData.stock) > 0,
        stock: parseInt(formData.stock),
        sales: 0,
        rating: 0,
        reviewCount: 0,
        isSuggested: false,
      };

      await addDoc(collection(db, 'products'), productData);
      onSuccess();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        sizes: [],
        colors: [],
      });
      setImage(null);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSizesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sizes = e.target.value.split(',').map(size => size.trim());
    setFormData(prev => ({ ...prev, sizes }));
  };

  const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colors = e.target.value.split(',').map(color => color.trim());
    setFormData(prev => ({ ...prev, colors }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          required
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stock</label>
        <input
          type="number"
          required
          min="0"
          value={formData.stock}
          onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Sizes (comma-separated)</label>
        <input
          type="text"
          value={formData.sizes.join(', ')}
          onChange={handleSizesChange}
          placeholder="S, M, L, XL"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Colors (comma-separated)</label>
        <input
          type="text"
          value={formData.colors.join(', ')}
          onChange={handleColorsChange}
          placeholder="Red, Blue, Green"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={handleImageChange}
          className="mt-1 block w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Adding Product...' : 'Add Product'}
      </button>
    </form>
  );
};
