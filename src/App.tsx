import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  Cake, 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Edit2, 
  PlusCircle, 
  TrendingUp, 
  BarChart2, 
  RotateCcw, 
  Check, 
  Info, 
  DollarSign, 
  X, 
  Sparkles,
  ChevronRight,
  Package,
  Calculator,
  Flame,
  FileDown,
  FileUp,
  Sliders
} from 'lucide-react';

import { Ingredient, Product, RecipeIngredient } from './types';
import { INITIAL_INGREDIENTS, INITIAL_PRODUCTS } from './initialData';
import { 
  getProductCost, 
  getActualFoodCostPct, 
  getGrossMarginPct, 
  formatCurrency, 
  getFoodCostColor, 
  calculateIngredientCost,
  getSuggestedPrice
} from './utils';

import MockIPhoneFrame from './components/MockIPhoneFrame';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';

export default function App() {
  // State for ingredients and products
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'ingredients' | 'builder' | 'settings'>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Kawa' | 'Deser'>('all');
  
  // App settings state
  const [globalTargetFoodCost, setGlobalTargetFoodCost] = useState(25);
  const [currency, setCurrency] = useState('PLN');

  // Interactive detail modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // New Ingredient input form state
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngPrice, setNewIngPrice] = useState('');
  const [newIngAmount, setNewIngAmount] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('g');
  const [newIngCategory, setNewIngCategory] = useState('Kawa');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);

  // New Recipe / Product Builder state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Kawa' | 'Deser'>('Kawa');
  const [newProdIngredients, setNewProdIngredients] = useState<RecipeIngredient[]>([]);
  const [newProdTargetFC, setNewProdTargetFC] = useState(25);
  const [newProdSellingPrice, setNewProdSellingPrice] = useState('');
  const [newProdNotes, setNewProdNotes] = useState('');
  const [builderStep, setBuilderStep] = useState<1 | 2>(1); // Step 1: Info, Step 2: Ingredients

  // Notifications state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load from local storage
  useEffect(() => {
    const storedIngredients = localStorage.getItem('cafe_ingredients');
    const storedProducts = localStorage.getItem('cafe_products');
    const storedFC = localStorage.getItem('cafe_target_fc');
    const storedCurrency = localStorage.getItem('cafe_currency');

    if (storedIngredients) {
      setIngredients(JSON.parse(storedIngredients));
    } else {
      setIngredients(INITIAL_INGREDIENTS);
      localStorage.setItem('cafe_ingredients', JSON.stringify(INITIAL_INGREDIENTS));
    }

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('cafe_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (storedFC) {
      setGlobalTargetFoodCost(Number(storedFC));
    }
    
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }
  }, []);

  // Save changes to LocalStorage helper
  const saveIngredientsToStorage = (updatedIngs: Ingredient[]) => {
    setIngredients(updatedIngs);
    localStorage.setItem('cafe_ingredients', JSON.stringify(updatedIngs));
  };

  const saveProductsToStorage = (updatedProds: Product[]) => {
    setProducts(updatedProds);
    localStorage.setItem('cafe_products', JSON.stringify(updatedProds));
  };

  // Show a beautiful temporary banner
  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // 1. Ingredients CRUD operations
  const handleAddOrEditIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName || !newIngPrice || !newIngAmount) {
      triggerNotification('Wypełnij wszystkie pola składnika!', 'info');
      return;
    }

    const priceNum = parseFloat(newIngPrice);
    const amountNum = parseFloat(newIngAmount);

    if (isNaN(priceNum) || priceNum <= 0 || isNaN(amountNum) || amountNum <= 0) {
      triggerNotification('Podaj prawidłowe liczby dodatnie!', 'info');
      return;
    }

    if (editingIngId) {
      // Edit
      const updated = ingredients.map(ing => 
        ing.id === editingIngId 
          ? { ...ing, name: newIngName, price: priceNum, amount: amountNum, unit: newIngUnit, category: newIngCategory }
          : ing
      );
      saveIngredientsToStorage(updated);
      setEditingIngId(null);
      triggerNotification(`Składnik "${newIngName}" został zaktualizowany!`);
    } else {
      // Add
      const newIng: Ingredient = {
        id: `ing-${Date.now()}`,
        name: newIngName,
        price: priceNum,
        amount: amountNum,
        unit: newIngUnit,
        category: newIngCategory
      };
      saveIngredientsToStorage([...ingredients, newIng]);
      triggerNotification(`Dodano nowy składnik: "${newIngName}"!`);
    }

    // Reset Form
    setNewIngName('');
    setNewIngPrice('');
    setNewIngAmount('');
    setIsAddingIngredient(false);
  };

  const handleStartEditIngredient = (ing: Ingredient) => {
    setEditingIngId(ing.id);
    setNewIngName(ing.name);
    setNewIngPrice(ing.price.toString());
    setNewIngAmount(ing.amount.toString());
    setNewIngUnit(ing.unit);
    setNewIngCategory(ing.category);
    setIsAddingIngredient(true);
  };

  const handleDeleteIngredient = (id: string, name: string) => {
    // Check if ingredient is used in any products
    const isUsed = products.some(prod => prod.ingredients.some(ri => ri.ingredientId === id));
    if (isUsed) {
      const affectedProducts = products.filter(prod => prod.ingredients.some(ri => ri.ingredientId === id)).map(p => p.name).join(', ');
      triggerNotification(`Nie można usunąć! Składnik jest używany w recepturach: ${affectedProducts}`, 'info');
      return;
    }

    if (window.confirm(`Czy na pewno chcesz usunąć składnik "${name}"?`)) {
      const filtered = ingredients.filter(ing => ing.id !== id);
      saveIngredientsToStorage(filtered);
      triggerNotification(`Usunięto składnik "${name}"`);
    }
  };

  // 2. Product and pricing update from detail sheet
  const handleUpdateProductPrice = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProductsToStorage(updated);
    triggerNotification(`Zaktualizowano cenę i foodcost dla "${updatedProduct.name}"!`);
  };

  // 3. Product creation in Creator (Tab 3)
  const handleToggleBuilderIngredient = (ingId: string) => {
    const exists = newProdIngredients.find(ri => ri.ingredientId === ingId);
    if (exists) {
      setNewProdIngredients(newProdIngredients.filter(ri => ri.ingredientId !== ingId));
    } else {
      setNewProdIngredients([...newProdIngredients, { ingredientId: ingId, quantity: 1 }]);
    }
  };

  const handleBuilderQuantityChange = (ingId: string, qty: number) => {
    setNewProdIngredients(newProdIngredients.map(ri => 
      ri.ingredientId === ingId ? { ...ri, quantity: Math.max(0, qty) } : ri
    ));
  };

  const getTemporaryBuilderCost = (): number => {
    return newProdIngredients.reduce((total, ri) => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      if (!ing) return total;
      return total + calculateIngredientCost(ing, ri.quantity);
    }, 0);
  };

  const handleSaveCreatedProduct = () => {
    if (!newProdName) {
      triggerNotification('Nazwa produktu jest wymagana!', 'info');
      return;
    }

    if (newProdIngredients.length === 0) {
      triggerNotification('Wybierz przynajmniej jeden składnik receptury!', 'info');
      return;
    }

    const cost = getTemporaryBuilderCost();
    const sellingPriceNum = newProdSellingPrice ? parseFloat(newProdSellingPrice) : getSuggestedPrice(cost, newProdTargetFC);

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      triggerNotification('Podaj prawidłową cenę sprzedaży!', 'info');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      ingredients: [...newProdIngredients],
      targetFoodCost: newProdTargetFC,
      sellingPrice: Math.round(sellingPriceNum * 100) / 100,
      notes: newProdNotes
    };

    const updatedProds = [...products, newProd];
    saveProductsToStorage(updatedProds);
    triggerNotification(`Stworzono pomyślnie produkt "${newProdName}"!`);

    // Reset Builder Form
    setNewProdName('');
    setNewProdCategory('Kawa');
    setNewProdIngredients([]);
    setNewProdSellingPrice('');
    setNewProdNotes('');
    setBuilderStep(1);
    setActiveTab('menu'); // Return to menu tab to see it!
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Czy chcesz usunąć produkt "${name}" z menu?`)) {
      const filtered = products.filter(p => p.id !== id);
      saveProductsToStorage(filtered);
      triggerNotification(`Usunięto produkt "${name}"`);
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    }
  };

  // 4. Settings operations
  const handleResetToDefaults = () => {
    if (window.confirm('Czy na pewno chcesz przywrócić domyślne składniki i receptury? Stracisz własne zmiany.')) {
      setIngredients(INITIAL_INGREDIENTS);
      setProducts(INITIAL_PRODUCTS);
      setGlobalTargetFoodCost(25);
      setCurrency('PLN');
      localStorage.setItem('cafe_ingredients', JSON.stringify(INITIAL_INGREDIENTS));
      localStorage.setItem('cafe_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('cafe_target_fc', '25');
      localStorage.setItem('cafe_currency', 'PLN');
      triggerNotification('Przywrócono domyślne dane kawiarni!', 'success');
    }
  };

  const handleUpdateGlobalTargetFC = (val: number) => {
    setGlobalTargetFoodCost(val);
    localStorage.setItem('cafe_target_fc', val.toString());
  };

  const handleUpdateCurrency = (curr: string) => {
    setCurrency(curr);
    localStorage.setItem('cafe_currency', curr);
    triggerNotification(`Zmieniono walutę na ${curr}`);
  };

  // JSON Export / Import Data
  const handleExportData = () => {
    const backupData = {
      ingredients,
      products,
      globalTargetFoodCost,
      currency,
      version: '1.0'
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kawiarnia_foodcost_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification('Wyeksportowano pomyślnie plik JSON!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.ingredients && parsed.products) {
            saveIngredientsToStorage(parsed.ingredients);
            saveProductsToStorage(parsed.products);
            if (parsed.globalTargetFoodCost) {
              setGlobalTargetFoodCost(parsed.globalTargetFoodCost);
              localStorage.setItem('cafe_target_fc', parsed.globalTargetFoodCost.toString());
            }
            if (parsed.currency) {
              setCurrency(parsed.currency);
              localStorage.setItem('cafe_currency', parsed.currency);
            }
            triggerNotification('Zaimportowano dane pomyślnie!', 'success');
          } else {
            triggerNotification('Nieprawidłowy plik kopii zapasowej!', 'info');
          }
        } catch (error) {
          triggerNotification('Błąd odczytu pliku JSON!', 'info');
        }
      };
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prod.notes && prod.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || prod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouped ingredients for rendering in tab 2
  const ingredientsByCategory = filteredIngredients.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // Calculation of overall café metrics
  const totalPortfoliCost = products.reduce((acc, p) => acc + getProductCost(p, ingredients), 0);
  const totalPortfolioRevenue = products.reduce((acc, p) => acc + p.sellingPrice, 0);
  const averageFC = totalPortfolioRevenue > 0 ? (totalPortfoliCost / totalPortfolioRevenue) * 100 : 0;
  const averageMargin = 100 - averageFC;

  return (
    <MockIPhoneFrame>
      
      {/* Dynamic Slide-in Notification Bar */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-4 right-4 z-50 p-3 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2 backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 border-zinc-100 dark:border-zinc-800"
          >
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-zinc-800 dark:text-zinc-200 flex-1">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* iPad Navigation Header */}
        <div className="px-6 md:px-10 pt-6 pb-3 shrink-0 flex flex-col gap-1.5 select-none">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs sm:text-sm font-bold text-sky-500 uppercase tracking-widest">
                Coffee & Dessert Costing
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
                {activeTab === 'menu' && 'Menu Cafe'}
                {activeTab === 'ingredients' && 'Składniki'}
                {activeTab === 'builder' && 'Kreator Receptur'}
                {activeTab === 'settings' && 'Statystyki i Opcje'}
              </h1>
            </div>
            
            {/* Quick Action in Header */}
            {activeTab === 'menu' && (
              <button 
                id="header-add-prod-btn"
                onClick={() => {
                  setBuilderStep(1);
                  setActiveTab('builder');
                }}
                className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-90 active:scale-95 shadow-md shadow-sky-500/10 transition"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}

            {activeTab === 'ingredients' && (
              <button 
                id="header-add-ing-btn"
                onClick={() => {
                  setEditingIngId(null);
                  setNewIngName('');
                  setNewIngPrice('');
                  setNewIngAmount('');
                  setIsAddingIngredient(!isAddingIngredient);
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-md ${isAddingIngredient ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-600' : 'bg-sky-500 text-white shadow-sky-500/10'}`}
              >
                {isAddingIngredient ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Search Bar / Category Filter (For Menu & Ingredients tabs only) */}
        {(activeTab === 'menu' || activeTab === 'ingredients') && (
          <div className="px-6 md:px-10 pb-4 shrink-0 space-y-3.5 select-none">
            {/* iPad Search Bar */}
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-zinc-400 dark:text-zinc-500" />
              <input 
                type="text"
                placeholder={activeTab === 'menu' ? 'Szukaj kawy lub deseru...' : 'Szukaj składnika...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-10 bg-zinc-200/60 dark:bg-zinc-900 border-0 focus:ring-1 focus:ring-sky-500/50 text-sm sm:text-base font-medium rounded-2xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Segmented control for category in Menu tab */}
            {activeTab === 'menu' && (
              <div className="w-full bg-zinc-200/60 dark:bg-zinc-900 p-1 rounded-2xl flex text-xs sm:text-sm font-bold select-none border border-zinc-100/10">
                <button 
                  onClick={() => setCategoryFilter('all')}
                  className={`flex-1 py-2.5 rounded-xl text-center transition ${categoryFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  Wszystkie
                </button>
                <button 
                  onClick={() => setCategoryFilter('Kawa')}
                  className={`flex-1 py-2.5 rounded-xl text-center transition ${categoryFilter === 'Kawa' ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  Kawy ☕
                </button>
                <button 
                  onClick={() => setCategoryFilter('Deser')}
                  className={`flex-1 py-2.5 rounded-xl text-center transition ${categoryFilter === 'Deser' ? 'bg-white dark:bg-zinc-800 text-pink-700 dark:text-pink-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  Desery 🍰
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Tab Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-6">
          
          {/* Tab 1: Menu List */}
          {activeTab === 'menu' && (
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2 select-none">
                  <Coffee className="w-12 h-12 text-zinc-300 dark:text-zinc-800 stroke-[1.5]" />
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">Brak pasujących pozycji w menu.</p>
                  <button 
                    onClick={() => {
                      setBuilderStep(1);
                      setActiveTab('builder');
                    }}
                    className="mt-2 text-xs font-bold text-sky-500 hover:underline"
                  >
                    Dodaj pierwszą recepturę
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="relative group">
                      <ProductCard 
                        product={product} 
                        ingredients={ingredients} 
                        onClick={() => setSelectedProduct(product)} 
                      />
                      
                      {/* Swipe action / floating delete button simulated nicely for desktop */}
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-2 p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 rounded-xl transition-all duration-200 shadow-xs"
                        title="Usuń produkt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Ingredients View */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              
              {/* Add/Edit Ingredient Form Panel */}
              <AnimatePresence>
                {isAddingIngredient && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddOrEditIngredient}
                    className="overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-4 space-y-3 select-none"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-500">
                      {editingIngId ? 'Edycja składnika' : 'Nowy Składnik'}
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nazwa składnika</label>
                        <input 
                          type="text" 
                          placeholder="np. Mleko świeże 3.2%, Kawa Etiopia" 
                          value={newIngName}
                          onChange={(e) => setNewIngName(e.target.value)}
                          className="w-full h-8 px-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-lg text-zinc-800 dark:text-zinc-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cena (PLN)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="np. 4.50" 
                            value={newIngPrice}
                            onChange={(e) => setNewIngPrice(e.target.value)}
                            className="w-full h-8 px-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-lg text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Ilość w opakowaniu</label>
                          <input 
                            type="number" 
                            step="1"
                            placeholder="np. 1000" 
                            value={newIngAmount}
                            onChange={(e) => setNewIngAmount(e.target.value)}
                            className="w-full h-8 px-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-lg text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Jednostka</label>
                          <select 
                            value={newIngUnit}
                            onChange={(e) => setNewIngUnit(e.target.value)}
                            className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-lg text-zinc-800 dark:text-zinc-100"
                          >
                            <option value="g">Gramy (g)</option>
                            <option value="ml">Mililitry (ml)</option>
                            <option value="szt.">Sztuki (szt.)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kategoria</label>
                          <select 
                            value={newIngCategory}
                            onChange={(e) => setNewIngCategory(e.target.value)}
                            className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-lg text-zinc-800 dark:text-zinc-100"
                          >
                            <option value="Kawa">Kawa</option>
                            <option value="Nabiał">Nabiał</option>
                            <option value="Cukier i Syropy">Cukier i Syropy</option>
                            <option value="Owoce">Owoce</option>
                            <option value="Mąka i Suche">Mąka i Suche</option>
                            <option value="Dodatki">Dodatki</option>
                            <option value="Inne">Inne</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingIngredient(false);
                          setEditingIngId(null);
                        }}
                        className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl text-[10px] transition"
                      >
                        Anuluj
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl text-[10px] hover:bg-sky-600 transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Zapisz
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Grouped Ingredients List */}
              {ingredients.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2 select-none">
                  <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-800 stroke-[1.5]" />
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">Brak zdefiniowanych składników.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start select-none">
                  {Object.keys(ingredientsByCategory).sort().map(category => (
                    <div key={category} className="space-y-1.5">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">
                        {category}
                      </h4>
                      
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {ingredientsByCategory[category].map(ing => {
                          // Cost per unit (e.g. per 1g or ml)
                          const unitCost = ing.price / ing.amount;
                          // Standardize visual helper (e.g. cost of 100g or 100ml for clarity)
                          const multiplyAmt = ing.unit === 'szt.' ? 1 : 100;
                          const showAmountCost = unitCost * multiplyAmt;

                          return (
                            <div key={ing.id} className="p-3.5 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-950/20 transition">
                              <div>
                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                  {ing.name}
                                </span>
                                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                                  <span>{formatCurrency(ing.price)} za {ing.amount} {ing.unit}</span>
                                  <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>
                                  <span className="font-mono text-zinc-500 dark:text-zinc-400">
                                    ({formatCurrency(showAmountCost)} / {multiplyAmt === 1 ? 'szt.' : `${multiplyAmt} ${ing.unit}`})
                                  </span>
                                </div>
                              </div>
                              
                              {/* Item actions */}
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => handleStartEditIngredient(ing)}
                                  className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-sky-500 rounded-lg transition"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                                  className="p-1.5 bg-zinc-50 hover:bg-rose-50 dark:bg-zinc-800/40 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Creator / Recipe Builder */}
          {activeTab === 'builder' && (
            <div className="space-y-4 select-none">
              
              {/* Step Segment Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-500">
                  Krok {builderStep} z 2: {builderStep === 1 ? 'Podstawowe informacje' : 'Złóż recepturę'}
                </span>
                
                {builderStep === 2 && (
                  <button 
                    onClick={() => setBuilderStep(1)}
                    className="text-[11px] font-bold text-zinc-500 hover:underline"
                  >
                    Wróć do Kroku 1
                  </button>
                )}
              </div>

              {/* Step 1 Form */}
              {builderStep === 1 && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Kategoria produktu</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setNewProdCategory('Kawa')}
                        className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 text-xs font-bold transition border ${newProdCategory === 'Kawa' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 text-amber-700 dark:text-amber-400 shadow-xs' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-500'}`}
                      >
                        <Coffee className="w-5 h-5" />
                        <span>Kawa lub Napój</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewProdCategory('Deser')}
                        className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 text-xs font-bold transition border ${newProdCategory === 'Deser' ? 'bg-pink-50 dark:bg-pink-950/20 border-pink-300 text-pink-700 dark:text-pink-400 shadow-xs' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-500'}`}
                      >
                        <Cake className="w-5 h-5" />
                        <span>Ciasto lub Deser</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Nazwa produktu</label>
                    <input 
                      type="text" 
                      placeholder="np. Latte Macchiato owsiane, Tarta malinowa" 
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full h-10 px-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-xl text-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Opis / Uwagi (opcjonalnie)</label>
                    <textarea 
                      placeholder="np. Podawać z dodatkowym cukrem brązowym, parzyć na ziarnach Specialty." 
                      value={newProdNotes}
                      rows={3}
                      onChange={(e) => setNewProdNotes(e.target.value)}
                      className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-sky-500/50 text-xs font-medium rounded-xl text-zinc-800 dark:text-zinc-100 resize-none"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (!newProdName) {
                        triggerNotification('Wpisz nazwę produktu!', 'info');
                        return;
                      }
                      setBuilderStep(2);
                    }}
                    className="w-full py-3.5 bg-sky-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-sky-500/10 hover:bg-sky-600 active:scale-98 transition flex items-center justify-center gap-1.5"
                  >
                    Dalej: Dobierz składniki
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2 Form (Add ingredients & Prices) */}
              {builderStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  
                  {/* Left Column: Select raw ingredients with quantity controls */}
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-xs space-y-3.5">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dostępne składniki w magazynie:</span>
                    
                    {ingredients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-400">
                        Nie masz żadnych składników! Najpierw stwórz składnik w zakładce "Składniki".
                      </div>
                    ) : (
                      <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 pr-1 space-y-1">
                        {ingredients.map(ing => {
                          const recipeItem = newProdIngredients.find(ri => ri.ingredientId === ing.id);
                          const isChecked = !!recipeItem;

                          return (
                            <div key={ing.id} className="py-2.5 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleBuilderIngredient(ing.id)}
                                    className="rounded border-zinc-300 dark:border-zinc-700 text-sky-500 focus:ring-sky-500/40 w-4.5 h-4.5"
                                  />
                                  <span>{ing.name}</span>
                                </label>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {formatCurrency(ing.price / ing.amount)} / {ing.unit}
                                </span>
                              </div>

                              {/* Ingredient Quantity slide/input if checked */}
                              {isChecked && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  className="pl-7 pr-1 flex items-center gap-3"
                                >
                                  <input 
                                    type="number"
                                    min="0.1"
                                    step="any"
                                    value={recipeItem.quantity}
                                    onChange={(e) => handleBuilderQuantityChange(ing.id, parseFloat(e.target.value) || 0)}
                                    className="w-16 h-7 text-center font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg text-zinc-800 dark:text-zinc-200"
                                  />
                                  <span className="text-xs text-zinc-400 font-medium select-none">{ing.unit}</span>
                                  
                                  {/* Slider for quick adjustments */}
                                  <input 
                                    type="range"
                                    min="1"
                                    max={ing.unit === 'szt.' ? '10' : ing.unit === 'ml' ? '300' : '150'}
                                    step="1"
                                    value={recipeItem.quantity}
                                    onChange={(e) => handleBuilderQuantityChange(ing.id, Number(e.target.value))}
                                    className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 accent-sky-500 rounded-lg appearance-none cursor-pointer"
                                  />
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Summary cost & dynamic suggested selling pricing */}
                  <div className="space-y-4">
                    {newProdIngredients.length > 0 ? (
                      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900/40 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4 shadow-xs">
                        <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          <span>Aktualny koszt (COGS):</span>
                          <span className="text-sm font-mono text-zinc-900 dark:text-white">
                            {formatCurrency(getTemporaryBuilderCost())}
                          </span>
                        </div>

                        {/* Slider to adjust desired margin (foodcost target) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-medium">Poziom Food Cost dla produktu:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                              {newProdTargetFC}%
                            </span>
                          </div>
                          <input 
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            value={newProdTargetFC}
                            onChange={(e) => setNewProdTargetFC(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-zinc-400 font-semibold">
                            <span>Wysoka marża (10%)</span>
                            <span>Niska marża (60%)</span>
                          </div>
                        </div>

                        <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3.5 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sugerowana cena sprzedaży:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                              {formatCurrency(getSuggestedPrice(getTemporaryBuilderCost(), newProdTargetFC))}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cena ostateczna w menu (PLN)</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                step="0.01"
                                placeholder={getSuggestedPrice(getTemporaryBuilderCost(), newProdTargetFC).toFixed(2)}
                                value={newProdSellingPrice}
                                onChange={(e) => setNewProdSellingPrice(e.target.value)}
                                className="w-full h-10 pl-3.5 pr-14 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:ring-1 focus:ring-sky-500/50 text-xs font-bold rounded-xl text-zinc-800 dark:text-zinc-100 font-mono"
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">
                                PLN
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-250 dark:border-zinc-850 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                        Wybierz przynajmniej jeden składnik z lewej strony, aby zobaczyć koszty i kalkulator cen.
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setBuilderStep(1)}
                        className="flex-1 py-3.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl text-xs hover:opacity-90 transition"
                      >
                        Wróć do Krok 1
                      </button>
                      <button 
                        onClick={handleSaveCreatedProduct}
                        disabled={newProdIngredients.length === 0}
                        className="flex-1 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-sky-500/10 hover:opacity-95 active:scale-98 disabled:opacity-40 transition flex items-center justify-center gap-1"
                      >
                        Stwórz produkt
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Tab 4: Analytics and Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4 select-none">
              
              {/* Bento Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-850 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                    Średni Food Cost
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
                      {averageFC.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium mt-0.5">W całym menu</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-850 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                    Średnia Marża
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {averageMargin.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium mt-0.5">Wysoce rentowna</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-850 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                    Pozycje w Menu
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-zinc-800 dark:text-white font-mono">
                      {products.length}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium mt-0.5">Kawy i desery</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-850 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                    Składniki
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-zinc-800 dark:text-white font-mono">
                      {ingredients.length}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-medium mt-0.5">W bazie danych</span>
                </div>
              </div>

              {/* Cafe Cost Health Rating indicator */}
              <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 dark:from-sky-950/20 dark:to-indigo-950/20 p-4 rounded-3xl border border-sky-100 dark:border-sky-900/30 flex items-start gap-3">
                <div className="p-2 bg-sky-500 text-white rounded-2xl shrink-0 mt-0.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-sky-800 dark:text-sky-300">Ocena Rentowności Kawiarni</h4>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Średni foodcost twoich produktów wynosi <strong className="text-sky-600 dark:text-sky-400">{averageFC.toFixed(1)}%</strong>. 
                    {averageFC < 25 ? ' Twoja kawiarnia ma doskonałe, wzorowe marże. Jesteś w stanie wygenerować wysokie zyski przy optymalnej sprzedaży.' : 
                     averageFC <= 33 ? ' Marże są na optymalnym poziomie dla branży gastronomicznej (standard to 25-33%). Kontroluj wzrosty cen u dostawców.' :
                     ' Twój foodcost przekracza bezpieczną barierę 33%. Rozważ podniesienie cen sprzedaży kaw lub obniżenie kosztów u dostawców.'}
                  </p>
                </div>
              </div>

              {/* Grid split for preferences and actions on large screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* Preferences Configuration List */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                      Ustawienia globalne
                    </h4>

                    {/* Global Target FC Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Domyślny docelowy Food Cost (%):</span>
                        <span className="font-bold text-sky-500 font-mono text-sm">{globalTargetFoodCost}%</span>
                      </div>
                      <input 
                        type="range"
                        min="15"
                        max="45"
                        step="1"
                        value={globalTargetFoodCost}
                        onChange={(e) => handleUpdateGlobalTargetFC(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                      <span className="block text-[9px] text-zinc-400 leading-normal mt-1">
                        Wartość ta posłuży jako domyślny punkt odniesienia podczas tworzenia nowych receptur w kreatorze.
                      </span>
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-4 select-none">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Waluta kawiarni:</span>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                      {['PLN', 'EUR', 'USD'].map(curr => (
                        <button
                          key={curr}
                          onClick={() => handleUpdateCurrency(curr)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${currency === curr ? 'bg-white dark:bg-zinc-750 text-zinc-950 dark:text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-700'}`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions / Backup Restore */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-5 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                      Kopia i Zarządzanie Danymi
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={handleExportData}
                        className="py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl text-[10px] border border-zinc-100 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition"
                      >
                        <FileDown className="w-3.5 h-3.5 text-sky-500" />
                        <span>Eksportuj kopie</span>
                      </button>

                      <label className="py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl text-[10px] border border-zinc-100 dark:border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer transition">
                        <FileUp className="w-3.5 h-3.5 text-amber-500" />
                        <span>Importuj kopie</span>
                        <input 
                          type="file" 
                          accept=".json" 
                          onChange={handleImportData}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={handleResetToDefaults}
                    className="w-full py-3 mt-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 border border-rose-100/50 dark:border-rose-900/30"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Przywróć domyślne przepisy
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Tab Navigation Footer (iOS Tab Bar style) */}
        <div className="shrink-0 h-[84px] bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-100 dark:border-zinc-800/80 backdrop-blur-md px-6 flex justify-center items-center select-none z-30">
          <div className="w-full max-w-xl flex justify-between items-center">
            
            <button 
              id="tab-btn-menu"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('menu');
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3 transition ${activeTab === 'menu' ? 'text-sky-500 font-extrabold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
            >
              <Coffee className={`w-6.5 h-6.5 transition-transform ${activeTab === 'menu' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-xs tracking-wide font-semibold">Kalkulator</span>
            </button>

            <button 
              id="tab-btn-ingredients"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('ingredients');
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3 transition ${activeTab === 'ingredients' ? 'text-sky-500 font-extrabold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
            >
              <Package className={`w-6.5 h-6.5 transition-transform ${activeTab === 'ingredients' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-xs tracking-wide font-semibold">Składniki</span>
            </button>

            <button 
              id="tab-btn-builder"
              onClick={() => {
                setSearchQuery('');
                setBuilderStep(1);
                setActiveTab('builder');
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3 transition ${activeTab === 'builder' ? 'text-sky-500 font-extrabold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
            >
              <PlusCircle className={`w-6.5 h-6.5 transition-transform ${activeTab === 'builder' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-xs tracking-wide font-semibold">Nowy</span>
            </button>

            <button 
              id="tab-btn-settings"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('settings');
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3 transition ${activeTab === 'settings' ? 'text-sky-500 font-extrabold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
            >
              <BarChart2 className={`w-6.5 h-6.5 transition-transform ${activeTab === 'settings' ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-xs tracking-wide font-semibold">Opcje</span>
            </button>

          </div>
        </div>

      </div>

      {/* iOS Modal / Detail Slide-up sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct}
            ingredients={ingredients}
            onClose={() => setSelectedProduct(null)}
            onSave={handleUpdateProductPrice}
          />
        )}
      </AnimatePresence>

    </MockIPhoneFrame>
  );
}
