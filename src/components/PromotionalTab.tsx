import { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  Tag,
  Users,
  AlertCircle,
} from "lucide-react";
import { useReduxPromotion } from "../redux/useReduxPromotion";
import { useEmailSubscription } from "../redux/useEmailSubscription";
import toast from "react-hot-toast";
import type { Promotion } from "../types/promotion";

interface FormData {
  title: string;
  description: string;
  type: "product" | "offer" | "discount";
  content: string;
  discountPercentage?: number;
  discountCode?: string;
  validFrom: string;
  imageUrl?: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  type: "offer",
  content: "",
  discountPercentage: undefined,
  discountCode: "",
  validFrom: new Date().toISOString().split("T")[0],
  imageUrl: "",
  isActive: true,
};

export const PromotionalTab = () => {
  const {
    promotions,
    loading,
    error,
    emailHistory,
    fetchPromotions,
    createPromotion,
    updatePromotionData,
    deletePromotion,
    sendCampaignToSubscribers,
  } = useReduxPromotion();

  const {
    activeSubscribers,
    loading: emailLoading,
    fetchSubscribers,
    getSubscriberEmails,
  } = useEmailSubscription();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(
    null
  );
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchPromotions();
    fetchSubscribers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? target.checked
          : name === "discountPercentage"
          ? value
            ? Number(value)
            : undefined
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const promotionToSave: Omit<Promotion, "id" | "createdAt" | "updatedAt"> =
        {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          content: formData.content,
          imageUrl: formData.imageUrl || undefined,
          isActive: formData.isActive,
          validFrom: new Date(formData.validFrom),
          validUntil: new Date(formData.validFrom),
          ...(formData.discountPercentage && {
            discountPercentage: formData.discountPercentage,
          }),
          ...(formData.discountCode && { discountCode: formData.discountCode }),
        };

      if (editingId) {
        await updatePromotionData(editingId, promotionToSave);
        toast.success("Promotion updated successfully");
      } else {
        await createPromotion(promotionToSave);
        toast.success("Promotion created successfully");
      }
      setFormData(initialFormData);
      setEditingId(null);
      setShowForm(false);
      await fetchPromotions();
    } catch (err) {
      toast.error("Failed to save promotion");
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setFormData({
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      content: promotion.content,
      discountPercentage: promotion.discountPercentage,
      discountCode: promotion.discountCode || "",
      validFrom: new Date(promotion.validFrom).toISOString().split("T")[0],
      imageUrl: promotion.imageUrl || "",
      isActive: promotion.isActive,
    });
    setEditingId(promotion.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        await deletePromotion(id);
        toast.success("Promotion deleted");
        await fetchPromotions();
      } catch (err) {
        toast.error("Failed to delete promotion");
      }
    }
  };

  const handleSendCampaign = async (promotion: Promotion) => {
    const subscriberEmails = getSubscriberEmails();

    if (subscriberEmails.length === 0) {
      toast.error("No active subscribers to send campaign to");
      return;
    }

    setSendingCampaignId(promotion.id || null);

    try {
      // Send promotional emails to all subscribers
      const result = await sendCampaignToSubscribers(
        promotion,
        subscriberEmails
      );

      if (result.successCount > 0) {
        toast.success(
          `Campaign sent to ${result.successCount} subscriber${
            result.successCount !== 1 ? "s" : ""
          }!`
        );
      }

      if (result.failureCount > 0) {
        toast.error(
          `Failed to send to ${result.failureCount} subscriber${
            result.failureCount !== 1 ? "s" : ""
          }`
        );
        if (result.errors.length > 0) {
          console.error("Email sending errors:", result.errors);
        }
      }

      // Log detailed results
      console.log(`📧 Campaign Results:`, {
        campaignTitle: promotion.title,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalAttempted: subscriberEmails.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error("Failed to send campaign: " + errorMessage);
      console.error("Campaign sending error:", err);
    } finally {
      setSendingCampaignId(null);
    }
  };

  const cancelEdit = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Promotions</p>
              <p className="text-2xl font-bold text-blue-600">
                {promotions.filter((p) => p.isActive).length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Subscribers</p>
              <p className="text-2xl font-bold text-green-600">
                {activeSubscribers.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Campaigns Sent</p>
              <p className="text-2xl font-bold text-purple-600">
                {emailHistory.length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Promotion" : "Create New Promotion"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Promotion title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="offer">Offer</option>
                  <option value="product">New Product</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description for preview"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Full promotional content/message"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starts From
                </label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {formData.type === "discount" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code
                  </label>
                  <input
                    type="text"
                    name="discountCode"
                    value={formData.discountCode}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex-1 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                {previewMode ? "Edit Mode" : "Preview"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>

          {previewMode && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-2">Preview:</h4>
              <div className="bg-white p-4 rounded border border-gray-300">
                <h3 className="font-bold text-lg mb-2">{formData.title}</h3>
                <p className="text-gray-600 mb-3">{formData.description}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {formData.content}
                </p>
                {formData.type === "discount" && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm">
                      <strong>Discount:</strong> {formData.discountPercentage}%
                    </p>
                    <p className="text-sm">
                      <strong>Code:</strong> {formData.discountCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Promotions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Promotions</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Promotion
          </button>
        </div>

        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promotions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 as any}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No promotions yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                promotions.map((promotion: any) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {promotion.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {promotion.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {promotion.type.charAt(0).toUpperCase() +
                          promotion.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(promotion.validFrom).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          promotion.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {promotion.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(promotion)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit promotion"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendCampaign(promotion)}
                          disabled={
                            sendingCampaignId === promotion.id || emailLoading
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Send campaign to subscribers"
                        >
                          {sendingCampaignId === promotion.id ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(promotion.id || "")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete promotion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Campaign History */}
      {emailHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Campaign History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emailHistory.map((record: any) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.promotionTitle}
                        </p>
                        <p className="text-sm text-gray-600">
                          {record.subject}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {record.successCount}/{record.recipientCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Sent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionalTab;
