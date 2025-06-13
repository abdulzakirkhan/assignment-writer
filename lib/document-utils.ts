import type { AssignmentDetails } from "@/types/assignment"

export const generateDocumentContent = (assignment: AssignmentDetails): string => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const content = `
${assignment.title}

Generated on: ${formatDate(assignment.createdAt)}
Word Count: ${assignment.wordCount} words
Reference Style: ${assignment.referenceStyle}
Pages: ${assignment.pageCount}

${assignment.sections
  .map(
    (section) => `
${section.title}

${section.content}

`,
  )
  .join("\n")}

---
Document Statistics:
- Total Word Count: ${assignment.wordCount}
- Total Sections: ${assignment.sections.length}
- Reference Style: ${assignment.referenceStyle}
- Generated: ${formatDate(assignment.createdAt)}
`

  return content.trim()
}

export const downloadAsText = (assignment: AssignmentDetails) => {
  const content = generateDocumentContent(assignment)
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${assignment.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadAsHTML = (assignment: AssignmentDetails) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${assignment.title}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
            font-weight: bold;
        }
        h2 {
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
            text-indent: 20px;
        }
        .metadata {
            text-align: center;
            margin-bottom: 40px;
            font-size: 14px;
            color: #666;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>${assignment.title}</h1>
    
    <div class="metadata">
        <p>Generated on: ${assignment.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
        <p>Word Count: ${assignment.wordCount} words | Reference Style: ${assignment.referenceStyle}</p>
    </div>

    ${assignment.sections
      .map(
        (section) => `
        <h2>${section.title}</h2>
        ${section.content
          .split("\n\n")
          .map((paragraph) => (paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ""))
          .join("")}
    `,
      )
      .join("")}

    <div class="footer">
        <p><strong>Document Statistics:</strong></p>
        <p>Total Word Count: ${assignment.wordCount} | Total Sections: ${assignment.sections.length} | Reference Style: ${assignment.referenceStyle}</p>
        <p>Generated: ${assignment.createdAt.toLocaleDateString()}</p>
    </div>
</body>
</html>`

  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${assignment.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// New function to download as DOCX
export const downloadAsDocx = async (assignment: AssignmentDetails) => {
  // Dynamically import the docx library
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation, BorderStyle } =
    await import("docx")

  // Create document sections
  const children = []

  // Add title
  children.push(
    new Paragraph({
      text: assignment.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  )

  // Add metadata
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Generated on: ${assignment.createdAt.toLocaleDateString()}`,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
    }),
  )

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Word Count: ${assignment.wordCount} words | Reference Style: ${assignment.referenceStyle}`,
          size: 24,
        }),
      ],
      spacing: { after: 400 },
    }),
  )

  // Add each section
  assignment.sections.forEach((section) => {
    // Add section title
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
    )

    // Add section content
    const paragraphs = section.content.split("\n\n")
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim()) {
        children.push(
          new Paragraph({
            text: paragraph.trim(),
            spacing: { after: 200 },
          }),
        )
      }
    })
  })

  // Add footer
  children.push(
    new Paragraph({
      text: "Document Statistics",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
  )

  children.push(
    new Paragraph({
      text: `Total Word Count: ${assignment.wordCount} | Total Sections: ${assignment.sections.length}`,
      spacing: { after: 200 },
    }),
  )

  children.push(
    new Paragraph({
      text: `Reference Style: ${assignment.referenceStyle} | Generated: ${assignment.createdAt.toLocaleDateString()}`,
      spacing: { after: 200 },
    }),
  )

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children,
      },
    ],
  })

  // Generate and download the document
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${assignment.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const copyToClipboard = async (assignment: AssignmentDetails): Promise<boolean> => {
  try {
    const content = generateDocumentContent(assignment)
    await navigator.clipboard.writeText(content)
    return true
  } catch (error) {
    console.log("assignment :",assignment)
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}
