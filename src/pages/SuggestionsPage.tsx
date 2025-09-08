import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useScrollToTop } from "../utils/scrollToTop";
import {
  MessageSquare,
  CheckCircle,
  Lightbulb,
  Send,
  Mail,
  FileText,
  Tag,
  Zap,
} from "lucide-react";

const SuggestionsPage = () => {
  const [formData, setFormData] = useState({
    type: "WEBSITE_FEEDBACK" as const,
    title: "",
    description: "",
    category: "",
    email: "",
  });
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit suggestions");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "suggestions"), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: Timestamp.now(),
        status: "PENDING",
      });

      setSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          type: "WEBSITE_FEEDBACK",
          title: "",
          description: "",
          category: "",
          email: "",
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("Failed to submit suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Suggestion Box
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Help us improve by sharing your ideas and feedback
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600">
                    Your suggestion has been submitted successfully. We'll
                    review it and get back to you soon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <Send className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Submit Your Suggestion
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4" />
                        Suggestion Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as typeof formData.type,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        required
                      >
                        <option value="WEBSITE_FEEDBACK">
                          Website Feedback
                        </option>
                        <option value="PRODUCT_REQUEST">Product Request</option>
                        <option value="FEATURE_REQUEST">Feature Request</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Brief title for your suggestion"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors min-h-[120px]"
                        placeholder="Please provide detailed information about your suggestion"
                        required
                        maxLength={1000}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/1000 characters
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4" />
                        Category{" "}
                        <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="e.g., Fashion, Accessories, User Interface"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Your email address"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        We'll notify you when we review your suggestion
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition-colors
                        ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Suggestion
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Tips for Great Suggestions
                </h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 text-sm">
                    Be specific about what you'd like to see or change
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 text-sm">
                    Explain why this suggestion would be valuable
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 text-sm">
                    Include examples if possible
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 text-sm">
                    Consider how it might benefit other users
                  </span>
                </li>
              </ul>
            </div>

            {/* Recent Suggestions */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Implementations
                </h2>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Product Request
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      ✓ Implemented
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Sustainable Fashion Collection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Added a new collection of eco-friendly and sustainable
                    fashion items.
                  </p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Feature Request
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      ✓ Implemented
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Size Guide Calculator
                  </h3>
                  <p className="text-sm text-gray-600">
                    Added an interactive size guide to help customers find their
                    perfect fit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
