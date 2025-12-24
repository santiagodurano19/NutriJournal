
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

export const getCoachAdvice = async (profile: UserProfile, logs: MealEntry[], measurements?: any[]): Promise<string> => {
  const recentLogsText = logs.slice(-15).map(l => `- [${l.time}] ${l.type}: ${l.description} (${l.nutrition.calories} kcal)`).join('\n');
  const measurementHistory = measurements?.slice(-5).map(m => `- Fecha: ${m.date}, Peso: ${m.weight}kg, Grasa: ${m.bodyFat || 'N/A'}%`).join('\n');

  const prompt = `
    Actúa como un Nutricionista y Coach de Salud experto. 
    IMPORTANTE: No uses asteriscos dobles para negritas en exceso. Usa un formato limpio.
    
    Perfil del usuario:
    - Nombre: ${profile.name}
    - Edad: ${profile.age} años
    - Estatura: ${profile.height} cm
    - Peso actual: ${profile.weight} kg
    - % Grasa Corporal: ${profile.bodyFat || 'No especificado'}
    - Actividad: ${profile.activityLevel}
    - Objetivo: ${profile.goal}
    - Alergias/Intolerancias: ${profile.allergies}, ${profile.intolerances}
    - Notas: ${profile.considerations}

    Historial de mediciones:
    ${measurementHistory || 'Sin historial previo'}

    Registros de comidas (incluyendo horas):
    ${recentLogsText}

    Basado en este perfil, proporciona un análisis:
    1. ANALISIS GENERAL: ¿Qué está haciendo bien?
    2. PUNTOS DE MEJORA: ¿En qué está fallando respecto a su objetivo y el timing de sus comidas?
    3. ACCIONES PRACTICAS: Consejos específicos (porciones, alimentos, cambios de horario).
    4. ALERTAS: Sobre alergias o porcentajes de grasa si es necesario.
    
    Usa un lenguaje profesional pero cercano. Evita el uso excesivo de símbolos Markdown.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      topP: 0.9,
    }
  });

  return response.text || "No se pudo generar el consejo en este momento.";
};
