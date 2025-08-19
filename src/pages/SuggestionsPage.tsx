import { useState } from "react";
import type { FormEvent } from "react";

const SuggestionsPage = () => {
  const [formData, setFormData] = useState({
    type: "WEBSITE_FEEDBACK" as const,
    title: "",
    description: "",
    category: "",
    email: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Here you would typically send this to your backend
    console.log("Suggestion submitted:", formData);
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Suggestion Box</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-xl mb-2">✓</div>
              <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
              <p className="text-gray-600">
                Your suggestion has been submitted successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="WEBSITE_FEEDBACK">Website Feedback</option>
                  <option value="PRODUCT_REQUEST">Product Request</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Brief title for your suggestion"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                  placeholder="Please provide detailed information about your suggestion"
                  required
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., Fashion, Accessories, User Interface"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your email address"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  We'll notify you when we review your suggestion
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Submit Suggestion
              </button>
            </form>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Tips for Great Suggestions
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Be specific about what you'd like to see or change
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Explain why this suggestion would be valuable
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Include examples if possible
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Consider how it might benefit other users
            </li>
          </ul>
        </div>

        {/* Recent Suggestions Preview */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Recent Implemented Suggestions
          </h2>
          <div className="grid gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  Product Request
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Implemented
                </span>
              </div>
              <h3 className="font-medium mb-1">
                Sustainable Fashion Collection
              </h3>
              <p className="text-sm text-gray-600">
                Added a new collection of eco-friendly and sustainable fashion
                items.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  Feature Request
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Implemented
                </span>
              </div>
              <h3 className="font-medium mb-1">Size Guide Calculator</h3>
              <p className="text-sm text-gray-600">
                Added an interactive size guide to help customers find their
                perfect fit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
