import { categories } from "../data/categories";
import { useNavigate } from "react-router-dom";

const FeaturedCategories = () => {
  const navigate = useNavigate();

  const scrollLeft = () => {
    const container = document.getElementById("categories-container");
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("categories-container");
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full group">
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary p-1.5 sm:p-2 rounded-full shadow-lg 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1/2"
        aria-label="Scroll left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary p-1.5 sm:p-2 rounded-full shadow-lg 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/2"
        aria-label="Scroll right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div
        id="categories-container"
        className="flex overflow-x-auto gap-1 sm:gap-2 md:gap-6 pb-4 px-0 snap-x scroll-smooth no-scrollbar justify-start md:justify-center"
      >
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/categories?category=${category.slug}`)}
            className="snap-start flex-none w-1/3 sm:w-auto group cursor-pointer"
          >
            <div
              className="w-[85px] h-[85px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] lg:w-[180px] lg:h-[180px] 
                rounded-full overflow-hidden border-2 sm:border-4 border-gray-100 
                shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20 mx-auto"
            >
              <div className="relative w-full h-full">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/default-category_plcxck.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-black/10 hover:from-black/20 hover:to-black/5 transition-colors duration-300"></div>
              </div>
            </div>
            {/* Category Name Below Circle */}
            <div className="mt-2 sm:mt-3 md:mt-4 text-center">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300">
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategories;
