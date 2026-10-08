// ProjectTimer.jsx - Premium SaaS-Grade Overdue Alert & Project Countdown Popover
import React, { useState, useEffect, useRef } from "react";
import { getWorkAssignments, muteProjectAlarm } from "../../config/api";
import { Clock, AlertTriangle, Volume2, VolumeX, BellRing, Timer, HelpCircle, Loader2 } from "lucide-react";

const ProjectTimer = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Grant mute access to both ADMIN and EDITOR
  const hasMuteAccess = user.role === "ADMIN" || user.role === "EDITOR";

  const [activeProjects, setActiveProjects] = useState([]);
  
  // Dynamic initialization checking if 24 hours mute timer has expired
  const [isMuted, setIsMuted] = useState(() => {
    const muted = localStorage.getItem("timerMuted") === "true";
    const muteTimestamp = localStorage.getItem("muteTimestamp");
    if (muted && muteTimestamp) {
      const timePassed = Date.now() - parseInt(muteTimestamp);
      if (timePassed >= 24 * 60 * 60 * 1000) {
        localStorage.setItem("timerMuted", "false");
        localStorage.removeItem("muteTimestamp");
        return false;
      }
      return true;
    }
    return muted;
  });
  
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false); // Closed by default in the topbar
  const [loading, setLoading] = useState(false);

  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  // Poll server for projects list
  const fetchProjects = async () => {
    try {
      const res = await getWorkAssignments();
      if (res.data && res.data.projects) {
        // Filter: only active projects in IN_PROGRESS status
        const inProgress = res.data.projects.filter(
          (p) => p.status === "IN_PROGRESS" && p.duration?.expectedCompletionDate
        );
        setActiveProjects(inProgress);
      }
    } catch (error) {
      console.error("Timer error fetching assignments:", error);
    }
  };

  const handleMuteProject = async (workId, type) => {
    try {
      const response = await muteProjectAlarm({ workId, type });
      fetchProjects();
    } catch (error) {
      console.error("Failed to mute project alarm:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    const pollInterval = setInterval(fetchProjects, 10000); // Poll every 10 seconds
    return () => clearInterval(pollInterval);
  }, []);

  // Countdown timer tick every 1 second
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => {
      setNow(new Date());

      // Auto-unmute after 24 hours
      const muted = localStorage.getItem("timerMuted") === "true";
      const muteTimestamp = localStorage.getItem("muteTimestamp");
      if (muted && muteTimestamp) {
        const timePassed = Date.now() - parseInt(muteTimestamp);
        if (timePassed >= 24 * 60 * 60 * 1000) {
          localStorage.setItem("timerMuted", "false");
          localStorage.removeItem("muteTimestamp");
          setIsMuted(false);
        }
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

  // Determine if any task is overdue and not muted for this user's role
  const overdueTasks = activeProjects.filter((p) => {
    const deadline = new Date(p.duration.expectedCompletionDate);
    const isMutedForRole = user.role === "ADMIN" ? p.adminAlarmMuted : p.editorAlarmMuted;
    return deadline < now && !isMutedForRole;
  });

  // Determine if any task is near deadline (within 2 days) but not overdue and not muted for this user's role
  const nearDeadlineTasks = activeProjects.filter((p) => {
    const deadline = new Date(p.duration.expectedCompletionDate);
    const timeLeft = deadline - now;
    const isMutedForRole = user.role === "ADMIN" ? p.adminAlarmMuted : p.editorAlarmMuted;
    return timeLeft >= 0 && timeLeft <= TWO_DAYS_MS && !isMutedForRole;
  });

  const hasOverdue = overdueTasks.length > 0;
  const hasNearDeadline = nearDeadlineTasks.length > 0;
  const hasAlarm = hasOverdue || hasNearDeadline;

  // Web Audio Context alarm builder
  const startAlarmSound = () => {
    if (alarmIntervalRef.current) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    
    alarmIntervalRef.current = setInterval(() => {
      if (isMuted) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch((err) => console.log("AudioContext resume failed:", err));
        return;
      }

      // Dual-tone high frequency warning beep
      try {
        const playBeep = (freq, startTime, duration) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const t = ctx.currentTime;
        playBeep(880, t, 0.25);
        playBeep(880, t + 0.3, 0.25);
      } catch (err) {
        console.error("Audio beep generation failed:", err);
      }
    }, 1200);
  };

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  // Alarm sound triggers (ADMIN and EDITOR both silence via isMuted)
  useEffect(() => {
    const playAlarm = hasAlarm && hasMuteAccess && !isMuted;
    if (playAlarm) {
      startAlarmSound();
    } else {
      stopAlarmSound();
    }
    return () => stopAlarmSound();
  }, [hasAlarm, isMuted, hasMuteAccess]);

  // Expose toggle mute button with 24 hours expiry time marking
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem("timerMuted", nextMuted ? "true" : "false");
    if (nextMuted) {
      localStorage.setItem("muteTimestamp", Date.now().toString());
      toast.info("Overdue alarm sound muted for 24 hours.");
    } else {
      localStorage.removeItem("muteTimestamp");
      toast.info("Overdue alarm sound unmuted.");
    }
  };

  // Enable audio context via user interaction
  const enableAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().then(() => {
        setAudioEnabled(true);
      });
    } else {
      setAudioEnabled(true);
    }
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().then(() => {
          setAudioEnabled(true);
        }).catch((err) => console.log("Failed to resume AudioContext:", err));
      }
    };
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("mousedown", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("mousedown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    const checkState = setInterval(() => {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        setAudioEnabled(true);
        clearInterval(checkState);
      }
    }, 1000);
    return () => clearInterval(checkState);
  }, []);

  // Format remaining time
  const formatTimeDiff = (targetDate) => {
    const diff = new Date(targetDate) - now;
    const isLate = diff < 0;
    const isWarning = !isLate && diff <= TWO_DAYS_MS;
    const absDiff = Math.abs(diff);

    const hrs = Math.floor(absDiff / (1000 * 60 * 60));
    const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((absDiff % (1000 * 60)) / 1000);

    const timeStr = `${hrs}h ${mins}m ${secs}s`;
    
    let text = `${timeStr} left`;
    if (isLate) {
      text = `${timeStr} OVERDUE`;
    } else if (isWarning) {
      text = `${timeStr} left (Urgent)`;
    }

    return { isLate, isWarning, text, raw: timeStr };
  };

  // Hide component for standard users (clients)
  if (!hasMuteAccess) return null;

  return (
    <div className="relative">
      
      {/* Topbar Alarm/Timer Trigger Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        title="Project Overdue Alarms"
        className={`p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 transition flex items-center justify-center relative ${
          hasAlarm ? "ring-2 ring-rose-500/20" : ""
        }`}
      >
        <Clock size={16} className={hasOverdue ? "text-rose-500 animate-pulse" : hasNearDeadline ? "text-amber-500 animate-pulse" : ""} />
        
        {/* Count notification bubble badge */}
        {activeProjects.length > 0 && (
          <span className={`absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full text-[8px] font-black flex items-center justify-center text-white border-2 border-white dark:border-[#121214] ${
            hasOverdue ? "bg-rose-500 animate-bounce" : hasNearDeadline ? "bg-amber-500" : "bg-emerald-500"
          }`}>
            {activeProjects.length}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {expanded && (
        <div className="absolute right-0 mt-3.5 w-80 sm:w-96 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl rounded-2xl p-5 z-[9999] text-zinc-800 dark:text-zinc-100 transition-all duration-200">
          
          {/* Header Bar inside dropdown */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3.5 mb-3.5">
            <div className="flex items-center gap-2">
              {hasOverdue ? (
                <BellRing className="w-4 h-4 text-rose-500 animate-bounce" />
              ) : (
                <Timer className="w-4 h-4 text-[#5A7863] dark:text-[#A7D18C]" />
              )}
              <span className="font-extrabold text-xs tracking-tight">
                {hasOverdue 
                  ? "Overdue Projects Alert" 
                  : hasNearDeadline 
                  ? "Near Deadline Warning" 
                  : "Active Countdowns"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Web Audio Context enabler */}
              {!audioEnabled && hasAlarm && (
                <button 
                  onClick={enableAudio}
                  className="px-2 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-bold animate-pulse hover:bg-amber-600 transition"
                >
                  Enable Sound
                </button>
              )}

              {/* Volume mute button for admin/editor with 24 hours status tooltip */}
              <button
                onClick={toggleMute}
                title={isMuted ? "Alarm muted (Auto-unmutes after 24 hrs)" : "Mute alarm sound for 24 hrs"}
                className={`p-1.5 rounded-lg border transition ${
                  isMuted 
                    ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40" 
                    : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100"
                }`}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
            </div>
          </div>

          {/* Body List of all projects */}
          {activeProjects.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              No active folder assignments running.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {activeProjects.map((proj) => {
                const timing = formatTimeDiff(proj.duration.expectedCompletionDate);

                return (
                  <div 
                    key={proj._id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      timing.isLate 
                        ? "bg-rose-50/40 dark:bg-rose-950/5 border-rose-100 dark:border-rose-950/20" 
                        : timing.isWarning
                        ? "bg-amber-50/40 dark:bg-amber-950/5 border-amber-100 dark:border-amber-950/20"
                        : "bg-zinc-50/30 dark:bg-zinc-900/20 border-zinc-100 dark:border-zinc-850"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="font-extrabold text-[12px] text-zinc-800 dark:text-zinc-100 block">
                          {proj.category} Delivery
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-1 font-medium">
                          Client: <span className="text-zinc-600 dark:text-zinc-300">{proj.client?.name}</span> | Editor: <span className="text-zinc-600 dark:text-zinc-300">{proj.editor?.name}</span>
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {timing.isLate ? (
                          <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/20">
                            Overdue
                          </span>
                        ) : timing.isWarning ? (
                          <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            Urgent
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-[#5A7863] dark:text-[#A7D18C] bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                            In Progress
                          </span>
                        )}

                        {/* Project sub-mute buttons */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-semibold">Mute:</span>
                          <button
                            onClick={() => handleMuteProject(proj._id, user.role)}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border transition ${
                              (user.role === "ADMIN" ? proj.adminAlarmMuted : proj.editorAlarmMuted)
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" 
                                : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
                            }`}
                          >
                            {(user.role === "ADMIN" ? proj.adminAlarmMuted : proj.editorAlarmMuted) ? "Unmute" : "Mute"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-medium">
                        Deadline: {new Date(proj.duration.expectedCompletionDate).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        timing.isLate 
                          ? "text-rose-500 animate-pulse" 
                          : timing.isWarning
                          ? "text-amber-500 animate-pulse"
                          : "text-zinc-600 dark:text-zinc-300"
                      }`}>
                        {timing.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectTimer;
