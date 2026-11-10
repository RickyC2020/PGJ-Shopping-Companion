// Google Gemini API Integration for Progressive Foods
import { RECIPE_IDEAS } from '../data/storeData.js';
import { sanitizeClientConfig } from '../utils/securityConfig.js';

const clientConfig = typeof import.meta !== 'undefined' && import.meta.env
  ? sanitizeClientConfig(import.meta.env)
  : {};

export const GEMINI_API_KEY =
  clientConfig.VITE_PUBLIC_GEMINI_API_KEY ||
  clientConfig.VITE_GEMINI_API_KEY ||
  "";

// Order of models to try (gemini-3.5-flash-lite has higher quota/availability on free tier)
const MODELS_TO_TRY = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash'
];

// In-memory cache to prevent redundant API calls for same product and store
const mealIdeaCache = new Map();

/**
 * Generates an authentic Jamaican meal idea using the Gemini API Structured Outputs.
 *
 * @param {Object} scannedProduct The currently scanned product
 * @param {string} storeName The currently selected store name
 * @param {Array} allProducts The full mock JSON products database
 * @returns {Promise<{recipe_name: string, ingredients: string[]}>}
 */
export async function generateMealIdea(scannedProduct, storeName, allProducts = []) {
  if (!scannedProduct || !storeName) {
    throw new Error("Scanned product and store name are required");
  }

  const cacheKey = `${scannedProduct.barcode}_${storeName}`;
  if (mealIdeaCache.has(cacheKey)) {
    return mealIdeaCache.get(cacheKey);
  }

  // Step 2: Filter mock JSON database for products where inventory level for that specific store > 0
  const inStockProducts = allProducts.filter(p => {
    const qty = p.inventory ? (p.inventory[storeName] ?? 0) : 0;
    return qty > 0;
  });

  const inStockListFormatted = inStockProducts
    .map(p => `- ${p.name} (Category: ${p.category})`)
    .join('\n');

  // Step 3: Payload containing scanned product name and the filtered array of available in-stock products
  const userContent = `Scanned Ingredient: ${scannedProduct.name}

Currently in-stock ingredients at ${storeName}:
${inStockListFormatted || 'None'}`;

  // Step 4: Exact system instruction
  const systemInstructionText = "You are a culinary assistant for Progressive Foods. Suggest a quick, authentic Jamaican recipe that uses the scanned ingredient and 2 to 3 other ingredients from the provided in-stock list.";

  // Step 5 & 6: generationConfig with Structured Outputs (responseMimeType: "application/json" and responseSchema)
  const requestBody = {
    system_instruction: {
      parts: [
        {
          text: systemInstructionText
        }
      ]
    },
    contents: [
      {
        parts: [
          {
            text: userContent
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          recipe_name: {
            type: "STRING"
          },
          ingredients: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          }
        },
        required: ["recipe_name", "ingredients"]
      }
    }
  };

  let lastError = null;

  // Try available models in sequence to mitigate model-specific quota exhaustion (e.g. 429s)
  for (const modelName of MODELS_TO_TRY) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Model ${modelName} returned status ${response.status}:`, errorText);
        lastError = new Error(`Gemini API (${modelName}) error: ${response.status}`);
        // If rate limited or quota exceeded, try next model in fallback list
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        // Step 7: Parse the returned JSON
        const parsed = JSON.parse(rawText);
        if (parsed.recipe_name && Array.isArray(parsed.ingredients)) {
          mealIdeaCache.set(cacheKey, parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Fetch failed for model ${modelName}:`, err);
      lastError = err;
    }
  }

  // Graceful in-stock fallback if API daily quota is fully exhausted across all models
  console.warn("All Gemini API models exhausted or unreachable. Using authentic Jamaican recipe generator with in-stock items.");
  const fallbackResult = generateFallbackInStockRecipe(scannedProduct, storeName, inStockProducts);
  mealIdeaCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Intelligent Jamaican recipe generator using verified in-stock ingredients for the branch.
 * Acts as a failsafe when API quota limits (429) are encountered.
 */
function generateFallbackInStockRecipe(scannedProduct, storeName, inStockProducts) {
  const curated = RECIPE_IDEAS[scannedProduct.barcode];

  // Pick 2 other items in stock that aren't the scanned item
  const otherInStock = inStockProducts.filter(p => p.barcode !== scannedProduct.barcode);

  const chosenIngredients = [scannedProduct.name];
  if (otherInStock.length > 0) {
    chosenIngredients.push(otherInStock[0].name);
  }
  if (otherInStock.length > 1) {
    chosenIngredients.push(otherInStock[1].name);
  }

  const recipeName = curated
    ? curated.dish
    : `Jamaican Style ${scannedProduct.name.split(' ')[0]} Medley`;

  return {
    recipe_name: recipeName,
    ingredients: chosenIngredients
  };
}
