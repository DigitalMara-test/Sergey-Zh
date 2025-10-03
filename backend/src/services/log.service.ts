import { pool } from '../db';
import type { LogResponse } from '../types';

export class LogService {
  async create(json: Record<string, unknown> | object): Promise<LogResponse> {
    const result = await pool.query(
      'INSERT INTO log (json) VALUES ($1) RETURNING id, inserted_at, json',
      [json]
    );

    if (!result.rows[0]) {
      throw new Error('Failed to create log entry');
    }

    return result.rows[0];
  }

  async findAll(): Promise<LogResponse[]> {
    const result = await pool.query(
      'SELECT id, inserted_at, json FROM log ORDER BY id'
    );
    return result.rows;
  }
}
