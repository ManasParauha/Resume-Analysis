import { Hono } from "hono"
import { handle } from "hono/vercel"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import PDFParser from "pdf2json"
import resumeAnalyzerAgent from "../mastra/agents/resumeAnalyzerAgent"
import analyzeResumeTool from "../mastra/tools/analyzeResumeTool"

const app = new Hono().basePath("/api")

// Health check
app.get("/ping", (c) => c.text("pong"))

// PDF analysis route
app.post("/analyze", async (c) => {
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
    const tempFilePath = path.join(tempDir, `${fileName}.pdf`)

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
  }
})

app.post("/mastra", async (c) => {
  try {
    const { parsedText } = await c.req.json()

    if (!parsedText) {
      return c.json({ error: "parsedText is required" }, 400)
    }

    // Call the tool directly
    const result = await analyzeResumeTool.execute!({
      context: { resumeText: parsedText },
      runtimeContext:{}
    }as any)

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
