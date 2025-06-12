import { v4 as uuidv4 } from "uuid"
import type { FileCategory, FileInfo } from "@/types/assignment"

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}

export const getFileType = (file: File): string => {
  if (file.type.includes("pdf")) return "PDF"
  if (file.type.includes("doc")) return "DOC"
  if (file.type.includes("text")) return "TXT"
  return file.type.split("/")[1]?.toUpperCase() || "Unknown"
}

export const processFile = async (file: File, category: FileCategory): Promise<FileInfo> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string

      resolve({
        id: uuidv4(),
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file),
        progress: 100,
        status: "complete",
        content: content,
        category: category,
      })
    }

    reader.onerror = () => {
      resolve({
        id: uuidv4(),
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file),
        progress: 100,
        status: "error",
        content: undefined,
        category: category,
      })
    }

    // Read the file as text
    if (file.type.includes("text") || file.type.includes("doc")) {
      reader.readAsText(file)
    } else {
      // For other file types, we'll just use the name for now
      // In a real app, you'd want to use a PDF parser or other appropriate tool
      resolve({
        id: uuidv4(),
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file),
        progress: 100,
        status: "complete",
        content: `Content of ${file.name}`,
        category: category,
      })
    }
  })
}
