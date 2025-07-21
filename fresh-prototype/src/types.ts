export interface TextElement {
  id: string;
  original_text: string;
  edited_text: string;
  frame_name: string;
  component_path: string;
  context_notes: string;
  image?: string;
  node_type?: string;
  style_info?: StyleInfo;
  coordinates?: Coordinates;
}

export interface StyleInfo {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  textCase?: string;
  letterSpacing?: number;
  lineHeight?: number;
  fills?: any[];
  visible?: boolean;
}

export interface Coordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedData {
  data: TextElement[];
  message: string;
  success: boolean;
}

export interface FigmaFileInfo {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  document: {
    id: string;
    name: string;
    type: string;
    children: number;
  };
}

export interface SpreadsheetExport {
  success: boolean;
  downloadUrl: string;
  filename: string;
  rowCount: number;
  message: string;
}

export interface UploadedFile {
  success: boolean;
  filename: string;
  path: string;
  size: number;
  content: string;
  format: 'csv' | 'xlsx';
  message: string;
}

export interface TextUpdate {
  id: string;
  original_text: string;
  edited_text: string;
  frame_name: string;
  component_path: string;
}