import { categories } from "../data/categories";
import { useNavigate } from "react-router-dom";

const FeaturedCategories = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full group overflow-hidden">
      <div
        id="categories-container"
        className="flex overflow-x-auto gap-1 sm:gap-2 md:gap-6 pb-4 px-1 sm:px-2 snap-x snap-mandatory scroll-smooth no-scrollbar justify-start"
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
                    target.src =
                      "https://res.cloudinary.com/ashdan/image/upload/v1698530024/puja-items/default-category_plcxck.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-black/10 hover:from-black/20 hover:to-black/5 transition-colors duration-300"></div>
              </div>
            </div>
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