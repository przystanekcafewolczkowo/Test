export interface Ingredient {
  id: string;
  name: string;
  price: number; // price for the whole package
  amount: number; // size of the package (e.g., 1000 for 1kg/1L, 10 for a 10-pack)
  unit: string; // 'g', 'ml', 'szt.', 'kg', 'l'
  category: string; // 'Kawa', 'Nabiał', 'Cukier i Syropy', 'Owoce', 'Mąka i Suche', 'Inne'
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // quantity in recipe (in the ingredient's unit, e.g. 18g coffee beans, 150ml milk)
}

export interface Product {
  id: string;
  name: string;
  category: 'Kawa' | 'Deser';
  ingredients: RecipeIngredient[];
  targetFoodCost: number; // target food cost percentage, e.g. 25 for 25%
  sellingPrice: number; // actual selling price (gross or net, let's treat as final price)
  notes?: string;
}

export interface CafeStats {
  totalProducts: number;
  totalIngredients: number;
  averageFoodCost: number;
  averageMargin: number;
}
