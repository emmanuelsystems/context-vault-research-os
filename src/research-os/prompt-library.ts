import fs from 'fs'
import path from 'path'

const PROMPTS_BASE_PATH = path.resolve(__dirname, '../../knowledge/prompts')

function safeReadText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

function listPromptFiles(): string[] {
  try {
    if (!fs.existsSync(PROMPTS_BASE_PATH)) return []
    return fs
      .readdirSync(PROMPTS_BASE_PATH, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.md'))
      .map((d) => d.name)
      .sort()
  } catch {
    return []
  }
}

export const PromptLibrary = {
  list: () => {
    return listPromptFiles().map((filename) => ({
      id: filename.replace(/\.md$/i, ''),
      filename,
    }))
  },

  get: (id: string) => {
    const filename = id.endsWith('.md') ? id : `${id}.md`
    const filePath = path.join(PROMPTS_BASE_PATH, filename)
    const text = safeReadText(filePath)
    if (text === null) {
      throw new Error(`Prompt not found: ${id}`)
    }
    return text
  },
}

