
import { ProcessedDocument, DocumentType } from '../types';

declare const pdfjsLib: any;

const fileToB64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is "data:mime/type;base64,..." - we only want the part after the comma
      const encoded = reader.result?.toString().split(',')[1];
      if (encoded) {
        resolve(encoded);
      } else {
        reject(new Error('Failed to convert file to base64.'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const processFile = async (file: File): Promise<ProcessedDocument> => {
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return processPdf(file);
  } else if (fileType.startsWith('image/')) {
    return processImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or an image.');
  }
};

const processPdf = async (file: File): Promise<ProcessedDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return {
    fileName: file.name,
    type: 'pdf',
    content: fullText.trim(),
    previewUrl: ''
  };
};

const processImage = async (file: File): Promise<ProcessedDocument> => {
  const base64Data = await fileToB64(file);
  const previewUrl = URL.createObjectURL(file);

  return {
    fileName: file.name,
    type: 'image',
    content: base64Data, // Base64 content for API
    previewUrl: previewUrl, // Object URL for display
  };
};
