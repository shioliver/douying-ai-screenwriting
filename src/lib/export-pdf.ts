"use client"

import html2pdf from "html2pdf.js"

export async function exportScriptToPDF(title: string, content: string) {
  const plainText = content.replace(/<[^>]*>/g, "")

  const htmlContent = `
    <div style="font-family: Courier New, monospace; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 40px; font-weight: bold;">${title}</h1>
      <div style="font-size: 14px; white-space: pre-wrap;">${plainText}</div>
    </div>
  `

  const opt = {
    margin: [20, 20, 20, 20] as [number, number, number, number],
    filename: `${title}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  }

  const element = document.createElement("div")
  element.innerHTML = htmlContent
  document.body.appendChild(element)

  try {
    await html2pdf().set(opt).from(element).save()
  } finally {
    document.body.removeChild(element)
  }
}
