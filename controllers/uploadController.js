const axios      = require('axios');
const FormData   = require('form-data');
const cloudinary = require('../config/cloudinary');

// ─── Common food nutrition database (fallback) ──────────────────────────────
const COMMON_FOODS_DB = {
  rice: { calories: 206, protein: 4.3, carbs: 45, fat: 0.3 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.3 },
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  dal: { calories: 101, protein: 8.6, carbs: 16, fat: 0.3 },
  paneer: { calories: 265, protein: 25.4, carbs: 3.3, fat: 17 },
  salad: { calories: 32, protein: 1.2, carbs: 6, fat: 0.4 },
  soup: { calories: 73, protein: 2.3, carbs: 11, fat: 1.8 },
  oats: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  oatmeal: { calories: 158, protein: 6, carbs: 27, fat: 3.2 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  yogurt: { calories: 100, protein: 10, carbs: 4.7, fat: 3.3 },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  fish: { calories: 100, protein: 22, carbs: 0, fat: 1 },
  vegetables: { calories: 40, protein: 2.5, carbs: 7, fat: 0.3 },
  fruit: { calories: 60, protein: 0.6, carbs: 15, fat: 0.2 },
  burger: { calories: 550, protein: 25, carbs: 45, fat: 30 },
  pizza: { calories: 285, protein: 12, carbs: 36, fat: 10 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  steak: { calories: 271, protein: 25, carbs: 0, fat: 19 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  sandwich: { calories: 350, protein: 15, carbs: 40, fat: 12 },
  taco: { calories: 156, protein: 8, carbs: 12, fat: 9 },
  pancakes: { calories: 227, protein: 6, carbs: 28, fat: 10 },
  sushi: { calories: 200, protein: 10, carbs: 38, fat: 1 },
  smoothie: { calories: 150, protein: 2, carbs: 35, fat: 1 },
  burrito: { calories: 450, protein: 20, carbs: 55, fat: 18 },
  lasagna: { calories: 400, protein: 25, carbs: 35, fat: 20 },
  omelette: { calories: 154, protein: 11, carbs: 1, fat: 12 },
  waffles: { calories: 291, protein: 8, carbs: 33, fat: 14 },
  quinoa: { calories: 120, protein: 4, carbs: 21, fat: 2 },
  shrimp: { calories: 99, protein: 24, carbs: 0, fat: 0.3 },
  salmon: { calories: 208, protein: 22, carbs: 0, fat: 13 },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  avocado: { calories: 160, protein: 2, carbs: 9, fat: 15 },
  orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  blueberries: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  strawberries: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  almonds: { calories: 579, protein: 21, carbs: 22, fat: 50 },
  popcorn: { calories: 375, protein: 11, carbs: 74, fat: 4 },
  chocolate: { calories: 546, protein: 5, carbs: 61, fat: 31 },
  cookie: { calories: 502, protein: 5, carbs: 68, fat: 24 },
  muffin: { calories: 377, protein: 4, carbs: 46, fat: 19 },
  noodles: { calories: 138, protein: 5, carbs: 25, fat: 2 },
  ramen: { calories: 436, protein: 10, carbs: 52, fat: 20 },
  dimsum: { calories: 50, protein: 3, carbs: 6, fat: 2 },
  curry: { calories: 250, protein: 15, carbs: 10, fat: 15 },
  hotdog: { calories: 290, protein: 10, carbs: 18, fat: 20 },
};

const NON_FOOD_KEYWORDS = [
  'shoe', 'shoes', 'sneaker', 'slipper', 'sandal', 'boot',
  'shirt', 'pant', 'jeans', 'dress', 'jacket', 'clothes',
  'phone', 'mobile', 'laptop', 'keyboard', 'mouse', 'remote',
  'book', 'pen', 'pencil', 'bag', 'watch', 'bottle',
  'car', 'bike', 'motorcycle', 'chair', 'table', 'sofa',
  'dog', 'cat', 'pet', 'person', 'face',
];

const isLikelyNonFood = (value = '') => {
  const text = String(value || '').toLowerCase();
  return NON_FOOD_KEYWORDS.some((keyword) => text.includes(keyword));
};

// ─── Helper: Guess food from filename/type ──────────────────────────────────
const guessFoodFromFilename = (filename) => {
  const nameLC = filename.toLowerCase();

  if (isLikelyNonFood(nameLC)) {
    return { detectedFood: 'Non-food item', probability: 0.95, isNonFood: true };
  }

  for (const [food] of Object.entries(COMMON_FOODS_DB)) {
    if (nameLC.includes(food)) {
      return { detectedFood: food, probability: 0.6, isNonFood: false };
    }
  }
  return { detectedFood: 'Unknown Food', probability: 0.2, isNonFood: false };
};

// ─── Helper: Get nutrition for detected food ────────────────────────────────
const getNutritionForFood = (foodName) => {
  const nameLC = foodName.toLowerCase();
  const entry = COMMON_FOODS_DB[nameLC];
  if (entry) {
    return { ...entry };
  }
  // Unknown item should not be assigned fake nutrition values.
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
};

// ─── Helper: Upload buffer to Cloudinary ────────────────────────────────────
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'nutrition-app/food-images',
        public_id: `food_${Date.now()}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ─── Helper: Analyze image via Spoonacular (with fallback) ────────────────────
const analyzeWithSpoonacular = async (imageBuffer, mimetype, filename) => {
  // Check if API key is configured
  if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY.includes('your_')) {
    // Use fallback detection from filename
    const guessed = guessFoodFromFilename(filename);

    if (guessed.isNonFood) {
      return {
        category: { name: guessed.detectedFood, probability: guessed.probability },
        nutrition: {
          calories: { value: 0 },
          protein: { value: 0 },
          carbs: { value: 0 },
          fat: { value: 0 },
        },
        recipes: [],
        isApproximation: true,
        isNonFood: true,
        message: 'This image looks like a non-food item. Please upload a meal photo.',
      };
    }

    const nutrition = getNutritionForFood(guessed.detectedFood);
    return {
      category: { name: guessed.detectedFood, probability: guessed.probability },
      nutrition: {
        calories: { value: nutrition.calories },
        protein: { value: nutrition.protein },
        carbs: { value: nutrition.carbs },
        fat: { value: nutrition.fat },
      },
      recipes: [],
      isApproximation: true,
      isNonFood: false,
      message: 'Using estimated nutrition. Add Spoonacular API key for AI detection.',
    };
  }

  // Use real Spoonacular API
  try {
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: 'food.jpg',
      contentType: mimetype,
    });

    const response = await axios.post(
      'https://api.spoonacular.com/food/images/analyze',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.SPOONACULAR_API_KEY,
        },
        timeout: 10000,
      }
    );
    const data = response.data || {};
    const categoryName = data?.category?.name || '';

    if (isLikelyNonFood(categoryName)) {
      return {
        category: {
          name: 'Non-food item',
          probability: data?.category?.probability ?? 0,
        },
        nutrition: {
          calories: { value: 0 },
          protein: { value: 0 },
          carbs: { value: 0 },
          fat: { value: 0 },
        },
        recipes: [],
        isApproximation: true,
        isNonFood: true,
        message: 'This image looks like a non-food item. Please upload a meal photo.',
      };
    }

    return { ...data, isNonFood: false };
  } catch (error) {
    // If API fails, fall back to filename detection
    const guessed = guessFoodFromFilename(filename);

    if (guessed.isNonFood) {
      return {
        category: { name: guessed.detectedFood, probability: guessed.probability },
        nutrition: {
          calories: { value: 0 },
          protein: { value: 0 },
          carbs: { value: 0 },
          fat: { value: 0 },
        },
        recipes: [],
        isApproximation: true,
        isNonFood: true,
        message: 'This image looks like a non-food item. Please upload a meal photo.',
      };
    }

    const nutrition = getNutritionForFood(guessed.detectedFood);
    return {
      category: { name: guessed.detectedFood, probability: guessed.probability },
      nutrition: {
        calories: { value: nutrition.calories },
        protein: { value: nutrition.protein },
        carbs: { value: nutrition.carbs },
        fat: { value: nutrition.fat },
      },
      recipes: [],
      isApproximation: true,
      isNonFood: false,
      message: 'Using estimated nutrition due to API issue. Please try again or add a valid API key.',
    };
  }
};

// @desc  Upload food image, detect food, return nutrition info
// @route POST /api/upload/analyze
// @access Private
const analyzeFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // 1. Upload to Cloudinary (for permanent storage + URL)
    let cloudResult;
    try {
      cloudResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    } catch (cloudError) {
      // If Cloudinary fails, create a fallback image URL
      cloudResult = {
        secure_url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64').substring(0, 50)}...`,
      };
    }

    // 2. Analyze image using Spoonacular AI (with fallback)
    const analysis = await analyzeWithSpoonacular(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    // 3. Extract the relevant nutrition & food data
    const nutrition = analysis.nutrition || {};
    const category  = analysis.category  || {};

    const result = {
      imageUrl: cloudResult.secure_url,
      detectedFood: category.name          || 'Unknown',
      probability:  category.probability   || 0,
      nutrition: {
        calories: nutrition.calories?.value ?? 0,
        protein:  nutrition.protein?.value  ?? 0,
        carbs:    nutrition.carbs?.value    ?? 0,
        fat:      nutrition.fat?.value      ?? 0,
      },
      recipes: analysis.recipes || [],
      isApproximation: analysis.isApproximation || false,
      isNonFood: analysis.isNonFood || false,
      message: analysis.message,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Upload/analyze error:', error);
    const message = error.response?.data?.message || error.message || 'Failed to analyze food';
    res.status(500).json({ success: false, message });
  }
};

module.exports = { analyzeFood };
