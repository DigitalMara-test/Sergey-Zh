import axios from 'axios';
import app from '../src/index';
import { pool } from '../src/db';
import { Server } from 'http';

interface LogResponse {
  id: number;
  inserted_at: string;
  json: Record<string, unknown>;
}

interface HealthResponse {
  status: string;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

describe('Database Structure', () => {
  test('log table should have correct schema', async () => {
    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'log'
      ORDER BY ordinal_position
    `);

    const columns = result.rows;

    expect(columns).toHaveLength(3);

    const idColumn = columns.find((col: any) => col.column_name === 'id');
    expect(idColumn).toMatchObject({
      data_type: 'integer',
      is_nullable: 'NO'
    });
    expect(idColumn.column_default).toContain('nextval');

    const insertedAtColumn = columns.find((col: any) => col.column_name === 'inserted_at');
    expect(insertedAtColumn).toMatchObject({
      data_type: 'timestamp with time zone',
      is_nullable: 'NO'
    });
    expect(insertedAtColumn.column_default).toContain('now()');

    const jsonColumn = columns.find((col: any) => col.column_name === 'json');
    expect(jsonColumn).toMatchObject({
      data_type: 'json',
      is_nullable: 'NO'
    });
  });

  test('log table should have primary key on id', async () => {
    const result = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'log' AND constraint_type = 'PRIMARY KEY'
    `);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].constraint_type).toBe('PRIMARY KEY');
  });
});

describe('Log API with Axios', () => {
  let server: Server;
  let api: ReturnType<typeof axios.create>;
  const PORT = 3002;

  beforeAll((done) => {
    server = app.listen(PORT, () => {
      api = axios.create({
        baseURL: `http://localhost:${PORT}`,
        validateStatus: () => true
      });
      done();
    });
  });

  afterAll(async () => {
    await pool.end();
    server.close();
  });

  describe('GET /health', () => {
    test('should return status ok', async () => {
      const response = await api.get<HealthResponse>('/health');

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({ status: 'ok' });
    });
  });

  describe('POST /api/logs', () => {
    test('should create log entry and persist in database', async () => {
      const testData = { test: 'data', number: 123 };
      const response = await api.post<LogResponse>('/api/logs', {
        json: testData
      });

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(Number),
        inserted_at: expect.any(String),
        json: testData
      });
      expect(new Date(response.data.inserted_at).getTime()).not.toBeNaN();

      const logs = await api.get<LogResponse[]>('/api/logs');
      const createdLog = logs.data.find(log => log.id === response.data.id);

      expect(createdLog).toMatchObject({
        id: response.data.id,
        json: testData
      });
    });

    test('should reject empty json object', async () => {
      const response = await api.post<ErrorResponse>('/api/logs', {
        json: {}
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Validation error');
    });

    test('should reject invalid request body', async () => {
      const response = await api.post<ErrorResponse>('/api/logs', {
        invalid: 'field'
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Validation error');
    });
  });

  describe('POST /api/logs/external', () => {
    test('should fetch external data and save to database', async () => {
      const response = await api.post<LogResponse>('/api/logs/external');

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(Number),
        inserted_at: expect.any(String),
        json: {
          userId: expect.any(Number),
          id: expect.any(Number),
          title: expect.any(String),
          body: expect.any(String)
        }
      });
      expect(new Date(response.data.inserted_at).getTime()).not.toBeNaN();

      const logs = await api.get<LogResponse[]>('/api/logs');
      const externalLog = logs.data.find(log => log.id === response.data.id);

      expect(externalLog).toBeDefined();
      expect(externalLog?.json).toHaveProperty('userId');
    });
  });
});
