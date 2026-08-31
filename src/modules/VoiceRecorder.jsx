import { useState, useRef, useEffect } from 'react';

function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ─── Canonical AmplifyU voice-rehearsal recording control ────────────────────
// The reusable "ready to record -> recording -> transcribing" interaction
// used across all Rehearsal screens that require the user to speak. Modeled
// on Day 1's original Voice Warm-Up recording control.
//
// Props:
//   T, T2            — theme objects
//   maxSeconds        — hard recording cap; once elapsed reaches this, the
//                       recording auto-stops and auto-submits exactly as if
//                       the user tapped stop. Required by every call site —
//                       there is no uncapped mode.
//   onDone(text)      — called once a recording has been transcribed (or the
//                       user submits typed fallback text after a failure)
//   onRecordingChange(active) — called whenever recording/transcribing starts
//                       or stops, so the parent can gate its own nav/CTA state
export function VoiceRecorder({ T, T2, maxSeconds, onDone, onRecordingChange }) {
  const [isRec, setIsRec] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState(false);
  const [transcribeFailed, setTranscribeFailed] = useState(false);
  const [fallbackText, setFallbackText] = useState('');

  const timerRef = useRef(null);
  const mediaRecRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    onRecordingChange?.(isRec || transcribing);
  }, [isRec, transcribing]);

  useEffect(() => {
    if (isRec) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRec]);

  // Hard cap — auto-stop (which auto-submits via the normal stopRec flow)
  // the instant elapsed reaches maxSeconds, so nobody can prop the mic open.
  useEffect(() => {
    if (isRec && maxSeconds && elapsed >= maxSeconds) {
      stopRec();
    }
  }, [isRec, elapsed, maxSeconds]);

  // Stop any in-flight recording if the component unmounts (e.g. user swipes away mid-recording)
  useEffect(() => {
    return () => {
      try {
        const mr = mediaRecRef.current;
        if (mr && mr.state !== 'inactive') {
          mr.onstop = null;
          mr.stop();
          mr.stream?.getTracks().forEach(t => t.stop());
        }
      } catch {}
    };
  }, []);

  function startRec() {
    setIsRec(true);
    setElapsed(0);
    setMicError(false);
    setTranscribeFailed(false);
    audioChunksRef.current = [];
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        let mr;
        try { mr = new MediaRecorder(stream, {mimeType: 'audio/webm'}); }
        catch { mr = new MediaRecorder(stream); }
        mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.start(1000);
        mediaRecRef.current = mr;
      }).catch(() => { setIsRec(false); setMicError(true); });
    } else {
      setIsRec(false);
      setMicError(true);
    }
  }

  function stopRec() {
    setIsRec(false);
    setTranscribing(true);
    clearInterval(timerRef.current);
    const mr = mediaRecRef.current;
    if (!mr || mr.state === 'inactive') { setTranscribing(false); setTranscribeFailed(true); return; }
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
      try {
        const b64 = await blobToB64(blob);
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({b64, mimeType: 'audio/webm'}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        setTranscribing(false);
        onDone((data.text || '').trim());
      } catch (err) {
        console.error('[VoiceRecorder] transcribe error:', err);
        setTranscribing(false);
        setTranscribeFailed(true);
      }
    };
    try { mr.stop(); } catch(e) { setTranscribing(false); setTranscribeFailed(true); }
  }

  function submitFallback() {
    const t = fallbackText.trim();
    setMicError(false);
    setTranscribeFailed(false);
    onDone(t);
  }

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (transcribing) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <style>{`@keyframes voiceRecSpin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 36, height: 36, border: "2px solid #DDD5C4", borderTop: "2px solid #8A9E84", borderRadius: "50%", margin: "0 auto 16px", animation: "voiceRecSpin 0.8s linear infinite" }} />
        <p style={{ fontFamily: T.sans, fontSize: 14, color: "#A8998A", margin: 0 }}>Your coach is listening…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <button onClick={isRec ? stopRec : startRec} style={{
        width: 80, height: 80, borderRadius: "50%", border: "none", cursor: "pointer",
        background: isRec ? "#B05C4A" : "#8A9E84",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isRec ? "0 0 0 8px rgba(176,92,74,0.15)" : "0 0 0 6px rgba(138,158,132,0.12)",
        transition: "all 0.2s ease",
      }}>
        {isRec
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" fill="white"/></svg>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="white"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        }
      </button>
      {isRec && (
        <div style={{ fontFamily: T.sans, fontSize: 13, color: "#B05C4A", fontWeight: 600 }}>
          Recording — {fmtTime(elapsed)}{maxSeconds ? ` / ${fmtTime(maxSeconds)}` : ''} &nbsp;·&nbsp; tap to stop
        </div>
      )}
      {!isRec && !micError && !transcribeFailed && (
        <div style={{ fontFamily: T.sans, fontSize: 13, color: "#A8998A" }}>Tap to start recording</div>
      )}
      {!isRec && (micError || transcribeFailed) && (
        <div style={{ width: "100%", marginTop: 4, padding: "16px 18px", background: "#F0EBE2", borderRadius: 8, border: "0.5px solid #DDD5C4" }}>
          <p style={{ fontFamily: T.sans, fontSize: 13, color: "#6B5E44", lineHeight: 1.6, margin: "0 0 10px" }}>
            {micError ? "We couldn't access your microphone. Check your permissions, or type your response instead." : "We couldn't quite hear that. Try again, or type your response instead."}
          </p>
          <textarea value={fallbackText} onChange={e => setFallbackText(e.target.value)} placeholder="Type what you'd say…" style={{ width: "100%", minHeight: 80, background: "transparent", border: "none", borderBottom: "0.5px solid #DDD5C4", padding: "8px 0", fontFamily: T.sans, fontSize: 13, color: "#2C2416", resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}/>
          {fallbackText.trim().length > 10 && (
            <button onClick={submitFallback} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 4, border: "none", background: "#2C2416", color: "#F7F3EC", fontFamily: T.sans, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Submit →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
