import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientData, OrganRisk } from '../types/patient';
import { generateRecommendations } from '../ai/recommendations';

/**
 * Export health analysis and recommendations to PDF
 */
export const exportHealthReportToPDF = async (
  patientData: PatientData,
  organRisk: OrganRisk
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204); // Blue color
    pdf.text('BioTwin360 Health Report', margin, yPosition);
    yPosition += 15;

    // Date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;

    // Patient Information Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Patient Information', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const patientInfo = [
      `Age: ${patientData.age} years`,
      `Sex: ${patientData.sex}`,
      `Blood Pressure: ${patientData.bloodPressure.systolic}/${patientData.bloodPressure.diastolic} mmHg`,
      `Total Cholesterol: ${patientData.cholesterol} mg/dL`,
      `Fasting Glucose: ${patientData.glucose} mg/dL`,
      `BMI: ${patientData.bmi || 'Not provided'}`,
      `Smoking Status: ${patientData.smokingStatus}`,
      `Exercise Level: ${patientData.exerciseLevel}`
    ];

    patientInfo.forEach(info => {
      pdf.text(info, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Risk Assessment Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Risk Assessment', margin, yPosition);
    yPosition += 10;

    // Heart Risk
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const heartColor = organRisk.heart.level === 'high' ? [220, 53, 69] : 
                      organRisk.heart.level === 'moderate' ? [255, 193, 7] : [40, 167, 69];
    pdf.setTextColor(...heartColor);
    pdf.text(`Cardiovascular Risk: ${organRisk.heart.level.toUpperCase()} (${organRisk.heart.score}/100)`, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Risk Factors:', margin, yPosition);
    yPosition += 6;
    organRisk.heart.factors.forEach(factor => {
      pdf.text(`• ${factor}`, margin + 5, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Liver Risk
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const liverColor = organRisk.liver.level === 'high' ? [220, 53, 69] : 
                       organRisk.liver.level === 'moderate' ? [255, 193, 7] : [40, 167, 69];
    pdf.setTextColor(...liverColor);
    pdf.text(`Hepatic Risk: ${organRisk.liver.level.toUpperCase()} (${organRisk.liver.score}/100)`, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Risk Factors:', margin, yPosition);
    yPosition += 6;
    organRisk.liver.factors.forEach(factor => {
      pdf.text(`• ${factor}`, margin + 5, yPosition);
      yPosition += 5;
    });

    // New page for recommendations
    pdf.addPage();
    yPosition = margin;

    // Recommendations Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Personalized Health Recommendations', margin, yPosition);
    yPosition += 15;

    const recommendations = generateRecommendations(patientData, organRisk);
    
    recommendations.forEach((rec, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      // Recommendation title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const priorityColor = rec.priority === 'high' ? [220, 53, 69] : 
                           rec.priority === 'medium' ? [255, 193, 7] : [40, 167, 69];
      pdf.setTextColor(...priorityColor);
      pdf.text(`${index + 1}. ${rec.title} (${rec.priority.toUpperCase()} PRIORITY)`, margin, yPosition);
      yPosition += 8;

      // Description
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const descLines = pdf.splitTextToSize(rec.description, pageWidth - 2 * margin);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 4 + 3;

      // Action items
      pdf.setFont('helvetica', 'bold');
      pdf.text('Action Items:', margin, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      rec.actionItems.forEach(item => {
        const itemLines = pdf.splitTextToSize(`• ${item}`, pageWidth - 2 * margin - 5);
        pdf.text(itemLines, margin + 5, yPosition);
        yPosition += itemLines.length * 4;
      });

      // Timeframe and benefit
      yPosition += 3;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Timeframe: `, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(rec.timeframe, margin + 25, yPosition);
      yPosition += 5;

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Expected Benefit: `, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      const benefitLines = pdf.splitTextToSize(rec.expectedBenefit, pageWidth - 2 * margin - 35);
      pdf.text(benefitLines, margin + 35, yPosition);
      yPosition += benefitLines.length * 4 + 8;
    });

    // Footer disclaimer
    pdf.addPage();
    yPosition = margin;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('Important Medical Disclaimer', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const disclaimer = `This report is generated by BioTwin360 AI and is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment. The recommendations provided are based on general health guidelines and your input data, but they cannot replace professional medical consultation.

Always consult with qualified healthcare professionals before making any changes to your health regimen, especially for high-priority recommendations. Your doctor can provide personalized guidance based on your complete medical history, current health status, and individual circumstances.

BioTwin360 and its AI models are tools designed to support health awareness and education, but they are not substitutes for professional medical care. If you have any concerns about your health or the recommendations in this report, please contact your healthcare provider immediately.

Generated by BioTwin360 - AI-Powered Digital Twin Health Platform
Visit: https://biotwin360.com for more information`;

    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    pdf.text(disclaimerLines, margin, yPosition);

    // Save the PDF
    const fileName = `BioTwin360_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('Health report exported successfully');
  } catch (error) {
    console.error('Failed to export health report:', error);
    throw new Error('Failed to generate PDF report');
  }
};

/**
 * Export analysis visualization as image
 */
export const exportVisualizationAsImage = async (elementId: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Visualization element not found');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `BioTwin360_Visualization_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    console.log('Visualization exported successfully');
  } catch (error) {
    console.error('Failed to export visualization:', error);
    throw new Error('Failed to export visualization');
  }
};

