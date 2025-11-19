import { useEffect } from "react";
import { useReduxPromotion } from "./useReduxPromotion";
import { useEmailSubscription } from "./useEmailSubscription";

export const PromotionReduxInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { fetchPromotions } = useReduxPromotion();
  const { fetchSubscribers } = useEmailSubscription();

  useEffect(() => {
    // Fetch promotions and subscribers on app load
    Promise.all([fetchPromotions(), fetchSubscribers()]).catch((err) =>
      console.error("Error initializing promotion data:", err)
    );
  }, [fetchPromotions, fetchSubscribers]);

  return <>{children}</>;
};

export default PromotionReduxInitializer;
