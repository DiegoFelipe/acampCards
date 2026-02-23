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
  const [attackedCards, setAttackedCards] = useState<Set<number>>(new Set());
  const [destroyCardId, setDestroyCardId] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(0);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(0);
  const [selectedSin, setSelectedSin] = useState<number | null>(0);
  const [selectedWeaponCode, setSelectedWeaponCode] = useState<number | null>(0);
  const [lupaCountdown, setLupaCountdown] = useState<number | null>(null);
  const [lupaLife, setLupaLife] = useState<number | null>(null);
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

  const handleKeyDown = (e) => {
    // console.log("Valor digitado1111:", stage, e.target.value);
    const inputLen = e.target.value.length;
    // console.log(40, inputLen);
    if (e.key === "Enter" && stage === 0 && inputLen == 1) {
      setStage(1);
      setSelectedTeam(e.target.value);
    }
    if (e.key === "Enter" && stage === 1 && inputLen == 1) {
      setStage(2);
      console.log("Valor digitado:", e.target.value);
      setSelectedSin(e.target.value);
    }
    if (e.key === "Enter" && stage === 2 && inputLen == 7) {
      setStage(3);
      // console.log("Valor digitado:", e.target.value);
      setSelectedWeaponCode(e.target.value);
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

  const attackCard = async (cardId: number, teamId: number, weaponCode: string) => {
    const attackSound = new Audio("/sounds/attack.mp3");
    await attackSound.play();
    setAttackedCards((prev) => new Set(prev).add(cardId));
    setTimeout(() => {
      setAttackedCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }, 800);

    const res = await fetch("/api/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, cardId, weaponCode }),
    });
    const data = await res.json();
    console.log(78, data);

    // If lupa was used, select the sin card to show its details with countdown
    if (data.lupa) {
      selectCard(cardId);
      setLupaCountdown(15);
      setLupaLife(data.currentLife);

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
    }

    // Reset stages for next attack
    setStage(0);
    setSelectedTeam(0);
    setSelectedSin(0);
    setSelectedWeaponCode(0);
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
    const isDestroyed = destroyCardId === card.id;

    // If this card is being destroyed but this is the grid render, hide it
    if (isDestroyed && !isStandaloneDestroy) {
      return <div key={card.id} style={{ visibility: "hidden", width: "100%", height: "auto" }} />;
    }

    const animationClass = isDestroyed
      ? ""
      : isSelected
        ? hasSpun
          ? "scale-110 shadow-lg"
          : "custom-spin-3d"
        : "transition-transform duration-300 hover:scale-105";

    const destroyClass = isDestroyed ? "destroy-center" : "";

    return (
      <div
        key={card.id}
        className={`relative ${isAttacked ? "animate-shake" : ""} ${isSelected || isDestroyed ? "selected-card" : ""
          } ${animationClass} ${destroyClass} bg-black border border-green-700 shadow-[0_0_20px_#00ff99] rounded-lg flex flex-col overflow-hidden`}
        style={{
          width: isSelected || isDestroyed ? "320px" : "100%",
          height: isSelected || isDestroyed ? "420px" : "auto",
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

        {isAttacked && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            <div className="absolute w-32 h-32 bg-[url('/imgs/claw.png')] bg-contain bg-no-repeat animate-clawAttack left-0 top-1/2 -translate-y-1/2" />
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

        @keyframes clawAttack {
          0% {
            left: -100px;
            opacity: 0;
            transform: rotate(-20deg) scale(1.2);
          }
          50% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: rotate(20deg) scale(1.2);
          }
        }
        .animate-clawAttack {
          animation: clawAttack 1.1s ease-out forwards;
        }

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
          <div className="fixed top-1/2 left-1/2 -translate-y-1/2 translate-x-[220px] z-50 w-64 h-48 bg-green-900 text-green-200 border border-green-500 shadow-xl rounded-md p-4 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Informações</h3>
            <p>
              <strong>Nome:</strong> {cards.find((c) => c.id === selectedCard)?.name}
            </p>
            <p>
              <strong>Vida Atual: </strong>{lupaLife !== null ? lupaLife : cards.find((c) => c.id === selectedCard)?.life}❤️
            </p>
            <p className="text-sm text-green-400 mt-2">Mais detalhes podem ir aqui...</p>
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
              onKeyDown={handleKeyDown}
              className="bg-black text-green-400 font-mono text-lg border border-green-500 px-4 py-2 rounded outline-none focus:shadow-[0_0_20px_#00ff00] caret-green-400 placeholder-green-400 transition"
            />
          </div>
        )}
      </div>
    </>
  );
}
