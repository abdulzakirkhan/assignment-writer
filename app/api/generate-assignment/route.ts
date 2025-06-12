import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { generateMockAssignment } from "@/lib/mock-assignment"
import { v4 as uuidv4 } from "uuid"

export const runtime = "nodejs"
export const maxDuration = 60

// Use the environment variable for the Gemini API key
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

// Helper function to clean JSON response
const cleanJsonResponse = (text: string): string => {
  let cleanedText = text.trim()

  // Remove markdown code blocks if present
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.replace(/```json\n?/, "").replace(/\n?```$/, "")
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/```\n?/, "").replace(/\n?```$/, "")
  }

  // Try to find JSON object if embedded in other text
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleanedText = jsonMatch[0]
  }

  return cleanedText
}

// Function to generate a section of the assignment
async function generateAssignmentSection(
  sectionTitle: string,
  sectionWordCount: number,
  referenceStyle: string,
  additionalContext: string,
): Promise<any> {

  if (!apiKey) throw new Error("API key is missing")

  const sectionPrompt = `Generate a detailed academic section titled "${sectionTitle}" with approximately ${sectionWordCount} words.
Use ${referenceStyle} citation style where appropriate.
${additionalContext}

The section should be well-structured with multiple paragraphs separated by double newlines.
Format the response as valid JSON with the following structure:
{
  "title": "${sectionTitle}",
  "content": "Detailed section content with multiple paragraphs...",
  "wordCount": ${sectionWordCount}
}

Focus only on generating high-quality content for this specific section.`

  try {
    const response = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: sectionPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    })

    if (!response || !response.text) {
      throw new Error("Empty response from Gemini")
    }

    // Parse the response
    const cleanedText = cleanJsonResponse(response.text)
    const parsedSection = JSON.parse(cleanedText)

    // Calculate actual word count
    const actualWordCount = parsedSection.content ? parsedSection.content.split(/\s+/).length : 0


    return {
      id: uuidv4(),
      title: parsedSection.title || sectionTitle,
      content: parsedSection.content,
      wordCount: actualWordCount,
    }
  } catch (error) {
    console.error(`Error generating section "${sectionTitle}":`, error)

    // Return a fallback section
    return {
      id: uuidv4(),
      title: sectionTitle,
      content: `This section could not be generated due to an error. Please try regenerating the assignment.`,
      wordCount: 15,
    }
  }
}

export async function POST(req: Request) {
  try {
    const { files, settings, wordCount, referenceStyle, additionalInstructions, copies } = await req.json()

    // Check if we should use mock data (for testing or when API is not available)
    const useMockData = req.headers.get("x-use-mock-data") === "true"

    if (useMockData) {
      console.log("Using mock data for assignment generation")
      // Return mock assignment data
      const mockAssignment = generateMockAssignment(referenceStyle, wordCount)
      return new Response(JSON.stringify(mockAssignment), { status: 200 })
    }

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

    // Always return mock data if we're in development or if there's an issue with the API
    // This ensures the app can still function for demo purposes
    try {
      // Create a simple test request to verify the API key works
      await generateText({
        model: google("gemini-1.5-flash"),
        prompt: "Test prompt to verify API key",
        maxTokens: 10,
      })
    } catch (apiTestError) {
      console.error("API key test failed, using mock data instead:", apiTestError)
      const mockAssignment = generateMockAssignment(referenceStyle, wordCount)
      return new Response(JSON.stringify(mockAssignment), { status: 200 })
    }

    // Create a system prompt based on the uploaded files and settings
    const fileContents = files
      .map(
        (file: any) =>
          `File Type: ${file.category}\nFile Name: ${file.name} (${file.type})\nContent summary: ${file.name} contains information related to the assignment.`,
      )
      .join("\n\n")

    const additionalContext = `
Files Information:
${fileContents}

Settings:
- Academic style: ${settings.academicStyle ? "Yes" : "No"}
- Include citations: ${settings.includeCitations ? "Yes" : "No"}
- Include examples: ${settings.includeExamples ? "Yes" : "No"}
- Add conclusion: ${settings.addConclusion ? "Yes" : "No"}
- Additional Instructions: ${additionalInstructions || "None provided"}
`

    try {
      // First, generate the assignment structure
      const structurePrompt = `Create a structure for an academic assignment of approximately ${wordCount} words.
${additionalContext}

The assignment should have a clear title and be divided into logical sections including an introduction and conclusion.
Each section should have a title and an approximate word count that adds up to around ${wordCount} total words.

Format the response as valid JSON with the following structure:
{
  "title": "Assignment Title",
  "sections": [
    {
      "title": "Introduction",
      "wordCount": 300
    },
    {
      "title": "Section Title",
      "wordCount": 500
    },
    ...
  ]
}

Only include the structure, not the actual content of the sections.`

      const structureResponse = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: structurePrompt,
        temperature: 0.5,
        maxTokens: 1000,
      })

      if (!structureResponse || !structureResponse.text) {
        throw new Error("Empty response from Gemini when generating structure")
      }

      // Parse the structure
      const cleanedStructureText = cleanJsonResponse(structureResponse.text)
      let structure
      try {
        structure = JSON.parse(cleanedStructureText)
      } catch (parseError) {
        console.error("Failed to parse structure JSON:", parseError)
        // Create a fallback structure
        structure = {
          title: "Academic Assignment",
          sections: [
            { title: "Introduction", wordCount: Math.floor(wordCount * 0.1) },
            { title: "Literature Review", wordCount: Math.floor(wordCount * 0.2) },
            { title: "Methodology", wordCount: Math.floor(wordCount * 0.2) },
            { title: "Findings", wordCount: Math.floor(wordCount * 0.2) },
            { title: "Discussion", wordCount: Math.floor(wordCount * 0.2) },
            { title: "Conclusion", wordCount: Math.floor(wordCount * 0.1) },
          ],
        }
      }

      // Generate each section in parallel
      const sectionPromises = structure.sections.map((section: any) =>
        generateAssignmentSection(section.title, section.wordCount, referenceStyle, additionalContext),
      )


      // return 

      const generatedSections = await Promise.all(sectionPromises)

      // Calculate total word count
      const totalWordCount = generatedSections.reduce(
        (total: number, section: any) => total + (section.wordCount || 0),
        0,
      )

      console.log("generatedSections :",generatedSections)

      // Assemble the final assignment
      const assignment = {
        id: uuidv4(),
        title: structure.title,
        sections: generatedSections,
        wordCount: totalWordCount,
        pageCount: Math.ceil(totalWordCount / 300),
        references: Math.ceil(totalWordCount / 200), // Approximate number of references
        referenceStyle: referenceStyle,
        createdAt: new Date().toISOString(),
      }

      return new Response(JSON.stringify(assignment), { status: 200 })
    } catch (error) {
      console.error("Error generating assignment:", error)

      // Return a fallback assignment with error information
      const fallbackAssignment = {
        id: uuidv4(),
        title: "Sample Assignment (API Error Fallback)",
        sections: [
          {
            id: uuidv4(),
            title: "Introduction",
            content: `This is a sample assignment created because there was an error with the AI generation: ${
              error instanceof Error ? error.message : "Unknown error"
            }. You can try again or use this sample to test the interface.`,
            wordCount: 40,
          },
          {
            id: uuidv4(),
            title: "Main Content",
            content:
              "This section would normally contain the main content of your assignment. In a real assignment, this would be generated based on your requirements and uploaded materials.",
            wordCount: 30,
          },
          {
            id: uuidv4(),
            title: "Conclusion",
            content:
              "This is a sample conclusion. In a real assignment, this would summarize the key points and findings discussed in the main content.",
            wordCount: 25,
          },
        ],
        wordCount: 95,
        pageCount: 1,
        references: 5,
        referenceStyle: referenceStyle,
        createdAt: new Date().toISOString(),
      }

      return new Response(JSON.stringify(fallbackAssignment), { status: 200 })
    }
  } catch (error) {
    console.error("Error in generate-assignment route:", error)

    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        error: "Failed to generate assignment",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
