import type { ExecutionProvider, ExecutionRequest, ExecutionResult } from './types';

const LANGUAGE_IDS = { C: 50, 'C++': 54, Java: 62 } as const;

type Judge0Response = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status?: { id: number; description: string };
  exit_code: number | null;
  time: string | null;
  memory: number | null;
};

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64');
}

function decode(value: string | null): string | null {
  return value ? Buffer.from(value, 'base64').toString('utf8') : null;
}

export class Judge0Provider implements ExecutionProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor() {
    this.baseUrl = process.env.JUDGE0_API_URL ?? 'https://ce.judge0.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    if (!this.baseUrl) {
      return {
        state: 'unavailable', stdout: null, stderr: null, compileOutput: null,
        statusDescription: 'Execution provider is not configured', exitCode: null,
        time: null, memory: null, provider: 'Judge0 (not configured)',
      };
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['X-Auth-Token'] = this.apiKey;
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST', headers, body: JSON.stringify({
        language_id: LANGUAGE_IDS[request.language], source_code: encode(request.source), stdin: encode(request.stdin),
      }), signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Execution provider returned HTTP ${response.status}`);
    const result = await response.json() as Judge0Response;
    const statusId = result.status?.id ?? 0;
    const state = statusId === 5 ? 'timeout' : statusId >= 6 && statusId <= 12 ? 'failed' : 'completed';
    return { state, stdout: decode(result.stdout), stderr: decode(result.stderr), compileOutput: decode(result.compile_output), statusDescription: result.status?.description ?? 'Unknown', exitCode: result.exit_code, time: result.time, memory: result.memory, provider: 'Judge0 CE' };
  }
}