import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product } from "../types/product";
import type { Section } from "../types/section";
import { Plus, X, GripVertical, Eye, EyeOff } from "lucide-react";

const HomepageManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [customSections, setCustomSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, "products"));
      const allProducts = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(allProducts);
      setFeaturedProducts(allProducts.filter((p) => p.isFeatured));
      setSuggestedProducts(allProducts.filter((p) => p.isSuggested));

      // Fetch custom sections
      const sectionsSnapshot = await getDocs(collection(db, "sections"));
      const sectionsData = sectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Section[];
      setCustomSections(sectionsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (
    productId: string,
    field: "isFeatured" | "isSuggested"
  ) => {
    try {
      const productRef = doc(db, "products", productId);
      const productToUpdate = products.find((p) => p.id === productId);

      if (!productToUpdate) return;

      await updateDoc(productRef, {
        [field]: !productToUpdate[field],
      });

      await fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setSectionForm({
      name: section.name,
      description: section.description || "",
    });
    setShowNewSectionForm(true);
  };

  const resetForm = () => {
    setEditingSectionId(null);
    setSectionForm({ name: "", description: "" });
    setShowNewSectionForm(false);
  };

  const saveSection = async () => {
    if (!sectionForm.name.trim()) return;

    try {
      if (editingSectionId) {
        // Update existing section
        await updateDoc(doc(db, "sections", editingSectionId), {
          name: sectionForm.name,
          description: sectionForm.description,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Create new section
        const sectionData = {
          name: sectionForm.name,
          description: sectionForm.description,
          productIds: [],
          order: customSections.length,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        await addDoc(collection(db, "sections"), sectionData);
      }
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;

    try {
      await deleteDoc(doc(db, "sections", sectionId));
      await fetchData();
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const toggleSectionProduct = async (sectionId: string, productId: string) => {
    try {
      const section = customSections.find((s) => s.id === sectionId);
      if (!section) return;

      const productIds = section.productIds.includes(productId)
        ? section.productIds.filter((id) => id !== productId)
        : [...section.productIds, productId];

      await updateDoc(doc(db, "sections", sectionId), {
        productIds,
        updatedAt: Timestamp.now(),
      });

      await fetchData();
    } catch (error) {
      console.error("Error updating section products:", error);
    }
  };

  const toggleSectionVisibility = async (sectionId: string) => {
    try {
      const section = customSections.find((s) => s.id === sectionId);
      if (!section) return;

      await updateDoc(doc(db, "sections", sectionId), {
        isActive: !section.isActive,
        updatedAt: Timestamp.now(),
      });

      await fetchData();
    } catch (error) {
      console.error("Error toggling section visibility:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Products Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Featured Products
        </h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Currently Featured
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">{product.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleProductStatus(product.id, "isFeatured")
                    }
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Add to Featured
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products
                .filter((p) => !p.isFeatured)
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500">{product.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleProductStatus(product.id, "isFeatured")
                      }
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Products Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Suggested Products
        </h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Currently Suggested
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">{product.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleProductStatus(product.id, "isSuggested")
                    }
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Add to Suggested
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products
                .filter((p) => !p.isSuggested)
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500">{product.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleProductStatus(product.id, "isSuggested")
                      }
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Custom Sections
          </h2>
          <button
            onClick={() => setShowNewSectionForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Section
          </button>
        </div>

        {showNewSectionForm && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                {editingSectionId ? "Edit Section" : "Create New Section"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sectionName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Section Name
                </label>
                <input
                  type="text"
                  id="sectionName"
                  value={sectionForm.name}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Enter section name"
                />
              </div>
              <div>
                <label
                  htmlFor="sectionDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="sectionDescription"
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Enter section description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSection}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  {editingSectionId ? "Save Changes" : "Create Section"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {customSections.map((section) => (
            <div key={section.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {section.name}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSection(section)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit section"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleSectionVisibility(section.id)}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${
                      section.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                    title={section.isActive ? "Hide section" : "Show section"}
                  >
                    {section.isActive ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete section"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Products in this section
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products
                      .filter((p) => section.productIds.includes(p.id))
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {product.price}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              toggleSectionProduct(section.id, product.id)
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Add products to this section
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products
                      .filter((p) => !section.productIds.includes(p.id))
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {product.price}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              toggleSectionProduct(section.id, product.id)
                            }
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomepageManager;
