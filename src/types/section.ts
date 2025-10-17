export interface Section {
  id: string;
  name: string;
  description?: string;
  productIds: string[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
