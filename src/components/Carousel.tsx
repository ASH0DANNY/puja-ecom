import { useEffect, useState } from "react";

import carousel1SmallScreen from "../assets/images/carousel/carousel1_small_screen.png";
import newImageCarousel from "../assets/images/carousel/new_image_carousel.png";

interface CarouselSlide {
  imageMobile: string;
  imageDesktop: string;
  heading: string;
  description: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    imageMobile: carousel1SmallScreen,
    imageDesktop: newImageCarousel,
    heading: `Welcome to ${import.meta.env.VITE_APP_NAME}`,
    description: "Your one-stop shop for all your needs",
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  // Preload both mobile and desktop images
  useEffect(() => {
    const preloadImages = async () => {
      const loadStatuses = await Promise.all(
        carouselSlides.map((slide) => {
          return Promise.all(
            [slide.imageMobile, slide.imageDesktop].map((src) => {
              return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
              });
            })
          ).then((results) => results.every(Boolean));
        })
      );
      setImagesLoaded(loadStatuses as boolean[]);
    };
    preloadImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[3/2] overflow-hidden">
      <div
        className="flex transition-transform duration-1000 ease-out h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${carouselSlides.length * 100}%`,
        }}
      >
        {carouselSlides.map((slide, index) => (
          <div key={index} className="relative w-full h-full flex-shrink-0">
            <picture>
              <source media="(min-width: 640px)" srcSet={slide.imageDesktop} />
              <img
                src={slide.imageMobile}
                alt={slide.heading}
                className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                  imagesLoaded[index] ? "opacity-100" : "opacity-0"
                }`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </picture>
            <div className="absolute inset-0 bg-black bg-opacity-5"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  {/* {slide.heading} */}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;