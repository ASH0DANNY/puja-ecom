const CategoriesPage = () => {
  const categories = [
    {
      id: 1,
      name: "Women's Fashion",
      description: "Dresses, tops, shoes, and accessories for women",
      image: "women.jpg",
    },
    {
      id: 2,
      name: "Men's Fashion",
      description: "Shirts, pants, shoes, and accessories for men",
      image: "men.jpg",
    },
    {
      id: 3,
      name: "Kids' Fashion",
      description: "Clothing and accessories for children",
      image: "kids.jpg",
    },
    {
      id: 4,
      name: "Accessories",
      description: "Bags, jewelry, watches, and more",
      image: "accessories.jpg",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-600">{category.description}</p>
              <button className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                Explore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
