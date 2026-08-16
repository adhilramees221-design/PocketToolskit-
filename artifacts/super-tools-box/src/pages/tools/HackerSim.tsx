import { useEffect, useRef, useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Link2, Volume2, VolumeX, Maximize, Minimize, Zap, ZapOff, Play } from "lucide-react";

// ─── Terminal lines ──────────────────────────────────────────────────────────
const HACK_LINES = [
  "> Initializing exploit framework v4.2.0...",
  "> Loading payload modules [██████████] 100%",
  "> Scanning target: 192.168.{r}.{r}",
  "> Port scan complete: 22, 80, 443, 8080, 3306 OPEN",
  "> CVE-2024-{r4} zero-day vulnerability detected",
  "> Injecting SQL payload: ' OR 1=1; DROP TABLE users;--",
  "> Bypassing firewall rules... SUCCESS",
  "> Decrypting RSA-4096 private key...",
  "  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] DECRYPTED ✓",
  "> SSH brute-force attack: root:{h6}... ACCESS GRANTED",
  "> Uploading reverse shell payload (4.2 KB)...",
  "> Shell established on 192.168.{r}.{r}:4444",
  "> whoami → root",
  "> Extracting password hashes from /etc/shadow...",
  "  $6$salt${h6}XxYz... [CRACKING AT 98 GH/s]",
  "> Password cracked: P@ssw0rd{r4}!",
  "> ARP spoofing initiated on subnet...",
  "> Intercepting HTTPS traffic (MitM active)...",
  "> Browser cookies extracted [session_id]: a3f9c2e1...",
  "> Email inbox downloaded: 2,847 messages ✓",
  "> Found 23 saved passwords — exporting...",
  "> Keylogger daemon started (PID: {r4})",
  "> Camera feed accessed — streaming 720p...",
  "> Microphone tapped — recording to /tmp/.audio",
  "> GPS coordinates: {gps}",
  "> Scanning gallery: {r4} photos found",
  "> Scanning gallery: {r4} videos found",
  "> Uploading photos & videos to remote server...",
  "  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% UPLOADED ✓",
  "> WhatsApp messages cloned: {r4} chats",
  "> Contacts exported: {r4} entries",
  "> AES-256 disk encryption started...",
  "  Files encrypted: 47,293 / 47,293 ✓",
  "> Wiping forensic traces: rm -rf /var/log/*",
  "> Installing persistence: /etc/cron.d/update",
  "> Zero-day exploit deployed — system OWNED ✓",
  "python3 exploit.py --target {ip} --payload reverse_shell",
  "nmap -sS -O -p 1-65535 --script vuln {ip}",
  "hydra -l root -P rockyou.txt ssh://{ip}",
  "tcpdump -i eth0 -w /tmp/capture.pcap &",
  "john --wordlist=passwords.txt hash.txt",
  "chmod +x rootkit.sh && ./rootkit.sh --silent",
  "> ALERT: 2FA intercepted via SS7 attack",
  "> ALERT: Cloud backup deleted — recovery impossible",
  "> Data exfiltration complete. 100% SUCCESS.",
  "> Maintaining stealth... CPU: 0.1%",
];

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツ0123456789ABCDEF<>{}[]|/\\!@#";

const THEMES = {
  green: { primary: "#00ff41", dim: "#003b10", bg: "#090e09", glow: "0 0 8px #00ff41,0 0 20px #00ff41" },
  cyan:  { primary: "#00e5ff", dim: "#00293d", bg: "#07090f", glow: "0 0 8px #00e5ff,0 0 20px #00e5ff" },
  red:   { primary: "#ff3c3c", dim: "#2a0000", bg: "#0e0404", glow: "0 0 8px #ff3c3c,0 0 20px #ff3c3c" },
};
type Theme = keyof typeof THEMES;

const r  = (n = 255) => Math.floor(Math.random() * n) + 1;
const h6 = () => [...Array(6)].map(() => "0123456789abcdef"[~~(Math.random() * 16)]).join("");
function fmt(line: string) {
  return line
    .replace(/{r}/g,  () => String(r()))
    .replace(/{r4}/g, () => String(r(9999)).padStart(4, "0"))
    .replace(/{h6}/g, h6)
    .replace(/{ip}/g, () => `${r()}.${r()}.${r()}.${r()}`)
    .replace(/{gps}/g, () => `${(Math.random()*180-90).toFixed(4)}°N ${(Math.random()*360-180).toFixed(4)}°E`);
}

// ─── Shared audio + TTS sequence ─────────────────────────────────────────────
// Returns a cancel function. Must be called from inside a user gesture:
// both audio elements are unlocked synchronously within the gesture so the
// delayed threat playback + TTS aren't blocked by autoplay policies.
function runPrankSequence(base: string, name: string, refs: {
  typing: React.MutableRefObject<HTMLAudioElement | null>;
  threat: React.MutableRefObject<HTMLAudioElement | null>;
}): () => void {
  window.speechSynthesis?.cancel();

  const timers: number[] = [];
  let cancelled = false;

  // Step 1 — typing sound (starts inside the gesture)
  const typing = new Audio(`${base}sounds/typing.mp3`);
  typing.loop  = true;
  typing.volume = 0.72;
  refs.typing.current = typing;
  typing.play().catch(() => {});

  // Pre-create + unlock the threat audio inside the same gesture
  // (muted play → pause counts as gesture activation for this element)
  const threat = new Audio(`${base}sounds/threat.mp3`);
  threat.volume = 0.9;
  refs.threat.current = threat;
  threat.muted = true;
  threat.play().then(() => {
    threat.pause();
    threat.currentTime = 0;
    threat.muted = false;
  }).catch(() => { threat.muted = false; });

  // Unlock speech synthesis inside the gesture with a silent utterance
  if (window.speechSynthesis) {
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    window.speechSynthesis.speak(warm);
  }

  let ttsPlayed = false;
  const playTTS = () => {
    if (cancelled || ttsPlayed) return;
    ttsPlayed = true;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `Your system has been hacked by ${name}. All photos and videos accessed.`
    );
    utter.rate   = 0.82;
    utter.pitch  = 0.7;
    utter.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const pick = voices.find(v => v.lang.startsWith("en") && /david|alex|google uk|google us/i.test(v.name));
    if (pick) utter.voice = pick;
    window.speechSynthesis.speak(utter);
  };

  // Step 2 — after 5s: stop typing, play threat; Step 3 — TTS after threat
  timers.push(window.setTimeout(() => {
    if (cancelled) return;
    typing.pause();
    typing.currentTime = 0;
    threat.play().catch(() => {});
    threat.addEventListener("ended", playTTS, { once: true });
    timers.push(window.setTimeout(playTTS, 12000)); // fallback if 'ended' never fires
  }, 5000));

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
    typing.pause();
    threat.pause();
    window.speechSynthesis?.cancel();
  };
}

// ─── CSS animations ───────────────────────────────────────────────────────────
const STYLES = `
@keyframes scanline{0%{top:-4%}100%{top:104%}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes fadeInUp{0%{opacity:0;transform:translateY(24px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fadeOut{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.85)}}
@keyframes pulseRed{0%,100%{box-shadow:0 0 24px #ff3c3c,0 0 60px #ff3c3c}50%{box-shadow:0 0 50px #ff3c3c,0 0 110px #ff3c3c,inset 0 0 30px #ff3c3c22}}
@keyframes pulseGreen{0%,100%{box-shadow:0 0 24px #00ff41,0 0 60px #00ff41}50%{box-shadow:0 0 50px #00ff41,0 0 110px #00ff41,inset 0 0 30px #00ff4122}}
@keyframes hackTitle{0%,100%{text-shadow:0 0 18px #ff3c3c,0 0 40px #ff3c3c}50%{text-shadow:0 0 36px #ff3c3c,0 0 80px #ff0000,0 0 120px #ff0000}}
@keyframes glitchShake{0%,100%{transform:translate(0)}10%{transform:translate(-4px,2px) skewX(4deg)}20%{transform:translate(4px,-2px) skewX(-3deg)}30%{transform:translate(-2px,1px)}50%{transform:translate(0)}}
@keyframes bgFlash{0%,100%{background:#0a0000}15%,45%{background:#1a0000}30%{background:#0a0000}}
.blink-cursor{animation:blink 1s step-end infinite}
.glitch-anim{animation:glitchShake .5s linear}
.victim-bg{animation:bgFlash 1.6s ease infinite}
`;

// ─── Matrix canvas (reused in both views) ────────────────────────────────────
function MatrixRain({ color, opacity = 0.18, speed = 55 }: { color: string; opacity?: number; speed?: number }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const fs = 13;
    let cols: number[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; cols = Array(~~(canvas.width / fs)).fill(0); };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0, last = 0;
    const draw = (ts: number) => {
      raf = requestAnimationFrame(draw);
      if (ts - last < speed) return;
      last = ts;
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `${fs}px monospace`;
      cols.forEach((y, i) => {
        ctx.fillText(MATRIX_CHARS[~~(Math.random() * MATRIX_CHARS.length)], i * fs, y * fs);
        cols[i] = y > canvas.height / fs && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [color, speed]);
  return <canvas ref={cvs} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }} />;
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function HackerSim() {
  const params = new URLSearchParams(window.location.search);
  const isVictim = params.get("s") === "1";
  const victimName = params.get("n") || "ANONYMOUS";
  if (isVictim) return <VictimView name={victimName} />;
  return <SimulatorView />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VICTIM VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function VictimView({ name }: { name: string }) {
  const [entered, setEntered]   = useState(false);
  const [lines, setLines]       = useState<string[]>([]);
  const [glitch, setGlitch]     = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFading, setAlertFading] = useState(false);
  const termRef   = useRef<HTMLDivElement>(null);
  const lineIdx   = useRef(0);
  const typingRef = useRef<HTMLAudioElement | null>(null);
  const threatRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const started   = useRef(false);
  const base      = import.meta.env.BASE_URL ?? "/";

  const handleContinue = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setEntered(true);

    // Show alert popup shortly after the hack screen appears
    setTimeout(() => setShowAlert(true), 400);
    setTimeout(() => setAlertFading(true),  3400);
    setTimeout(() => { setShowAlert(false); setAlertFading(false); }, 4100);

    // Audio starts inside this click — autoplay always allowed
    cancelRef.current = runPrankSequence(base, name, { typing: typingRef, threat: threatRef });
  }, [base, name]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      cancelRef.current?.();
      typingRef.current?.pause();
      threatRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Hack animation runs only after Continue is pressed
  useEffect(() => {
    if (!entered) return;

    const gl = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 650); }, 2800);

    const addLine = () => {
      const l = fmt(HACK_LINES[lineIdx.current++ % HACK_LINES.length]);
      setLines(p => [...p.slice(-55), l]);
      setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 8);
    };
    addLine();
    const li = setInterval(addLine, 160);

    return () => { clearInterval(gl); clearInterval(li); };
  }, [entered]);

  // ── Innocent blue landing screen ──
  if (!entered) {
    return (
      <div style={{
        position:"fixed", inset:0, zIndex:99999,
        background:"linear-gradient(160deg,#1e3a8a 0%,#2563eb 55%,#3b82f6 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        padding:"24px", textAlign:"center",
      }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:20 }}>
          🔗
        </div>
        <div style={{ color:"#fff", fontSize:"clamp(18px,5vw,24px)", fontWeight:700, marginBottom:8 }}>
          You've received a link
        </div>
        <div style={{ color:"rgba(255,255,255,0.75)", fontSize:14, marginBottom:32, maxWidth:320 }}>
          Tap continue to open the shared content
        </div>
        <button
          onClick={handleContinue}
          style={{
            background:"#ffffff", color:"#1d4ed8", border:"none", borderRadius:999,
            padding:"14px 56px", fontSize:17, fontWeight:700, cursor:"pointer",
            boxShadow:"0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          Continue
        </button>
        <div style={{ position:"absolute", bottom:14, color:"rgba(255,255,255,0.4)", fontSize:11, letterSpacing:"1px" }}>
          Pocket Tools Kit
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={glitch ? "glitch-anim victim-bg" : "victim-bg"}
        style={{ position: "fixed", inset: 0, zIndex: 99999, color: "#ff3c3c", fontFamily: "monospace", overflow: "hidden" }}
      >
        {/* Matrix rain */}
        <MatrixRain color="#ff2200" opacity={0.26} speed={40} />

        {/* Scanline */}
        <div style={{ position:"absolute", left:0, right:0, height:"2px", background:"rgba(255,50,50,0.18)", animation:"scanline 3.5s linear infinite", zIndex:1, pointerEvents:"none" }} />

        {/* Vignette */}
        <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", background:"radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.78) 100%)" }} />

        {/* Red alert popup */}
        {showAlert && (
          <div style={{
            position:"absolute", inset:0, zIndex:25, display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(20,0,0,0.88)",
            animation: alertFading ? "fadeOut 0.6s ease forwards" : "fadeInUp 0.4s ease",
          }}>
            <div style={{
              textAlign:"center", padding:"28px 32px", border:"2px solid #ff3c3c", borderRadius:18,
              maxWidth:"85vw", animation:"pulseRed 1s ease infinite",
            }}>
              <div style={{ fontSize:48, lineHeight:1, filter:"drop-shadow(0 0 14px #ff3c3c)" }}>⚠</div>
              <div style={{ fontSize:"clamp(14px,4vw,26px)", fontWeight:900, letterSpacing:"2px", marginTop:10, textShadow:"0 0 20px #ff3c3c" }}>
                YOUR SYSTEM HAS BEEN<br/>HACKED BY {name.toUpperCase()}
              </div>
              <div style={{ fontSize:"clamp(9px,2vw,12px)", opacity:0.65, marginTop:8, letterSpacing:"2px" }}>
                ALL PHOTOS AND VIDEOS ARE BEING ACCESSED
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{ position:"relative", zIndex:2, height:"100%", display:"flex", flexDirection:"column", padding:"12px 14px" }}>
          {/* Header */}
          <div style={{ textAlign:"center", padding:"10px 8px", borderBottom:"2px solid #ff3c3c", animation:"hackTitle 1.4s ease-in-out infinite" }}>
            <div style={{ fontSize:"clamp(8px,2vw,12px)", letterSpacing:"4px", opacity:0.6, marginBottom:4 }}>
              ⚠ CRITICAL SECURITY BREACH DETECTED ⚠
            </div>
            <div style={{ fontSize:"clamp(15px,4.2vw,36px)", fontWeight:900, lineHeight:1.2, textShadow:"0 0 20px #ff3c3c,0 0 40px #ff0000" }}>
              YOUR SYSTEM HAS BEEN<br/>HACKED BY {name.toUpperCase()}
            </div>
            <div style={{ fontSize:"clamp(8px,1.6vw,11px)", opacity:0.55, marginTop:5, letterSpacing:"2px" }}>
              FILES · VIDEOS · PHOTOS · CONTACTS ARE BEING STOLEN
            </div>
          </div>

          {/* Terminal */}
          <div ref={termRef} style={{ flex:1, overflowY:"auto", padding:"10px 2px", fontSize:"clamp(9px,2vw,12px)", lineHeight:1.65 }}>
            {lines.map((l, i) => (
              <div key={i} style={{ opacity: i === lines.length - 1 ? 1 : 0.65 }}>
                {l}
                {i === lines.length - 1 && <span className="blink-cursor" style={{ marginLeft:2 }}>█</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", fontSize:10, opacity:0.22, letterSpacing:"2px", zIndex:3, pointerEvents:"none", fontFamily:"monospace", color:"#ff3c3c" }}>
          Pocket Tools Kit
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR / CREATOR VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function SimulatorView() {
  const [theme, setTheme]         = useState<Theme>("green");
  const [lines, setLines]         = useState<string[]>(["> System initialized.", "> Click / tap terminal to stream code."]);
  const [autoHack, setAutoHack]   = useState(false);
  const [muted, setMuted]         = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hackerName, setHackerName] = useState("");
  const [prank, setPrank]         = useState("");
  const [copied, setCopied]       = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [modal, setModal]         = useState<"granted"|"denied"|null>(null);
  const [modalFading, setModalFading] = useState(false);
  const [testAlert, setTestAlert] = useState(false);
  const [testAlertFading, setTestAlertFading] = useState(false);

  const lineIdx    = useRef(0);
  const termRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const autoRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAdd    = useRef(0);
  const typingRef  = useRef<HTMLAudioElement | null>(null);
  const threatRef  = useRef<HTMLAudioElement | null>(null);
  const cancelSeqRef = useRef<(() => void) | null>(null);
  const alertTimers  = useRef<number[]>([]);

  const base = import.meta.env.BASE_URL ?? "/";
  const t = THEMES[theme];

  const ensureCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtxRef.current;
  };
  const beep = (freq = 300, dur = 0.04, vol = 0.05) => {
    if (muted) return;
    try {
      const ctx = ensureCtx();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch {}
  };

  const addLine = useCallback((burst = false) => {
    const now = Date.now();
    if (!burst && now - lastAdd.current < 120) return;
    lastAdd.current = now;
    const l = fmt(HACK_LINES[lineIdx.current++ % HACK_LINES.length]);
    setLines(p => [...p.slice(-60), l]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 8);
    beep(180 + Math.random() * 380, 0.035, 0.045);
  }, [muted]);

  useEffect(() => {
    if (autoHack) { autoRef.current = setInterval(() => addLine(true), 260); }
    else { if (autoRef.current) clearInterval(autoRef.current); }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoHack, addLine]);

  // Cleanup on unmount: stop any running prank sequence + timers
  useEffect(() => () => {
    cancelSeqRef.current?.();
    alertTimers.current.forEach(clearTimeout);
    typingRef.current?.pause();
    threatRef.current?.pause();
    window.speechSynthesis?.cancel();
    audioCtxRef.current?.close().catch(() => {});
  }, []);

  useEffect(() => {
    if (!modal) return;
    const a = setTimeout(() => setModalFading(true), 2500);
    const b = setTimeout(() => { setModal(null); setModalFading(false); }, 3200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [modal]);

  const triggerModal = (type: "granted"|"denied") => {
    setGlitching(true); setTimeout(() => setGlitching(false), 550);
    setModal(type); setModalFading(false);
    if (!muted) {
      const ctx = ensureCtx();
      (type === "granted"
        ? [523,659,784,1047] : [880,1320,660,1100]
      ).forEach((f, i) => setTimeout(() => beep(f, 0.18, 0.12), i * 100));
    }
    setLines(p => [...p.slice(-60), type === "granted"
      ? "> ✓ ACCESS GRANTED — system unlocked." : "> ✗ ACCESS DENIED — lockout triggered."]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 8);
  };

  const testPrank = () => {
    ensureCtx();
    const name = hackerName.trim() || "ANONYMOUS";

    // Cancel any previous sequence (timers + audio + TTS) before starting anew
    cancelSeqRef.current?.();
    cancelSeqRef.current = null;

    // Show red alert popup (reset timers if re-clicked)
    alertTimers.current.forEach(clearTimeout);
    setTestAlert(true);
    setTestAlertFading(false);
    alertTimers.current = [
      window.setTimeout(() => setTestAlertFading(true), 3000),
      window.setTimeout(() => { setTestAlert(false); setTestAlertFading(false); }, 3700),
    ];

    if (!muted) {
      cancelSeqRef.current = runPrankSequence(base, name, { typing: typingRef, threat: threatRef });
    }
    setLines(p => [...p.slice(-60), `> [TEST] Prank sequence started for "${name}"`]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 8);
  };

  const generatePrank = () => {
    const name = hackerName.trim() || "ANONYMOUS";
    const origin = window.location.origin;
    const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    setPrank(`${origin}${basePath}/tools/view?n=${encodeURIComponent(name)}&s=1`);
  };

  const copyPrank = () => {
    if (!prank) return;
    navigator.clipboard.writeText(prank);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <ToolLayout
      toolId="hacker"
      instructions={
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Click / Tap</strong> the terminal to add code lines instantly.</li>
          <li>Toggle <strong>Auto Hack</strong> for continuous streaming.</li>
          <li>Enter a name → <strong>Generate Link</strong> → victim gets full audio + TTS experience 😈</li>
          <li><strong>Test Prank</strong> button lets you preview the full sound sequence yourself.</li>
        </ul>
      }
    >
      <style>{STYLES}</style>

      {/* Test alert popup (creator view) */}
      {testAlert && (
        <div style={{
          position:"fixed", inset:0, zIndex:9999,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(20,0,0,0.85)",
          animation: testAlertFading ? "fadeOut 0.6s ease forwards" : "fadeInUp 0.4s ease",
        }}>
          <div style={{
            textAlign:"center", padding:"28px 36px", border:"2px solid #ff3c3c", borderRadius:18,
            maxWidth:"90vw", fontFamily:"monospace", animation:"pulseRed 1s ease infinite",
          }}>
            <div style={{ fontSize:52, lineHeight:1, filter:"drop-shadow(0 0 14px #ff3c3c)" }}>⚠</div>
            <div style={{ fontSize:"clamp(14px,4vw,26px)", fontWeight:900, letterSpacing:"2px", marginTop:10, color:"#ff3c3c", textShadow:"0 0 20px #ff3c3c" }}>
              YOUR SYSTEM HAS BEEN<br/>HACKED BY {(hackerName.trim() || "ANONYMOUS").toUpperCase()}
            </div>
            <div style={{ fontSize:11, opacity:0.6, marginTop:8, letterSpacing:"2px", color:"#ff3c3c" }}>
              ALL PHOTOS AND VIDEOS ARE BEING ACCESSED
            </div>
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {(["green","cyan","red"] as Theme[]).map(th => (
          <button key={th} onClick={() => setTheme(th)}
            style={{ width:24, height:24, borderRadius:"50%", background:THEMES[th].primary, cursor:"pointer", border: theme===th ? "3px solid white":"3px solid transparent", boxShadow: theme===th ? `0 0 10px ${THEMES[th].primary}`:"none", transition:"all .2s" }}
          />
        ))}
        <Button size="sm" variant="outline" onClick={() => setMuted(m=>!m)} className="gap-1 h-7 text-xs">
          {muted ? <VolumeX className="h-3 w-3"/> : <Volume2 className="h-3 w-3"/>}
          {muted ? "Unmute":"Mute"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { if (!fullscreen) containerRef.current?.requestFullscreen?.(); else document.exitFullscreen?.(); setFullscreen(f=>!f); }} className="gap-1 h-7 text-xs">
          {fullscreen ? <Minimize className="h-3 w-3"/> : <Maximize className="h-3 w-3"/>}
          Fullscreen
        </Button>
        <Button size="sm" onClick={() => { setAutoHack(a=>!a); ensureCtx(); }}
          className="gap-1 h-7 text-xs" style={{ background: autoHack ? "#ef4444":undefined }}>
          {autoHack ? <ZapOff className="h-3 w-3"/> : <Zap className="h-3 w-3"/>}
          {autoHack ? "Stop Auto":"Auto Hack"}
        </Button>
      </div>

      {/* Terminal */}
      <div ref={containerRef} className={glitching ? "glitch-anim" : ""}
        onClick={() => { addLine(); ensureCtx(); }}
        onTouchStart={() => { addLine(); ensureCtx(); }}
        style={{
          position:"relative", borderRadius:12, overflow:"hidden",
          background: t.bg, border:`1.5px solid ${t.primary}`,
          boxShadow:`0 0 18px ${t.primary}44,inset 0 0 28px ${t.dim}`,
          cursor:"crosshair", userSelect:"none", height:340,
        }}>
        <MatrixRain color={t.primary} opacity={0.16} />
        <div style={{ position:"absolute", left:0, right:0, height:"2px", background:`${t.primary}18`, animation:"scanline 5s linear infinite", zIndex:1, pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", background:"radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.55) 100%)" }} />

        {/* Title bar */}
        <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderBottom:`1px solid ${t.primary}33`, background:`${t.dim}88` }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i)=><div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
          <span style={{ color:t.primary, fontSize:11, letterSpacing:"2px", marginLeft:6 }}>HACKER TERMINAL v4.2 ● ONLINE</span>
        </div>

        {/* Lines */}
        <div ref={termRef} style={{ position:"relative", zIndex:2, height:"calc(100% - 36px)", overflowY:"auto", padding:"8px 12px", fontFamily:"monospace", fontSize:12, lineHeight:1.7, color:t.primary }}>
          {lines.map((line, i) => (
            <div key={i} style={{ opacity: i===lines.length-1?1:0.68, textShadow: i===lines.length-1?t.glow:"none" }}>
              {line}
              {i===lines.length-1 && <span className="blink-cursor" style={{ color:t.primary, marginLeft:2 }}>█</span>}
            </div>
          ))}
        </div>
        <div style={{ position:"absolute", bottom:8, right:12, zIndex:2, fontSize:9, color:t.primary, opacity:0.28, pointerEvents:"none", letterSpacing:"1px" }}>TAP TO TYPE</div>

        {/* ACCESS modal */}
        {modal && (
          <div style={{ position:"absolute", inset:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", background: modal==="granted"?"rgba(0,22,0,0.88)":"rgba(22,0,0,0.88)", animation: modalFading?"fadeOut .5s ease forwards":"fadeInUp .35s ease" }}>
            <div style={{ textAlign:"center", padding:"28px 36px", border:`2px solid ${modal==="granted"?"#00ff41":"#ff3c3c"}`, borderRadius:16, fontFamily:"monospace", animation: modal==="granted"?"pulseGreen 1.5s ease infinite":"pulseRed .9s ease infinite" }}>
              <div style={{ fontSize:52, lineHeight:1, filter:`drop-shadow(0 0 12px ${modal==="granted"?"#00ff41":"#ff3c3c"})` }}>{modal==="granted"?"✓":"✗"}</div>
              <div style={{ fontSize:22, fontWeight:900, letterSpacing:"3px", marginTop:8, color:modal==="granted"?"#00ff41":"#ff3c3c", textShadow:`0 0 20px ${modal==="granted"?"#00ff41":"#ff3c3c"}` }}>
                {modal==="granted"?"ACCESS GRANTED":"ACCESS DENIED"}
              </div>
              <div style={{ fontSize:10, opacity:0.65, marginTop:5, letterSpacing:"2px" }}>
                {modal==="granted"?"AUTHENTICATION SUCCESSFUL":"LOCKOUT TRIGGERED · ALERT SENT"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Access + Test buttons */}
      <div className="flex gap-2 mt-3 flex-wrap">
        <button onClick={(e)=>{e.stopPropagation();triggerModal("granted");}}
          style={{ flex:1, minWidth:120, padding:"9px 4px", borderRadius:10, border:"1.5px solid #00ff41", background:"#001800", color:"#00ff41", fontFamily:"monospace", fontSize:12, fontWeight:700, letterSpacing:"2px", cursor:"pointer" }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow="0 0 14px #00ff41"}
          onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          ✓ ACCESS GRANTED
        </button>
        <button onClick={(e)=>{e.stopPropagation();triggerModal("denied");}}
          style={{ flex:1, minWidth:120, padding:"9px 4px", borderRadius:10, border:"1.5px solid #ff3c3c", background:"#180000", color:"#ff3c3c", fontFamily:"monospace", fontSize:12, fontWeight:700, letterSpacing:"2px", cursor:"pointer" }}
          onMouseEnter={e=>e.currentTarget.style.boxShadow="0 0 14px #ff3c3c"}
          onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          ✗ ACCESS DENIED
        </button>
      </div>

      {/* ─── Prank Link Generator ────────────────────────────────────────── */}
      <div className="mt-4 rounded-xl border p-4 space-y-4 bg-muted/30">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4" /> Prank Link Generator
        </p>

        {/* Name input */}
        <div className="space-y-1.5">
          <Label htmlFor="hname" className="text-xs">Enter Hacker Name</Label>
          <Input
            id="hname"
            placeholder="e.g. Shadow404, DarkHunter, ..."
            value={hackerName}
            onChange={e => { setHackerName(e.target.value); setPrank(""); }}
            onKeyDown={e => e.key==="Enter" && generatePrank()}
            className="font-mono"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={generatePrank} className="gap-1.5">
            <Link2 className="h-4 w-4" /> Generate Link
          </Button>
          <Button variant="outline" onClick={testPrank} className="gap-1.5">
            <Play className="h-4 w-4" /> Test Prank Sound
          </Button>
        </div>

        {/* Generated link */}
        {prank && (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input readOnly value={prank}
                className="flex-1 font-mono text-xs border rounded-lg px-3 py-2 bg-muted truncate min-w-0" />
              <Button size="sm" variant="outline" onClick={copyPrank} className="gap-1.5 shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                {copied ? "Copied!":"Copy Link"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              🎭 Send this via WhatsApp or Telegram. When opened:<br/>
              <strong>5s typing sound</strong> → <strong>alarm</strong> → <strong>voice: "Hacked by {hackerName.trim() || "you"}. All photos and videos accessed."</strong>
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
