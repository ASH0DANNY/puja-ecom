const SuggestionsPage = () => {
  const suggestions = [
    {
      id: 1,
      title: "Summer Collection",
      description:
        "Based on your recent purchases, you might like our new summer collection.",
      category: "Recommended",
    },
    {
      id: 2,
      title: "Trending Items",
      description: "Popular items in your favorite categories.",
      category: "Trending",
    },
    {
      id: 3,
      title: "Recently Viewed",
      description: "Items you've shown interest in.",
      category: "Personal",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Suggestions For You</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-4">
              {suggestion.category}
            </span>
            <h2 className="text-xl font-semibold mb-2">{suggestion.title}</h2>
            <p className="text-gray-600 mb-4">{suggestion.description}</p>
            <button className="text-primary hover:text-primary/80 font-medium">
              Explore →
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          Personalized Recommendations
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {["Casual Wear", "Formal", "Accessories", "Shoes"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Preferred Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Women's Fashion",
                  "Men's Fashion",
                  "Seasonal",
                  "Trending",
                ].map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
