import React, { useState, useEffect, useRef } from "react";
import { getWorkAssignments, muteProjectAlarm } from "../../config/api";
import { Clock, AlertTriangle, Volume2, VolumeX, BellRing, Timer, CheckCircle } from "lucide-react";

const ProjectTimer = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "ADMIN";

  const [projects, setProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("timerMuted") === "true";
  });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const audioCtxRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("timerMuted", isMuted);
  }, [isMuted]);

  // Poll server for projects list
  const fetchProjects = async () => {
    try {
      const res = await getWorkAssignments();
      if (res.data && res.data.projects) {
        // Filter: only active projects in IN_PROGRESS status
        const inProgress = res.data.projects.filter(
          (p) => p.status === "IN_PROGRESS" && p.duration?.expectedCompletionDate
        );
        console.log("PROJECTS POLLED FROM CLIENT:", inProgress);
        setActiveProjects(inProgress);
      }
    } catch (error) {
      console.error("Timer error fetching assignments:", error);
    }
  };

  const handleMuteProject = async (workId, type) => {
    console.log("MUTING ALARM ON CLIENT FOR:", { workId, type });
    try {
      const response = await muteProjectAlarm({ workId, type });
      console.log("MUTED ALARM CLIENT RESPONSE:", response.data);
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
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

  // Determine if any task is overdue and not muted for this user's role
  const overdueTasks = activeProjects.filter((p) => {
    const deadline = new Date(p.duration.expectedCompletionDate);
    const isMutedForRole = isAdmin ? p.adminAlarmMuted : p.editorAlarmMuted;
    return deadline < now && !isMutedForRole;
  });

  // Determine if any task is near deadline (within 2 days) but not overdue and not muted for this user's role
  const nearDeadlineTasks = activeProjects.filter((p) => {
    const deadline = new Date(p.duration.expectedCompletionDate);
    const timeLeft = deadline - now;
    const isMutedForRole = isAdmin ? p.adminAlarmMuted : p.editorAlarmMuted;
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
      const muted = isAdmin ? isMuted : false;
      if (muted) return;
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
        // Beep 1
        playBeep(880, t, 0.25);
        // Beep 2
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

  // Alarm sound triggers based on status (starts sounding 2 days in advance, only Admin can mute it)
  useEffect(() => {
    const playAlarm = hasAlarm && (!isAdmin || !isMuted);
    if (playAlarm) {
      startAlarmSound();
    } else {
      stopAlarmSound();
    }
    return () => stopAlarmSound();
  }, [hasAlarm, isMuted, isAdmin]);

  // Attempt to enable Web Audio Context via user interaction
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
    // Automatically flag if context is running
    const checkState = setInterval(() => {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        setAudioEnabled(true);
        clearInterval(checkState);
      }
    }, 1000);
    return () => clearInterval(checkState);
  }, []);

  // Format time remaining/overdue/warning
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

    return {
      isLate,
      isWarning,
      text,
      raw: timeStr,
    };
  };

  if (activeProjects.length === 0) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 max-w-sm w-80 sm:w-96 text-slate-800 ${
        expanded ? "scale-100" : "scale-90 opacity-90"
      }`}
    >
      {/* Container */}
      <div 
        className={`backdrop-blur-md bg-white/80 border shadow-2xl rounded-3xl p-5 overflow-hidden transition-all duration-355 ${
          hasOverdue 
            ? "border-rose-300 bg-rose-50/90 shadow-rose-100" 
            : hasNearDeadline
            ? "border-amber-300 bg-amber-50/90 shadow-amber-100"
            : "border-slate-200/60"
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            {hasOverdue ? (
              <div className="relative">
                <BellRing className="w-5 h-5 text-rose-600 animate-bounce" />
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
              </div>
            ) : hasNearDeadline ? (
              <div className="relative">
                <BellRing className="w-5 h-5 text-amber-650 animate-bounce" />
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-amber-650 rounded-full animate-ping" />
              </div>
            ) : (
              <Timer className="w-5 h-5 text-[#5A7863]" />
            )}
            <span className="font-extrabold text-sm text-slate-800">
              {hasOverdue 
                ? "🚨 Overdue Projects Alert!" 
                : hasNearDeadline 
                ? "⚠️ Near Deadline Alert!" 
                : "⏱️ Project Countdowns"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Autoplay Enabler if browser blocks it (Admin Only) */}
            {!audioEnabled && hasAlarm && isAdmin && (
              <button 
                onClick={enableAudio}
                className="px-2 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold animate-pulse hover:bg-amber-600 transition cursor-pointer"
              >
                Enable Sound
              </button>
            )}

            {/* Mute button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                className={`p-1.5 rounded-lg border transition ${
                  isMuted 
                    ? "bg-rose-100 text-rose-700 border-rose-200" 
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}

            {/* Minimize toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5"
            >
              {expanded ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Content list */}
        {expanded && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {activeProjects.map((proj) => {
              const timing = formatTimeDiff(proj.duration.expectedCompletionDate);

              return (
                <div 
                  key={proj._id}
                  className={`p-3 rounded-2xl border text-xs transition-colors ${
                    timing.isLate 
                      ? "bg-rose-100/50 border-rose-200/60 shadow-sm" 
                      : timing.isWarning
                      ? "bg-amber-100/50 border-amber-200/60 shadow-sm"
                      : "bg-white/60 border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-extrabold text-slate-900 block text-[13px]">
                        {proj.category} Subfolder
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Client: <b className="text-slate-600">{proj.client?.name}</b> | Editor: <b className="text-slate-600">{proj.editor?.name}</b>
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {timing.isLate ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-rose-700 tracking-wider bg-rose-200 px-2 py-0.5 rounded-lg animate-pulse">
                          <AlertTriangle size={10} /> Overdue
                        </span>
                      ) : timing.isWarning ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-amber-700 tracking-wider bg-amber-200 px-2 py-0.5 rounded-lg animate-pulse">
                          <AlertTriangle size={10} /> Urgent
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#5A7863] bg-emerald-50 px-2 py-0.5 rounded-lg">
                          In Progress
                        </span>
                      )}
                      {isAdmin ? (
                        <div className="flex flex-col gap-1 mt-1 text-right items-end">
                          {/* Admin Alarm Control */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-400 font-semibold">Admin:</span>
                            <button
                              onClick={() => handleMuteProject(proj._id, "ADMIN")}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border transition cursor-pointer ${
                                proj.adminAlarmMuted 
                                  ? "text-emerald-750 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" 
                                  : "text-rose-750 bg-rose-50 hover:bg-rose-100 border-rose-200"
                              }`}
                            >
                              {proj.adminAlarmMuted ? "Unmute" : "Mute"}
                            </button>
                          </div>
                          {/* Editor Alarm Control */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-400 font-semibold">Editor:</span>
                            <button
                              onClick={() => handleMuteProject(proj._id, "EDITOR")}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border transition cursor-pointer ${
                                proj.editorAlarmMuted 
                                  ? "text-emerald-750 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" 
                                  : "text-rose-750 bg-rose-50 hover:bg-rose-100 border-rose-200"
                              }`}
                            >
                              {proj.editorAlarmMuted ? "Unmute" : "Mute"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        proj.editorAlarmMuted && (
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-0.5 mt-1">
                            <VolumeX size={10} /> Silenced by Admin
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/30">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Clock size={11} /> Deadline: {new Date(proj.duration.expectedCompletionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`font-black ${
                      timing.isLate 
                        ? "text-rose-700 animate-pulse text-[11px]" 
                        : timing.isWarning
                        ? "text-amber-700 animate-pulse text-[11px]"
                        : "text-slate-700 font-mono text-[11px]"
                    }`}>
                      {timing.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Minimal display when collapsed */}
        {!expanded && (
          <div className="text-center pt-1">
            <span className={`text-[11px] font-black ${
              hasOverdue 
                ? "text-rose-700 animate-pulse" 
                : hasNearDeadline
                ? "text-amber-700 animate-pulse"
                : "text-[#5A7863]"
            }`}>
              {hasOverdue 
                ? `🚨 ${overdueTasks.length} task(s) are overdue!` 
                : hasNearDeadline
                ? `⚠️ ${nearDeadlineTasks.length} task(s) near deadline!`
                : `⏱️ ${activeProjects.length} task(s) running`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTimer;
