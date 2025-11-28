import { Truck, Shield, RefreshCw, Zap } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface FeaturesSectionProps {
  variant?: "homepage" | "product-details";
}

const FeaturesSection = ({ variant = "homepage" }: FeaturesSectionProps) => {
  const features: Feature[] = [
    {
      icon: <Truck className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Free Shipping",
      description:
        "Free delivery on orders over ₹500. Fast and reliable shipping across India.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Shield className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Secure Payment",
      description:
        "100% secure transactions. Your payment information is encrypted and protected.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <RefreshCw className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Easy Returns",
      description:
        "30-day money-back guarantee. Easy returns and exchanges for your satisfaction.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Zap className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Fast Delivery",
      description:
        "Express delivery available. Get your order within 2-3 business days.",
      color: "from-red-500 to-red-600",
    },
  ];

  // For product details, show only 4 features
  const displayFeatures =
    variant === "product-details" ? features.slice(0, 4) : features;

  return (
    <section
      className={`${
        variant === "homepage" ? "py-12 md:py-14 lg:py-14" : "py-8 md:py-12"
      } bg-gradient-to-b from-gray-50 to-white`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header - only show for homepage */}
        {variant === "homepage" && (
          <div className="text-center mb-6 md:mb-8 lg:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
              Why Shop With Us
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Experience exceptional service with our commitment to quality,
              reliability, and customer satisfaction
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-3 md:mt-4"></div>
          </div>
        )}

        {/* Features Container */}
        {variant === "homepage" ? (
          // Grid for all screen sizes with responsive card sizing
          <div className="w-full">
            {/* Mobile/Tablet/Desktop: Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
              {displayFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg md:rounded-xl bg-white border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 text-center h-full flex flex-col">
                    {/* Icon Container */}
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${feature.color} text-white mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md mx-auto`}
                    >
                      {feature.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed flex-grow line-clamp-2 sm:line-clamp-3 md:line-clamp-none">
                      {feature.description}
                    </p>

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-10 h-10 bg-primary/10 rounded-full -mr-4 -mt-4 sm:-mr-5 sm:-mt-5 lg:-mr-6 lg:-mt-6 group-hover:scale-150 transition-transform duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Product details variant - responsive grid with smaller cards on mobile
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 max-w-6xl mx-auto">
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg md:rounded-xl bg-white border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 text-center">
                  {/* Icon Container */}
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${feature.color} text-white mb-2 sm:mb-3 md:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed line-clamp-3 sm:line-clamp-4">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-10 h-10 bg-primary/10 rounded-full -mr-4 -mt-4 sm:-mr-5 sm:-mt-5 lg:-mr-6 lg:-mt-6 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
