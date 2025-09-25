import { Hono } from "hono"
import { handle } from "hono/vercel"

const app = new Hono().basePath('/api')

// Health check
app.get("/ping", (c) => c.text("pong"))

// Resume analysis endpoint
app.post("/analyze", async (c) => {
  const formData = await c.req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return c.json({ error: "No file uploaded" }, 400)
  }

  // For now: just return file info
  return c.json({
    message: "Resume received!",
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  })
})

export const GET = handle(app)
export const POST = handle(app)
