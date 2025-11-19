import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "../types/product";
import { useNavigate } from "react-router-dom";

interface HorizontalProductScrollProps {
  products: Product[];
  loading: boolean;
  title: string;
  showMorePath: string;
}

const HorizontalProductScroll = ({
  products,
  loading,
  title,
  showMorePath,
}: HorizontalProductScrollProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Show only first 5 products, with 6th being a "Show More" card
  useEffect(() => {
    setDisplayProducts(products.slice(0, 5));
  }, [products]);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [displayProducts]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // width of card + gap
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-gray-600">No {title.toLowerCase()} available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View - 3 Rows Grid */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {products.slice(0, 6).map((product, index) => (
            <div key={product.id || `show-more-${index}`} className="w-full">
              {index < 5 ? (
                <ProductCard product={product} />
              ) : (
                // Show More Card for Mobile - Matching ProductCard structure
                <div
                  onClick={() => navigate(showMorePath)}
                  className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer w-full border-2 border-dashed border-primary flex flex-col"
                >
                  {/* Image Container */}
                  <div
                    className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"
                    style={{ height: "180px" }}
                  >
                    <ArrowRight className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors text-center">
                        Show More
                      </h3>
                      <p className="text-gray-600 text-xs text-center line-clamp-2">
                        View all products
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View - Horizontal Scroll */}
      <div className="hidden md:block relative">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-6 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-6 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-primary" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide px-2"
          style={{
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: "280px" }}
            >
              <ProductCard product={product} />
            </div>
          ))}

          {/* Show More Card */}
          {products.length > 5 && (
            <div
              key="show-more"
              onClick={() => navigate(showMorePath)}
              className="flex-shrink-0 group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-dashed border-primary flex flex-col"
              style={{ width: "280px" }}
            >
              {/* Image Container */}
              <div
                className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"
                style={{ height: "180px" }}
              >
                <ArrowRight className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-grow">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors text-center line-clamp-1">
                    Show More
                  </h3>
                  <p className="text-gray-600 text-xs text-center line-clamp-2">
                    View all {title.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar hide style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HorizontalProductScroll;
