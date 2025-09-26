// app/api/[[...route]]/route.ts (Final Fixed Version)

import { Hono } from "hono"
import { handle } from "hono/vercel"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import PDFParser from "pdf2json"
import { runResumeAnalysis } from "../mastra/agents/resumeAnalyzerAgent"

const app = new Hono().basePath("/api")

// PDF analysis route
app.post("/analyze", async (c) => {
  // Define tempFilePath outside of the try block so it's accessible in the finally block
  let tempFilePath: string | null = null;

  try {

    const formData = await c.req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400)
    }

    if (file.type !== "application/pdf") {
      return c.json({ error: "Only PDF files are allowed." }, 400)
    }

    // Generate unique filename
    const fileName = uuidv4()

    // Use project-local tmp folder
    const tempDir = path.join(process.cwd(), "tmp")
    await fs.mkdir(tempDir, { recursive: true }) // create folder if not exists

    // Assign to the external variable
    tempFilePath = path.join(tempDir, `${fileName}.pdf`)

    // Convert ArrayBuffer -> Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tempFilePath, fileBuffer)

    // Parse PDF
    // 🛑 FIX: Use the specific (PDFParser as any) cast directly without the broken @ts-expect-error comment
    // @typescript-eslint/no-explicit-any
    const pdfParser = new (PDFParser as any)(null, 1)

    const parsedText: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: unknown) => {
        if (typeof err === 'object' && err !== null && 'parserError' in err) {
          reject((err as { parserError: string }).parserError);
        } else {
          reject(new Error("PDF Parser data error"));
        }
      });

      // 🛑 FIX: Removed the unnecessary @ts-ignore comment here.
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent()
        resolve(text)
      })
      pdfParser.loadPDF(tempFilePath)
    })

    return c.json({ fileName, parsedText })

    // 🛑 FIX: Use unknown for the catch block (resolves the 'any' error)
  } catch (err: unknown) {
    console.error("Error parsing PDF:", err)

    let errorMessage = "An unknown error occurred.";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    return c.json({ error: "Failed to parse PDF", details: errorMessage }, 500)
  } finally {
    // 🛑 FIX: The type check ensures fs.unlink is called with a pure string (resolving the 'string | null' issue)
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
        console.log(`Successfully deleted temporary file: ${tempFilePath}`)
      } catch (unlinkError: unknown) { // 🛑 FIX: Use unknown for catch error
        // Log the error but do not rethrow, as the main logic succeeded or was already handled.
        const unlinkCode = typeof unlinkError === 'object' && unlinkError !== null ? (unlinkError as { code?: string }).code : null;
        if (unlinkCode === 'ENOENT') {
          console.warn(`Attempted to delete file, but it did not exist: ${tempFilePath}`);
        } else {
          console.error("Failed to delete temporary file:", unlinkError)
        }
      }
    }
  }
})

// Mastra AI analysis route (Already largely correct, just ensuring type consistency)
app.post("/mastra", async (c) => {
  try {
    const { parsedText } = await c.req.json()

    if (!parsedText) {
      return c.json({ error: "parsedText is required" }, 400)
    }

    // Call the tool directly
    const result = await runResumeAnalysis(parsedText)

    return c.json({ analysis: result })
  } catch (err: unknown) {
    console.error("Mastra tool error:", err)
    let errorMessage = "An unknown error occurred.";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    return c.json(
      { error: "Failed to analyze resume", details: errorMessage || String(err) },
      500
    )
  }
})


export const GET = handle(app)
export const POST = handle(app)