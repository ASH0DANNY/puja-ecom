import { useEffect } from "react";
import { Shield } from "lucide-react";
import { useScrollToTop } from "../utils/scrollToTop";

const PrivacyPolicyPage = () => {
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Rachna Creation ("we", "us", "our", or "Company") operates the
              e-commerce website. This page informs you of our policies
              regarding the collection, use, and disclosure of personal data
              when you use our website and the choices you have associated with
              that data.
            </p>
          </section>

          {/* Information Collection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Personal Identification Information
                </h3>
                <p className="text-gray-700">
                  We collect personal identification information that you
                  provide voluntarily such as name, email address, mailing
                  address, phone number, and payment information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Browsing Information
                </h3>
                <p className="text-gray-700">
                  We automatically collect information about how you interact
                  with our website, including pages visited, products viewed,
                  time spent, click patterns, and referring URL.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Cookies and Tracking
                </h3>
                <p className="text-gray-700">
                  We use cookies and similar tracking technologies to track
                  activity and hold certain information to enhance your browsing
                  experience and personalize content.
                </p>
              </div>
            </div>
          </section>

          {/* Use of Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Process and complete transactions and send related information
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Email you regarding your account, order status, and customer
                  service
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Send promotional emails and newsletters with your consent
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Improve our website, services, and customer experience
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Personalize and customize your experience
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Comply with legal obligations and prevent fraudulent activity
                </span>
              </li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure. While we strive to
              use commercially acceptable means to protect your personal
              information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Third Party */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Third-Party Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal identification
              information to others. We may share generic aggregated demographic
              information not linked to any personal identification information
              regarding visitors and users with our business partners and
              trusted affiliates.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information when required by law or when we
              believe in good faith that disclosure is necessary to protect our
              rights, your safety, or the safety of others.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Rights
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700">You have the right to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span className="text-gray-700">
                    Access and review your personal data
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span className="text-gray-700">
                    Request correction or deletion of your data
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span className="text-gray-700">
                    Opt-out of promotional communications
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span className="text-gray-700">
                    Request a copy of your data in a portable format
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>Rachna Creation</strong>
                <br />
                Email:{" "}
                <a
                  href={`mailto:${import.meta.env.VITE_APP_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {import.meta.env.VITE_APP_EMAIL}
                </a>
                <br />
                Phone:{" "}
                <a
                  href={`tel:${import.meta.env.VITE_APP_MOBILE_NO}`}
                  className="text-primary hover:underline"
                >
                  {import.meta.env.VITE_APP_MOBILE_NO}
                </a>
                <br />
                Address: {import.meta.env.VITE_APP_ADDREDSS}
              </p>
            </div>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or other
              factors. We will notify you of any material changes by posting the
              updated policy on our website with a new "Last Updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
