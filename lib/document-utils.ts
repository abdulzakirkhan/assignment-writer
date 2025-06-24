import type { AssignmentDetails } from "@/types/assignment"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
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
  // children.push(
  //   new Paragraph({
  //     text: "Document Statistics",
  //     heading: HeadingLevel.HEADING_2,
  //     spacing: { before: 400, after: 200 },
  //   }),
  // )

  // children.push(
  //   new Paragraph({
  //     text: `Total Word Count: ${assignment.wordCount} | Total Sections: ${assignment.sections.length}`,
  //     spacing: { after: 200 },
  //   }),
  // )

  // children.push(
  //   new Paragraph({
  //     text: `Reference Style: ${assignment.referenceStyle} | Generated: ${assignment.createdAt.toLocaleDateString()}`,
  //     spacing: { after: 200 },
  //   }),
  // )

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


export const downloadAsPdf = (assignment: AssignmentDetails) => {
  const doc = new jsPDF("p", "pt", "a4")
  const marginLeft = 40
  const lineSpacing = 20
  const pageHeight = doc.internal.pageSize.height

  let cursorY = 60

  // Title
  doc.setFontSize(20)
  doc.setFont("Helvetica", "bold")
  doc.text(assignment.title, marginLeft, cursorY, { maxWidth: 520 })

  cursorY += lineSpacing + 10

  // Loop through sections
  doc.setFontSize(12)
  assignment.sections.forEach((section, i) => {
    const estimatedHeight = doc.getTextDimensions(section.content, { maxWidth: 520 }).h

    // Add page if needed
    if (cursorY + estimatedHeight > pageHeight - 80) {
      doc.addPage()
      cursorY = 60
    }

    // Section Heading
    doc.setFont("Helvetica", "bold")
    doc.setFontSize(14)
    doc.text(section.title, marginLeft, cursorY)
    cursorY += lineSpacing

    // Section Content
    doc.setFont("Helvetica", "normal")
    const splitText = doc.splitTextToSize(section.content, 520)
    doc.text(splitText, marginLeft, cursorY)
    cursorY += splitText.length * lineSpacing
  })

  // If references exist, add them
  const hasReferences = "references" in assignment && Array.isArray((assignment as any).references)
  if (hasReferences) {
    const references = (assignment as any).references as string[]

    if (cursorY + 100 > pageHeight - 60) {
      doc.addPage()
      cursorY = 60
    }

    doc.setFont("Helvetica", "bold")
    doc.setFontSize(14)
    doc.text("References", marginLeft, cursorY)
    cursorY += lineSpacing

    doc.setFont("Helvetica", "normal")
    doc.setFontSize(12)

    references.forEach((ref: string) => {
      const splitRef = doc.splitTextToSize(ref, 520)
      doc.text(splitRef, marginLeft, cursorY)
      cursorY += splitRef.length * lineSpacing

      if (cursorY > pageHeight - 80) {
        doc.addPage()
        cursorY = 60
      }
    })
  }

  // Save the PDF
  const fileName = `${assignment.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
  doc.save(fileName)
}