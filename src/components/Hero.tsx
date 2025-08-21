const Hero = () => {
  const hero_background = import("../assets/images/hero-background.jpg");
  return (
    <section className="relative bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-primary">Summer</span> Collection 2025
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
              Discover our latest collection featuring trendy designs and premium quality.
              Shop the season's most exciting styles today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold 
                hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 
                shadow-lg hover:shadow-xl">
                Shop Now
              </button>
              <button className="bg-white text-primary px-8 py-4 rounded-full text-lg font-semibold 
                hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 
                shadow-lg hover:shadow-xl border-2 border-primary">
                View Lookbook
              </button>
            </div>
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
              <img
                src={`${hero_background}`}
                alt="Summer Collection"
                className="rounded-lg shadow-2xl"
              />
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
    </section>
  );
};

export default Hero;
