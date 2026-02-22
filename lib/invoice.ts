import jsPDF from 'jspdf';
import { InvoiceData } from '@/types';
import { formatCurrency, formatDate } from './utils';

export function generateInvoicePDF(data: InvoiceData): Blob {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const darkColor: [number, number, number] = [31, 41, 55];
  const lightGray: [number, number, number] = [243, 244, 246];
  
  // Header with company name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('SkillVoucher', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Learning Platform', 20, 32);
  
  // Invoice title
  doc.setTextColor(...darkColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 25);
  
  // Invoice details box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.invoiceNumber}`, 150, 32);
  doc.text(`Date: ${formatDate(data.date)}`, 150, 37);
  
  // Customer details section
  let yPos = 55;
  
  doc.setFillColor(...lightGray);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('BILL TO:', 22, yPos + 5.5);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.customerName}`, 20, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${data.customerEmail}`, 20, yPos);
  
  if (data.customerPhone) {
    yPos += 6;
    doc.text(`Phone: ${data.customerPhone}`, 20, yPos);
  }
  
  if (data.customerCompany) {
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Company: ${data.customerCompany}`, 20, yPos);
  }
  
  // Course details section
  yPos += 15;
  
  doc.setFillColor(...lightGray);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COURSE DETAILS:', 22, yPos + 5.5);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Course Name:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  
  // Wrap long course names
  const splitCourseName = doc.splitTextToSize(data.courseName, 120);
  doc.text(splitCourseName, 60, yPos);
  yPos += splitCourseName.length * 6;
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Duration:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('90 Days (3 Months)', 60, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Access Period:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('Full access to all course materials', 60, yPos);
  
  // Payment details table
  yPos += 20;
  
  doc.setFillColor(...primaryColor);
  doc.rect(20, yPos, 170, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 25, yPos + 7);
  doc.text('AMOUNT', 160, yPos + 7);
  
  yPos += 10;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(20, yPos, 170, 12, 'FD');
  
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Course Enrollment Fee', 25, yPos + 8);
  doc.text(formatCurrency(data.amount, data.currency), 160, yPos + 8);
  
  // Total section
  yPos += 12;
  
  doc.setFillColor(...lightGray);
  doc.rect(20, yPos, 170, 10, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', 25, yPos + 7);
  doc.text(formatCurrency(data.amount, data.currency), 160, yPos + 7);
  
  // Transaction details
  yPos += 20;
  
  doc.setFillColor(...lightGray);
  doc.rect(20, yPos, 170, 8, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION DETAILS:', 22, yPos + 5.5);
  
  yPos += 13;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${data.paymentMethod}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Transaction ID: ${data.transactionId}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Status: PAID`, 20, yPos);
  
  // Footer with reimbursement notice
  yPos += 15;
  
  doc.setFillColor(254, 226, 226);
  doc.rect(20, yPos, 170, 22, 'F');
  
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REIMBURSEMENT NOTICE:', 25, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.text('This invoice is valid for company reimbursement purposes. Please submit this', 25, yPos + 11);
  doc.text('document to your HR/Finance department along with the payment proof.', 25, yPos + 15);
  
  // Footer
  yPos = 280;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing SkillVoucher!', 105, yPos, { align: 'center' });
  doc.text('For support: support@skillvoucher.com | +91-XXXXXXXXXX', 105, yPos + 4, { align: 'center' });
  doc.text('www.skillvoucher.com', 105, yPos + 8, { align: 'center' });
  
  return doc.output('blob');
}

export function downloadInvoice(data: InvoiceData) {
  const pdf = generateInvoicePDF(data);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${data.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
