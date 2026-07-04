import { Product, Ingredient } from '../types';
import { getProductCost, getActualFoodCostPct, getGrossMarginPct, formatCurrency, getFoodCostColor } from '../utils';
import { Coffee, Cake, ChevronRight, TrendingUp } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  ingredients: Ingredient[];
  onClick: () => void;
}

export default function ProductCard({ product, ingredients, onClick }: ProductCardProps) {
  const cost = getProductCost(product, ingredients);
  const fcPct = getActualFoodCostPct(cost, product.sellingPrice);
  const marginPct = getGrossMarginPct(cost, product.sellingPrice);
  
  const fcStyle = getFoodCostColor(fcPct);

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition duration-200 cursor-pointer flex justify-between items-center group active:scale-[0.99] select-none"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Category Icon */}
        <div className={`p-3.5 rounded-xl shrink-0 transition-all ${product.category === 'Kawa' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100' : 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 group-hover:bg-pink-100'}`}>
          {product.category === 'Kawa' ? (
            <Coffee className="w-6 h-6 stroke-[2]" />
          ) : (
            <Cake className="w-6 h-6 stroke-[2]" />
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0">
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">
            {product.name}
          </h4>
          
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Koszt: <strong className="font-semibold">{formatCurrency(cost)}</strong>
            </span>
            <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Zysk: <strong className="font-semibold">{formatCurrency(Math.max(0, product.sellingPrice - cost))}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics and Chevron */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
            {formatCurrency(product.sellingPrice)}
          </div>
          
          {/* Food Cost Badge */}
          <div className="flex items-center gap-2 justify-end mt-1">
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${fcStyle.bg} ${fcStyle.text}`}>
              FC {fcPct.toFixed(0)}%
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">
              Marża {marginPct.toFixed(0)}%
            </span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
      </div>
    </div>
  );
}
