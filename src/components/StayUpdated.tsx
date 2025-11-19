import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { useEmailSubscription } from "../redux/useEmailSubscription";
import toast from "react-hot-toast";

export const StayUpdated = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { subscribeEmail } = useEmailSubscription();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeEmail(email);
      setEmail("");
      setIsSuccess(true);
      toast.success("Thanks for subscribing! We'll keep you updated.");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Subscription failed";
      if (errorMessage.includes("already subscribed")) {
        toast.error("This email is already subscribed");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Stay Updated</h2>
          </div>

          <p className="text-center text-gray-600 mb-8">
            Subscribe to our newsletter and be the first to know about new
            products, exclusive offers, and special discounts!
          </p>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-600">
                Thank you for subscribing!
              </p>
              <p className="text-gray-600 text-center mt-2">
                We'll send exciting updates to your inbox soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
                  maxLength={255}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default StayUpdated;
