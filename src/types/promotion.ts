// Promotion/Campaign types
export interface Promotion {
  id?: string;
  title: string;
  description: string;
  type: "product" | "offer" | "discount"; // Type of promotion
  content: string; // Full promotional content/message
  discountPercentage?: number; // For discount type
  discountCode?: string; // Promo code if applicable
  validFrom: Date | string;
  validUntil: Date | string;
  imageUrl?: string; // Banner/image for promotion
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Record of sent promotional emails (for tracking)
export interface PromotionEmail {
  id?: string;
  promotionId: string;
  promotionTitle: string;
  sentAt: Date | string;
  recipientCount: number;
  subject: string;
  successCount: number;
  failureCount: number;
  status: "pending" | "sent" | "failed";
}

// Subscribed email for promotions
export interface SubscribedEmail {
  id?: string;
  email: string;
  subscribedAt: Date | string;
  isActive: boolean;
  unsubscribeToken?: string; // Token for unsubscribe link
}

// Promotion state in Redux
export interface PromotionState {
  promotions: Promotion[];
  emailHistory: PromotionEmail[];
  loading: boolean;
  error: string | null;
}

// Email subscription state in Redux
export interface EmailSubscriptionState {
  subscribers: SubscribedEmail[];
  loading: boolean;
  error: string | null;
}
