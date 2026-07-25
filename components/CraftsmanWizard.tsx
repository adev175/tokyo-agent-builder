'use client';

import { useEffect, useRef, useState } from 'react';
import { dictationSupported, startVoice, type VoiceSession } from '@/lib/speech';
import type { Place } from '@/lib/types';
import PieceMap from './PieceMap';

export interface WizardState {
  storeName: string;
  storeOrigin: string;
  storePeople: string;
  images: string[];
  transcript: string;
  heritage: string;
  audioDataUrl?: string;
  place: Place | null;
}

const STEP_LABELS = ['店名', '場所', '写真', '声', '確認'];
const STEP_LABELS_EN = ['Shop name', 'Location', 'Photographs', 'Voice', 'Review'];

export default function CraftsmanWizard({
  value,
  onChange,
  onForge,
  running,
}: {
  value: WizardState;
  onChange: (next: WizardState) => void;
  onForge: () => void;
  running: boolean;
}) {
  const [step, setStep] = useState(0);
  const set = (patch: Partial<WizardState>) => onChange({ ...value, ...patch });
  const last = STEP_LABELS.length - 1;

  const canAdvance = [value.storeName.trim().length > 0, true, value.images.length > 0, true, true][step];

  return (
    <div className="border-rule border-b">
      <div className="flex items-center gap-1 px-5 py-3">
        {STEP_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => i < step && setStep(i)}
            disabled={i > step}
            className={`field-label flex items-center gap-1.5 normal-case ${i === step ? 'text-shu' : i < step ? 'text-sumi' : 'text-dust'}`}
          >
            <span className="mono text-[10px]">{i + 1}</span>
            <span className="jp">{label}</span>
            {i < STEP_LABELS.length - 1 ? <span className="text-dust px-1">·</span> : null}
          </button>
        ))}
      </div>

      <div className="min-h-[280px] px-5 pb-4">
        {step === 0 ? <NameStep value={value} set={set} /> : null}
        {step === 1 ? <LocationStep value={value} set={set} /> : null}
        {step === 2 ? <PhotosStep value={value} set={set} /> : null}
        {step === 3 ? <VoiceStep value={value} set={set} /> : null}
        {step === 4 ? <ReviewStep value={value} onForge={onForge} running={running} /> : null}
      </div>

      {step < last ? (
        <div className="border-rule flex items-center justify-between border-t px-5 py-3">
          <button
            className="field-label disabled:opacity-30"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            ‹ back
          </button>
          <span className="field-label normal-case">{STEP_LABELS_EN[step]}</span>
          <button
            className="field-label bg-shu text-field rounded-[2px] px-3 py-1.5 disabled:bg-[color:var(--dust)]"
            disabled={!canAdvance}
            onClick={() => setStep((s) => Math.min(last, s + 1))}
          >
            next ›
          </button>
        </div>
      ) : (
        <div className="border-rule flex items-center justify-start border-t px-5 py-3">
          <button className="field-label" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            ‹ back
          </button>
        </div>
      )}
    </div>
  );
}

function NameStep({ value, set }: { value: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <span className="jp text-ink text-[15px]">お店の名前は何ですか？</span>
      <span className="text-ash text-[13px]">What should we call your shop? This becomes its marketplace name and URL.</span>
      <input
        autoFocus
        value={value.storeName}
        onChange={(e) => set({ storeName: e.target.value })}
        placeholder="例：三代目 準山窯"
        className="jp border-line bg-field mt-2 w-full rounded-[2px] border px-3 py-3 text-[16px] outline-none"
      />

      <AboutShopDisclosure value={value} set={set} />
    </div>
  );
}

function AboutShopDisclosure({ value, set }: { value: WizardState; set: (p: Partial<WizardState>) => void }) {
  const [open, setOpen] = useState(Boolean(value.storeOrigin || value.storePeople));
  return (
    <div className="border-rule mt-2 border-t pt-3">
      <button onClick={() => setOpen((o) => !o)} className="field-label normal-case">
        {open ? '− ' : '+ '}about your shop <span className="text-dust">(optional — or just mention it in the voice step)</span>
      </button>
      {open ? (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <span className="jp text-[12px]">お店のこと</span>
            <span className="text-dust ml-2 text-[11px]">where it's from, when it started</span>
            <textarea
              rows={2}
              value={value.storeOrigin}
              onChange={(e) => set({ storeOrigin: e.target.value })}
              placeholder="祖父が昭和五十二年にこの窯を築きました。"
              className="jp border-line bg-field mt-1.5 w-full resize-none rounded-[2px] border px-2.5 py-2 text-[13px] leading-[1.8] outline-none"
            />
          </div>
          <div>
            <span className="jp text-[12px]">作り手</span>
            <span className="text-dust ml-2 text-[11px]">who works here</span>
            <textarea
              rows={2}
              value={value.storePeople}
              onChange={(e) => set({ storePeople: e.target.value })}
              placeholder="三代目の私と、上絵付けをする娘の美和です。"
              className="jp border-line bg-field mt-1.5 w-full resize-none rounded-[2px] border px-2.5 py-2 text-[13px] leading-[1.8] outline-none"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LocationStep({ value, set }: { value: WizardState; set: (p: Partial<WizardState>) => void }) {
  const [locating, setLocating] = useState(false);

  function locate() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/place?lat=${latitude}&lng=${longitude}`);
          set({ place: (await res.json()) as Place });
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <span className="jp text-ink text-[15px]">工房の場所を教えてください。</span>
      <span className="text-ash text-[13px]">Where is the workshop? Buyers see this on the map, and it sets travel time from Tokyo.</span>
      <button
        onClick={locate}
        className={`field-label rounded-[2px] border px-3 py-2.5 ${value.place ? 'border-shu text-shu' : 'border-line'}`}
      >
        {locating ? 'locating…' : value.place ? `${value.place.prefecture}${value.place.city} · re-locate` : 'use my location (Google Maps)'}
      </button>
      {value.place ? <PieceMap place={value.place} /> : null}
      {!value.place ? <span className="text-dust text-[12px]">Optional — you can skip this and add it later.</span> : null}
    </div>
  );
}

function PhotosStep({ value, set }: { value: WizardState; set: (p: Partial<WizardState>) => void }) {
  const [camera, setCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      streamRef.current = stream;
      setCamera(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      fileRef.current?.click();
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamera(false);
  }

  function shoot() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1280 / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    set({ images: [...value.images, canvas.toDataURL('image/jpeg', 0.86)].slice(0, 4) });
  }

  function addFiles(files: FileList) {
    const room = 4 - value.images.length;
    Promise.all(
      [...files].slice(0, room).map(
        (f) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(f);
          }),
      ),
    ).then((urls) => set({ images: [...value.images, ...urls].slice(0, 4) }));
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <span className="jp text-ink text-[15px]">作品を撮影してください。</span>
      <span className="text-ash text-[13px]">Photograph the piece — up to four angles.</span>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        <button className="field-label border-line rounded-[2px] border px-2.5 py-1.5" onClick={camera ? closeCamera : openCamera}>
          {camera ? 'close camera' : 'camera'}
        </button>
        <button className="field-label border-line rounded-[2px] border px-2.5 py-1.5" onClick={() => fileRef.current?.click()}>
          upload
        </button>
        <span className="field-label ml-auto normal-case">{value.images.length}/4</span>
      </div>

      {camera ? (
        <div className="bg-plate relative">
          <video ref={videoRef} autoPlay playsInline muted className="max-h-[300px] w-full object-contain" />
          <button onClick={shoot} className="bg-shu text-field field-label absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[2px] px-4 py-2">
            shutter
          </button>
        </div>
      ) : null}

      {value.images.length ? (
        <div className="flex gap-2">
          {value.images.map((src, i) => (
            <button key={i} onClick={() => set({ images: value.images.filter((_, k) => k !== i) })} title="Remove" className="border-line bg-plate h-16 w-16 overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VoiceStep({ value, set }: { value: WizardState; set: (p: Partial<WizardState>) => void }) {
  const [recording, setRecording] = useState<'transcript' | 'heritage' | null>(null);
  const [transcribing, setTranscribing] = useState<'transcript' | 'heritage' | null>(null);
  const [interim, setInterim] = useState('');
  const sessionRef = useRef<VoiceSession | null>(null);
  const baseRef = useRef('');

  async function toggleVoice(field: 'transcript' | 'heritage') {
    if (recording === field) {
      const out = await sessionRef.current?.stop();
      sessionRef.current = null;
      setRecording(null);
      setInterim('');
      if (field === 'heritage' && out?.audioDataUrl) set({ audioDataUrl: out.audioDataUrl });
      if (out?.audioDataUrl) {
        setTranscribing(field);
        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ audioDataUrl: out.audioDataUrl, language: 'ja' }),
          });
          const data = (await res.json()) as { text?: string; error?: string };
          // The server transcript is more accurate than the browser's live guess (and is
          // the ONLY transcript at all on Safari/Firefox, which have no SpeechRecognition),
          // so it replaces whatever live dictation produced for this session.
          if (data.text) set({ [field]: (baseRef.current ? baseRef.current + ' ' : '') + data.text } as Partial<WizardState>);
        } catch {
          /* keep whatever live dictation already produced, if anything */
        } finally {
          setTranscribing(null);
        }
      }
      return;
    }
    if (recording) return;
    baseRef.current = value[field];
    const base = value[field];
    try {
      sessionRef.current = await startVoice((final, live) => {
        setInterim(live);
        set({ [field]: (base ? base + ' ' : '') + final } as Partial<WizardState>);
      });
      setRecording(field);
    } catch {
      setInterim('マイクを使用できません');
    }
  }

  const dictation = dictationSupported();

  return (
    <div className="flex flex-col gap-1 pt-2">
      <span className="jp text-ink text-[15px]">この作品について話してください。</span>
      <span className="text-ash mb-1 text-[13px]">
        Two separate, both optional: how you made it (technique), and its family history, if it has one. Press record
        and speak, or just type — {dictation ? 'captions appear as you talk, and are' : 'the words are'} transcribed
        for real once you stop.
      </span>
      <VoiceField
        label="技法メモ"
        sublabel="how it was made"
        hint="speak or type"
        canRecord
        recording={recording === 'transcript'}
        transcribing={transcribing === 'transcript'}
        interim={recording === 'transcript' ? interim : ''}
        text={value.transcript}
        onText={(transcript) => set({ transcript })}
        onToggle={() => toggleVoice('transcript')}
      />
      <VoiceField
        label="家族の記憶"
        sublabel=""
        hint="speak or type"
        canRecord
        recording={recording === 'heritage'}
        transcribing={transcribing === 'heritage'}
        interim={recording === 'heritage' ? interim : ''}
        text={value.heritage}
        onText={(heritage) => set({ heritage })}
        onToggle={() => toggleVoice('heritage')}
        recorded={Boolean(value.audioDataUrl)}
      />
    </div>
  );
}

function VoiceField(props: {
  label: string;
  sublabel: string;
  hint: string;
  canRecord: boolean;
  recording: boolean;
  transcribing: boolean;
  interim: string;
  text: string;
  recorded?: boolean;
  onText: (v: string) => void;
  onToggle: () => void;
}) {
  const hasText = props.text.trim().length > 0;
  return (
    <div className="border-rule border-t pt-2">
      <div className="flex items-baseline gap-2">
        <span className="jp text-[12px]">{props.label}</span>
        {props.sublabel ? <span className="text-dust text-[11px] normal-case">{props.sublabel}</span> : null}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="field-label normal-case">
          {props.recorded ? '音声あり · ' : ''}
          {props.transcribing ? 'transcribing…' : props.hint}
        </span>
        {!props.recording && !props.transcribing && hasText ? (
          <span className="text-[11px] normal-case text-[color:var(--ok,#3f5e3a)]">✓ recorded</span>
        ) : null}
        {props.canRecord ? (
          <button
            onClick={props.onToggle}
            disabled={props.transcribing}
            className={`field-label ml-auto rounded-[2px] border px-2 py-1 disabled:opacity-40 ${props.recording ? 'border-shu text-shu' : 'border-line'}`}
          >
            {props.recording ? '● stop' : 'record'}
          </button>
        ) : null}
      </div>

      {props.recording || props.transcribing ? (
        <div className="jp bg-plate mt-1.5 min-h-[74px] w-full rounded-[2px] px-2.5 py-2 text-[13px] leading-[1.9]">
          {props.text ? <span className="text-ink">{props.text} </span> : null}
          {props.interim ? <span className="text-ash italic">{props.interim}</span> : null}
          {props.transcribing ? <span className="text-dust animate-pulse">文字起こし中…</span> : null}
          {props.recording && !props.text && !props.interim ? <span className="text-dust animate-pulse">聞いています…</span> : null}
        </div>
      ) : (
        <textarea
          className="jp w-full resize-none bg-transparent pt-1.5 pb-3 text-[13px] leading-[1.9] outline-none"
          rows={3}
          value={props.text}
          onChange={(e) => props.onText(e.target.value)}
          placeholder={props.label === '技法メモ' ? '土は花坂、釉は自分で挽いております。' : '祖父は戦後、絵具の材料が手に入らず…'}
        />
      )}
    </div>
  );
}

function ReviewStep({ value, onForge, running }: { value: WizardState; onForge: () => void; running: boolean }) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <span className="jp text-ink text-[15px]">確認して出荷しましょう。</span>
      <dl className="text-[13px]">
        <Row label="Shop" value={value.storeName || '—'} />
        <Row label="Location" value={value.place ? `${value.place.prefecture}${value.place.city}` : 'not set'} />
        <Row label="Photos" value={`${value.images.length}`} />
      </dl>
      {value.transcript ? (
        <div className="border-rule border-t pt-2.5">
          <span className="field-label normal-case">✓ 技法メモ · technique memo</span>
          <p className="jp text-ink mt-1 text-[13px] leading-[1.8]">{value.transcript}</p>
        </div>
      ) : (
        <div className="border-rule border-t pt-2.5">
          <span className="text-dust text-[12px]">No technique memo — you can still add one after listing.</span>
        </div>
      )}
      {value.heritage ? (
        <div className="border-rule border-t pt-2.5">
          <span className="field-label normal-case">✓ 家族の記憶 · family history</span>
          <p className="jp text-ink mt-1 text-[13px] leading-[1.8]">{value.heritage}</p>
        </div>
      ) : null}
      <button
        onClick={onForge}
        disabled={running || !value.images.length}
        className="field-label bg-shu text-field mt-2 w-full rounded-[2px] py-3.5 disabled:bg-[color:var(--dust)]"
      >
        {running ? 'forging…' : 'forge → list on the marketplace'}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-rule flex justify-between border-t py-2">
      <span className="text-dust">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
