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

    // 🛑 Assign to the external variable
    tempFilePath = path.join(tempDir, `${fileName}.pdf`)

    // Convert ArrayBuffer -> Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tempFilePath, fileBuffer)

    // Parse PDF
    const pdfParser = new (PDFParser as any)(null, 1)
    const parsedText: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: any) => reject(err.parserError))
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent()
        resolve(text)
      })
      pdfParser.loadPDF(tempFilePath)
    })

    return c.json({ fileName, parsedText })
  } catch (err: any) {
    console.error("Error parsing PDF:", err)
    return c.json({ error: "Failed to parse PDF", details: err?.message || String(err) }, 500)
  } finally {
    //  STEP: Ensure the file is deleted
    if (tempFilePath) {
      try {
        // Check if the file exists before attempting to delete it
        await fs.unlink(tempFilePath)
        console.log(`Successfully deleted temporary file: ${tempFilePath}`)
      } catch (unlinkError: any) {
        // Log the error but do not rethrow, as the main logic succeeded or was already handled.
        // This prevents deletion errors from masking the original error.
        if (unlinkError.code === 'ENOENT') {
          // File already deleted or never created (e.g., upload failed early), which is fine.
          console.warn(`Attempted to delete file, but it did not exist: ${tempFilePath}`);
        } else {
          console.error("Failed to delete temporary file:", unlinkError)
        }
      }
    }
  }
})
app.post("/mastra", async (c) => {
  try {
    const { parsedText } = await c.req.json()

    if (!parsedText) {
      return c.json({ error: "parsedText is required" }, 400)
    }

    // Call the tool directly
    const result = await runResumeAnalysis(parsedText)

    return c.json({ analysis: result })
  } catch (err: any) {
    console.error("Mastra tool error:", err)
    return c.json(
      { error: "Failed to analyze resume", details: err?.message || String(err) },
      500
    )
  }
})


export const GET = handle(app)
export const POST = handle(app)
