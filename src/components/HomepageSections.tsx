import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Product } from "../types/product";
import type { Section } from "../types/section";
import ProductCard from "./ProductCard";

const HomepageSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionProducts, setSectionProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      // Fetch active sections
      const sectionsSnapshot = await getDocs(
        query(collection(db, "sections"), where("isActive", "==", true))
      );
      const sectionsData = sectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Section[];

      // Sort sections by order
      const sortedSections = sectionsData.sort((a, b) => a.order - b.order);
      setSections(sortedSections);

      // Fetch all products for all sections at once
      const allProductIds = new Set(
        sectionsData.flatMap((section) => section.productIds)
      );

      if (allProductIds.size > 0) {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const allProducts = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Create a map of section ID to its products
        const productsMap: Record<string, Product[]> = {};
        sectionsData.forEach((section) => {
          productsMap[section.id] = section.productIds
            .map((id) => allProducts.find((p) => p.id === id))
            .filter((p): p is Product => p !== undefined);
        });

        setSectionProducts(productsMap);
      }
    } catch (error) {
      console.error("Error fetching homepage sections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm lg:text-base">
            Loading sections...
          </p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <div key={section.id} className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-gray-900">
              {section.name}
            </h2>
            {section.description && (
              <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
                {section.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {sectionProducts[section.id]?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomepageSections;
