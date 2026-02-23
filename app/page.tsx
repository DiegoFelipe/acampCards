"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const cards = [
  { id: 1, name: "Mentira", image: "/imgs/mentira3.jpg", life: 200 },
  { id: 2, name: "Imoralidade", image: "/imgs/imoralidade3.jpg", life: 300 },
  { id: 3, name: "Inveja", image: "/imgs/inveja3.jpg", life: 150 },
  { id: 4, name: "Gula", image: "/imgs/gula2.jpg", life: 50 },
  { id: 5, name: "Ira", image: "/imgs/ira2.jpg", life: 250 },
  { id: 6, name: "Idolatria", image: "/imgs/idolatria2.jpg", life: 500 },
  { id: 7, name: "Fofoca", image: "/imgs/fofoca2.jpg", life: 450 },
  { id: 8, name: "Preguiça", image: "/imgs/preguica.jpg", life: 450 },
  { id: 9, name: "Divisão na igreja", image: "/imgs/divisao2.jpg", life: 300 },
];

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [attackedCards, setAttackedCards] = useState<Map<number, number>>(new Map());
  const [destroyCardId, setDestroyCardId] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);

  // Rewards & Questions State
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pendingRewards, setPendingRewards] = useState<{ weapons: number, magnifying: number, teamId: number } | null>(null);
  const [questionFeedback, setQuestionFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [questionTimer, setQuestionTimer] = useState<number>(30);
  const [stage, setStage] = useState<number | null>(0);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(0);
  const [selectedSin, setSelectedSin] = useState<number | null>(0);
  const [selectedWeaponCode, setSelectedWeaponCode] = useState<number | null>(0);
  const [lupaCountdown, setLupaCountdown] = useState<number | null>(null);
  const [lupaLife, setLupaLife] = useState<number | null>(null);
  const [lupaIsFreeze, setLupaIsFreeze] = useState<boolean>(false);
  const [lupaIsPoison, setLupaIsPoison] = useState<boolean>(false);
  const [highlightedCard, setHighlightedCard] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scrambledMessage, setScrambledMessage] = useState<string | null>(null);
  const lupaIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ref
  const input1Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input1Ref.current?.focus();
  }, [stage]);

  // Keep input focused — refocus on any click unless an animation is active
  useEffect(() => {
    const refocus = () => {
      if (!lupaCountdown && !destroyCardId && !selectedCard) {
        setTimeout(() => input1Ref.current?.focus(), 50);
      }
    };
    document.addEventListener("click", refocus);
    return () => document.removeEventListener("click", refocus);
  }, [lupaCountdown, destroyCardId, selectedCard]);

  // Random highlight effect on cards
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedCard && !destroyCardId && !lupaCountdown) {
        const randomId = cards[Math.floor(Math.random() * cards.length)].id;
        setHighlightedCard(randomId);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedCard, destroyCardId, lupaCountdown]);

  // Question Timer
  useEffect(() => {
    if (stage === 4 && pendingQuestions.length > 0 && !questionFeedback) {
      const timer = setInterval(() => {
        setQuestionTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer(0); // 0 means time out / wrong answer
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, pendingQuestions, questionFeedback, currentQuestionIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    const inputLen = valStr.length;

    if (stage === 0 && inputLen === 1) {
      const val = parseInt(valStr);
      if (val < 1 || val > 4 || isNaN(val)) {
        setToastMessage("⚠️ EQUIPE INVÁLIDA (1-4)");
        setTimeout(() => setToastMessage(null), 3000);
        e.target.value = "";
        return;
      }
      setStage(1);
      setSelectedTeam(val);
      e.target.value = "";
    } else if (stage === 1 && inputLen === 1) {
      const val = parseInt(valStr);
      if (val < 1 || val > 9 || isNaN(val)) {
        setToastMessage("⚠️ PECADO INVÁLIDO (1-9)");
        setTimeout(() => setToastMessage(null), 3000);
        e.target.value = "";
        return;
      }
      setStage(2);
      setSelectedSin(val);
      e.target.value = "";
    } else if (stage === 2 && inputLen === 7) {
      setStage(3);
      setSelectedWeaponCode(parseInt(valStr));
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Fallback for Enter if they type too fast or paste differently
    const target = e.target as HTMLInputElement;
    const inputLen = target.value.length;
    if (e.key === "Enter" && stage === 0 && inputLen === 1) {
      handleChange(e as any);
    }
    if (e.key === "Enter" && stage === 1 && inputLen === 1) {
      handleChange(e as any);
    }
    if (e.key === "Enter" && stage === 2 && inputLen === 7) {
      handleChange(e as any);
    }

    // Question Stage (stage 4) Keyboard Input
    if (stage === 4 && !questionFeedback) {
      const key = e.key;
      // if it's a number 1-5, answer
      if (["1", "2", "3", "4", "5"].includes(key)) {
        handleAnswer(parseInt(key));
        target.value = "";
      } else if (key !== "Enter") {
        setToastMessage("⚠️ RESPOSTA INVÁLIDA (1-5)");
        setTimeout(() => setToastMessage(null), 3000);
        target.value = "";
      }
    }
  };

  useEffect(() => {
    const music = new Audio("/sounds/music.mp3");
    music.loop = true;

    const startMusic = () => {
      music.play().catch((e) => {
        console.warn("Autoplay bloqueado até interação do usuário.");
      });

      // Remove o listener após tocar
      document.removeEventListener("click", startMusic);
    };

    // Aguarda o primeiro clique na página
    document.addEventListener("click", startMusic);

    return () => {
      music.pause();
      document.removeEventListener("click", startMusic);
    };
  }, []);

  // Trigger attack when all inputs are collected (stage 3)
  useEffect(() => {
    if (stage === 3 && selectedTeam && selectedSin && selectedWeaponCode) {
      attackCard(Number(selectedSin), Number(selectedTeam), String(selectedWeaponCode));
    }
  }, [stage]);

  const selectCard = (id: number) => {
    setSelectedCard(id);
    setHasSpun(false);
    setTimeout(() => setHasSpun(true), 3000);
  };

  const resetCard = () => {
    setSelectedCard(null);
    setDestroyCardId(null);
    setHasSpun(false);
  };

  const playWeaponSound = (type: number) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;

    if (type === 1) {
      // Knife: metallic whoosh + impact thud + ring
      for (let i = 0; i < 3; i++) {
        // Whoosh sweep
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sawtooth";
        o.frequency.setValueAtTime(3000 + i * 400, t + i * 0.18);
        o.frequency.exponentialRampToValueAtTime(200, t + i * 0.18 + 0.15);
        g.gain.setValueAtTime(0.18, t + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.18);
        o.start(t + i * 0.18); o.stop(t + i * 0.18 + 0.18);

        // Impact thud
        const thud = ctx.createOscillator();
        const tg = ctx.createGain();
        thud.connect(tg); tg.connect(ctx.destination);
        thud.type = "sine";
        thud.frequency.setValueAtTime(150, t + i * 0.18 + 0.08);
        thud.frequency.exponentialRampToValueAtTime(40, t + i * 0.18 + 0.2);
        tg.gain.setValueAtTime(0.2, t + i * 0.18 + 0.08);
        tg.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.25);
        thud.start(t + i * 0.18 + 0.08); thud.stop(t + i * 0.18 + 0.25);
      }
      // Metallic ring tail
      const ring = ctx.createOscillator();
      const rg = ctx.createGain();
      ring.connect(rg); rg.connect(ctx.destination);
      ring.type = "sine";
      ring.frequency.setValueAtTime(4200, t + 0.5);
      ring.frequency.exponentialRampToValueAtTime(2000, t + 1.2);
      rg.gain.setValueAtTime(0.05, t + 0.5);
      rg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      ring.start(t + 0.5); ring.stop(t + 1.2);

    } else if (type === 2) {
      // Bomb: deep rumble build + massive explosion + aftershock
      // Rumble build-up
      const rumble = ctx.createOscillator();
      const rg = ctx.createGain();
      rumble.connect(rg); rg.connect(ctx.destination);
      rumble.type = "sawtooth";
      rumble.frequency.setValueAtTime(60, t);
      rumble.frequency.exponentialRampToValueAtTime(120, t + 0.5);
      rg.gain.setValueAtTime(0.05, t);
      rg.gain.linearRampToValueAtTime(0.25, t + 0.45);
      rg.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      rumble.start(t); rumble.stop(t + 0.55);

      // Massive explosion noise
      const buf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
      const noise = ctx.createBufferSource();
      const ng = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.setValueAtTime(4000, t + 0.5); lp.frequency.exponentialRampToValueAtTime(200, t + 1.5);
      noise.buffer = buf; noise.connect(lp); lp.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.4, t + 0.5);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      noise.start(t + 0.5);

      // Sub-bass aftershock
      const sub = ctx.createOscillator();
      const sg = ctx.createGain();
      sub.connect(sg); sg.connect(ctx.destination);
      sub.type = "sine";
      sub.frequency.setValueAtTime(50, t + 0.5);
      sub.frequency.exponentialRampToValueAtTime(20, t + 1.5);
      sg.gain.setValueAtTime(0.3, t + 0.5);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      sub.start(t + 0.5); sub.stop(t + 1.5);

    } else if (type === 3) {
      // Ice: shimmering harmonics + cracking + deep resonance
      // Shimmer harmonics
      [2400, 3200, 4000, 4800, 5600].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, t + i * 0.08);
        o.frequency.exponentialRampToValueAtTime(freq * 0.4, t + i * 0.08 + 0.6);
        g.gain.setValueAtTime(0.06, t + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.7);
        o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.7);
      });
      // Ice crack noise
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() > 0.92 ? (Math.random() * 2 - 1) : 0) * Math.exp(-i / (ctx.sampleRate * 0.08));
      const crack = ctx.createBufferSource();
      const cg = ctx.createGain();
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 3000;
      crack.buffer = buf; crack.connect(hp); hp.connect(cg); cg.connect(ctx.destination);
      cg.gain.setValueAtTime(0.2, t + 0.3);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      crack.start(t + 0.3);
      // Deep resonant hum
      const hum = ctx.createOscillator();
      const hg = ctx.createGain();
      hum.connect(hg); hg.connect(ctx.destination);
      hum.type = "triangle";
      hum.frequency.setValueAtTime(180, t);
      hum.frequency.exponentialRampToValueAtTime(60, t + 1);
      hg.gain.setValueAtTime(0.1, t);
      hg.gain.exponentialRampToValueAtTime(0.001, t + 1);
      hum.start(t); hum.stop(t + 1);

    } else if (type === 4) {
      // Fire: roaring sweep + crackle noise + sub rumble
      // Roaring sweep
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      o1.connect(g1); g1.connect(ctx.destination);
      o2.connect(g2); g2.connect(ctx.destination);
      o1.type = "sawtooth"; o2.type = "square";
      o1.frequency.setValueAtTime(150, t);
      o1.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
      o1.frequency.exponentialRampToValueAtTime(80, t + 1.2);
      o2.frequency.setValueAtTime(300, t);
      o2.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      o2.frequency.exponentialRampToValueAtTime(100, t + 1);
      g1.gain.setValueAtTime(0.12, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      g2.gain.setValueAtTime(0.06, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 1);
      o1.start(t); o1.stop(t + 1.2);
      o2.start(t); o2.stop(t + 1);
      // Dense crackle
      const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() > 0.9 ? (Math.random() * 2 - 1) : 0) * 0.8 * Math.exp(-i / (ctx.sampleRate * 0.4));
      const n = ctx.createBufferSource();
      const ng = ctx.createGain();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 2000; bp.Q.value = 0.5;
      n.buffer = buf; n.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.25, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      n.start(t);
      // Sub rumble
      const sub = ctx.createOscillator();
      const sg = ctx.createGain();
      sub.connect(sg); sg.connect(ctx.destination);
      sub.type = "sine";
      sub.frequency.setValueAtTime(50, t);
      sub.frequency.exponentialRampToValueAtTime(30, t + 1);
      sg.gain.setValueAtTime(0.15, t + 0.1);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 1);
      sub.start(t); sub.stop(t + 1);

    } else if (type === 5) {
      // Poison: gurgling bubbles + acid hiss + eerie drone
      // Gurgly bubbles
      for (let i = 0; i < 8; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        const st = t + i * 0.12 + Math.random() * 0.06;
        const freq = 200 + Math.random() * 400;
        o.frequency.setValueAtTime(freq, st);
        o.frequency.exponentialRampToValueAtTime(freq * 0.2, st + 0.2);
        g.gain.setValueAtTime(0.1, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
        o.start(st); o.stop(st + 0.22);
      }
      // Acid hiss noise
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (ctx.sampleRate * 0.3));
      const hiss = ctx.createBufferSource();
      const hg = ctx.createGain();
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 5000;
      hiss.buffer = buf; hiss.connect(hp); hp.connect(hg); hg.connect(ctx.destination);
      hg.gain.setValueAtTime(0.12, t + 0.2);
      hg.gain.exponentialRampToValueAtTime(0.001, t + 1);
      hiss.start(t + 0.2);
      // Eerie modulated drone
      const drone = ctx.createOscillator();
      const dg = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      drone.connect(dg); dg.connect(ctx.destination);
      lfo.connect(lg); lg.connect(drone.frequency);
      drone.type = "triangle";
      drone.frequency.setValueAtTime(120, t);
      drone.frequency.exponentialRampToValueAtTime(60, t + 1.2);
      lfo.frequency.setValueAtTime(8, t);
      lg.gain.setValueAtTime(30, t);
      dg.gain.setValueAtTime(0.08, t);
      dg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      drone.start(t); lfo.start(t);
      drone.stop(t + 1.2); lfo.stop(t + 1.2);
    }

    setTimeout(() => ctx.state !== "closed" && ctx.close(), 2000);
  };

  const attackCard = async (cardId: number, teamId: number, weaponCode: string) => {
    const res = await fetch("/api/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, cardId, weaponCode }),
    });
    const data = await res.json();
    console.log(78, data);

    // Handle error responses with alien toast
    if (!res.ok) {
      const msg = data.error === "Código de arma já usado"
        ? "⚠️ CÓDIGO JÁ UTILIZADO"
        : "❌ CÓDIGO INVÁLIDO";

      // Play alien error sound (3 layers, lasts full toast duration)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const t = audioCtx.currentTime;

      // Layer 1: Descending sweep
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(800, t);
      osc1.frequency.exponentialRampToValueAtTime(80, t + 2.5);
      gain1.gain.setValueAtTime(0.12, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 3);
      osc1.start(t);
      osc1.stop(t + 3);

      // Layer 2: Pulsing low drone
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      lfo.connect(lfoGain);
      lfoGain.connect(gain2.gain);
      osc2.type = "square";
      osc2.frequency.setValueAtTime(120, t);
      lfo.frequency.setValueAtTime(6, t);
      lfoGain.gain.setValueAtTime(0.08, t);
      gain2.gain.setValueAtTime(0.1, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 3);
      osc2.start(t);
      lfo.start(t);
      osc2.stop(t + 3);
      lfo.stop(t + 3);

      // Layer 3: High warble
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(1200, t);
      osc3.frequency.setValueAtTime(1400, t + 0.3);
      osc3.frequency.setValueAtTime(1100, t + 0.6);
      osc3.frequency.setValueAtTime(1300, t + 0.9);
      osc3.frequency.setValueAtTime(1000, t + 1.2);
      osc3.frequency.setValueAtTime(900, t + 1.8);
      osc3.frequency.exponentialRampToValueAtTime(200, t + 2.8);
      gain3.gain.setValueAtTime(0.06, t);
      gain3.gain.exponentialRampToValueAtTime(0.001, t + 3);
      osc3.start(t);
      osc3.stop(t + 3);

      setTimeout(() => audioCtx.state !== "closed" && audioCtx.close(), 3100);

      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
      setStage(0);
      setSelectedTeam(0);
      setSelectedSin(0);
      setSelectedWeaponCode(0);
      return;
    }

    // Play attack animation only on success
    const weaponType = parseInt(weaponCode[0]);

    // Play weapon-specific sound
    playWeaponSound(weaponType);

    setAttackedCards((prev) => new Map(prev).set(cardId, weaponType));
    setTimeout(() => {
      setAttackedCards((prev) => {
        const newMap = new Map(prev);
        newMap.delete(cardId);
        return newMap;
      });
    }, 1200);

    // If lupa was used, select the sin card to show its details with countdown
    if (data.lupa) {
      selectCard(cardId);
      setLupaCountdown(15);
      setLupaLife(data.currentLife);
      setLupaIsFreeze(!!data.isFreeze);
      setLupaIsPoison(!!data.isPoison);

      // Create audio context for countdown beeps
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      const playBeep = (secondsLeft: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        // Higher pitch in last 5 seconds for urgency
        osc.frequency.value = secondsLeft <= 5 ? 1200 + (5 - secondsLeft) * 100 : 800;
        osc.type = "square";
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
      };

      // Play initial beep
      playBeep(15);

      // Clear any existing interval
      if (lupaIntervalRef.current) clearInterval(lupaIntervalRef.current);

      lupaIntervalRef.current = setInterval(() => {
        setLupaCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(lupaIntervalRef.current!);
            lupaIntervalRef.current = null;
            audioCtx.state !== "closed" && audioCtx.close();
            resetCard();
            setLupaLife(null);
            setLupaIsFreeze(false);
            setLupaIsPoison(false);
            return null;
          }
          playBeep(prev - 1);
          return prev - 1;
        });
      }, 1000);
    }

    // If the card was destroyed, trigger the destroy animation
    if (data.destroyed) {
      const teamNames: { [key: number]: string } = { 1: "Azul", 2: "Vermelho", 3: "Verde", 4: "Amarelo" };
      const card = cards.find((c) => c.id === cardId);
      const teamName = teamNames[data.teamId] || `Equipe ${data.teamId}`;
      const sinName = card?.name || "desconhecido";
      destroyCard(cardId, teamName, sinName);

      if (data.drops) {
        setTimeout(() => {
          if (data.drops.questions && data.drops.questions.length > 0) {
            setPendingQuestions(data.drops.questions);
            setCurrentQuestionIndex(0);
            setQuestionTimer(30);
            setPendingRewards({ weapons: data.drops.weapons, magnifying: data.drops.magnifying, teamId: data.teamId });
            setStage(4); // Question Mode
          } else if (data.drops.weapons > 0 || data.drops.magnifying > 0) {
            handleRewardsToast(data.drops.weapons, data.drops.magnifying);
            setStage(0);
          } else {
            setStage(0);
          }
        }, 4000);
      } else {
        setTimeout(() => setStage(0), 4000);
      }

      setSelectedTeam(0);
      setSelectedSin(0);
      setSelectedWeaponCode(0);
      return;
    }

    // Reset stages for next attack
    setStage(0);
    setSelectedTeam(0);
    setSelectedSin(0);
    setSelectedWeaponCode(0);
  };

  const handleAnswer = async (answerIndex: number) => {
    if (questionFeedback) return; // prevent double clicking

    const question = pendingQuestions[currentQuestionIndex];
    if (!question || !pendingRewards) return;

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer: answerIndex, teamId: pendingRewards.teamId }),
      });
      const data = await res.json();

      setQuestionFeedback(data.correct ? "correct" : "wrong");
      setCorrectAnswerIndex(data.correctAnswer);

      // Play sound effect based on correctness
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const t = audioCtx.currentTime;

      if (data.correct) {
        // Correct sound: pleasant ascending major chord arpeggio
        [440, 554.37, 659.25, 880].forEach((freq, i) => { // A4, C#5, E5, A5
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t + i * 0.08);
          gain.gain.setValueAtTime(0.1, t + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
          osc.start(t + i * 0.08);
          osc.stop(t + i * 0.08 + 0.3);
        });
      } else {
        // Wrong sound: harsh low buzz / descending portamento
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sawtooth";
        // Start low and drop lower
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
      }

      setTimeout(() => audioCtx.state !== "closed" && audioCtx.close(), 1000);

      // Wait 3 seconds then go to next question or exit
      setTimeout(() => {
        setQuestionFeedback(null);
        setCorrectAnswerIndex(null);

        if (currentQuestionIndex + 1 < pendingQuestions.length) {
          setCurrentQuestionIndex(prev => prev + 1);
          setQuestionTimer(30);
        } else {
          // Finish questions
          setPendingQuestions([]);
          setCurrentQuestionIndex(0);

          if (pendingRewards.weapons > 0 || pendingRewards.magnifying > 0) {
            handleRewardsToast(pendingRewards.weapons, pendingRewards.magnifying);
          }
          setPendingRewards(null);
          setStage(0);
        }
      }, 3000);
    } catch (e) {
      console.error("Error submitting answer:", e);
    }
  };

  const handleRewardsToast = (weapons: number, magnifying: number) => {
    // 1. Format message dynamically
    const parts = [];
    if (weapons > 0) parts.push(`${weapons}x Armas`);
    if (magnifying > 0) parts.push(`${magnifying}x Lupa`);
    if (parts.length === 0) return;

    const finalMessage = `🎁 RECOMPENSAS:\n${parts.join(" e ")}`;

    // 2. Start Matrix Jackpot Scramble
    setToastMessage("..."); // trigger toast UI
    const chars = "01%$#@!&*?";
    let ticks = 0;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const tStart = audioCtx.currentTime;

    // Fast ticking sound for scramble duration (2 seconds)
    for (let i = 0; i < 20; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(600 + Math.random() * 400, tStart + i * 0.1);
      gain.gain.setValueAtTime(0.05, tStart + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, tStart + i * 0.1 + 0.05);
      osc.start(tStart + i * 0.1);
      osc.stop(tStart + i * 0.1 + 0.05);
    }

    const scrambleInterval = setInterval(() => {
      let scrambled = "🎁 RECOMPENSAS:\n";
      for (let i = 0; i < finalMessage.length - 16; i++) { // offset "🎁 RECOMPENSAS:\n"
        scrambled += chars[Math.floor(Math.random() * chars.length)];
      }
      setScrambledMessage(scrambled);
      ticks++;

      if (ticks >= 20) { // 2 seconds completed
        clearInterval(scrambleInterval);
        setScrambledMessage(null);
        setToastMessage(finalMessage);

        // 3. Play positive reward sound (sparkly arpeggio)
        const tFinish = audioCtx.currentTime;
        [400, 500, 600, 800].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, tFinish + i * 0.1);
          gain.gain.setValueAtTime(0.15, tFinish + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, tFinish + i * 0.1 + 0.4);
          osc.start(tFinish + i * 0.1);
          osc.stop(tFinish + i * 0.1 + 0.4);
        });

        setTimeout(() => {
          setToastMessage(null);
          audioCtx.state !== "closed" && audioCtx.close();
        }, 5000); // 5 seconds timeout
      }
    }, 100);
  };

  const destroyCard = (id: number, teamName: string, sin: string) => {
    setDestroyCardId(id);
    setTimeout(() => {
      setDestroyCardId(null);
      const victorySound = new Audio("/sounds/lvlup.mp3");
      victorySound.play();
      setShowCongrats(true);
      setVictoryMessage(`Equipe ${teamName} venceu o pecado da ${sin}!`);
      setTimeout(() => setShowCongrats(false), 2000);
    }, 2000); // duração da animação de destruição
  };

  const renderCard = (card: (typeof cards)[0], isSelected = false, isStandaloneDestroy = false) => {
    const isAttacked = attackedCards.has(card.id);
    const weaponUsed = attackedCards.get(card.id);
    const isDestroyed = destroyCardId === card.id;

    // If this card is being destroyed but this is the grid render, hide it
    if (isDestroyed && !isStandaloneDestroy) {
      return <div key={card.id} style={{ visibility: "hidden", width: "100%", height: "auto" }} />;
    }

    const isHighlighted = highlightedCard === card.id;

    const animationClass = isDestroyed
      ? ""
      : isSelected
        ? hasSpun
          ? "scale-110 shadow-lg"
          : "custom-spin-3d"
        : "transition-all duration-700 ease-in-out hover:scale-105";

    const destroyClass = isDestroyed ? "destroy-center" : "";

    return (
      <div
        key={card.id}
        className={`relative ${isAttacked ? "animate-shake" : ""} ${isSelected || isDestroyed ? "selected-card" : ""
          } ${animationClass} ${destroyClass} bg-black border border-green-700 shadow-[0_0_20px_#00ff99] rounded-lg flex flex-col overflow-hidden`}
        style={{
          width: isSelected || isDestroyed ? "320px" : "100%",
          height: isSelected || isDestroyed ? "420px" : "auto",
          ...(isHighlighted && !isSelected && !isDestroyed ? { transform: "scale(1.05)", boxShadow: "0 0 30px #00ff99, 0 0 60px #00ff6644" } : {}),
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 h-[10%] text-lg font-bold text-green-300 border-b border-green-600 uppercase tracking-wider">
          <span className="text-green-500">#{card.id}</span>
          <span>{card.name}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 h-[10%] text-red-500 border-b border-green-600 text-base">
          <span className="animate-pulse">❤️</span>
          <span>{card.life}</span>
        </div>
        <div className="h-[60%] w-full bg-black flex items-center justify-center overflow-hidden border-y border-green-600">
          <Image
            src={card.image}
            alt={card.name}
            width={300}
            height={300}
            className="h-full w-full object-cover filter grayscale-[30%] contrast-125 hover:grayscale-0 transition duration-300"
            priority={card.id === 2}
          />
        </div>
        <div className="flex flex-1 divide-x divide-green-700 border-t border-green-600 text-green-300 text-sm h-10">
          <div className="flex-1 flex items-center justify-center hover:bg-green-800/20 cursor-pointer transition relative">
            <Image
              src={`/question.png`}
              alt={`Col 1`}
              width={50}
              height={50}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 flex items-center justify-center hover:bg-green-800/20 cursor-pointer transition relative">
            <Image
              src={`/weapon.png`}
              alt={`Col 2`}
              width={50}
              height={50}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 flex items-center justify-center hover:bg-green-800/20 cursor-pointer transition relative">
            <Image
              src={`/lupa.png`}
              alt={`Col 3`}
              width={50}
              height={50}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {isAttacked && weaponUsed === 1 && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            <div className="absolute text-6xl animate-weaponSlash" style={{ top: '20%', left: '-20%' }}>🗡️</div>
            <div className="absolute text-6xl animate-weaponSlash" style={{ top: '50%', left: '-20%', animationDelay: '0.15s' }}>🗡️</div>
            <div className="absolute text-6xl animate-weaponSlash" style={{ top: '35%', left: '-20%', animationDelay: '0.3s' }}>🗡️</div>
          </div>
        )}
        {isAttacked && weaponUsed === 2 && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="text-8xl animate-weaponBomb">💣</div>
            <div className="absolute text-9xl animate-weaponExplode" style={{ animationDelay: '0.4s', opacity: 0 }}>💥</div>
          </div>
        )}
        {isAttacked && weaponUsed === 3 && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-cyan-400/30 animate-weaponFreeze rounded-lg" />
            <div className="absolute text-5xl animate-weaponIceDrop" style={{ top: '-10%', left: '20%' }}>❄️</div>
            <div className="absolute text-5xl animate-weaponIceDrop" style={{ top: '-10%', left: '50%', animationDelay: '0.2s' }}>❄️</div>
            <div className="absolute text-5xl animate-weaponIceDrop" style={{ top: '-10%', left: '70%', animationDelay: '0.4s' }}>🧊</div>
          </div>
        )}
        {isAttacked && weaponUsed === 4 && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-orange-500/20 animate-weaponFireGlow rounded-lg" />
            <div className="absolute text-5xl animate-weaponFireRise" style={{ bottom: '-20%', left: '15%' }}>🔥</div>
            <div className="absolute text-5xl animate-weaponFireRise" style={{ bottom: '-20%', left: '45%', animationDelay: '0.15s' }}>🔥</div>
            <div className="absolute text-5xl animate-weaponFireRise" style={{ bottom: '-20%', left: '70%', animationDelay: '0.3s' }}>🔥</div>
          </div>
        )}
        {isAttacked && weaponUsed === 5 && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-purple-600/20 animate-weaponPoisonGlow rounded-lg" />
            <div className="absolute text-4xl animate-weaponBubble" style={{ bottom: '10%', left: '20%' }}>☠️</div>
            <div className="absolute text-3xl animate-weaponBubble" style={{ bottom: '20%', left: '50%', animationDelay: '0.2s' }}>💀</div>
            <div className="absolute text-4xl animate-weaponBubble" style={{ bottom: '5%', left: '70%', animationDelay: '0.4s' }}>☠️</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        .selected-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 50;
          perspective: 1200px;
        }

        @keyframes spin3D {
          0% {
            transform: translate(-50%, -50%) rotateY(0deg) scale(1);
            box-shadow: 0 0 20px #00ff99;
          }
          25% {
            transform: translate(-50%, -50%) rotateY(270deg) scale(1.05);
            box-shadow: 0 10px 40px rgba(0, 255, 153, 0.6);
          }
          50% {
            transform: translate(-50%, -50%) rotateY(540deg) scale(1.1);
            box-shadow: 0 20px 60px rgba(0, 255, 153, 0.7);
          }
          75% {
            transform: translate(-50%, -50%) rotateY(810deg) scale(1.05);
            box-shadow: 0 10px 40px rgba(0, 255, 153, 0.6);
          }
          100% {
            transform: translate(-50%, -50%) rotateY(1080deg) scale(1.1);
            box-shadow: 0 0 20px #00ff99;
          }
        }
        .custom-spin-3d {
          animation: spin3D 3s ease-in-out forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        /* Weapon: Knife - slash across */
        @keyframes weaponSlash {
          0% { left: -20%; opacity: 0; transform: rotate(-30deg); }
          30% { opacity: 1; }
          100% { left: 110%; opacity: 0; transform: rotate(15deg); }
        }
        .animate-weaponSlash { animation: weaponSlash 0.5s ease-out forwards; }

        /* Weapon: Bomb - shake then explode */
        @keyframes weaponBomb {
          0% { transform: scale(1); opacity: 1; }
          60% { transform: scale(1.1) rotate(10deg); opacity: 1; }
          80% { transform: scale(1.2) rotate(-5deg); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        .animate-weaponBomb { animation: weaponBomb 0.5s ease-in forwards; }

        @keyframes weaponExplode {
          0% { transform: scale(0); opacity: 0; }
          30% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        .animate-weaponExplode { animation: weaponExplode 0.7s ease-out forwards; }

        /* Weapon: Ice - freeze overlay + snowflakes */
        @keyframes weaponFreeze {
          0% { opacity: 0; }
          30% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { opacity: 0; }
        }
        .animate-weaponFreeze { animation: weaponFreeze 1.2s ease-in-out forwards; }

        @keyframes weaponIceDrop {
          0% { top: -10%; opacity: 0; transform: rotate(0deg); }
          20% { opacity: 1; }
          100% { top: 100%; opacity: 0; transform: rotate(180deg); }
        }
        .animate-weaponIceDrop { animation: weaponIceDrop 1s ease-in forwards; }

        /* Weapon: Fire - flames rise */
        @keyframes weaponFireRise {
          0% { bottom: -20%; opacity: 0; transform: scale(1); }
          30% { opacity: 1; }
          70% { opacity: 1; transform: scale(1.3); }
          100% { bottom: 100%; opacity: 0; transform: scale(0.5); }
        }
        .animate-weaponFireRise { animation: weaponFireRise 0.9s ease-out forwards; }

        @keyframes weaponFireGlow {
          0% { opacity: 0; }
          30% { opacity: 0.3; }
          70% { opacity: 0.4; }
          100% { opacity: 0; }
        }
        .animate-weaponFireGlow { animation: weaponFireGlow 1s ease-in-out forwards; }

        /* Weapon: Poison - bubbles float up */
        @keyframes weaponBubble {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 1; transform: translateY(-10px) scale(1); }
          60% { opacity: 0.8; }
          100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
        .animate-weaponBubble { animation: weaponBubble 1s ease-out forwards; }

        @keyframes weaponPoisonGlow {
          0% { opacity: 0; }
          30% { opacity: 0.3; }
          80% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        .animate-weaponPoisonGlow { animation: weaponPoisonGlow 1.2s ease-in-out forwards; }

        @keyframes shake {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-4px, 2px);
          }
          40% {
            transform: translate(4px, -2px);
          }
          60% {
            transform: translate(-3px, 1px);
          }
          80% {
            transform: translate(3px, -1px);
          }
          100% {
            transform: translate(0);
          }
        }
        .animate-shake {
          animation: shake 0.3s;
        }

        @keyframes destroyCardCenter {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3) rotate(20deg);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(0) rotate(720deg);
            opacity: 0;
          }
        }
        .destroy-center {
          animation: destroyCardCenter 2s forwards;
        }

        @keyframes congratsFade {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .congrats-overlay {
          animation: congratsFade 0.5s ease-out forwards;
        }
        @keyframes alienGlitch {
          0%, 100% { opacity: 1; transform: skewX(0deg); }
          10% { opacity: 0.8; transform: skewX(-2deg); }
          20% { opacity: 1; transform: skewX(1deg); }
          30% { opacity: 0.9; transform: skewX(0deg); }
          50% { opacity: 0.7; transform: skewX(3deg); }
          70% { opacity: 1; transform: skewX(-1deg); }
        }
        .alien-toast {
          animation: alienGlitch 0.5s ease-out;
        }
      `}</style>

      <div className="relative h-screen w-screen flex bg-black font-mono text-green-400 overflow-hidden">
        {/* overlay escuro para select ou destroy */}
        {(selectedCard || destroyCardId) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 cursor-pointer"
            onClick={resetCard}
          />
        )}

        <div className="w-[80%] h-full grid grid-cols-3 grid-rows-3 gap-6 p-6 box-border z-10">
          {cards.map((card) => renderCard(card))}
        </div>

        {selectedCard && renderCard(cards.find((c) => c.id === selectedCard)!, true)}

        {destroyCardId && renderCard(cards.find((c) => c.id === destroyCardId)!, false, true)}

        {selectedCard && hasSpun && (
          <div className="fixed top-1/2 left-1/2 -translate-y-1/2 translate-x-[220px] z-50 w-64 bg-green-900 text-green-200 border border-green-500 shadow-xl rounded-md p-4 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Informações</h3>
            <p>
              <strong>Nome:</strong> {cards.find((c) => c.id === selectedCard)?.name}
            </p>
            <p>
              <strong>Vida Atual: </strong>{lupaLife !== null ? lupaLife : cards.find((c) => c.id === selectedCard)?.life}❤️
            </p>
            {(lupaIsFreeze || lupaIsPoison) && (
              <div className="mt-3 flex flex-col gap-1">
                {lupaIsFreeze && (
                  <div className="flex items-center gap-2 text-cyan-300 bg-cyan-900/40 px-2 py-1 rounded">
                    <span>❄️</span> <span className="font-bold text-sm">CONGELADO</span>
                  </div>
                )}
                {lupaIsPoison && (
                  <div className="flex items-center gap-2 text-purple-400 bg-purple-900/40 px-2 py-1 rounded">
                    <span>☠️</span> <span className="font-bold text-sm">ENVENENADO</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {lupaCountdown !== null && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center">
            <div className="relative">
              <div className="text-8xl font-black tabular-nums text-green-400 drop-shadow-[0_0_30px_rgba(0,255,100,0.8)] animate-pulse" style={{ fontFamily: "'Courier New', monospace", textShadow: "0 0 10px #00ff66, 0 0 20px #00ff66, 0 0 40px #00ff66, 0 0 80px #003300" }}>
                {String(lupaCountdown).padStart(2, '0')}
              </div>
              <div className="absolute inset-0 text-8xl font-black tabular-nums text-transparent" style={{ fontFamily: "'Courier New', monospace", WebkitTextStroke: '1px rgba(0,255,100,0.3)' }}>
                {String(lupaCountdown).padStart(2, '0')}
              </div>
            </div>
            <div className="mt-2 text-green-500 text-sm uppercase tracking-[0.5em] font-mono opacity-70">🔍 investigando</div>
            <div className="mt-3 w-48 h-1 bg-green-900 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_#00ff66]" style={{ width: `${(lupaCountdown / 15) * 100}%` }} />
            </div>
          </div>
        )}

        {showCongrats && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black text-green-100 px-12 py-6 rounded-xl text-3xl font-bold shadow-lg congrats-overlay">
              🎉 {victoryMessage} 🎉
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-[70]">
            <div className={`relative bg-black border-2 ${scrambledMessage ? 'border-green-300 shadow-[0_0_80px_#00ff66]' : 'border-green-500 shadow-[0_0_40px_#00ff66,0_0_80px_#00ff6633]'} rounded-xl px-16 py-10 alien-toast transition-all duration-300`}>
              <div className="absolute inset-0 rounded-xl opacity-10 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,100,0.1) 2px, rgba(0,255,100,0.1) 4px)" }} />
              <div className="text-center">
                <div className="text-7xl mb-4 text-center mx-auto w-full flex justify-center">
                  {scrambledMessage ? (
                    <div className="animate-pulse">👾</div>
                  ) : toastMessage.includes("RECOMPENSAS") ? (
                    <div className="animate-bounce">👽</div>
                  ) : (
                    <div>👽</div>
                  )}
                </div>
                <div className={`text-green-400 text-4xl font-black font-mono uppercase tracking-wider whitespace-pre-line ${scrambledMessage ? 'opacity-80' : ''}`} style={{ textShadow: "0 0 10px #00ff66, 0 0 20px #00ff66" }}>
                  {scrambledMessage ? scrambledMessage : toastMessage}
                </div>
                {!toastMessage.includes("RECOMPENSAS") && (
                  <div className="mt-3 text-green-600 text-lg font-mono opacity-70">tente outro código</div>
                )}
              </div>
            </div>
          </div>
        )}

        {stage === 0 && (
          <div className="w-[20%] h-full bg-black border-l border-green-800 p-6 flex flex-col items-center justify-center space-y-6 z-10">
            <Image src="/imgs/logo.gif" alt="Logo" width={150} height={150} className="mb-4" />
            <h2 className="text-green-400 text-3xl font-bold uppercase text-center animate-pulse">
              Digite a cor da sua equipe
            </h2>
            <ul className="space-y-3 text-xl text-white uppercase">
              <li className="text-blue-500">
                <span>1</span> - azul
              </li>
              <li className="text-red-500">
                <span>2</span> - vermelho
              </li>
              <li className="text-green-500">
                <span>3</span> - verde
              </li>
              <li className="text-yellow-500">
                <span>4</span> - amarelo
              </li>
            </ul>
            <input
              type="text"
              ref={input1Ref}
              placeholder="..."
              autoFocus
              maxLength={1}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-black text-green-400 font-mono text-lg border border-green-500 px-4 py-2 rounded outline-none focus:shadow-[0_0_20px_#00ff00] caret-green-400 placeholder-green-400 transition"
            />
          </div>
        )}

        {stage === 1 && (
          <div className="w-[20%] h-full bg-black border-l border-green-800 p-6 flex flex-col items-center justify-center space-y-6 z-10">
            <Image src="/imgs/logo.gif" alt="Logo" width={150} height={150} className="mb-4" />
            <h2 className="text-green-400 text-3xl font-bold uppercase text-center animate-pulse">
              Digite o número do PECADO
            </h2>

            <input
              type="text"
              ref={input1Ref}
              placeholder="..."
              autoFocus
              maxLength={1}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-black text-green-400 font-mono text-lg border border-green-500 px-4 py-2 rounded outline-none focus:shadow-[0_0_20px_#00ff00] caret-green-400 placeholder-green-400 transition"
            />
          </div>
        )}

        {stage === 2 && (
          <div className="w-[20%] h-full bg-black border-l border-green-800 p-6 flex flex-col items-center justify-center space-y-6 z-10">
            <Image src="/imgs/logo.gif" alt="Logo" width={150} height={150} className="mb-4" />
            <h2 className="text-green-400 text-3xl font-bold uppercase text-center animate-pulse">
              Digite o código da carta
            </h2>

            <input
              type="text"
              ref={input1Ref}
              placeholder="..."
              autoFocus
              maxLength={7}
              min={7}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-black text-green-400 font-mono text-lg border border-green-500 px-4 py-2 rounded outline-none focus:shadow-[0_0_20px_#00ff00] caret-green-400 placeholder-green-400 transition"
            />
          </div>
        )}

        {stage === 4 && pendingQuestions.length > 0 && (
          <div className="w-[20%] h-full bg-black border-l border-green-800 p-6 flex flex-col items-center justify-center z-10 overflow-y-auto">
            <h2 className="text-green-400 text-2xl font-bold uppercase text-center mb-4 leading-tight">
              BÔNUS ({currentQuestionIndex + 1}/{pendingQuestions.length})
            </h2>

            <div className={`text-4xl font-black tabular-nums border-2 rounded px-4 py-2 mb-4 transition-colors ${questionTimer <= 5 ? "text-red-500 border-red-500 animate-pulse bg-red-900/20" :
              questionTimer <= 10 ? "text-yellow-500 border-yellow-500 bg-yellow-900/20" :
                "text-green-500 border-green-500 bg-green-900/20"
              }`}>
              00:{String(questionTimer).padStart(2, '0')}
            </div>

            <div className="bg-green-900/30 border border-green-500 rounded p-4 mb-6 text-green-100 text-center text-sm">
              {pendingQuestions[currentQuestionIndex].prompt}
            </div>

            <div className="w-full flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => {
                const altText = pendingQuestions[currentQuestionIndex][`alt${i}`];
                let btnClass = "bg-black border border-green-700 text-green-400 hover:bg-green-900/50";

                if (questionFeedback) {
                  if (i === correctAnswerIndex) {
                    btnClass = "bg-green-600 border-green-400 text-white shadow-[0_0_15px_#00ff00]";
                  } else {
                    btnClass = "bg-black border-gray-700 text-gray-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={!!questionFeedback}
                    onClick={() => handleAnswer(i)}
                    className={`px-4 py-3 rounded uppercase text-xs font-bold font-mono transition-all text-left ${btnClass}`}
                  >
                    <span className="text-gray-500 mr-2">{i}.</span> {altText}
                  </button>
                );
              })}
            </div>
            {questionFeedback === "correct" && (
              <div className="mt-6 text-green-400 text-xl font-bold animate-pulse">+20 PONTOS!</div>
            )}
            {questionFeedback === "wrong" && (
              <div className="mt-6 text-red-500 text-xl font-bold animate-pulse">❌</div>
            )}

            <input
              type="text"
              ref={input1Ref}
              autoFocus
              className="opacity-0 absolute w-0 h-0"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
      </div>
    </>
  );
}
