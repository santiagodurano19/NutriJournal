
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealEntry, NutritionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMeal = async (description: string): Promise<NutritionData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza nutricionalmente el siguiente plato o alimento: "${description}". Proporciona valores estimados basados en porciones estándar.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER, description: "Total de calorías en kcal" },
          protein: { type: Type.NUMBER, description: "Gramos de proteína" },
          fat: { type: Type.NUMBER, description: "Gramos de grasa total" },
          carbs: { type: Type.NUMBER, description: "Gramos de carbohidratos totales" },
          sugar: { type: Type.NUMBER, description: "Gramos de azúcar" }
        },
        required: ["calories", "protein", "fat", "carbs", "sugar"]
      }
    }
  });

  try {
    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0 };
  }
};

export const getDailyAnalysis = async (date: string, meals: MealEntry[], stats: any): Promise<string> => {
  const mealsText = meals.map(m => `- [${m.time}] ${m.type}: ${m.description} (${m.nutrition.calories} kcal, P:${m.nutrition.protein}g, C:${m.nutrition.carbs}g, G:${m.nutrition.fat}g)`).join('\n');
  const totals = meals.reduce((acc, m) => ({
    cals: acc.cals + m.nutrition.calories,
    p: acc.p + m.nutrition.protein,
    c: acc.c + m.nutrition.carbs,
    g: acc.g + m.nutrition.fat
  }), { cals: 0, p: 0, c: 0, g: 0 });

  const prompt = `
    Analiza el día alimenticio del usuario (${date}):
    
    META DEL DÍA: ${stats.targetCalories.toFixed(0)} kcal
    CONSUMIDO: ${totals.cals.toFixed(0)} kcal
    MACROS OBJETIVO: P:${stats.targetProtein.toFixed(0)}g, C:${stats.targetCarbs.toFixed(0)}g, G:${stats.targetFat.toFixed(0)}g
    CONSUMO ACTUAL: P:${totals.p.toFixed(0)}g, C:${totals.c.toFixed(0)}g, G:${totals.g.toFixed(0)}g
    ¿ENTRENÓ?: ${stats.isExerciseDay ? 'SÍ' : 'NO'}

    COMIDAS REGISTRADAS:
    ${mealsText}

    Dime:
    1. BALANCE CALÓRICO: ¿Se pasó o le faltó? ¿Fue adecuado para el entrenamiento?
    2. CALIDAD DE MACROS: ¿La distribución de proteínas/carbos/grasas fue óptima?
    3. CONSEJO PARA MAÑANA: Qué debería ajustar basado en lo de hoy.
    
    Sé breve, motivador y directo. Máximo 150 palabras.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "No se pudo generar el análisis diario.";
};

export const getCoachAdvice = async (profile: UserProfile, logs: MealEntry[], measurements?: any[]): Promise<string> => {
  const recentLogsText = logs.slice(-30).map(l => `- ${l.date} [${l.type}]: ${l.description}`).join('\n');
  const measurementHistory = measurements?.slice(-10).map(m => `- ${m.date}: ${m.weight}kg, ${m.bodyFat || 'N/A'}% grasa`).join('\n');

  const prompt = `
    Actúa como un Nutricionista y Coach de Salud experto en Biohacking y Rendimiento. 
    Analiza la ESTRATEGIA GLOBAL del usuario a largo plazo.
    
    Perfil: ${profile.name}, ${profile.age} años, ${profile.height}cm, ${profile.weight}kg, Meta: ${profile.goal} (${profile.weightLossTarget || profile.weightGainTarget || 0}kg/mes).
    Nivel de Actividad Base: ${profile.activityLevel}.
    
    Historial de Peso/Grasa:
    ${measurementHistory || 'Sin datos aún'}

    Últimos Registros Alimenticios (Patrones):
    ${recentLogsText}

    Proporciona un REPORTE ESTRATÉGICO:
    1. EVALUACIÓN DE PROGRESO: ¿Sus mediciones reales coinciden con sus registros de comida?
    2. IDENTIFICACIÓN DE PATRONES: ¿Hay alimentos recurrentes dañinos o carencias de nutrientes?
    3. RUTINA RECOMENDADA: Diseña una estructura ideal de comidas (horarios y tipos de macro) basada en su actividad física.
    4. AJUSTES DE OBJETIVO: ¿Es realista su meta de kg/mes con lo que está registrando?

    Usa un formato limpio con títulos claros. Sé muy analítico y profesional.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.8,
    }
  });

  return response.text || "No se pudo generar la estrategia global.";
};
