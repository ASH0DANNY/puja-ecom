import { useCallback } from "react";
import {
  setPromotions,
  addPromotion,
  updatePromotion,
  removePromotion,
  setLoading,
  setError,
  addEmailToHistory,
} from "../redux/slices/promotionSlice";
import {
  useAppDispatch,
  useAppSelector,
  selectPromotions,
  selectPromotionLoading,
  selectPromotionError,
  selectPromotionEmailHistory,
} from "../redux/hooks";
import { sendPromotionalEmailToSubscribers } from "../utils/emailService";
import type { Promotion } from "../types/promotion";

const STORAGE_KEY = "puja_ecom_promotions";

export const useReduxPromotion = () => {
  const dispatch = useAppDispatch();
  const promotions = useAppSelector(selectPromotions);
  const loading = useAppSelector(selectPromotionLoading);
  const error = useAppSelector(selectPromotionError);
  const emailHistory = useAppSelector(selectPromotionEmailHistory);

  // Fetch all promotions from localStorage
  const fetchPromotions = useCallback(() => {
    dispatch(setLoading(true));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const promotionsData = stored ? JSON.parse(stored) : [];
      dispatch(setPromotions(promotionsData));
      dispatch(setError(null));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch promotions";
      dispatch(setError(errorMessage));
      console.error("Error fetching promotions:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Create new promotion (localStorage only)
  const createPromotion = useCallback(
    async (
      promotionData: Omit<Promotion, "id" | "createdAt" | "updatedAt">
    ) => {
      dispatch(setLoading(true));
      try {
        const newPromotion: Promotion = {
          id: `promo_${Date.now()}`,
          ...promotionData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const promotionsData = stored ? JSON.parse(stored) : [];
        promotionsData.push(newPromotion);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(promotionsData));

        dispatch(addPromotion(newPromotion));
        dispatch(setError(null));
        return newPromotion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create promotion";
        dispatch(setError(errorMessage));
        console.error("Error creating promotion:", err);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  // Update promotion (localStorage only)
  const updatePromotionData = useCallback(
    async (promotionId: string, updates: Partial<Promotion>) => {
      dispatch(setLoading(true));
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const promotionsData = stored ? JSON.parse(stored) : [];
        const index = promotionsData.findIndex(
          (p: Promotion) => p.id === promotionId
        );

        if (index !== -1) {
          promotionsData[index] = {
            ...promotionsData[index],
            ...updates,
            updatedAt: new Date(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(promotionsData));
        }

        const updatedPromotion: Promotion = {
          id: promotionId,
          ...promotions.find((p) => p.id === promotionId),
          ...updates,
          updatedAt: new Date(),
        } as Promotion;

        dispatch(updatePromotion(updatedPromotion));
        dispatch(setError(null));
        return updatedPromotion;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update promotion";
        dispatch(setError(errorMessage));
        console.error("Error updating promotion:", err);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, promotions]
  );

  // Delete promotion (localStorage only)
  const deletePromotion = useCallback(
    async (promotionId: string) => {
      dispatch(setLoading(true));
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const promotionsData = stored ? JSON.parse(stored) : [];
        const filtered = promotionsData.filter(
          (p: Promotion) => p.id !== promotionId
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        dispatch(removePromotion(promotionId));
        dispatch(setError(null));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete promotion";
        dispatch(setError(errorMessage));
        console.error("Error deleting promotion:", err);
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  // Record email campaign sent
  const recordEmailCampaign = useCallback(
    (
      promotionId: string,
      promotionTitle: string,
      recipientCount: number,
      subject: string
    ) => {
      dispatch(
        addEmailToHistory({
          promotionId,
          promotionTitle,
          recipientCount,
          subject,
        })
      );
    },
    [dispatch]
  );

  // Send promotional email to subscribers
  const sendCampaignToSubscribers = useCallback(
    async (
      promotion: Promotion,
      subscriberEmails: string[]
    ): Promise<{ successCount: number; failureCount: number; errors: string[] }> => {
      dispatch(setLoading(true));
      try {
        const result = await sendPromotionalEmailToSubscribers({
          subscriberEmails,
          campaignTitle: promotion.title,
          campaignDescription: promotion.description,
          campaignType: promotion.type,
          campaignContent: promotion.content,
          discountPercentage: promotion.discountPercentage,
          discountCode: promotion.discountCode,
          validFrom: promotion.validFrom instanceof Date 
            ? promotion.validFrom.toISOString().split('T')[0]
            : promotion.validFrom,
          imageUrl: promotion.imageUrl,
        });

        // Record successful campaign sending
        if (result.successCount > 0) {
          recordEmailCampaign(
            promotion.id || "",
            promotion.title,
            result.successCount,
            `${promotion.title} - ${promotion.type}`
          );
        }

        dispatch(setError(null));
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send campaign emails";
        dispatch(setError(errorMessage));
        console.error("Error sending campaign:", err);
        return {
          successCount: 0,
          failureCount: subscriberEmails.length,
          errors: [errorMessage],
        };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, recordEmailCampaign]
  );

  return {
    promotions,
    loading,
    error,
    emailHistory,
    fetchPromotions,
    createPromotion,
    updatePromotionData,
    deletePromotion,
    recordEmailCampaign,
    sendCampaignToSubscribers,
  };
};
