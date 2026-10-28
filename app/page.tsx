'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  FileCode2,
  FolderOpen,
  Gauge,
  Play,
  RotateCcw,
  Settings2,
  TerminalSquare,
  X,
  Zap,
} from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Language = 'C' | 'C++' | 'Java';
type ExecutionDiagnostic = { line: string; message: string };

const STARTERS: Record<Language, string> = {
  C: `#include <stdio.h>\n\nint main(void) {\n    int first, second;\n    scanf("%d %d", &first, &second);\n    printf("sum = %d\\n", first + second);\n    return 0;\n}`,
  'C++': `#include <iostream>\n\nint main() {\n    int number;\n    std::cin >> number;\n    std::cout << (number % 2 == 0 ? "even" : "odd") << "\\n";\n    return 0;\n}`,
  Java: `import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner input = new Scanner(System.in);\n        int number = input.nextInt();\n        System.out.println(number * number);\n    }\n}`,
};

const languageToMonaco: Record<Language, string> = { C: 'c', 'C++': 'cpp', Java: 'java' };

function parseDiagnostic(output: string): ExecutionDiagnostic {
  const lineMatch = output.match(/(?:\.c|\.cpp|\.java|Main|main)[^:\n]*:(\d+)(?::\d+)?/i) ?? output.match(/line\s+(\d+)/i);
  const message = output.split('\n').map((line) => line.trim()).find(Boolean) ?? 'The provider returned an execution error.';
  return { line: lineMatch?.[1] ? `Line ${lineMatch[1]}` : 'Line unavailable', message };
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('C');
  const [drafts, setDrafts] = useState<Record<Language, string>>(STARTERS);
  const [stdin, setStdin] = useState('12 30');
  const [isRunning, setIsRunning] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState('Output');
  const [executionMessage, setExecutionMessage] = useState('Your program output will appear here');
  const [executionTone, setExecutionTone] = useState<'idle' | 'success' | 'error'>('idle');
  const [executionDiagnostic, setExecutionDiagnostic] = useState<ExecutionDiagnostic | null>(null);

  const code = drafts[language];
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setExecutionTone('idle');
    setExecutionMessage('Preparing your program...');
    setExecutionDiagnostic(null);
    try {
      const response = await fetch('/api/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language, source: code, stdin }) });
      const result = await response.json() as { error?: string; stdout?: string | null; stderr?: string | null; compileOutput?: string | null; statusDescription?: string };
      if (!response.ok) throw new Error(result.error ?? 'Execution failed');
      const output = result.stdout || result.compileOutput || result.stderr;
      setExecutionTone(result.compileOutput || result.stderr ? 'error' : 'success');
      setExecutionMessage(output || result.statusDescription || 'Program finished without output');
      if (result.compileOutput || result.stderr) setExecutionDiagnostic(parseDiagnostic(output ?? result.statusDescription ?? ''));
    } catch (error) {
      setExecutionTone('error');
      const message = error instanceof Error ? error.message : 'Execution service unavailable';
      setExecutionMessage(message);
      setExecutionDiagnostic(parseDiagnostic(message));
    } finally {
      setIsRunning(false);
    }
  }, [code, language, stdin]);
  useEffect(() => {
    const handleRunShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!isRunning) void runCode();
      }
    };
    window.addEventListener('keydown', handleRunShortcut);
    return () => window.removeEventListener('keydown', handleRunShortcut);
  }, [isRunning, runCode]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Zap size={17} fill="currentColor" /></div>
          <span>HOW_CODE_WORKS</span>
          <span className="brand-divider" />
          <span className="brand-subtitle">Compiler Lab</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Open documentation"><CircleHelp size={17} /></button>
          <button className="icon-button" aria-label="Settings"><Settings2 size={17} /></button>
          <div className="avatar">AK</div>
        </div>
      </header>

      <section className="workspace-toolbar">
        <div className="file-context"><FolderOpen size={16} /><span>workspace</span><ChevronRight size={14} /><FileCode2 size={16} /><strong>main.{language === 'C' ? 'c' : language === 'C++' ? 'cpp' : 'java'}</strong></div>
        <div className="toolbar-controls">
          <label className="select-control">Language <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option>C</option><option>C++</option><option>Java</option></select><ChevronDown size={14} /></label>
          <button className="secondary-button" onClick={() => setDrafts({ ...drafts, [language]: STARTERS[language] })}><RotateCcw size={15} /> Restore</button>
          <button className="run-button" onClick={runCode} disabled={isRunning}><Play size={15} fill="currentColor" /> {isRunning ? 'Compiling...' : 'Run code'} <kbd>⌘ ↵</kbd></button>
        </div>
      </section>

      <div className="main-grid">
        <aside className="left-rail">
          <div className="rail-label">EXPLORER</div>
          <div className="rail-file active"><FileCode2 size={15} /><span>main.{language === 'C' ? 'c' : language === 'C++' ? 'cpp' : 'java'}</span></div>
          <div className="rail-spacer" />
          <div className="rail-tool"><BookOpen size={16} /><span>Lessons</span></div>
          <div className="rail-tool"><Gauge size={16} /><span>Metrics</span></div>
        </aside>

        <section className="editor-column">
          <div className="panel-heading editor-heading"><span>main.{language === 'C' ? 'c' : language === 'C++' ? 'cpp' : 'java'}</span><div className="heading-tools"><span className="saved-status"><Check size={13} /> Saved locally</span><button className="text-icon-button" aria-label="Copy source" onClick={() => navigator.clipboard?.writeText(code)}><Copy size={15} /></button></div></div>
          <div className="editor-wrap"><Editor height="100%" language={languageToMonaco[language]} theme="vs-dark" value={code} onChange={(value) => { setDrafts({ ...drafts, [language]: value ?? '' }); setExecutionTone('idle'); }} options={{ minimap: { enabled: false }, fontSize: 14, lineHeight: 23, cursorStyle: 'line-thin', cursorWidth: 2, fontLigatures: false, padding: { top: 16, bottom: 16 }, scrollBeyondLastLine: false, roundedSelection: false, renderLineHighlight: 'line', automaticLayout: true, fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace' }} /></div>
          <div className="editor-footer"><span>Ln 1, Col 1</span><span>UTF-8</span><span>Spaces: 4</span><span className="footer-language">{language} <ChevronDown size={13} /></span></div>
        </section>

        <aside className="side-column">
          <section className="side-panel input-panel"><div className="panel-heading"><div><TerminalSquare size={15} /> Standard input</div><button className="text-icon-button" onClick={() => setStdin('')} aria-label="Clear input"><X size={15} /></button></div><p className="panel-hint">Values your program reads from stdin</p><textarea value={stdin} onChange={(event) => setStdin(event.target.value)} spellCheck={false} /><div className="sample-row"><span>Sample input</span><button onClick={() => setStdin(language === 'C' ? '12 30' : '7')}>Load example</button></div></section>
          <section className="side-panel output-panel"><div className="output-tabs">{['Output', 'Diagnostics', 'Details'].map((tab) => <button key={tab} className={activeOutputTab === tab ? 'active' : ''} onClick={() => setActiveOutputTab(tab)}>{tab}{tab === 'Diagnostics' && <span className="tab-count">{executionTone === 'error' ? '1' : '0'}</span>}</button>)}</div><div className="output-body">{activeOutputTab === 'Output' ? <><div className="output-status"><span className={isRunning ? 'status-dot running' : executionTone === 'error' ? 'status-dot error' : 'status-dot'} />{isRunning ? 'Running on sandbox...' : executionTone === 'success' ? 'Execution complete' : executionTone === 'error' ? 'Execution needs attention' : 'Ready to run'}<span className="output-time">{isRunning ? '·' : executionTone === 'idle' ? 'No execution yet' : 'Actual provider response'}</span></div><div className={`terminal-output ${executionTone === 'error' ? 'error-output' : ''}`}><span className="prompt">$</span> {executionMessage}{executionTone === 'idle' && <span className="cursor" />}</div></> : activeOutputTab === 'Diagnostics' ? <div className="empty-output">{executionTone === 'error' ? <><X size={20} /><strong>Provider or compiler message</strong><span>{executionMessage}</span></> : <><Check size={20} /><strong>No diagnostics</strong><span>Compiler messages will appear here.</span></>}</div> : <div className="details-list"><div><span>Status</span><strong>{isRunning ? 'Running' : executionTone === 'idle' ? 'Not executed' : executionTone === 'error' ? 'Failed' : 'Received'}</strong></div><div><span>Provider</span><strong>{executionTone === 'idle' ? 'Judge0 CE' : 'Judge0 response'}</strong></div>{executionDiagnostic && <><div><span>Location</span><strong>{executionDiagnostic.line}</strong></div><div className="detail-error"><span>Error</span><strong>{executionDiagnostic.message}</strong></div></>}<div><span>Artifacts</span><strong>Final output only</strong></div></div>}</div><div className="output-footer"><span><span className={`status-dot ${isRunning ? 'running' : ''}`} /> {isRunning ? 'Submitting...' : 'Sandbox ready'}</span><span>Provider responses are shown as received</span></div></section>
        </aside>
      </div>

      <footer className={`app-footer status-bar ${isRunning ? 'compiling' : executionTone === 'success' ? 'successful' : executionTone === 'error' ? 'failed' : 'writing'}`}><span className="status-indicator" aria-hidden="true" /><strong>STATUS</strong><span>{isRunning ? 'Compiling and running' : executionTone === 'success' ? 'Compilation successful' : executionTone === 'error' ? 'Compilation failed' : 'Writing code'} <b>·</b> {language} <b>·</b> UTF-8 <b>·</b> Spaces: 4</span><span>{isRunning ? 'Judge0 sandbox active' : executionTone === 'idle' ? 'Ready to run' : executionTone === 'success' ? 'Program finished' : 'Check diagnostics'} <b>·</b> HOW_CODE_WORKS</span></footer>
    </main>
  );
}
