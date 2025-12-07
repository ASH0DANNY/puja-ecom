import { useEffect, useState } from "react";
import { useScrollToTop } from "../utils/scrollToTop";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  Building2,
  Headphones,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { sendContactUsEmail } from "../utils/emailService";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

const ContactPage = () => {
  const scrollToTop = useScrollToTop();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  useEffect(() => {
    scrollToTop();
  }, []);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send contact form email using the email service
  const sendContactEmail = async (): Promise<boolean> => {
    try {
      const adminEmail = import.meta.env.VITE_APP_EMAIL;

      if (!adminEmail) {
        console.error("Admin email not configured. Check your .env file.");
        return false;
      }

      const emailSent = await sendContactUsEmail({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        adminEmail: adminEmail,
      });

      return emailSent;
    } catch (error) {
      console.error("Error sending contact email:", error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({
        type: "error",
        message: "Please fix the errors above and try again.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Sending your message..." });

    const emailSent = await sendContactEmail();

    if (emailSent) {
      setStatus({
        type: "success",
        message: "Message sent successfully! We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } else {
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Contact Us
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Get in touch with our team - we're here to help
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Send className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Send us a Message
                </h2>
              </div>

              {/* Status Messages */}
              {status.type === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 text-sm font-medium">
                      {status.message}
                    </p>
                  </div>
                </div>
              )}

              {status.type === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">
                      {status.message}
                    </p>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <User className="w-4 h-4" />
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Contact Information
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600 text-sm">
                      {import.meta.env.VITE_APP_MOBILE_NO}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600 text-sm">
                      {import.meta.env.VITE_APP_EMAIL}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Business Hours
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM
                      <br />
                      Saturday: 10:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Visit Our Store
                </h2>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg mt-1">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-gray-600 text-sm">
                    {import.meta.env.VITE_APP_ADDREDSS}
                  </p>
                  <button className="mt-3 text-primary hover:text-primary/80 text-sm font-medium">
                    Get Directions →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Need Quick Help?
              </h2>

              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-medium text-gray-900 text-sm">
                    Order Support
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Track orders, returns & exchanges
                  </p>
                </button>

                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-medium text-gray-900 text-sm">
                    Product Questions
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Size guides, materials & care
                  </p>
                </button>

                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-medium text-gray-900 text-sm">
                    Account Help
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Login issues, account settings
                  </p>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
