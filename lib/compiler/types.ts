export type SupportedLanguage = 'C' | 'C++' | 'Java';

export type ExecutionState = 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'unavailable';

export interface ExecutionRequest {
  language: SupportedLanguage;
  source: string;
  stdin: string;
}

export interface ExecutionResult {
  state: ExecutionState;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusDescription: string;
  exitCode: number | null;
  time: string | null;
  memory: number | null;
  provider: string;
}

export interface ExecutionProvider {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}