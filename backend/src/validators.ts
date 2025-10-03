import { z } from 'zod';

export const createLogSchema = z.object({
  json: z.record(z.string(), z.unknown()).refine(
    (val) => Object.keys(val).length > 0,
    { message: 'json object cannot be empty' }
  )
});

export const externalApiResponseSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string()
});
