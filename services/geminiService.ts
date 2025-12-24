
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealEntry, NutritionData, PantryItem, GeneratedMealPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMeal = async (description: string): Promise<NutritionData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza nutricionalmente: "${description}". Responde en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          sugar: { type: Type.NUMBER }
        },
        required: ["calories", "protein", "fat", "carbs", "sugar"]
      }
    }
  });
  try { return JSON.parse(response.text || '{}'); } catch { return { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 }; }
};

export const generatePantryMenu = async (profile: UserProfile, pantry: PantryItem[], stats: any): Promise<GeneratedMealPlan> => {
  const pantryList = pantry.map(i => i.name).join(', ');
  const prompt = `
    Eres un Nutricionista Jefe. El usuario tiene estos ingredientes en casa: ${pantryList}.
    Su objetivo es ${profile.goal} con una meta diaria de ${stats.targetCalories.toFixed(0)} kcal.
    Macros objetivo: P:${stats.targetProtein.toFixed(0)}g, C:${stats.targetCarbs.toFixed(0)}g, G:${stats.targetFat.toFixed(0)}g.

    TAREA: Crea un plan de menú MODULAR. 
    1. Genera 10 opciones para cada categoría (Desayuno, Snack, Almuerzo, Cena).
    2. Importante: Cada opción de una misma categoría DEBE tener valores nutricionales casi idénticos para que sean intercambiables.
    3. Si el usuario mezcla cualquier opción (ej: Desayuno 1 + Snack 4 + Almuerzo 2 + Cena 10), el total DEBE aproximarse a su meta diaria.
    4. Sugiere 5 productos clave que NO están en su lista pero potenciarían su objetivo.

    Responde ESTRICTAMENTE en JSON siguiendo este esquema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          desayunos: { type: Type.ARRAY, items: { type: Type.STRING } },
          snacks: { type: Type.ARRAY, items: { type: Type.STRING } },
          almuerzos: { type: Type.ARRAY, items: { type: Type.STRING } },
          cenas: { type: Type.ARRAY, items: { type: Type.STRING } },
          sugerenciasCompra: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["desayunos", "snacks", "almuerzos", "cenas", "sugerenciasCompra"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    throw new Error("Error al generar el menú modular.");
  }
};

export const getDailyAnalysis = async (date: string, meals: MealEntry[], stats: any): Promise<string> => {
  const mealsText = meals.map(m => `- ${m.description}`).join('\n');
  const prompt = `Analiza el día ${date}. Comidas: ${mealsText}. Meta: ${stats.targetCalories}kcal. Sé breve y directo.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "";
};

export const getCoachAdvice = async (profile: UserProfile, logs: MealEntry[], measurements?: any[]): Promise<string> => {
  const prompt = `Analiza perfil de ${profile.name}, meta ${profile.goal}. Da consejos estratégicos de nutrición y rutina.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
  return response.text || "";
};
