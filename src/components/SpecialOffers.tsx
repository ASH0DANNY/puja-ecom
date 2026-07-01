import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Zap, Gift, Percent, Truck, Tag, Copy, Check } from "lucide-react";
import type { Discount } from "../types/discount";

interface DisplayOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  minPurchase?: number;
  isActive: boolean;
  endDate?: Date | null;
  daysLeft?: number | null;
}

const SpecialOffers = () => {
  const [offers, setOffers] = useState<DisplayOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveDiscounts();
  }, []);

  const fetchActiveDiscounts = async () => {
    try {
      const now = new Date();
      const discountsRef = collection(db, "discounts");

      // Query for active discounts
      const q = query(discountsRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);

      const discountsList = querySnapshot.docs
        .map(
          (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            startDate:
              doc.data().startDate instanceof Timestamp
                ? doc.data().startDate.toDate()
                : new Date(doc.data().startDate),
            endDate:
              doc.data().endDate instanceof Timestamp
                ? doc.data().endDate.toDate()
                : doc.data().endDate
                  ? new Date(doc.data().endDate)
                  : null,
            createdAt:
              doc.data().createdAt instanceof Timestamp
                ? doc.data().createdAt.toDate()
                : new Date(doc.data().createdAt),
            updatedAt:
              doc.data().updatedAt instanceof Timestamp
                ? doc.data().updatedAt.toDate()
                : new Date(doc.data().updatedAt),
          } as Discount)
        )
        .filter((discount) => {
          // Filter for valid discounts (within date range and not expired)
          const isStartValid = new Date(discount.startDate) <= now;
          const isEndValid =
            !discount.endDate || new Date(discount.endDate) >= now;
          return isStartValid && isEndValid;
        })
        .slice(0, 4); // Limit to 4 offers for display

      const displayOffers: DisplayOffer[] = discountsList.map(
        (discount, index) => {
          const colors = [
            {
              bg: "from-orange-50 to-red-50",
              border: "border-orange-200",
              icon: "Zap",
            },
            {
              bg: "from-blue-50 to-indigo-50",
              border: "border-blue-200",
              icon: "Gift",
            },
            {
              bg: "from-green-50 to-emerald-50",
              border: "border-green-200",
              icon: "Percent",
            },
            {
              bg: "from-purple-50 to-pink-50",
              border: "border-purple-200",
              icon: "Truck",
            },
          ];
          const colorScheme = colors[index % colors.length];

          const getIcon = (iconName: string) => {
            const iconMap: Record<string, React.ReactNode> = {
              Zap: <Zap className="w-full h-full" />,
              Gift: <Gift className="w-full h-full" />,
              Percent: <Percent className="w-full h-full" />,
              Truck: <Truck className="w-full h-full" />,
            };
            return iconMap[iconName] || <Tag className="w-full h-full" />;
          };

          const daysLeft = discount.endDate
            ? Math.ceil(
              (new Date(discount.endDate).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
            )
            : null;

          const displayValue =
            discount.discountType === "percentage"
              ? `${discount.value}%`
              : `${discount.value}`;

          return {
            id: discount.id,
            code: discount.code,
            title: discount.code,
            description: discount.description,
            discount: displayValue,
            icon: getIcon(colorScheme.icon),
            bgColor: colorScheme.bg,
            borderColor: colorScheme.border,
            minPurchase: discount.minPurchase,
            isActive: discount.isActive,
            endDate: discount.endDate ? new Date(discount.endDate) : null,
            daysLeft: daysLeft && daysLeft > 0 ? daysLeft : null,
          };
        }
      );

      setOffers(displayOffers);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="py-8 md:py-12 lg:py-14 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Exclusive Offers & Discounts
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-2">
            Don't miss out on our amazing deals
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-3 md:mt-4"></div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8 md:py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm md:text-base">
                Loading exclusive offers...
              </p>
            </div>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-gray-600 text-base md:text-lg">
              No active offers available right now.
            </p>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Check back soon for exciting deals!
            </p>
          </div>
        ) : (
          <>
            {/* Offers Horizontal Scroll Container */}
            <div className="relative group overflow-hidden">
              {/* Scroll Container */}
              <div className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide">
                <div className="flex gap-3 md:gap-4 lg:gap-5 pb-4 min-w-max px-1 mt-2">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`relative group overflow-hidden rounded-lg lg:rounded-xl border-2 ${offer.borderColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer h-[180px] sm:h-[200px] lg:h-[220px] max-w-[200px]`}
                    >
                      {/* Background with gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${offer.bgColor} opacity-60 group-hover/card:opacity-100 transition-opacity duration-300`}
                      ></div>

                      {/* Content */}
                      <div className="relative p-4 md:p-5 lg:p-6 flex flex-col h-full">
                        {/* Top Section - Icon and Discount Badge */}
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          {/* Icon */}
                          <div className="text-primary group-hover/card:scale-110 transition-transform duration-300 w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 flex-shrink-0">
                            {offer.icon}
                          </div>

                          {/* Discount Badge */}
                          <div className="bg-primary text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-sm md:text-base font-bold shadow-md">
                            {offer.discount}
                          </div>
                        </div>

                        {/* Title with Copy Button */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 line-clamp-1">
                            {offer.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(offer.code);
                            }}
                            className="flex-shrink-0 p-1.5 md:p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                            title="Copy code"
                          >
                            {copiedCode === offer.code ? (
                              <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 md:w-6 md:h-6 text-gray-600 hover:text-gray-900" />
                            )}
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm md:text-base line-clamp-2 mb-3">
                          {offer.description}
                        </p>

                        {/* Bottom Info */}
                        <div className="mt-auto pt-3 md:pt-4 border-t border-gray-300 space-y-2">
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            {offer.minPurchase && offer.minPurchase > 0 && (
                              <span className="text-gray-600 font-medium">
                                Min Purchase: {offer.minPurchase}
                              </span>
                            )}
                            {offer.daysLeft && offer.daysLeft > 0 && (
                              <span className="text-orange-600 font-semibold ml-auto">
                                {offer.daysLeft} days left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Decorative corners */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-5 rounded-full -mr-8 -mt-8 group-hover/card:scale-150 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-secondary opacity-5 rounded-full -ml-6 -mb-6 group-hover/card:scale-150 transition-transform duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default SpecialOffers;
