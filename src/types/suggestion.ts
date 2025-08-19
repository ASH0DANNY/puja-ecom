export interface Suggestion {
  id: string;
  type: "WEBSITE_FEEDBACK" | "PRODUCT_REQUEST" | "FEATURE_REQUEST" | "OTHER";
  title: string;
  description: string;
  category?: string;
  email: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "IMPLEMENTED";
  createdAt: Date;
}
