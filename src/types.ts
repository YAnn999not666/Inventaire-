export interface PriceTier {
  id: string;
  price: number;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  tiers: PriceTier[];
}

export interface SavedInventoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  totalQuantity: number;
  categories: Category[];
  savedAt: string;
}
