/**
 * Dictation runs in the browser (SpeechRecognition, ja-JP) rather than through a
 * provider: it is free, has no key to provision, and the artisan sees the words
 * appear while they are still talking. The audio is captured in parallel so the
 * storefront can play the actual voice, not only its transcript.
 */

interface SpeechResultItem {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechEvent {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechResultItem };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function dictationSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(ctor());
}

export interface VoiceSession {
  stop(): Promise<{ audioDataUrl?: string }>;
}

export async function startVoice(onText: (final: string, interim: string) => void): Promise<VoiceSession> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const rec = new MediaRecorder(stream);
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();

  const Ctor = ctor();
  let recognition: Recognition | undefined;
  if (Ctor) {
    recognition = new Ctor();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = '';
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      onText(finalText, interim);
    };
    // Chrome ends the session on silence; restart until the user stops it.
    recognition.onend = () => {
      try {
        recognition?.start();
      } catch {
        /* already stopped */
      }
    };
    recognition.onerror = () => {};
    recognition.start();
  }

  return {
    async stop() {
      if (recognition) {
        recognition.onend = null;
        recognition.stop();
      }
      const blob = await new Promise<Blob>((resolve) => {
        rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
        rec.stop();
      });
      stream.getTracks().forEach((t) => t.stop());
      if (!blob.size) return {};
      const audioDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
      });
      return { audioDataUrl };
    },
  };
}
