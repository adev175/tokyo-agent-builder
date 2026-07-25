import { Daytona, type Sandbox } from '@daytonaio/sdk';

const g = globalThis as unknown as { __tsugiSandbox?: Promise<Sandbox> };

export function daytonaConfigured(): boolean {
  return Boolean(process.env.DAYTONA_API_KEY);
}

export function getSandbox(): Promise<Sandbox> {
  if (!daytonaConfigured()) return Promise.reject(new Error('DAYTONA_API_KEY missing'));
  if (!g.__tsugiSandbox) {
    const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
    // Auto-stop after 20 idle minutes and delete on stop: the account has a 30 GiB
    // total disk cap and every cold start would otherwise leave a sandbox behind.
    g.__tsugiSandbox = daytona
      .create({ language: 'python', autoStopInterval: 10, autoDeleteInterval: 0 })
      .catch((e) => {
        g.__tsugiSandbox = undefined;
        throw e;
      });
  }
  return g.__tsugiSandbox;
}

export async function runPython(source: string, timeoutSec = 25): Promise<{ stdout: string; ms: number }> {
  const started = Date.now();
  const sandbox = await getSandbox();
  const res = await sandbox.process.codeRun(source, undefined, timeoutSec);
  return { stdout: res.result ?? '', ms: Date.now() - started };
}

export async function uploadFiles(files: { path: string; content: string }[]): Promise<void> {
  const sandbox = await getSandbox();
  await Promise.all(files.map((f) => sandbox.fs.uploadFile(Buffer.from(f.content, 'utf-8'), f.path)));
}

export async function serveHtml(html: string, port = 8080): Promise<string> {
  const sandbox = await getSandbox();
  await sandbox.fs.uploadFile(Buffer.from(html, 'utf-8'), 'tsugi/index.html');
  await sandbox.process.executeCommand(
    `pkill -f "http.server ${port}" || true; nohup python3 -m http.server ${port} >/dev/null 2>&1 &`,
    'tsugi',
  );
  const link = await sandbox.getPreviewLink(port);
  return link.url;
}
