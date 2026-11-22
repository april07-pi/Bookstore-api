export interface Book {
  id: string;
  title: string;
  author: string;
  rating: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RestLogEntry {
  id: string;
  stepLabel: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  ok: boolean;
  durationMs: number;
  requestBody?: unknown;
  responseBody: unknown;
  timestamp: string;
}

export type ScriptMode = 'bonus' | 'sequential';

export type TargetMode = 'sandbox' | 'mockapi';

export interface ScriptConfig {
  apiUrl: string;
  postBook: {
    title: string;
    author: string;
    rating: string;
  };
  putTargetId: string;
  putBook: {
    title: string;
    author: string;
    rating: string;
  };
  deleteTargetId: string;
}

export interface ChecklistItem {
  id: string;
  section: 'Part A: MockAPI Setup' | 'Part B: Python Script' | 'Bonus & Submission';
  label: string;
  detail: string;
}
