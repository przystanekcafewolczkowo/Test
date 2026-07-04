import { Ingredient, Product, RecipeIngredient } from './types';

/**
 * Calculates the exact cost of a given quantity of an ingredient.
 */
export function calculateIngredientCost(ingredient: Ingredient, quantity: number): number {
  if (!ingredient || ingredient.amount <= 0) return 0;
  // Cost per unit * quantity
  return (ingredient.price / ingredient.amount) * quantity;
}

/**
 * Calculates the total cost of ingredients (COGS) for a product.
 */
export function getProductCost(product: Product, ingredients: Ingredient[]): number {
  return product.ingredients.reduce((total, recipeIng) => {
    const ing = ingredients.find(i => i.id === recipeIng.ingredientId);
    if (!ing) return total;
    return total + calculateIngredientCost(ing, recipeIng.quantity);
  }, 0);
}

/**
 * Calculates the suggested selling price based on the cost and target food cost percentage.
 * Suggested Price = Cost / (Target Food Cost % / 100)
 */
export function getSuggestedPrice(cost: number, targetFoodCostPct: number): number {
  if (targetFoodCostPct <= 0) return cost;
  return cost / (targetFoodCostPct / 100);
}

/**
 * Calculates the actual food cost percentage based on cost and selling price.
 * Food Cost % = (Cost / Selling Price) * 100
 */
export function getActualFoodCostPct(cost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return (cost / sellingPrice) * 100;
}

/**
 * Calculates the gross margin percentage.
 * Gross Margin % = ((Selling Price - Cost) / Selling Price) * 100
 */
export function getGrossMarginPct(cost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

/**
 * Calculates the markup percentage.
 * Markup % = ((Selling Price - Cost) / Cost) * 100
 */
export function getMarkupPct(cost: number, sellingPrice: number): number {
  if (cost <= 0) return 0;
  return ((sellingPrice - cost) / cost) * 100;
}

/**
 * Helper to format currency values cleanly in Polish Zloty (PLN) by default.
 */
export function formatCurrency(value: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Helper to determine the color badge class based on food cost percentage.
 * Lower is better (more profitable).
 */
export function getFoodCostColor(pct: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (pct <= 0) {
    return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: 'Brak' };
  }
  if (pct <= 22) {
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/50', label: 'Świetny' };
  }
  if (pct <= 30) {
    return { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/50', label: 'Dobry' };
  }
  if (pct <= 35) {
    return { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/50', label: 'Wysoki' };
  }
  return { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/50', label: 'Krytyczny' };
}
