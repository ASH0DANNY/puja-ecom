const FeaturedCategories = () => {
  const categories = [
    {
      id: 1,
      title: "Women's Fashion",
      description: "Explore our collection of women's clothing",
      image: "/women-fashion.jpg",
      items: "2.5k+ Items"
    },
    {
      id: 2,
      title: "Men's Fashion",
      description: "Discover trendy men's wear",
      image: "/men-fashion.jpg",
      items: "2k+ Items"
    },
    {
      id: 3,
      title: "Accessories",
      description: "Complete your look with our accessories",
      image: "/accessories.jpg",
      items: "1.5k+ Items"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map((category) => (
        <div
          key={category.id}
          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl 
            transform hover:-translate-y-2 transition-all duration-300"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={category.image}
              alt={category.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
          </div>

          {/* Content */}
          <div className="relative p-8 h-[300px] flex flex-col justify-end">
            <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
            <p className="text-gray-200 mb-4">{category.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{category.items}</span>
              <button className="px-6 py-2 bg-white text-primary rounded-full font-medium 
                transform group-hover:scale-105 transition-transform duration-300
                hover:bg-primary hover:text-white">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedCategories;
