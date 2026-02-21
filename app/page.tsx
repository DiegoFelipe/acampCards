"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const cards = [
  { id: 1, name: "Mentira", image: "/imgs/mentira3.jpg", life: 20 },
  { id: 2, name: "Imoralidade", image: "/imgs/imoralidade3.jpg", life: 30 },
  { id: 3, name: "Inveja", image: "/imgs/inveja3.jpg", life: 15 },
  { id: 4, name: "Gula", image: "/imgs/gula2.jpg", life: 5 },
  { id: 5, name: "Ira", image: "/imgs/ira2.jpg", life: 25 },
  { id: 6, name: "Idolatria", image: "/imgs/idolatria2.jpg", life: 50 },
  { id: 7, name: "Fofoca", image: "/imgs/fofoca2.jpg", life: 45 },
  { id: 8, name: "Preguiça", image: "/imgs/preguica.jpg", life: 45 },
  { id: 9, name: "Divisão na igreja", image: "/imgs/divisao2.jpg", life: 30 },
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

  // ref
  const input1Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input1Ref.current?.focus();
  }, []);

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

  const attackCard = async (id: number) => {
    const attackSound = new Audio("/sounds/attack.mp3");
    await attackSound.play();
    setAttackedCards((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setAttackedCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 800);

    const res = await fetch("/api/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: 2, cardId: 1, weaponCode: "2594760" }),
    });
    const data = await res.json();
    console.log(78, data);
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

  const renderCard = (card: (typeof cards)[0], isSelected = false) => {
    const isAttacked = attackedCards.has(card.id);
    const isDestroyed = destroyCardId === card.id;

    const animationClass = isSelected
      ? hasSpun
        ? "scale-110 shadow-lg"
        : "custom-spin-3d"
      : "transition-transform duration-300 hover:scale-105";

    const destroyClass = isDestroyed ? "destroy-center" : "";

    return (
      <div
        key={card.id}
        onClick={() => !isSelected && !isDestroyed && selectCard(card.id)}
        className={`relative ${isAttacked ? "animate-shake" : ""} ${
          isSelected || isDestroyed ? "selected-card" : ""
        } ${animationClass} ${destroyClass} bg-black border border-green-700 shadow-[0_0_20px_#00ff99] rounded-lg flex flex-col overflow-hidden cursor-pointer`}
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

        {destroyCardId && renderCard(cards.find((c) => c.id === destroyCardId)!, false)}

        {selectedCard && hasSpun && (
          <div className="fixed top-1/2 left-1/2 -translate-y-1/2 translate-x-[220px] z-50 w-64 h-48 bg-green-900 text-green-200 border border-green-500 shadow-xl rounded-md p-4 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Informações</h3>
            <p>
              <strong>Nome:</strong> {cards.find((c) => c.id === selectedCard)?.name}
            </p>
            <p>
              <strong>Vida:</strong> {cards.find((c) => c.id === selectedCard)?.life}
            </p>
            <p className="text-sm text-green-400 mt-2">Mais detalhes podem ir aqui...</p>
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
            <button
              onClick={() => attackCard(3)}
              className="mt-6 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
            >
              Atacar Card
            </button>
            <button
              onClick={() => destroyCard(2, "azul", "Imoralidade")}
              className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
            >
              Destroy Card #2
            </button>
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
