"use client";

import Image from "next/image";

const cards = [
  {
    id: 1,
    name: `Mentira`,
    image: "/imgs/mentira3.jpg",
    life: 20,
  },
  {
    id: 2,
    name: `Imoralidade`,
    image: "/imgs/imoralidade3.jpg",
    life: 30,
  },
  {
    id: 3,
    name: `Inveja`,
    image: "/imgs/inveja3.jpg",
    life: 15,
  },
  {
    id: 4,
    name: `Gula`,
    image: "/imgs/gula2.jpg",
    life: 5,
  },
  {
    id: 5,
    name: `Ira`,
    image: "/imgs/ira2.jpg",
    life: 25,
  },
  {
    id: 6,
    name: `Idolatria`,
    image: "/imgs/idolatria2.jpg",
    life: 50,
  },
  {
    id: 7,
    name: `Fofoca`,
    image: "/imgs/fofoca2.jpg",
    life: 45,
  },
  {
    id: 8,
    name: `Preguiça`,
    image: "/imgs/preguica.jpg",
    life: 45,
  },
  {
    id: 9,
    name: `Divisão na igreja`,
    image: "/imgs/divisao2.jpg",
    life: 30,
  },
];

export default function Home() {
  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-black via-[#011a11] to-black font-mono text-green-400">
      {/* Left 80% side with grid */}
      <div className="w-[80%] h-full grid grid-cols-3 grid-rows-3 gap-6 p-6 box-border">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-black border border-green-700 shadow-[0_0_10px_#00ff99] rounded-lg flex flex-col overflow-hidden hover:shadow-[0_0_20px_#00ffcc] transition duration-300"
          >
            {/* Top: Name + Number */}
            <div className="flex items-center justify-center px-4 py-2 h-[10%] text-lg font-bold text-green-300 border-b border-green-600 uppercase tracking-wider">
              <span className="text-green-500 text-2xl">#{card.id}_</span>
              <span>{card.name}</span>
            </div>

            {/* Likes row */}
            <div className="flex items-center gap-2 px-4 py-2 h-[10%] text-red-500 border-b border-green-600 text-base">
              <span className="animate-pulse">❤️</span>
              <span>{card.life}</span>
            </div>

            {/* Image (60%) */}
            <div className="h-[60%] w-full bg-black flex items-center justify-center overflow-hidden border-y border-green-600">
              <Image
                src={card.image}
                alt={card.name}
                width={200}
                height={200}
                className="h-full w-full object-cover filter grayscale-[30%] contrast-125 hover:grayscale-0 hover:scale-105 transition duration-300"
              />
            </div>

            {/* Bottom (20%) - 3 Columns */}
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
        ))}
      </div>

      {/* Right 20% side */}
      {/* <div className="w-[20%] h-full bg-black border-l border-green-800 p-4 flex flex-col items-center justify-center">
        <p className="text-green-500 text-center text-lg animate-pulse">💾 Matrix Panel</p>
      </div> */}
      <div className="w-[20%] h-full bg-black border-l border-green-800 p-6 flex flex-col items-start justify-center space-y-6">
        <h2 className="text-green-400 text-3xl font-bold uppercase text-center animate-pulse">
          Digite a cor da sua equipe
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
  );
}
