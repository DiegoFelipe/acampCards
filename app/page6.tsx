"use client";

import Image from "next/image";
import { useState } from "react";

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

  const selectCard = (id: number) => {
    setSelectedCard(id);
    setHasSpun(false);
    setTimeout(() => setHasSpun(true), 3000); // tempo da animação
  };

  const resetCard = () => {
    setSelectedCard(null);
    setHasSpun(false);
  };

  const renderCard = (card: (typeof cards)[0], isSelected = false) => {
    const animationClass = isSelected
      ? hasSpun
        ? "scale-110"
        : "custom-spin"
      : "transition-transform duration-300 hover:scale-105";

    return (
      <div
        key={card.id}
        onClick={() => !isSelected && selectCard(card.id)}
        className={`${
          isSelected
            ? `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50`
            : ""
        } ${animationClass} bg-black border border-green-700 shadow-[0_0_20px_#00ff99] rounded-lg flex flex-col overflow-hidden cursor-pointer`}
        style={{
          width: isSelected ? "320px" : "100%",
          height: isSelected ? "420px" : "auto",
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
        <div className="flex flex-1 divide-x divide-green-700 border-t border-green-600 text-green-300 text-sm">
          <div className="flex-1 flex items-center justify-center hover:bg-green-800/20 cursor-pointer transition">
            Col 1
          </div>
          <div className="flex-1 flex items-center justify-center hover:bg-green-800/20 cursor-pointer transition">
            Col 2
          </div>
          <div className="flex-1 flex items-center justify-center hover:bg-green-800/20 cursor-pointer transition">
            Col 3
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 👇 keyframes embutidos */}
      <style jsx global>{`
        @keyframes customSpinY {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          100% {
            transform: rotateY(1080deg) scale(1.1);
          }
        }

        .custom-spin {
          animation: customSpinY 3s ease-in-out forwards;
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
      `}</style>

      <div
        className="relative h-screen w-screen flex bg-black font-mono text-green-400 overflow-hidden"
        style={{ perspective: "1200px" }}
      >
        {/* Overlay escuro */}
        {selectedCard && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 cursor-pointer"
            onClick={resetCard}
          ></div>
        )}

        {/* Grid de cards */}
        <div className="w-[80%] h-full grid grid-cols-3 grid-rows-3 gap-6 p-6 box-border z-10">
          {cards.map((card) => (selectedCard === card.id ? null : renderCard(card)))}
        </div>

        {/* Card selecionado central */}
        {selectedCard && renderCard(cards.find((c) => c.id === selectedCard)!, true)}

        {/* Painel de informações fora do card */}
        {selectedCard && hasSpun && (
          <div className="fixed top-1/2 left-1/2 z-50 -translate-y-1/2 translate-x-[220px] ml-6 w-64 h-48 bg-green-900 text-green-200 border border-green-500 shadow-xl rounded-md p-4 animate-fadeIn">
            <h3 className="text-3xl uppercase font-bold mb-2">Status</h3>
            <p>
              <strong> Vida Atual:</strong> {cards.find((c) => c.id === selectedCard)?.life}{" "}
              <span className="animate-pulse mr-1">❤️</span>
            </p>
            <p>🧊 CONGELADO</p>
            <p>🤮 ENVENENADO</p>
            <p className="text-sm text-green-400 mt-2">Mais detalhes podem ir aqui...</p>
          </div>
        )}

        {/* Painel lateral fixo */}
        <div className="w-[20%] h-full bg-black border-l border-green-800 p-6 flex flex-col items-center justify-center space-y-6 z-10">
          <h2 className="text-green-400 text-3xl font-bold uppercase text-center animate-pulse">
            Digite a cor
          </h2>
          <ul className="space-y-3 text-xl text-green-300">
            <li>
              <span className="text-green-500">1</span> - azul
            </li>
            <li>
              <span className="text-green-500">2</span> - vermelho
            </li>
            <li>
              <span className="text-green-500">3</span> - verde
            </li>
            <li>
              <span className="text-green-500">4</span> - amarelo
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
