import { z } from 'zod';

export const executeSchema = z.object({
  language: z.enum(['C', 'C++', 'Java']),
  source: z.string().trim().min(1, 'Source code cannot be empty').max(100_000, 'Source code is limited to 100 KB'),
  stdin: z.string().max(20_000, 'Standard input is limited to 20 KB'),
});

export type ExecutePayload = z.infer<typeof executeSchema>;