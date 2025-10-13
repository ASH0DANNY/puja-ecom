import { useEffect, useState } from "react";
import carouselImage1 from "../assets/images/carousel/carousel_image1.jpg";
import carouselImage2 from "../assets/images/carousel/carousel_image2.jpg";
import carouselImage3 from "../assets/images/carousel/carousel_image3.jpg";
import carouselImage4 from "../assets/images/carousel/carousel_image4.jpg";

interface CarouselSlide {
  image: string;
  heading: string;
  description: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    image: carouselImage1,
    heading: "Welcome to Puja E-com",
    description: "Your one-stop shop for all your needs"
  },
  {
    image: carouselImage2,
    heading: "Discover Amazing Deals",
    description: "Get the best prices on top products"
  },
  {
    image: carouselImage3,
    heading: "Shop with Confidence",
    description: "Secure shopping experience"
  },
  {
    image: carouselImage4,
    heading: "Quality Products",
    description: "Handpicked items just for you"
  }
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const loadStatuses = await Promise.all(
        carouselSlides.map((slide) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = slide.image;
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          });
        })
      );
      setImagesLoaded(loadStatuses as boolean[]);
    };
    preloadImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
      <div
        className="flex transition-transform duration-1000 ease-out h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${carouselSlides.length * 100}%`,
        }}
      >
        {carouselSlides.map((slide, index) => (
          <div key={index} className="relative w-full h-full flex-shrink-0">
            <img
              src={slide.image}
              alt={slide.heading}
              className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                imagesLoaded[index] ? "opacity-100" : "opacity-0"
              }`}
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold">
                  {slide.heading}
                </h2>
                <p className="text-xl md:text-2xl">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
