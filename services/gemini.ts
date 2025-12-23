
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const foodSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    weight: { type: Type.NUMBER },
    calories: { type: Type.NUMBER },
    proteins: { type: Type.NUMBER },
    fats: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fiber: { type: Type.NUMBER },
  },
  required: ["name", "weight", "calories", "proteins", "fats", "carbs", "fiber"],
};

export async function analyzeFood(input: string | { data: string; mimeType: string }) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: typeof input === 'string' ? input : { parts: [{ text: "Анализируй еду" }, { inlineData: input }] },
    config: {
      systemInstruction: "Ты нутрициолог Janamen Health. Рассчитай КБЖУ и клетчатку. Обязательно определи примерный вес блюда.",
      responseMimeType: "application/json",
      responseSchema: foodSchema,
    },
  });
  return JSON.parse(response.text.trim());
}

export async function getAIPrediction(historyData: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Данные пользователя за последние 3 дня: ${JSON.stringify(historyData)}. 
    Проанализируй тренды (калории, вода, сон, восстановление). 
    Создай 1-2 вдохновляющих предсказания о физическом состоянии пользователя на ближайшие 7-14 дней.`,
    config: {
      systemInstruction: `Ты Ассистент-Предсказатель Janamen Health. 
      Обязательно используй формат: "Если ты продолжишь в том же духе, то через [X] дней...", "Скоро ты заметишь, что [Y]...". 
      Язык: Русский. Тон: Профессиональный, заботливый.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { prediction_text: { type: Type.STRING } },
        required: ["prediction_text"]
      }
    },
  });
  return JSON.parse(response.text.trim());
}

export async function getAIChatResponse(message: string, context: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Контекст пользователя: ${JSON.stringify(context)}. Вопрос: ${message}`,
    config: {
      systemInstruction: "Ты эксперт Janamen Health по питанию и тренировкам. Давай короткие, доказательные советы. Используй русский язык.",
    },
  });
  return response.text;
}

export async function generateReminder(userName: string = "Пользователь") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Напиши короткое, дружелюбное, но мотивирующее напоминание для ${userName}, который не вводил данные 16 часов.`,
  });
  return response.text.trim();
}
