import productsData from './products.json' with { type: 'json' };

export const STORES = [
  {
    id: 'portmore',
    name: 'Progressive Foods Portmore',
    shortName: 'Portmore',
    parish: 'St. Catherine',
    address: 'Portmore Pines Plaza, St. Catherine',
    phone: '(876) 989-1234',
    hours: 'Mon-Sat: 7:00 AM - 9:00 PM | Sun: 8:00 AM - 6:00 PM'
  },
  {
    id: 'ocho-rios',
    name: 'Progressive Foods Ocho Rios',
    shortName: 'Ocho Rios',
    parish: 'St. Ann',
    address: 'Main Street, Ocho Rios, St. Ann',
    phone: '(876) 974-5678',
    hours: 'Mon-Sat: 7:30 AM - 8:30 PM | Sun: 8:00 AM - 5:00 PM'
  },
  {
    id: 'mandeville',
    name: 'Progressive Foods Mandeville',
    shortName: 'Mandeville',
    parish: 'Manchester',
    address: 'Manchester Shopping Centre, Mandeville',
    phone: '(876) 962-9012',
    hours: 'Mon-Sat: 7:00 AM - 8:00 PM | Sun: 8:00 AM - 4:00 PM'
  },
  {
    id: 'fairview',
    name: 'Progressive Foods Fairview',
    shortName: 'Fairview',
    parish: 'St. James',
    address: 'Fairview Shopping Center, Montego Bay',
    phone: '(876) 953-3456',
    hours: 'Mon-Sat: 7:00 AM - 9:30 PM | Sun: 8:00 AM - 7:00 PM'
  },
  {
    id: 'whitter-village',
    name: 'Progressive Foods Whitter Village',
    shortName: 'Whitter Village',
    parish: 'St. James',
    address: 'Whitter Village Shopping Mall, Ironshore, Montego Bay',
    phone: '(876) 953-7890',
    hours: 'Mon-Sat: 7:00 AM - 10:00 PM | Sun: 8:00 AM - 8:00 PM'
  }
];

export const STORE_NAMES = STORES.map(s => s.name);

// Sample recipe ideas for Jamaican products (can be toggled in customer mode)
export const RECIPE_IDEAS = {
  "055270961124": {
    dish: "Jamaican Stew Mackerel & Green Bananas",
    time: "20 mins",
    difficulty: "Easy",
    ingredients: ["Grace Mackerel in Tomato Sauce", "Scotch Bonnet pepper", "Escallion & Thyme", "Boiled green bananas / dumplings"],
    instructions: "Sauté sliced onions, tomatoes, and escallion in a skillet. Stir in the Grace Mackerel with rich tomato sauce. Simmer with scotch bonnet for 5-8 minutes. Serve hot with boiled green bananas or fried dumplings."
  },
  "040055531586": {
    dish: "Jamaican Peppered Steak",
    time: "25 mins",
    difficulty: "Medium",
    ingredients: ["Eve Black Pepper", "Beef strips", "Soy sauce & browning", "Sweet peppers & onions"],
    instructions: "Season thin beef strips liberally with Eve Black Pepper, garlic, and scallion. Sear in hot oil until caramelized, toss with colorful bell pepper strips, and finish with a rich savory pepper gravy."
  },
  "050196110717": {
    dish: "Authentic Jamaican Rice and Peas",
    time: "45 mins",
    difficulty: "Easy",
    ingredients: ["Simply Natural Coconut Oil", "Red Kidney Beans (Gungo or peas)", "Jasmine/Basmati Rice", "Fresh Thyme & Coconut milk"],
    instructions: "Infuse your rice pot with a generous tablespoon of Simply Natural Coconut Oil for velvety aroma, escallion, crushed garlic clove, and a whole green scotch bonnet pepper."
  },
  "8857131311916": {
    dish: "Jamaican Sweet Corn & Saltfish Fritters",
    time: "15 mins",
    difficulty: "Easy",
    ingredients: ["Kendel Whole Kernel Sweet Corn", "Flour & Baking powder", "Finely chopped seasoning", "Flaked cooked saltfish"],
    instructions: "Fold sweet juicy Kendel Corn into seasoned batter with flaked saltfish. Drop spoonfuls into hot oil and fry until golden crisp on the edges."
  },
  "048848846329": {
    dish: "Breakfast Stewed Baked Beans & Franks",
    time: "12 mins",
    difficulty: "Quick",
    ingredients: ["Caribbean Choice Baked Beans", "Cocktail franks or salt pork", "Sweet peppers & onion", "Touch of butter & black pepper"],
    instructions: "Sauté diced onions and franks in a skillet with butter. Pour in Caribbean Choice Baked Beans and simmer until thick and bubbling. Pair with hot fried dumplings."
  },
  "05527085312": {
    dish: "Curried Vienna Sausages & Roti / Rice",
    time: "15 mins",
    difficulty: "Easy",
    ingredients: ["Grace Chicken Vienna Sausages", "Jamaican Betapac Curry powder", "Diced potatoes & onions", "Scotch bonnet"],
    instructions: "Slice Grace Vienna Sausages into discs. Sauté curry powder in oil to burn the curry, add sausages, diced potatoes and water. Simmer until the sauce is thick and savory."
  },
  "066613703028": {
    dish: "Spicy Jamaican Tuna Salad Sandwich",
    time: "10 mins",
    difficulty: "Quick",
    ingredients: ["Brunswick Tuna Flaked in Water", "Mayonnaise & lime juice", "Finely minced scotch bonnet", "Thick sliced Hardo bread"],
    instructions: "Drain Brunswick Tuna and flake with a fork. Mix with creamy mayo, minced scotch bonnet, diced onions, and lime juice. Heap high onto freshly baked Jamaican Hardo bread."
  },
  "033200011101": {
    dish: "Golden Jamaican Banana Fritters",
    time: "15 mins",
    difficulty: "Easy",
    ingredients: ["Arm & Hammer Pure Baking Soda", "Ripe Jamaican sweet bananas", "Flour, nutmeg & cinnamon", "Brown sugar & vanilla"],
    instructions: "Mash ripe bananas until smooth. Sift flour with a pinch of Arm & Hammer Baking Soda for fluffiness. Fry dollops in medium-hot oil until deep golden brown."
  },
  "066613164171": {
    dish: "Escoveitched Boneless Sardines & Crackers",
    time: "10 mins",
    difficulty: "Quick",
    ingredients: ["Brunswick Boneless Sardines", "Pickled onions & pimento", "Scotch bonnet & vinegar", "Excelsior water crackers"],
    instructions: "Gently warm Brunswick Boneless Sardines in a pan. Top with tangy pickled escoveitch onions, scotch bonnet strips, and pimento seeds. Serve with crunchy water crackers."
  }
};

export { productsData };
