import { useEffect } from "react";
import { FileText } from "lucide-react";
import { useScrollToTop } from "../utils/scrollToTop";

const TermsAndConditionsPage = () => {
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
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">
              Terms and Conditions
            </h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using this website operated by Rachna Creation,
              you accept and agree to be bound by the terms and provision of
              this agreement. If you do not agree to abide by the above, please
              do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on our website for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Modify or copy the materials
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Use the materials for any commercial purpose or for any public
                  display
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Attempt to reverse engineer, decompile, or disassemble any
                  software
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Remove any copyright or proprietary notations
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Transfer the materials to another person or "mirror" the
                  materials
                </span>
              </li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Disclaimer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on our website are provided on an 'as is' basis.
              Rachna Creation makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Limitations
            </h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall Rachna Creation or its suppliers be liable for
              any damages (including, without limitation, damages for loss of
              data or profit, or due to business interruption) arising out of
              the use or inability to use the materials on our website, even if
              we or our authorized representative has been notified orally or in
              writing of the possibility of such damage.
            </p>
          </section>

          {/* Accuracy of Materials */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The materials appearing on our website could include technical,
              typographical, or photographic errors. Rachna Creation does not
              warrant that any of the materials on our website are accurate,
              complete, or current. We may make changes to the materials
              contained on our website at any time without notice.
            </p>
          </section>

          {/* Materials and Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Materials and Content Ownership
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on our website are owned and operated by Rachna
              Creation. All product names, logos, and brands are the property of
              their respective owners. The content, text, graphics, and images
              on our website are protected by copyright laws and other
              intellectual property laws.
            </p>
          </section>

          {/* Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Links to Third Party Websites
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We have not reviewed all of the sites linked to our website and
              are not responsible for the contents of any such linked site. The
              inclusion of any link does not imply endorsement by us of the
              site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Modifications to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Rachna Creation may revise these terms and conditions at any time
              without notice. By using this website, you are agreeing to be
              bound by the then current version of these terms and conditions.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. User Accounts and Passwords
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you use this website, you are responsible for maintaining the
              confidentiality of your account information and password and for
              restricting access to your account. You agree to accept
              responsibility for all activities that occur under your account.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You must notify us immediately of any unauthorized use of your
              account or any other breaches of security.
            </p>
          </section>

          {/* Purchases and Orders */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Purchases and Orders
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Product Availability
                </h3>
                <p className="text-gray-700">
                  All products are subject to availability. We reserve the right
                  to refuse or cancel any order at any time for any reason.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Pricing
                </h3>
                <p className="text-gray-700">
                  All prices are subject to change without notice. We reserve
                  the right to limit quantities and correct pricing errors.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Payment
                </h3>
                <p className="text-gray-700">
                  Payment must be received before items are dispatched. We
                  accept various payment methods as displayed on our website.
                </p>
              </div>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Returns and Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our return policy is as follows:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Items must be returned within 7 days of purchase
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Items must be in unused condition with original packaging
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Shipping costs for returns are non-refundable
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Refunds will be processed within 10-15 business days
                </span>
              </li>
            </ul>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Shipping and Delivery
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We will make reasonable efforts to deliver items in a timely
              manner. However, we are not responsible for delays caused by
              courier services, customs, or unforeseen circumstances. Risk of
              loss for items passes to you upon delivery to the carrier.
            </p>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              13. Prohibited Conduct
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use this website for:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Any illegal activity or purpose
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Harassing, threatening, or abusive content
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Distributing viruses or malicious code
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-700">
                  Attempting unauthorized access to our systems
                </span>
              </li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              14. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in
              accordance with the laws of India, and you irrevocably submit to
              the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              15. Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms and Conditions, please
              contact us at:
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
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
