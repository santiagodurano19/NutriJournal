
export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  bodyFat?: number;
  gender: 'masculino' | 'femenino' | 'otro';
  activityLevel: 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'atleta';
  goal: 'perder_peso' | 'mantener_peso' | 'ganar_musculo';
  weightLossTarget?: number;
  weightGainTarget?: number;
  allergies: string;
  intolerances: string;
  considerations: string;
}

export interface BodyMeasurements {
  neck?: number;
  chest?: number;
  arm?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
}

export interface Measurement extends BodyMeasurements {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  height: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
}

export interface MealEntry {
  id: string;
  date: string;
  time: string;
  type: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  description: string;
  nutrition: NutritionData;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
}

export interface GeneratedMealPlan {
  desayunos: string[];
  snacks: string[];
  almuerzos: string[];
  cenas: string[];
  sugerenciasCompra: string[];
}

export interface MealPlanSession {
  id: string;
  date: string;
  pantrySnapshot: string[];
  plan: GeneratedMealPlan;
}
