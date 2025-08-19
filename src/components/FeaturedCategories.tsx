const FeaturedCategories = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Women's Fashion</h3>
        <p className="text-gray-600">
          Explore our collection of women's clothing
        </p>
      </div>
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Men's Fashion</h3>
        <p className="text-gray-600">Discover trendy men's wear</p>
      </div>
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Accessories</h3>
        <p className="text-gray-600">Complete your look with our accessories</p>
      </div>
    </section>
  );
};

export default FeaturedCategories;
