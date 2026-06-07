interface Promotion {
  id: number;
  name: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategories: string | null;
  applicableProducts: string | null;
}

interface Product {
  id: number;
  price: number;
  categoryId: number;
}

export const getApplicablePromotion = (product: Product, promotions: Promotion[]): Promotion | null => {
  const now = new Date();

  for (const promo of promotions) {
    // Check if promotion is active and within date range
    if (!promo.isActive) continue;
    
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    if (now < startDate || now > endDate) continue;

    // Check if product is in applicable categories
    if (promo.applicableCategories) {
      const categories = JSON.parse(promo.applicableCategories);
      if (!categories.includes(product.categoryId)) continue;
    }

    // Check if product is in applicable products
    if (promo.applicableProducts) {
      const products = JSON.parse(promo.applicableProducts);
      if (!products.includes(product.id)) continue;
    }

    // If no restrictions, or product matches restrictions, this promotion applies
    return promo;
  }

  return null;
};

export const calculateDiscountedPrice = (originalPrice: number, promotion: Promotion): number => {
  if (promotion.type === 'percentage') {
    const discount = originalPrice * (promotion.value / 100);
    const discountedPrice = originalPrice - discount;
    
    // Apply max discount limit if exists
    if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
      return originalPrice - promotion.maxDiscountAmount;
    }
    
    return discountedPrice;
  } else if (promotion.type === 'fixed_amount') {
    const discountedPrice = originalPrice - promotion.value;
    return Math.max(0, discountedPrice);
  }
  
  return originalPrice;
};
