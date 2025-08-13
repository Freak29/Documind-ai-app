
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type DocumentType = 'pdf' | 'image';

export interface ProcessedDocument {
  fileName: string;
  type: DocumentType;
  content: string; // For PDFs, this is extracted text. For images, this is base64 data.
  previewUrl: string; // Object URL for image preview.
}
