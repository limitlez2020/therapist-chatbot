import { NextResponse } from "next/server";
import { GoogleGenerativeAI} from '@google/generative-ai';


export async function POST(req, res) {

  const systemPrompt = `You are a compassionate and empathetic virtual therapist. 
                        Your goal is to listen to the user's problems, ask insightful
                        questions, and provide helpful advice without being judgmental.
                        Be supportive and focus on the user's emotional well-being.`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const MODEL_NAME = "gemini-pro";

    const data = await req.json();
    console.log("Parsed data:", data); // Add this for debugging

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const code = await response.text();

    return NextResponse.json({code: code})



  } catch (error) {
    console.error("Error in API Call:", error.message);
    console.error("Full Error Details:", error);
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}

