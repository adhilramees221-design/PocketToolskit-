import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function SpeedTester() {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [result, setResult] = useState<{ download: number; ping: number } | null>(null);

  const startTest = () => {
    setTesting(true);
    setProgress(0);
    setSpeed(0);
    setResult(null);

    // Simulated speed test (since we are client side only)
    const targetSpeed = Math.floor(Math.random() * 70) + 15; // 15 to 85 Mbps
    const ping = Math.floor(Math.random() * 30) + 10;
    
    const duration = 3000;
    const interval = 50;
    let timePassed = 0;

    const timer = setInterval(() => {
      timePassed += interval;
      const progressPercent = (timePassed / duration) * 100;
      
      if (progressPercent >= 100) {
        clearInterval(timer);
        setTesting(false);
        setProgress(100);
        setSpeed(targetSpeed);
        setResult({ download: targetSpeed, ping });
      } else {
        setProgress(progressPercent);
        // Fluctuate speed while testing
        const fluctuation = Math.random() * 20 - 10; 
        const currentEstimatedSpeed = Math.max(0, targetSpeed * (progressPercent/100) + fluctuation);
        setSpeed(currentEstimatedSpeed);
      }
    }, interval);
  };

  const getRotation = (value: number) => {
    // 0 Mbps = -135deg, 100 Mbps = 135deg
    const maxVal = 100;
    const clamped = Math.min(Math.max(value, 0), maxVal);
    return -135 + (clamped / maxVal) * 270;
  };

  return (
    <ToolLayout toolId="speed-tst" 
      instructions={
        <ul className="list-disc pl-5">
          <li>Click 'Start Test' to begin.</li>
          <li>This is a simulated aesthetic speed test since a real accurate one requires a dedicated backend server.</li>
          <li>Watch the gauge update in real-time.</li>
        </ul>
      }
    >
      <div className="flex flex-col items-center py-10">
        
        <div className="relative w-72 h-72 mb-12">
          {/* Gauge Background */}
          <div className="absolute inset-0 rounded-full border-[16px] border-muted" />
          
          {/* Active Gauge Arc (CSS clip trick) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="144"
              cy="144"
              r="128"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="16"
              className="text-primary transition-all duration-100 ease-linear"
              strokeDasharray={128 * 2 * Math.PI}
              strokeDashoffset={
                128 * 2 * Math.PI - ((128 * 2 * Math.PI) * (progress / 100) * 0.75) // 0.75 because gauge is 270 deg (3/4 of circle)
              }
              strokeLinecap="round"
              style={{ transformOrigin: 'center', transform: 'rotate(45deg)' }}
            />
          </svg>

          {/* Needle */}
          <div 
            className="absolute top-1/2 left-1/2 w-2 h-32 bg-primary origin-bottom -translate-x-1/2 -translate-y-full rounded-t-full transition-transform duration-75 ease-out shadow-md"
            style={{ transform: `translateX(-50%) translateY(-100%) rotate(${getRotation(speed)}deg)` }}
          />
          <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-foreground rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-10" />

          {/* Center Text */}
          <div className="absolute top-2/3 left-1/2 -translate-x-1/2 text-center w-full mt-4">
            <div className="text-5xl font-bold font-mono tracking-tighter">
              {speed.toFixed(1)}
            </div>
            <div className="text-muted-foreground font-medium text-sm mt-1 uppercase tracking-widest">
              Mbps
            </div>
          </div>
        </div>

        {result && !testing && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-8 mb-12 bg-muted/50 p-6 rounded-2xl border w-full max-w-sm justify-around"
          >
            <div className="text-center">
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-medium">Download</div>
              <div className="text-2xl font-bold flex items-baseline gap-1 justify-center">
                {result.download} <span className="text-sm font-normal text-muted-foreground">Mbps</span>
              </div>
            </div>
            <div className="w-px bg-border"></div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-medium">Ping</div>
              <div className="text-2xl font-bold flex items-baseline gap-1 justify-center">
                {result.ping} <span className="text-sm font-normal text-muted-foreground">ms</span>
              </div>
            </div>
          </motion.div>
        )}

        <Button 
          size="lg" 
          onClick={startTest} 
          disabled={testing}
          className="w-48 h-14 rounded-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
        >
          {testing ? (
            <><Activity className="h-5 w-5 animate-pulse" /> Testing...</>
          ) : result ? (
            <><RotateCcw className="h-5 w-5" /> Test Again</>
          ) : (
            <><Play className="h-5 w-5 fill-current" /> Go</>
          )}
        </Button>
      </div>
    </ToolLayout>
  );
}
