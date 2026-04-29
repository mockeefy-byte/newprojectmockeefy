// PDF Download Utility
// To enable PDF downloads, install html2pdf.js:
// npm install html2pdf.js

export async function downloadResumePDF(
  resumeTemplate: HTMLElement | null,
  fileName: string = 'resume.pdf'
) {
  if (!resumeTemplate) {
    console.error('Template element not found');
    return;
  }

  // Show installation message
  alert(
    'PDF Download Feature\n\nTo enable PDF downloads, please:\n\n1. Open terminal in client folder\n2. Run: npm install html2pdf.js\n3. Restart dev server: npm run dev\n\nFor now, use the Print option to save as PDF.'
  );

  // Use print as immediate fallback
  printResume(resumeTemplate);
}

export function printResume(resumeTemplate: HTMLElement | null) {
  if (!resumeTemplate) {
    console.error('Template element not found');
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write('<html><head><title>Resume</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(resumeTemplate.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
