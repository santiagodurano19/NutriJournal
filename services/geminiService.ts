
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealEntry, NutritionData, PantryItem, GeneratedMealPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_NUTRIJOURNAL });

export const analyzeMeal = async (description: string): Promise<NutritionData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza nutricionalmente esta comida: "${description}". Devuelve la información nutricional aproximada. Responde estrictamente en JSON.`,
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
    Eres un Nutricionista Jefe experto. 
    INVENTARIO ACTUAL: ${pantryList}.
    PERFIL: ${profile.age} años, ${profile.weight}kg, ${profile.height}cm. Objetivo: ${profile.goal}.
    ALERGIAS/INTOLERANCIAS: ${profile.allergies}, ${profile.intolerances}.
    METAS DIARIAS: ${stats.targetCalories.toFixed(0)} kcal (P:${stats.targetProtein.toFixed(0)}g, C:${stats.targetCarbs.toFixed(0)}g, G:${stats.targetFat.toFixed(0)}g).

    REGLAS ESTRICTAS:
    1. Crea 10 opciones por categoría (desayuno, snack, almuerzo, cena).
    2. CADA OPCIÓN de una misma categoría debe tener macros similares para ser intercambiable.
    3. INCLUYE CANTIDADES EXACTAS (ej: "150g de Pechuga de Pollo con 100g de Arroz").
    4. CUALQUIER COMBINACIÓN de una opción de cada categoría debe sumar aproximadamente los macros diarios del usuario.
    5. SUGERENCIAS DE COMPRA: Solo recomienda alimentos que NO están en el inventario y que complementan las recetas propuestas.
    
    Responde estrictamente en JSON.
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

  try { return JSON.parse(response.text || '{}'); } catch (error) { throw new Error("Error al generar el menú modular."); }
};

export const getDailyAnalysis = async (date: string, meals: MealEntry[], stats: any, profile: UserProfile): Promise<string> => {
  const mealsText = meals.map(m => `- [${m.type}] ${m.description} (${m.nutrition.calories} kcal)`).join('\n');
  const prompt = `
    Actúa como un Coach Nutricional de élite. Analiza la jornada de ${profile.name} para el día ${date}.
    
    PERFIL: ${profile.age} años, objetivo ${profile.goal}.
    INGESTAS:
    ${mealsText}
    METAS: ${stats.targetCalories.toFixed(0)} kcal.
    
    TAREA: Da una evaluación profesional. 
    Usa formato enriquecido: utiliza negritas para resaltar macros, usa subtítulos con emojis.
    Sé muy estético en tu respuesta. Da consejos prácticos para mañana.
  `;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "";
};

export const getCoachAdvice = async (profile: UserProfile, logs: MealEntry[]): Promise<string> => {
  const prompt = `
    Eres el Coach IA de NutriJournal. Tienes acceso al expediente de ${profile.name}.
    Objetivo: ${profile.goal}.
    
    TAREA: Proporciona una consulta estratégica profunda.
    Estructura la respuesta con:
    1. Un Título motivador.
    2. Análisis de su estado actual.
    3. 3 Pilares de acción concretos con cantidades o alimentos recomendados.
    
    Usa negritas (**texto**), listas y una estructura impecable. Usa un tono de experto pero cercano.
  `;
  const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
  return response.text || "";
};
