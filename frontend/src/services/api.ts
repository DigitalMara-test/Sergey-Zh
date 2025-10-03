import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface LogEntry {
  id: number;
  inserted_at: string;
  json: Record<string, unknown>;
}

export const api = {
  getLogs: async (): Promise<LogEntry[]> => {
    const response = await axios.get(`${API_URL}/logs`);
    return response.data;
  },

  createLog: async (json: Record<string, unknown>): Promise<LogEntry> => {
    const response = await axios.post(`${API_URL}/logs`, { json });
    return response.data;
  },

  fetchExternal: async (): Promise<LogEntry> => {
    const response = await axios.post(`${API_URL}/logs/external`);
    return response.data;
  }
};
