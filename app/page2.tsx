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
    <div className="h-screen w-screen flex">
      {/* Left 80% side with grid */}
      <div className="w-[80%] h-full grid grid-cols-3 grid-rows-3 gap-10 p-6 box-border">
        {cards.map((card) => (
          <div key={card.id} className="bg-white shadow rounded-lg flex flex-col overflow-hidden">
            {/* Top: Name + Number */}
            <div className="flex items-center px-3 py-1 flex-none h-[10%] text-3xl font-extrabold text-gray-800 border-b">
              <span>#{card.id} </span>
              <span> {card.name}</span>
            </div>

            {/* Likes row */}
            <div className="flex text-2xl items-center justify-start gap-2 px-3 py-1 flex-none h-[10%] border-b text-red-600">
              <span>❤️</span>
              <span>{card.life}</span>
            </div>

            {/* Image (60%) */}
            <div className="h-[60%] w-full flex items-center justify-center overflow-hidden bg-gray-100">
              <Image
                src={card.image}
                alt={card.name}
                width={200}
                height={200}
                className="object-fit h-full w-full"
              />
            </div>

            {/* Bottom (20%) - 3 Columns */}
            <div className="flex flex-1 divide-x border-t">
              <div className="flex-1 flex items-center justify-center text-xs">Col 1</div>
              <div className="flex-1 flex items-center justify-center text-xs">Col 2</div>
              <div className="flex-1 flex items-center justify-center text-xs">Col 3</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right 20% side */}
      <div className="w-[20%] h-full bg-gray-100 p-4">
        {/* <p className="text-center text-gray-500">Right Panel</p> */}
      </div>
    </div>
  );
}
