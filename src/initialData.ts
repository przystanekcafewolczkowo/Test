import { Ingredient, Product } from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Kawa Specialty (ziarna)',
    price: 110.00,
    amount: 1000,
    unit: 'g',
    category: 'Kawa'
  },
  {
    id: 'ing-2',
    name: 'Mleko świeże 3.2%',
    price: 4.50,
    amount: 1000,
    unit: 'ml',
    category: 'Nabiał'
  },
  {
    id: 'ing-3',
    name: 'Napój owsiany Barista',
    price: 9.00,
    amount: 1000,
    unit: 'ml',
    category: 'Nabiał'
  },
  {
    id: 'ing-4',
    name: 'Syrop waniliowy premium',
    price: 38.00,
    amount: 700,
    unit: 'ml',
    category: 'Cukier i Syropy'
  },
  {
    id: 'ing-5',
    name: 'Rogalik Croissant (szt.)',
    price: 25.00,
    amount: 10,
    unit: 'szt.',
    category: 'Inne'
  },
  {
    id: 'ing-6',
    name: 'Czekolada belgijska Callebaut',
    price: 65.00,
    amount: 1000,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-7',
    name: 'Maliny świeże',
    price: 15.00,
    amount: 250,
    unit: 'g',
    category: 'Owoce'
  },
  {
    id: 'ing-8',
    name: 'Twaróg tłusty',
    price: 18.00,
    amount: 1000,
    unit: 'g',
    category: 'Mąka i Suche'
  },
  {
    id: 'ing-9',
    name: 'Jajka wolny wybieg',
    price: 11.00,
    amount: 10,
    unit: 'szt.',
    category: 'Inne'
  },
  {
    id: 'ing-10',
    name: 'Masło 82%',
    price: 7.50,
    amount: 200,
    unit: 'g',
    category: 'Nabiał'
  },
  {
    id: 'ing-11',
    name: 'Cukier biały',
    price: 5.00,
    amount: 1000,
    unit: 'g',
    category: 'Cukier i Syropy'
  },
  {
    id: 'ing-12',
    name: 'Serek Mascarpone',
    price: 8.90,
    amount: 250,
    unit: 'g',
    category: 'Nabiał'
  },
  {
    id: 'ing-13',
    name: 'Śmietanka 36%',
    price: 9.80,
    amount: 500,
    unit: 'ml',
    category: 'Nabiał'
  },
  {
    id: 'ing-14',
    name: 'Mąka pszenna typ 450',
    price: 3.20,
    amount: 1000,
    unit: 'g',
    category: 'Mąka i Suche'
  },
  {
    id: 'ing-15',
    name: 'Mąka migdałowa',
    price: 54.90,
    amount: 1000,
    unit: 'g',
    category: 'Mąka i Suche'
  },
  {
    id: 'ing-16',
    name: 'Cukier puder',
    price: 6.50,
    amount: 1000,
    unit: 'g',
    category: 'Cukier i Syropy'
  },
  {
    id: 'ing-17',
    name: 'Cukier trzcinowy brązowy',
    price: 12.50,
    amount: 1000,
    unit: 'g',
    category: 'Cukier i Syropy'
  },
  {
    id: 'ing-18',
    name: 'Kakao ciemne alkalizowane',
    price: 18.00,
    amount: 500,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-19',
    name: 'Pasta pistacjowa 100%',
    price: 85.00,
    amount: 500,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-20',
    name: 'Pistacje łuskane',
    price: 115.00,
    amount: 1000,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-21',
    name: 'Orzechy włoskie',
    price: 45.00,
    amount: 1000,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-22',
    name: 'Orzechy laskowe',
    price: 52.00,
    amount: 1000,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-23',
    name: 'Borówki świeże',
    price: 19.50,
    amount: 500,
    unit: 'g',
    category: 'Owoce'
  },
  {
    id: 'ing-24',
    name: 'Banany bio',
    price: 6.90,
    amount: 1000,
    unit: 'g',
    category: 'Owoce'
  },
  {
    id: 'ing-25',
    name: 'Żelatyna wieprzowa',
    price: 5.80,
    amount: 100,
    unit: 'g',
    category: 'Dodatki'
  },
  {
    id: 'ing-26',
    name: 'Proszek do pieczenia',
    price: 2.50,
    amount: 100,
    unit: 'g',
    category: 'Mąka i Suche'
  },
  {
    id: 'ing-27',
    name: 'Laska wanilii Bourbon',
    price: 13.50,
    amount: 1,
    unit: 'szt.',
    category: 'Dodatki'
  },
  {
    id: 'ing-28',
    name: 'Sól morska drobna',
    price: 3.80,
    amount: 1000,
    unit: 'g',
    category: 'Mąka i Suche'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Espresso Double Shot',
    category: 'Kawa',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 18 }
    ],
    targetFoodCost: 20,
    sellingPrice: 11.00,
    notes: 'Klasyczne podwójne espresso parzone z 18g kawy specialty.'
  },
  {
    id: 'prod-2',
    name: 'Cappuccino klasyczne',
    category: 'Kawa',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 18 },
      { ingredientId: 'ing-2', quantity: 150 }
    ],
    targetFoodCost: 25,
    sellingPrice: 15.00,
    notes: 'Podwójne espresso ze spienionym mlekiem 3.2% w filiżance 180ml.'
  },
  {
    id: 'prod-3',
    name: 'Oat Flat White',
    category: 'Kawa',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 18 },
      { ingredientId: 'ing-3', quantity: 150 }
    ],
    targetFoodCost: 25,
    sellingPrice: 17.50,
    notes: 'Podwójne espresso z napojem owsianym Barista.'
  },
  {
    id: 'prod-4',
    name: 'Iced Latte z Wanilią',
    category: 'Kawa',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 18 },
      { ingredientId: 'ing-2', quantity: 200 },
      { ingredientId: 'ing-4', quantity: 20 }
    ],
    targetFoodCost: 25,
    sellingPrice: 20.00,
    notes: 'Kawa mrożona z syropem waniliowym i dużą ilością lodu.'
  },
  {
    id: 'prod-5',
    name: 'Croissant z czekoladą i malinami',
    category: 'Deser',
    ingredients: [
      { ingredientId: 'ing-5', quantity: 1 },
      { ingredientId: 'ing-6', quantity: 20 },
      { ingredientId: 'ing-7', quantity: 30 }
    ],
    targetFoodCost: 30,
    sellingPrice: 22.00,
    notes: 'Maślany croissant podgrzewany, polany czekoladą z malinami.'
  },
  {
    id: 'prod-6',
    name: 'Sernik domowy (porcja)',
    category: 'Deser',
    ingredients: [
      { ingredientId: 'ing-8', quantity: 100 },
      { ingredientId: 'ing-9', quantity: 1 },
      { ingredientId: 'ing-10', quantity: 15 },
      { ingredientId: 'ing-11', quantity: 20 }
    ],
    targetFoodCost: 25,
    sellingPrice: 18.00,
    notes: 'Porcja klasycznego sernika pieczonego na miejscu.'
  }
];
