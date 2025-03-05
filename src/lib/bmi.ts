/**
 * Calculate BMI based on height (in cm) and weight (in kg)
 */
export function calculateBMI(height: number, weight: number): number {
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  
  // BMI formula: weight (kg) / (height (m) * height (m))
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) {
    return 'Underweight';
  } else if (bmi < 25) {
    return 'Normal weight';
  } else if (bmi < 30) {
    return 'Overweight';
  } else {
    return 'Obese';
  }
}

/**
 * Get goal type based on BMI
 */
export function getGoalType(bmi: number): 'weight_gain' | 'weight_loss' | 'maintain' {
  if (bmi < 18.5) {
    return 'weight_gain';
  } else if (bmi > 25) {
    return 'weight_loss';
  } else {
    return 'maintain';
  }
}

/**
 * Get recommended calorie intake based on BMI, height, weight, age, and gender
 */
export function getRecommendedCalories(
  bmi: number, 
  height: number, 
  weight: number, 
  age: number, 
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
): number {
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr: number;
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days per week
    moderate: 1.55,      // Moderate exercise 3-5 days per week
    active: 1.725,       // Heavy exercise 6-7 days per week
    very_active: 1.9     // Very heavy exercise, physical job or training twice a day
  };
  
  const tdee = bmr * activityMultipliers[activityLevel]; // Total Daily Energy Expenditure
  
  // Adjust based on goal type
  const goalType = getGoalType(bmi);
  
  if (goalType === 'weight_loss') {
    return Math.round(tdee * 0.85); // 15% caloric deficit
  } else if (goalType === 'weight_gain') {
    return Math.round(tdee * 1.15); // 15% caloric surplus
  } else {
    return Math.round(tdee); // Maintenance calories
  }
}

/**
 * Get recommended macronutrient split based on goal type
 */
export function getRecommendedMacros(
  calories: number, 
  goalType: 'weight_gain' | 'weight_loss' | 'maintain'
): { proteins: number; carbs: number; fats: number } {
  let proteinPercentage: number;
  let carbPercentage: number;
  let fatPercentage: number;
  
  switch (goalType) {
    case 'weight_loss':
      // Higher protein, moderate fat, lower carbs
      proteinPercentage = 0.35; // 35%
      fatPercentage = 0.30;     // 30%
      carbPercentage = 0.35;    // 35%
      break;
    case 'weight_gain':
      // Higher carbs, moderate protein, moderate fat
      proteinPercentage = 0.25; // 25%
      fatPercentage = 0.25;     // 25%
      carbPercentage = 0.50;    // 50%
      break;
    case 'maintain':
    default:
      // Balanced macros
      proteinPercentage = 0.30; // 30%
      fatPercentage = 0.30;     // 30%
      carbPercentage = 0.40;    // 40%
      break;
  }
  
  // Calculate grams of each macronutrient
  // Protein and carbs = 4 calories per gram, fat = 9 calories per gram
  const proteins = Math.round((calories * proteinPercentage) / 4);
  const carbs = Math.round((calories * carbPercentage) / 4);
  const fats = Math.round((calories * fatPercentage) / 9);
  
  return { proteins, carbs, fats };
}

/**
 * Generate food recommendations based on user's BMI and nutritional needs
 */
export function generateRecommendations(
  bmi: number,
  goalType: 'weight_gain' | 'weight_loss' | 'maintain',
  currentMacros: { proteins: number; carbs: number; fats: number } = { proteins: 0, carbs: 0, fats: 0 }
): Array<{ foodName: string; reason: string; mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack' }> {
  const recommendations: Array<{ foodName: string; reason: string; mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack' }> = [];
  
  // Basic recommendation logic based on BMI and goal type
  if (goalType === 'weight_loss') {
    recommendations.push({
      foodName: 'Grilled chicken salad with olive oil dressing',
      reason: 'High in protein, low in calories, includes healthy fats and vegetables',
      mealTime: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Greek yogurt with berries',
      reason: 'High protein, low calorie snack with antioxidants from berries',
      mealTime: 'snack' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Baked salmon with steamed vegetables',
      reason: 'Lean protein with omega-3 fatty acids and fiber-rich vegetables',
      mealTime: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Vegetable omelet with a side of avocado',
      reason: 'Protein-rich breakfast with healthy fats and vegetables',
      mealTime: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
  } else if (goalType === 'weight_gain') {
    recommendations.push({
      foodName: 'Oatmeal with peanut butter, banana, and protein powder',
      reason: 'Calorie-dense breakfast with complex carbs, protein, and healthy fats',
      mealTime: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Whole grain pasta with lean ground turkey and vegetable sauce',
      reason: 'Balance of carbs and protein for muscle growth and energy',
      mealTime: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Trail mix with nuts, dried fruits, and dark chocolate',
      reason: 'Calorie-dense snack with healthy fats, carbs, and antioxidants',
      mealTime: 'snack' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Baked potato with grilled steak and roasted vegetables',
      reason: 'High-quality protein with complex carbs for weight gain',
      mealTime: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
  } else {
    // Maintain weight
    recommendations.push({
      foodName: 'Whole grain toast with eggs and avocado',
      reason: 'Balanced breakfast with protein, healthy fats, and complex carbs',
      mealTime: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Quinoa bowl with grilled chicken, vegetables, and a light dressing',
      reason: 'Balanced meal with complete protein and fiber',
      mealTime: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Apple slices with almond butter',
      reason: 'Balanced snack with fiber, healthy fats, and natural sugars',
      mealTime: 'snack' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
    
    recommendations.push({
      foodName: 'Grilled fish with brown rice and roasted vegetables',
      reason: 'Lean protein, complex carbs, and vegetables for a balanced dinner',
      mealTime: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
    });
  }
  
  return recommendations;
}