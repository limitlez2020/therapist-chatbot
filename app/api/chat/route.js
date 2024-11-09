import { NextResponse } from "next/server";
import { GoogleGenerativeAI} from '@google/generative-ai';


export async function POST(req) {

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are a compassionate and empathetic virtual therapist.
                        Your role is to listen carefully to the user, ask thoughtful
                        questions, and provide supportive guidance focused on the user's
                        emotional well-being. You are also capable of responding to a variety
                        of general inquiries and requests. When users ask for information, music
                        recommendations, or even the weather, provide helpful and accurate answers
                        in a warm manner. Avoid assuming the user's emotions or state
                        of mind; let the user express themselves first. When the user begins
                        with a casual greeting, simply respond with a warm, friendly greeting
                        in return, without formalities or framing it as a "new conversation."
                        Allow the user to lead the direction and tone of each chat. Thank you!`

   });

  try {
    /* 'data' is the basically the messages array from the page.js
     * file. This array contains the entire chat history:
     * it contains objects, and each object has a role and content
     * property. The role is either 'user' or 'assistant', and the
     * content is the text that the user or the assistant has typed.
     */
    const data = await req.json();

    /* Construct the conversation history: */
    const conversationHistory = data.map(message => {
      return `${message.content}`;
    }).join("\n\n");

    /* Combine the system instruction with the conversation history */
    const prompt = `${model.systemInstruction}\n\nHere's what has been discussed so far:${conversationHistory}\n`;

    /* Send user's prompt and then get assistant's response: */
    const result = await model.generateContentStream(prompt);
    const response = await result.response;
    const text = response.text();

    /* Return the assistant's response: */
    return new Response(text);


  } catch (error) {
    console.error("Error in API Call:", error.message);
    console.error("Full Error Details:", error);
    return NextResponse.json({ error: "Error generating response" }, { status: 500 });
  }
}

