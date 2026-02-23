import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Renders a DOM node as an image and inserts it into a jsPDF PDF.
 * @param elementId The DOM id of the invoice container to render.
 * @param pdfFileName The filename for the downloaded PDF.
 */
export async function downloadInvoiceAsPDF(elementId: string, pdfFileName: string) {
    const input = document.getElementById(elementId);
    if (!input) throw new Error('Invoice element not found');

    // Render the DOM node to a canvas
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    // Create PDF with same aspect ratio as image
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(pdfFileName);
}
