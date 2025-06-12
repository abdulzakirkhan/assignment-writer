import { streamText } from "ai"
import { google } from "@ai-sdk/google"

export const runtime = "nodejs"

// Use the environment variable for the Gemini API key
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

export async function POST(req: Request) {
  try {
    const { messages, assignment } = await req.json()

    const assignmentContext = assignment
      ? `The current assignment is titled "${assignment.title}" and contains the following sections: ${assignment.sections.map((s: any) => s.title).join(", ")}. It follows the ${assignment.referenceStyle} citation style and has a target word count of ${assignment.wordCount} words.`
      : "No assignment has been generated yet."

    // Validate API key
    if (!apiKey) {
      console.error("No Gemini API key found")
      return new Response(
        JSON.stringify({
          error: "Gemini API key is missing",
          message: "Please add your Gemini API key to the environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create a stream from Gemini
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: `You are an AI assistant helping with academic assignments. 
  ${assignmentContext}
  
  You should:
  - Answer questions about the assignment content clearly and helpfully
  - Provide suggestions for improvements when asked
  - Help with academic writing techniques and structure
  - Explain concepts mentioned in the assignment
  - Suggest additional research directions
  - Help with citation and referencing questions
  
  Keep responses concise but informative. If asked about specific sections, 
  refer to the content provided in the assignment context.`,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Return a streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
