import { useEffect } from "react";
import { useScrollToTop } from "../utils/scrollToTop";
import DiscountManager from "../components/DiscountManager";

const DiscountManagementPage = () => {
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  }, []);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Discount Management
        </h1>
        <DiscountManager />
      </div>
    </div>
  );
};

export default DiscountManagementPage;
