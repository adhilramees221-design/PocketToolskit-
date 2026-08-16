import { useEffect, useRef, useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Link2, Volume2, VolumeX, Maximize, Minimize, Zap, ZapOff } from "lucide-react";

// ─── Hacker terminal lines ───────────────────────────────────────────────────
const HACK_LINES = [
  "> Initializing exploit framework v4.2.0...",
  "> Loading payload modules [██████████] 100%",
  "> Scanning target: 192.168.1.{rand}",
  "> Port scan complete: 22, 80, 443, 8080, 3306 OPEN",
  "> CVE-2024-{rand4} vulnerability detected",
  "> Injecting SQL payload: ' OR 1=1; DROP TABLE users;--",
  "> Bypassing firewall rules... SUCCESS",
  "> Decrypting RSA-4096 private key...",
  "  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] DECRYPTED",
  "> SSH brute-force: root:{rand6}... ACCESS GRANTED",
  "> Uploading reverse shell payload (4.2 KB)...",
  "> Shell established on 192.168.1.{rand}:4444",
  "> whoami",
  "  root",
  "> cat /etc/passwd | grep -v nologin",
  "  root:x:0:0:root:/root:/bin/bash",
  "> Extracting password hashes from /etc/shadow...",
  "  $6$salt${rand6}XxYz... [CRACKING]",
  "> Hashcat running at 98.4 GH/s...",
  "> Password cracked: P@ssw0rd{rand4}!",
  "> Pivoting to internal network 10.0.0.0/24...",
  "> ARP spoofing initiated on subnet...",
  "> Intercepting HTTPS traffic (MitM active)...",
  "> Extracting browser cookies from target...",
  "  [session_id] a3f9c2e1d8b7...",
  "  [auth_token] Bearer eyJhbGciOiJS...",
  "> Accessing email account: victim@gmail.com",
  "  Inbox: 2,847 messages downloaded",
  "> Locating stored credentials in keychain...",
  "> Found 23 saved passwords — exporting...",
  "> Installing persistence: /etc/cron.d/update",
  "> Keylogger daemon started (PID: {rand4})",
  "> Camera accessed — streaming 720p feed",
  "> Microphone tapped — recording to /tmp/.audio",
  "> GPS coordinates: {gps}",
  "> Exfiltrating {rand}GB of sensitive data...",
  "  Upload speed: 128 MB/s → C2 server",
  "> Scanning gallery: {rand4} photos found",
  "> Scanning gallery: {rand4} videos found",
  "> Uploading photos & videos to remote server...",
  "  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% COMPLETE",
  "> Contacts exported: {rand4} entries",
  "> WhatsApp messages cloned: {rand4} chats",
  "> Encrypting disk with AES-256...",
  "  Files encrypted: 47,293 / 47,293 ✓",
  "> Zero-day exploit deployed successfully",
  "> System fully compromised ✓",
  "python3 -c 'import socket,subprocess,os;s=socket.socket()'",
  "nmap -sS -O -p 1-65535 --script vuln {ip}",
  "hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://{ip}",
  "tcpdump -i eth0 -w capture.pcap &",
  "john --wordlist=passwords.txt hash.txt",
  "chmod +x rootkit.sh && ./rootkit.sh --silent",
  "> ALERT: 2FA codes intercepted via SS7 attack",
  "> ALERT: Cloud backup deleted from AWS S3",
  "> Data breach complete. Exfiltration: SUCCESS",
  "> Maintaining stealth... CPU usage: 0.1%",
  "> Wiping forensic traces... [rm -rf /var/log/*]",
];

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ0123456789ABCDEF<>{}[]|/\\";

const THEMES = {
  green:  { primary: "#00ff41", dim: "#003b10", bg: "#0a0f0a", glow: "0 0 8px #00ff41, 0 0 20px #00ff41" },
  cyan:   { primary: "#00e5ff", dim: "#00293d", bg: "#080d10", glow: "0 0 8px #00e5ff, 0 0 20px #00e5ff" },
  red:    { primary: "#ff3c3c", dim: "#2a0000", bg: "#0f0505", glow: "0 0 8px #ff3c3c, 0 0 20px #ff3c3c" },
};
type Theme = keyof typeof THEMES;

function rand(n = 999) { return Math.floor(Math.random() * n) + 1; }
function randHex(len = 6) { return [...Array(len)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""); }
function formatLine(line: string): string {
  return line
    .replace("{rand}", String(rand()))
    .replace("{rand4}", String(rand(9999)).padStart(4, "0"))
    .replace("{rand6}", randHex(6))
    .replace("{ip}", `${rand(255)}.${rand(255)}.${rand(255)}.${rand(255)}`)
    .replace("{gps}", `${(Math.random() * 180 - 90).toFixed(4)}°N ${(Math.random() * 360 - 180).toFixed(4)}°E`);
}

// ─── Web Audio helpers ────────────────────────────────────────────────────────
function createAudioCtx() {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}
function playBeep(ctx: AudioContext, freq = 440, dur = 0.05, vol = 0.08) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch {}
}
function playGranted(ctx: AudioContext) {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playBeep(ctx, f, 0.18, 0.1), i * 100));
}
function playAlarmSynth(ctx: AudioContext) {
  [880, 1320, 660, 1100].forEach((f, i) => setTimeout(() => playBeep(ctx, f, 0.2, 0.15), i * 150));
}

// ─── Matrix Rain Canvas ───────────────────────────────────────────────────────
function MatrixCanvas({ theme, active }: { theme: Theme; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colsRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const fontSize = 13;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      colsRef.current = Array(Math.floor(canvas.width / fontSize)).fill(0);
    };
    resize();
    window.addEventListener("resize", resize);
    let last = 0;
    const draw = (ts: number) => {
      frameRef.current = requestAnimationFrame(draw);
      if (!active) return;
      if (ts - last < 55) return;
      last = ts;
      const t = THEMES[theme];
      ctx.fillStyle = `${t.bg}cc`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = t.primary;
      ctx.font = `${fontSize}px monospace`;
      colsRef.current.forEach((y, i) => {
        const ch = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        ctx.fillText(ch, i * fontSize, y * fontSize);
        colsRef.current[i] = y > canvas.height / fontSize && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", resize); };
  }, [theme, active]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.18 }} />;
}

// ─── Glitch CSS (injected once) ───────────────────────────────────────────────
const STYLES = `
@keyframes glitch2 {
  0%,100%{ transform:translate(0) scaleX(1); opacity:1; }
  10%{ transform:translate(4px,-1px) scaleX(1.02); opacity:.8; }
  20%{ transform:translate(-4px,2px) scaleX(0.98); opacity:.9; }
  30%{ transform:translate(2px,0) skewX(3deg); opacity:1; }
  50%{ transform:translate(-1px,0) skewX(-2deg); }
}
@keyframes scanline { 0%{top:-10%} 100%{top:110%} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes fadeInScale { 0%{opacity:0;transform:scale(0.7)} 100%{opacity:1;transform:scale(1)} }
@keyframes fadeOut { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.8)} }
@keyframes pulseGreen {
  0%,100%{ box-shadow:0 0 20px #00ff41,0 0 60px #00ff41; }
  50%{ box-shadow:0 0 40px #00ff41,0 0 100px #00ff41,inset 0 0 30px #00ff4122; }
}
@keyframes pulseRed {
  0%,100%{ box-shadow:0 0 20px #ff3c3c,0 0 60px #ff3c3c; }
  50%{ box-shadow:0 0 50px #ff3c3c,0 0 120px #ff3c3c,inset 0 0 30px #ff3c3c22; background:#1a0000; }
}
@keyframes victimGlitch {
  0%,100%{ transform:translate(0) skewX(0); filter:none; }
  5%{ transform:translate(-6px,2px) skewX(5deg); filter:hue-rotate(90deg); }
  10%{ transform:translate(6px,-2px) skewX(-3deg); filter:brightness(2); }
  15%{ transform:translate(-3px,0); filter:none; }
  90%{ transform:translate(4px,1px) skewX(-4deg); filter:hue-rotate(180deg); }
  95%{ transform:translate(-4px,-1px) skewX(2deg); filter:brightness(1.5); }
}
@keyframes hackTitle {
  0%,100%{ opacity:1; text-shadow:0 0 20px #ff3c3c,0 0 40px #ff3c3c; }
  50%{ opacity:0.7; text-shadow:0 0 40px #ff3c3c,0 0 80px #ff3c3c,0 0 120px #ff0000; }
}
@keyframes flashBg {
  0%,100%{ background:#0a0000; }
  10%,30%,50%{ background:#1a0000; }
  20%,40%{ background:#0a0000; }
}
.hacker-glitch2 { animation:glitch2 0.6s linear; }
.blink-cursor { animation:blink 1s step-end infinite; }
.victim-glitch { animation:victimGlitch 1.5s infinite; }
.victim-flash { animation:flashBg 0.6s ease infinite; }
`;

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HackerSim() {
  const params = new URLSearchParams(window.location.search);
  // Prank mode uses innocent params: ?n=NAME&s=1
  const isPrank = params.get("s") === "1";
  const prankName = params.get("n") || "ANONYMOUS";
  if (isPrank) return <VictimView name={prankName} />;
  return <SimulatorView />;
}

// ─── Victim / Prank View ──────────────────────────────────────────────────────
function VictimView({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [glitch, setGlitch] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showTap, setShowTap] = useState(true);
  const termRef = useRef<HTMLDivElement>(null);
  const lineIdx = useRef(0);
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const threatAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsSpokenRef = useRef(false);

  const base = import.meta.env.BASE_URL || "/";

  const triggerAudioSequence = useCallback(() => {
    if (audioUnlocked) return;
    setAudioUnlocked(true);
    setShowTap(false);

    // 1. Typing sound — play for 5.5 seconds
    const typing = new Audio(`${base}sounds/typing.mp3`);
    typingAudioRef.current = typing;
    typing.volume = 0.75;
    typing.loop = true;
    typing.play().catch(() => {});

    // 2. After 5.5s → stop typing, play threat sound
    setTimeout(() => {
      typing.pause();
      typing.currentTime = 0;
      const threat = new Audio(`${base}sounds/threat.mp3`);
      threatAudioRef.current = threat;
      threat.volume = 0.9;
      threat.loop = true;
      threat.play().catch(() => {});
    }, 5500);

    // 3. TTS — speak after 3 seconds (overlaps with typing for drama)
    setTimeout(() => {
      if (ttsSpokenRef.current) return;
      ttsSpokenRef.current = true;
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        `Warning! Your system has been hacked by ${name}. ` +
        `All your videos, photos, and contacts are being uploaded to a remote server right now. ` +
        `Hacked by ${name}.`
      );
      msg.rate = 0.88;
      msg.pitch = 0.75;
      msg.volume = 1.0;
      // Pick a deep/scary voice if available
      const voices = window.speechSynthesis.getVoices();
      const deepVoice = voices.find(v => v.lang.startsWith("en") && /male|david|alex|google/i.test(v.name));
      if (deepVoice) msg.voice = deepVoice;
      window.speechSynthesis.speak(msg);
    }, 3000);
  }, [audioUnlocked, base, name]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Try autoplay on mount (works on desktop / some mobile)
    setTimeout(() => triggerAudioSequence(), 400);

    // Glitch pulse every 2.5s
    const glitchTimer = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 700);
    }, 2500);

    // Stream lines FAST (180ms)
    const addLine = () => {
      const l = HACK_LINES[lineIdx.current % HACK_LINES.length];
      lineIdx.current++;
      setLines(prev => [...prev.slice(-50), formatLine(l)]);
      setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 10);
    };
    addLine();
    const lineTimer = setInterval(addLine, 180);

    // Matrix canvas
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const fontSize = 14;
    let cols: number[] = [];
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Array(Math.floor(canvas.width / fontSize)).fill(0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    let raf: number;
    let lastTs = 0;
    const drawMatrix = (ts: number) => {
      raf = requestAnimationFrame(drawMatrix);
      if (ts - lastTs < 40) return;
      lastTs = ts;
      ctx.fillStyle = "rgba(10,0,0,0.82)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ff3c3c";
      ctx.font = `${fontSize}px monospace`;
      cols.forEach((y, i) => {
        const ch = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        ctx.fillText(ch, i * fontSize, y * fontSize);
        cols[i] = y > canvas.height / fontSize && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    raf = requestAnimationFrame(drawMatrix);

    return () => {
      document.body.style.overflow = "";
      clearInterval(glitchTimer);
      clearInterval(lineTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      typingAudioRef.current?.pause();
      threatAudioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`${glitch ? "victim-glitch" : ""} victim-flash`}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          color: "#ff3c3c", fontFamily: "monospace", overflow: "hidden",
        }}
        onClick={triggerAudioSequence}
        onTouchStart={triggerAudioSequence}
      >
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.28 }} />

        {/* Scanline */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "3px",
          background: "rgba(255,60,60,0.22)",
          animation: "scanline 3.5s linear infinite", zIndex: 1, pointerEvents: "none",
        }} />

        {/* CRT vignette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }} />

        {/* Tap to enable audio overlay */}
        {showTap && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}>
            <div style={{
              textAlign: "center", color: "#ff3c3c", fontFamily: "monospace",
              animation: "blink 1s step-end infinite",
              fontSize: "clamp(16px,4vw,22px)", letterSpacing: "3px",
            }}>
              TAP ANYWHERE TO CONTINUE
            </div>
          </div>
        )}

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "12px 14px" }}>

          {/* Warning header */}
          <div style={{
            textAlign: "center", padding: "12px 8px",
            borderBottom: "2px solid #ff3c3c",
            animation: "hackTitle 1.4s ease-in-out infinite",
          }}>
            <div style={{ fontSize: "clamp(9px,2.2vw,13px)", letterSpacing: "4px", opacity: 0.65, marginBottom: 4 }}>
              ⚠ CRITICAL SECURITY BREACH DETECTED ⚠
            </div>
            <div style={{
              fontSize: "clamp(16px,4.5vw,38px)", fontWeight: 900,
              letterSpacing: "2px", lineHeight: 1.2,
              textShadow: "0 0 20px #ff3c3c, 0 0 40px #ff0000",
            }}>
              YOUR SYSTEM HAS BEEN<br />
              COMPROMISED BY {name.toUpperCase()}
            </div>
            <div style={{ fontSize: "clamp(8px,1.7vw,11px)", opacity: 0.6, marginTop: 5, letterSpacing: "2px" }}>
              ALL FILES · VIDEOS · PHOTOS · CONTACTS ARE BEING STOLEN
            </div>
          </div>

          {/* Terminal */}
          <div ref={termRef} style={{
            flex: 1, overflowY: "auto", padding: "10px 2px",
            fontSize: "clamp(9px,2vw,12px)", lineHeight: 1.65,
          }}>
            {lines.map((l, i) => (
              <div key={i} style={{ opacity: i === lines.length - 1 ? 1 : 0.68 }}>
                {l}
                {i === lines.length - 1 && <span className="blink-cursor" style={{ marginLeft: 2 }}>█</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          fontSize: 10, opacity: 0.25, letterSpacing: "2px", zIndex: 3, pointerEvents: "none",
          color: "#ff3c3c", fontFamily: "monospace",
        }}>
          Pocket Tools Kit
        </div>
      </div>
    </>
  );
}

// ─── Simulator View ───────────────────────────────────────────────────────────
function SimulatorView() {
  const [theme, setTheme] = useState<Theme>("green");
  const [lines, setLines] = useState<string[]>(["> System initialized. Ready to hack...", "> Tap / click anywhere to stream code."]);
  const [modal, setModal] = useState<"granted" | "denied" | null>(null);
  const [modalFading, setModalFading] = useState(false);
  const [autoHack, setAutoHack] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hackerName, setHackerName] = useState("");
  const [prank, setPrank] = useState("");
  const [copied, setCopied] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const lineIdx = useRef(0);
  const termRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAddRef = useRef(0);

  const t = THEMES[theme];
  const ensureAudio = () => {
    if (!audioRef.current) audioRef.current = createAudioCtx();
    return audioRef.current;
  };

  const addLine = useCallback((burst = false) => {
    const now = Date.now();
    if (!burst && now - lastAddRef.current < 120) return;
    lastAddRef.current = now;
    const l = HACK_LINES[lineIdx.current % HACK_LINES.length];
    lineIdx.current++;
    setLines(prev => [...prev.slice(-60), formatLine(l)]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 10);
    if (!muted) {
      try { playBeep(ensureAudio(), 200 + Math.random() * 400, 0.03, 0.04); } catch {}
    }
  }, [muted]);

  useEffect(() => {
    if (autoHack) {
      autoRef.current = setInterval(() => addLine(true), 280);
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoHack, addLine]);

  useEffect(() => {
    if (!modal) return;
    const t1 = setTimeout(() => setModalFading(true), 2500);
    const t2 = setTimeout(() => { setModal(null); setModalFading(false); }, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [modal]);

  const triggerModal = (type: "granted" | "denied") => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 600);
    setModal(type);
    setModalFading(false);
    if (!muted) {
      try {
        const ctx = ensureAudio();
        if (type === "granted") playGranted(ctx); else playAlarmSynth(ctx);
      } catch {}
    }
    const msg = type === "granted"
      ? "> ✓ ACCESS GRANTED — Welcome to the system."
      : "> ✗ ACCESS DENIED — Lockout triggered.";
    setLines(prev => [...prev.slice(-60), msg]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 10);
  };

  const generatePrank = () => {
    const name = hackerName.trim() || "ANONYMOUS";
    // Innocent-looking URL — no "hacker/hacked/prank" words
    const base = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "") + "/tools/view";
    setPrank(`${base}?n=${encodeURIComponent(name)}&s=1`);
  };

  const copyPrank = () => {
    if (!prank) return;
    navigator.clipboard.writeText(prank);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) { containerRef.current?.requestFullscreen?.(); }
    else { document.exitFullscreen?.(); }
    setFullscreen(f => !f);
  };

  return (
    <ToolLayout
      toolId="hacker"
      instructions={
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Click / Tap</strong> the terminal to stream hacker code instantly.</li>
          <li>Toggle <strong>Auto Hack</strong> for hands-free streaming.</li>
          <li>Enter a name → Generate Prank Link → send to a friend 😈</li>
          <li>The prank link looks innocent — no "hacker" words visible to victim!</li>
        </ul>
      }
    >
      <style>{STYLES}</style>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(["green", "cyan", "red"] as Theme[]).map((th) => (
          <button key={th} onClick={() => setTheme(th)}
            title={th === "green" ? "Matrix Green" : th === "cyan" ? "Cyber Cyan" : "Danger Red"}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              background: THEMES[th].primary,
              border: theme === th ? "3px solid white" : "3px solid transparent",
              cursor: "pointer", transition: "border 0.2s",
              boxShadow: theme === th ? `0 0 10px ${THEMES[th].primary}` : "none",
            }}
          />
        ))}
        <Button size="sm" variant="outline" onClick={() => setMuted(m => !m)} className="gap-1 h-7 text-xs">
          {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          {muted ? "Unmute" : "Mute"}
        </Button>
        <Button size="sm" variant="outline" onClick={toggleFullscreen} className="gap-1 h-7 text-xs">
          {fullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
          Fullscreen
        </Button>
        <Button size="sm" onClick={() => { setAutoHack(a => !a); ensureAudio(); }}
          className="gap-1 h-7 text-xs"
          style={{ background: autoHack ? "#ef4444" : undefined }}>
          {autoHack ? <ZapOff className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {autoHack ? "Stop Auto" : "Auto Hack"}
        </Button>
      </div>

      {/* Terminal */}
      <div ref={containerRef} className={glitching ? "hacker-glitch2" : ""}
        onClick={() => { addLine(); ensureAudio(); }}
        onTouchStart={() => { addLine(); ensureAudio(); }}
        style={{
          position: "relative", borderRadius: 12, overflow: "hidden",
          background: t.bg, border: `1.5px solid ${t.primary}`,
          boxShadow: `0 0 18px ${t.primary}44, inset 0 0 30px ${t.dim}`,
          cursor: "crosshair", userSelect: "none",
          height: 360, transition: "box-shadow 0.3s",
        }}>
        <MatrixCanvas theme={theme} active={!autoHack} />
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: `${t.primary}20`,
          animation: "scanline 5s linear infinite", zIndex: 1, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }} />
        {/* Title bar */}
        <div style={{
          position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderBottom: `1px solid ${t.primary}44`, background: `${t.dim}99`,
        }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i)=>(
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ color: t.primary, fontSize: 11, letterSpacing: "2px", marginLeft: 8 }}>
            HACKER TERMINAL v4.2 ● ONLINE
          </span>
        </div>
        {/* Output */}
        <div ref={termRef} style={{
          position: "relative", zIndex: 2,
          height: "calc(100% - 38px)", overflowY: "auto",
          padding: "10px 14px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.7,
          color: t.primary,
        }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              opacity: i === lines.length - 1 ? 1 : 0.72,
              textShadow: i === lines.length - 1 ? t.glow : "none",
            }}>
              {line}
              {i === lines.length - 1 && (
                <span className="blink-cursor" style={{ color: t.primary, marginLeft: 2 }}>█</span>
              )}
            </div>
          ))}
        </div>
        <div style={{
          position: "absolute", bottom: 10, right: 14, zIndex: 2,
          fontSize: 10, color: t.primary, opacity: 0.3, letterSpacing: "1px", pointerEvents: "none",
        }}>TAP TO TYPE</div>

        {/* Modal */}
        {modal && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: modal === "granted" ? "rgba(0,30,0,0.85)" : "rgba(30,0,0,0.85)",
            animation: modalFading ? "fadeOut 0.5s ease forwards" : "fadeInScale 0.3s ease",
          }}>
            <div style={{
              textAlign: "center", padding: "32px 40px",
              border: `2px solid ${modal === "granted" ? "#00ff41" : "#ff3c3c"}`,
              borderRadius: 16, fontFamily: "monospace",
              animation: modal === "granted" ? "pulseGreen 1.5s ease infinite" : "pulseRed 0.8s ease infinite",
            }}>
              <div style={{ fontSize: 56, lineHeight: 1,
                filter: `drop-shadow(0 0 12px ${modal === "granted" ? "#00ff41" : "#ff3c3c"})` }}>
                {modal === "granted" ? "✓" : "✗"}
              </div>
              <div style={{
                fontSize: 24, fontWeight: 900, letterSpacing: "3px", marginTop: 8,
                color: modal === "granted" ? "#00ff41" : "#ff3c3c",
                textShadow: modal === "granted" ? "0 0 20px #00ff41" : "0 0 20px #ff3c3c",
              }}>
                {modal === "granted" ? "ACCESS GRANTED" : "ACCESS DENIED"}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6, letterSpacing: "2px" }}>
                {modal === "granted" ? "AUTHENTICATION SUCCESSFUL" : "LOCKOUT TRIGGERED · ALERT SENT"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Access buttons */}
      <div className="flex gap-3 mt-3">
        <button onClick={(e) => { e.stopPropagation(); triggerModal("granted"); }}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #00ff41",
            background: "#001a00", color: "#00ff41", fontFamily: "monospace",
            fontSize: 13, fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
          }}
          onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 16px #00ff41")}
          onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>
          ✓ ACCESS GRANTED
        </button>
        <button onClick={(e) => { e.stopPropagation(); triggerModal("denied"); }}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #ff3c3c",
            background: "#1a0000", color: "#ff3c3c", fontFamily: "monospace",
            fontSize: 13, fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
          }}
          onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 16px #ff3c3c")}
          onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>
          ✗ ACCESS DENIED
        </button>
      </div>

      {/* Prank link generator */}
      <div className="mt-5 rounded-xl border p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4" /> Generate Prank Link
        </p>
        <p className="text-xs text-muted-foreground">
          The generated link looks completely normal — no suspicious words. When your friend opens it, they get the full experience: typing sounds, alarm, and a voice message! 😈
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter your name (e.g. Shadow404)"
            value={hackerName}
            onChange={(e) => setHackerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generatePrank()}
            className="font-mono"
          />
          <Button onClick={generatePrank} className="shrink-0">Generate</Button>
        </div>
        {prank && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input readOnly value={prank}
                className="flex-1 font-mono text-xs border rounded-lg px-3 py-2 bg-muted truncate" />
              <Button size="sm" variant="outline" onClick={copyPrank} className="gap-1 shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              🎭 Send via WhatsApp or Telegram. Victim gets: keyboard typing sounds (5s) → alarm → voice saying "Hacked by {hackerName || "you"}!"
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
