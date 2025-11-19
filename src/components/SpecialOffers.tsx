import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Zap, Gift, Percent, Truck, Tag } from "lucide-react";
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
              : `₹${discount.value}`;

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
            endDate: discount.endDate,
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

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Exclusive Offers & Discounts
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-2">
            Don't miss out on our amazing deals
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
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
            {/* Offers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 max-w-7xl mx-auto">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`relative group overflow-hidden rounded-lg lg:rounded-xl border-2 ${offer.borderColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer h-[180px] sm:h-[200px] lg:h-[220px]`}
                >
                  {/* Background with gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${offer.bgColor} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  {/* Content */}
                  <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col h-full">
                    {/* Top Section - Icon and Discount Badge */}
                    <div className="flex items-start justify-between mb-3 lg:mb-4">
                      {/* Icon */}
                      <div className="text-primary group-hover:scale-110 transition-transform duration-300 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex-shrink-0">
                        {offer.icon}
                      </div>

                      {/* Discount Badge */}
                      <div className="bg-primary text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md">
                        {offer.discount}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1">
                      {offer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-700 text-xs sm:text-sm mb-auto line-clamp-2 flex-grow">
                      {offer.description}
                    </p>

                    {/* Bottom Info */}
                    <div className="mt-3 pt-2 sm:pt-3 border-t border-gray-300 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        {offer.minPurchase && offer.minPurchase > 0 && (
                          <span className="text-gray-600">
                            Min: ₹{offer.minPurchase}
                          </span>
                        )}
                        {offer.daysLeft && offer.daysLeft > 0 && (
                          <span className="text-orange-600 font-semibold ml-auto">
                            {offer.daysLeft} day
                            {offer.daysLeft !== 1 ? "s" : ""} left
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Decorative corners */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-secondary opacity-5 rounded-full -ml-6 -mb-6 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SpecialOffers;
