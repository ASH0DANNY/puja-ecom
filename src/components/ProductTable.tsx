import { useEffect, useMemo, useState } from "react";
import { updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product } from "../types/product";
import { uploadImage } from "../utils/cloudinary";
import { categories } from "../data/categories";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onUpdate: () => void;
}

export const ProductTable = ({ products, onUpdate }: ProductTableProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "low-stock" | "out-of-stock"
  >("all");
  const [suggestedFilter, setSuggestedFilter] = useState<
    "all" | "suggested" | "not-suggested"
  >("all");
  const [sortKey, setSortKey] = useState<"name" | "price" | "stock" | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      onUpdate();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (product: Product, newImage?: File) => {
    setLoading(true);
    try {
      // Validate that at least one size with price exists
      if (!product.sizesWithPrices || product.sizesWithPrices.length === 0) {
        alert("Please add at least one size with price");
        setLoading(false);
        return;
      }

      const updateData = { ...product };

      // Set price from first size with price
      updateData.price = product.sizesWithPrices[0].price || 0;

      if (newImage) {
        const imageUrl = await uploadImage(newImage);
        updateData.image = imageUrl;
      }

      await updateDoc(doc(db, "products", product.id), updateData);
      onUpdate();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = async (product: Product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        isSuggested: !product.isSuggested,
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating suggestion:", error);
      alert("Failed to update suggestion status");
    }
  };

  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    )
      .sort()
      .map((categoryId) => ({
        id: categoryId,
        label:
          categories.find((category) => category.id === categoryId)?.name ||
          categoryId,
      }));
  }, [products]);

  const getProductPrice = (product: Product) => {
    if (product.sizesWithPrices && product.sizesWithPrices.length > 0) {
      return Math.min(...product.sizesWithPrices.map((size) => size.price || 0));
    }

    return product.price || 0;
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return "out-of-stock";
    if (product.stock <= 5) return "low-stock";
    return "in-stock";
  };

  const handleSort = (key: "name" | "price" | "stock") => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (key: "name" | "price" | "stock") => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-indigo-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-indigo-600" />
    );
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const sortedProducts = [...products].filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (
          categories.find((category) => category.id === product.category)?.name ||
          ""
        )
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" || getStockStatus(product) === stockFilter;
      const matchesSuggested =
        suggestedFilter === "all" ||
        (suggestedFilter === "suggested" && product.isSuggested) ||
        (suggestedFilter === "not-suggested" && !product.isSuggested);

      return (
        matchesSearch && matchesCategory && matchesStock && matchesSuggested
      );
    });

    if (!sortKey) {
      return sortedProducts;
    }

    return sortedProducts.sort((a, b) => {
      if (sortKey === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      if (sortKey === "price") {
        const aPrice = getProductPrice(a);
        const bPrice = getProductPrice(b);
        return sortDirection === "asc" ? aPrice - bPrice : bPrice - aPrice;
      }

      const aStock = a.stock || 0;
      const bStock = b.stock || 0;
      return sortDirection === "asc" ? aStock - bStock : bStock - aStock;
    });
  }, [
    categoryFilter,
    products,
    searchQuery,
    sortDirection,
    sortKey,
    stockFilter,
    suggestedFilter,
  ]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, categoryFilter, stockFilter, suggestedFilter, sortKey, sortDirection]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStockFilter("all");
    setSuggestedFilter("all");
    setSortKey(null);
    setSortDirection("asc");
  };

  return (
    <>
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search products
            </label>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Stock status
              </label>
              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value as typeof stockFilter)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Suggested
              </label>
              <select
                value={suggestedFilter}
                onChange={(event) =>
                  setSuggestedFilter(event.target.value as typeof suggestedFilter)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All</option>
                <option value="suggested">Suggested Only</option>
                <option value="not-suggested">Not Suggested</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Image
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 font-semibold text-[#6b7280]"
                  >
                    <span>Name</span>
                    {renderSortIcon("name")}
                  </button>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="flex items-center gap-1 font-semibold text-[#6b7280]"
                  >
                    <span>Price</span>
                    {renderSortIcon("price")}
                  </button>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  <button
                    type="button"
                    onClick={() => handleSort("stock")}
                    className="flex items-center gap-1 font-semibold text-[#6b7280]"
                  >
                    <span>Stock</span>
                    {renderSortIcon("stock")}
                  </button>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Suggested
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  >
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {categories.find(c => c.id === product.category)?.name || product.category}
                    </TableCell>
                    <TableCell>
                      {product.sizesWithPrices && product.sizesWithPrices.length > 0
                        ? product.sizesWithPrices
                            .map((size) => `${size.price.toFixed(2)}`)
                            .join(" / ")
                        : `${product.price.toFixed(2)}`}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleSuggestion(product)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold
                          ${
                            product.isSuggested
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {product.isSuggested ? "Yes" : "No"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500">
                    No products match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: "1px solid #e5e7eb",
            "& .MuiTablePagination-toolbar": {
              padding: "12px 24px",
            },
          }}
        />
      </Paper>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(editingProduct);
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Basic Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        required
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>


                  </div>

                  {/* Categories & Details */}
                  <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Categories & Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          required
                          value={editingProduct.category}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              category: e.target.value,
                            })
                          }
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.brand}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              brand: e.target.value,
                            })
                          }
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <input
                        type="text"
                        value={editingProduct.material}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            material: e.target.value,
                          })
                        }
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Inventory */}
                  <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Inventory
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SKU
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.sku}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              sku: e.target.value,
                            })
                          }
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          required
                          value={editingProduct.stock}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              stock: parseInt(e.target.value),
                            })
                          }
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Size Feature */}
                  <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Product Sizes with Prices & Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add or edit different sizes with their prices, weight, and dimensions
                    </p>

                    {editingProduct.sizesWithPrices &&
                      editingProduct.sizesWithPrices.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {editingProduct.sizesWithPrices.map((item, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Size
                                  </label>
                                  <input
                                    type="text"
                                    value={item.size}
                                    onChange={(e) => {
                                      const updated = [
                                        ...editingProduct.sizesWithPrices!,
                                      ];
                                      updated[index] = {
                                        ...item,
                                        size: e.target.value,
                                      };
                                      setEditingProduct({
                                        ...editingProduct,
                                        sizesWithPrices: updated,
                                      });
                                    }}
                                    placeholder="e.g., S, M, L"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Price
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => {
                                      const updated = [
                                        ...editingProduct.sizesWithPrices!,
                                      ];
                                      updated[index] = {
                                        ...item,
                                        price: parseFloat(e.target.value) || 0,
                                      };
                                      setEditingProduct({
                                        ...editingProduct,
                                        sizesWithPrices: updated,
                                      });
                                    }}
                                    placeholder="0.00"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Weight
                                  </label>
                                  <input
                                    type="text"
                                    value={item.weight || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...editingProduct.sizesWithPrices!,
                                      ];
                                      updated[index] = {
                                        ...item,
                                        weight: e.target.value || undefined,
                                      };
                                      setEditingProduct({
                                        ...editingProduct,
                                        sizesWithPrices: updated,
                                      });
                                    }}
                                    placeholder="e.g., 500g"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Dimensions
                                  </label>
                                  <input
                                    type="text"
                                    value={item.dimensions || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...editingProduct.sizesWithPrices!,
                                      ];
                                      updated[index] = {
                                        ...item,
                                        dimensions: e.target.value || undefined,
                                      };
                                      setEditingProduct({
                                        ...editingProduct,
                                        sizesWithPrices: updated,
                                      });
                                    }}
                                    placeholder="e.g., 30x20x10cm"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated =
                                    editingProduct.sizesWithPrices!.filter(
                                      (_, i) => i !== index
                                    );
                                  setEditingProduct({
                                    ...editingProduct,
                                    sizesWithPrices: updated,
                                  });
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove Size
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct({
                          ...editingProduct,
                          sizesWithPrices: [
                            ...(editingProduct.sizesWithPrices || []),
                            { size: "", price: 0 },
                          ],
                        });
                      }}
                      className="text-sm px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                    >
                      + Add Size
                    </button>
                  </div>

                  {/* Custom Size Feature */}
                  <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Custom Size Feature
                    </h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasCustomSize"
                        checked={editingProduct.hasCustomSize || false}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            hasCustomSize: e.target.checked,
                          })
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
                    <p className="text-sm text-gray-600">
                      When enabled, customers can enter their own custom dimensions (width, height, depth) during checkout.
                    </p>
                  </div>

                  {/* Image Upload */}
                  <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Product Image
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Image
                      </label>
                      <img
                        src={editingProduct.image}
                        alt={editingProduct.name}
                        className="w-32 h-32 object-cover rounded-lg mb-4"
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload New Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleUpdate(editingProduct, e.target.files[0]);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {loading ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductTable;
