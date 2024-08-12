import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {

  const systemPrompt = `You are a compassionate and empathetic virtual therapist. 
                        Your goal is to listen to the user's problems, ask insightful
                        questions, and provide helpful advice without being judgmental.
                        Be supportive and focus on the user's emotional well-being.`;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const data = await req.json();

  try {
    const completion = await openai.completions.create({
      messages: [
        { 
          role: 'system',
          content: systemPrompt,
        },
        ...data,
      ],

      model: "gpt-4o-mini",
      stream: "true",
    });

    /* THE STREAM: */
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try{
          for await (const chunk of completion){
            const content = chunk.choices[0].delta.content
            // If content exists:
            if (content){
              const text = encoder.encode(content)
              controller.enqueue(text)
            }
          }
          console.log("I got herree");
        }
        catch(err){
          console.error("Streaming Error:", err);
          console.error(err)
        }
        finally{
          controller.close()
        }
      },
    });

    // Send it:
    return new NextResponse(stream);

  } catch (error) {
    return NextResponse.json({ error: "Error generating response" }, { status: 500 }); // Uncomment this
  }
}
