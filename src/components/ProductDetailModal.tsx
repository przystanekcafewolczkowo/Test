import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coffee, Cake, Info, Save, Sliders, TrendingUp, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { Ingredient, Product } from '../types';
import { 
  getProductCost, 
  getActualFoodCostPct, 
  getGrossMarginPct, 
  getMarkupPct, 
  getSuggestedPrice, 
  formatCurrency, 
  getFoodCostColor,
  calculateIngredientCost
} from '../utils';

interface ProductDetailModalProps {
  product: Product | null;
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export default function ProductDetailModal({ product, ingredients, onClose, onSave }: ProductDetailModalProps) {
  if (!product) return null;

  const cost = getProductCost(product, ingredients);
  
  // Local state for the interactive pricing simulator
  const [sellingPrice, setSellingPrice] = useState(product.sellingPrice);
  const [targetFoodCost, setTargetFoodCost] = useState(product.targetFoodCost);
  const [isAutoPricing, setIsAutoPricing] = useState(false); // Whether price is bound to target food cost

  // Sync state if product changes
  useEffect(() => {
    setSellingPrice(product.sellingPrice);
    setTargetFoodCost(product.targetFoodCost);
  }, [product]);

  // Handle auto pricing recalculation
  useEffect(() => {
    if (isAutoPricing) {
      const suggested = getSuggestedPrice(cost, targetFoodCost);
      setSellingPrice(Math.round(suggested * 100) / 100);
    }
  }, [isAutoPricing, targetFoodCost, cost]);

  const actualFoodCost = getActualFoodCostPct(cost, sellingPrice);
  const grossMarginPct = getGrossMarginPct(cost, sellingPrice);
  const markupPct = getMarkupPct(cost, sellingPrice);
  const grossProfit = Math.max(0, sellingPrice - cost);
  
  const fcColor = getFoodCostColor(actualFoodCost);

  const handlePriceChange = (value: number) => {
    setSellingPrice(value);
    if (isAutoPricing) {
      // If manually adjusting price, we turn off auto-pricing
      setIsAutoPricing(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...product,
      sellingPrice: Number(sellingPrice),
      targetFoodCost: Number(targetFoodCost)
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-black/60 backdrop-blur-xs select-none p-0 md:p-6">
      {/* Tap outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Slide up sheet / Centered on iPad & desktop */}
      <motion.div 
        initial={{ y: '50%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '50%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full md:max-w-2xl max-h-[90%] md:max-h-[92%] bg-white dark:bg-zinc-900 rounded-t-[30px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-t md:border border-zinc-100 dark:border-zinc-800"
      >
        {/* iPad/iOS Drag Indicator (hidden on tablet, visible on mobile) */}
        <div className="w-full py-3 flex justify-center items-center md:hidden">
          <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl ${product.category === 'Kawa' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'bg-pink-100 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300'}`}>
              {product.category === 'Kawa' ? <Coffee className="w-6 h-6 stroke-[2]" /> : <Cake className="w-6 h-6 stroke-[2]" />}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{product.category}</span>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-tight mt-0.5">{product.name}</h3>
            </div>
          </div>
          <button 
            id="close-modal-btn"
            onClick={onClose} 
            className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Notes description if any */}
          {product.notes && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/40">
              "{product.notes}"
            </p>
          )}

          {/* Section: Recipe Breakdown */}
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Składniki Receptury</h4>
            <div className="bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              {product.ingredients.length === 0 ? (
                <div className="p-5 text-center text-sm text-zinc-400">Brak dodanych składników.</div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {product.ingredients.map((recipeIng, idx) => {
                    const ing = ingredients.find(i => i.id === recipeIng.ingredientId);
                    if (!ing) return null;
                    const itemCost = calculateIngredientCost(ing, recipeIng.quantity);
                    return (
                      <div key={idx} className="p-4 flex justify-between items-center text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-zinc-850 dark:text-zinc-100">{ing.name}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Zużycie: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{recipeIng.quantity} {ing.unit}</strong> ({formatCurrency(ing.price)} za {ing.amount} {ing.unit})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-zinc-750 dark:text-zinc-200">
                          {formatCurrency(itemCost)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* COGS Summary */}
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-900/60 flex justify-between items-center text-sm font-extrabold">
                    <span className="text-zinc-700 dark:text-zinc-300">Koszt Składników (COGS):</span>
                    <span className="font-mono text-zinc-950 dark:text-white text-base sm:text-lg font-black">
                      {formatCurrency(cost)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Interactive Simulator */}
          <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900/40 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-500" />
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Symulator Foodcost i Marży</h4>
              </div>
              
              {/* Auto Pricing Toggle Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Blokuj Foodcost</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isAutoPricing}
                    onChange={(e) => setIsAutoPricing(e.target.checked)}
                  />
                  <div className="w-10 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all"></div>
                </div>
              </label>
            </div>

            {/* Slider 1: Selling Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Cena sprzedaży (PLN):</span>
                <span className="font-black text-zinc-900 dark:text-white font-mono text-base bg-white dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  {formatCurrency(sellingPrice)}
                </span>
              </div>
              <input 
                type="range"
                min={Math.max(1, Math.ceil(cost))}
                max={Math.max(80, Math.ceil(cost * 15))}
                step="0.5"
                value={sellingPrice}
                disabled={isAutoPricing}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 accent-sky-500 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
              />
              {isAutoPricing && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>Cena wylicza się automatycznie na podstawie docelowego foodcostu</span>
                </div>
              )}
            </div>

            {/* Slider 2: Target Food Cost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Docelowy Food Cost (%):</span>
                <span className="font-black text-zinc-900 dark:text-white font-mono text-base bg-white dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  {targetFoodCost}%
                </span>
              </div>
              <input 
                type="range"
                min="5"
                max="80"
                step="1"
                value={targetFoodCost}
                onChange={(e) => {
                  setTargetFoodCost(Number(e.target.value));
                  setIsAutoPricing(true); // turning on target-bound price calculation when they slide this
                }}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 accent-amber-500 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Proportional Split Visual Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-450 font-bold px-1">
                <span>Składniki ({actualFoodCost.toFixed(0)}%)</span>
                <span>Zysk brutto ({grossMarginPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-amber-500 h-full transition-all duration-200"
                  style={{ width: `${Math.min(100, actualFoodCost)}%` }}
                />
                <div 
                  className="bg-emerald-500 h-full flex-1 transition-all duration-200"
                  style={{ width: `${Math.max(0, 100 - actualFoodCost)}%` }}
                />
              </div>
            </div>

            {/* Simulation Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 flex flex-col justify-between">
                <span className="text-xs text-zinc-450 dark:text-zinc-500 font-bold">Zysk Brutto (Marża zł)</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  +{formatCurrency(grossProfit)}
                </span>
              </div>
              
              <div className="bg-white dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 flex flex-col justify-between">
                <span className="text-xs text-zinc-450 dark:text-zinc-500 font-bold">Rzeczywista Marża %</span>
                <span className="text-base font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
                  {grossMarginPct.toFixed(1)}%
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 flex flex-col justify-between">
                <span className="text-xs text-zinc-455 dark:text-zinc-500 font-bold">Narzut (Mark-up) %</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                  {markupPct.toFixed(0)}%
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 flex flex-col justify-between">
                <span className="text-xs text-zinc-450 dark:text-zinc-500 font-bold">Status Food Cost</span>
                <span className={`text-xs font-extrabold mt-1.5 px-2 py-1 rounded-md text-center inline-block ${fcColor.bg} ${fcColor.text}`}>
                  {fcColor.label} ({actualFoodCost.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Guard/Warning Message if Selling Price is too low */}
            {sellingPrice <= cost && (
              <div className="flex items-center gap-2.5 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Cena sprzedaży jest niższa lub równa kosztom! Tracisz na każdym serwowanym produkcie.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex gap-3.5">
          <button 
            id="cancel-modal-btn"
            onClick={onClose} 
            className="flex-1 py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-xs sm:text-sm hover:opacity-90 active:scale-98 transition"
          >
            Anuluj
          </button>
          <button 
            id="save-modal-btn"
            onClick={handleSave}
            disabled={sellingPrice <= 0}
            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-500/10 hover:opacity-95 active:scale-98 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Zastosuj ceny
          </button>
        </div>
      </motion.div>
    </div>
  );
}
