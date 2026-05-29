import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar de forma global para reuso
setGlobalOptions({ maxInstances: 10 });

// Extraer API Key de variables de entorno (definidas en functions/.env)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const analyzeIncident = onCall(async (request) => {
  const { imageUrl, incidentType } = request.data;

  if (!imageUrl) {
    throw new HttpsError("invalid-argument", "Falta la URL de la imagen.");
  }

  if (!GEMINI_API_KEY) {
    logger.error("GEMINI_API_KEY no configurada.");
    throw new HttpsError("internal", "Error de configuración de servidor.");
  }

  try {
    logger.info(`Analizando imagen para incidente: ${incidentType}`);
    
    // 1. Descargamos la imagen de la URL como array buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // 2. Instanciamos Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Preparamos el prompt
    const prompt = `Esta es una imagen de un reporte ciudadano de Tijuana sobre: "${incidentType}". 
    Por favor, analiza la imagen y confirma de forma concisa si efectivamente muestra este problema de accesibilidad urbana.
    Si ves claramente la barrera o daño, descríbelo en una o dos oraciones para agregar contexto al reporte. Si la foto no parece mostrar el problema, indícalo también.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: response.headers.get("content-type") || "image/jpeg"
      }
    };

    // 4. Llamamos a Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const textResponse = result.response.text();

    logger.info("Análisis de Gemini completado con éxito.");

    return { analysis: textResponse };

  } catch (error: any) {
    logger.error("Error al analizar con Gemini", error);
    throw new HttpsError("internal", "No se pudo completar el análisis de la imagen.", error.message);
  }
});
