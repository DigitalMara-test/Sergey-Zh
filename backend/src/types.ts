export interface LogResponse {
  id: number;
  inserted_at: Date;
  json: Record<string, unknown>;
}

export interface ExternalApiData {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}
