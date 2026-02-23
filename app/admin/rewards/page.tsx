"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type TeamReward = {
    teamId: number;
    weapons: number;
    magnifying: number;
};

const TEAM_COLORS: Record<number, { name: string, bg: string, text: string, border: string, glow: string, btnBg: string, btnHover: string, btnBorder: string }> = {
    1: { name: "Azul", bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-500", glow: "shadow-[0_0_20px_#3b82f644]", btnBg: "bg-blue-600", btnHover: "hover:bg-blue-500", btnBorder: "border-blue-400" },
    2: { name: "Vermelho", bg: "bg-red-950/40", text: "text-red-400", border: "border-red-500", glow: "shadow-[0_0_20px_#ef444444]", btnBg: "bg-red-600", btnHover: "hover:bg-red-500", btnBorder: "border-red-400" },
    3: { name: "Verde", bg: "bg-green-950/40", text: "text-green-400", border: "border-green-500", glow: "shadow-[0_0_20px_#22c55e44]", btnBg: "bg-green-600", btnHover: "hover:bg-green-500", btnBorder: "border-green-400" },
    4: { name: "Amarelo", bg: "bg-yellow-950/40", text: "text-yellow-400", border: "border-yellow-500", glow: "shadow-[0_0_20px_#eab30844]", btnBg: "bg-yellow-600", btnHover: "hover:bg-yellow-500", btnBorder: "border-yellow-400" },
};

export default function RewardsAdmin() {
    const [rewards, setRewards] = useState<TeamReward[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    const fetchRewards = async () => {
        try {
            const res = await fetch("/api/rewards");
            const data = await res.json();
            setRewards(data.rewards || []);
        } catch (e) {
            console.error("Failed to fetch rewards", e);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        fetchRewards();
        // Auto-refresh every 10 seconds to keep admin view updated during gameplay
        const interval = setInterval(fetchRewards, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDeliver = async (teamId: number, teamName: string) => {
        if (!confirm(`Tem certeza que deseja entregar e zerar as recompensas da Equipe ${teamName}?`)) return;

        try {
            const res = await fetch(`/api/rewards?teamId=${teamId}`, { method: "DELETE" });
            if (res.ok) {
                // Optimistic UI update
                setRewards(prev => prev.map(r => r.teamId === teamId ? { ...r, weapons: 0, magnifying: 0 } : r));
            } else {
                alert("Falha ao entregar recompensas.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao entregar recompensas.");
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8 selection:bg-green-900 selection:text-green-100">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b border-green-800 pb-4">
                    <div className="flex items-center gap-4">
                        <Image src="/imgs/logo.gif" alt="Logo" width={60} height={60} />
                        <h1 className="text-3xl font-black uppercase tracking-widest" style={{ textShadow: "0 0 10px #00ff66" }}>
                            Admin: Recompensas
                        </h1>
                    </div>
                    <button
                        onClick={fetchRewards}
                        className="text-green-500 hover:text-green-300 text-sm underline transition-colors"
                    >
                        Atualizar Agora
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {rewards.map((reward) => {
                        const teamInfo = TEAM_COLORS[reward.teamId] || TEAM_COLORS[1];
                        const hasRewards = reward.weapons > 0 || reward.magnifying > 0;

                        return (
                            <div
                                key={reward.teamId}
                                className={`relative border-2 ${teamInfo.border} rounded-xl p-6 flex flex-col items-center justify-between min-h-[300px] transition-all duration-300 ${teamInfo.bg} ${hasRewards ? teamInfo.glow : 'opacity-60 grayscale'}`}
                            >
                                {/* Background scanning line effect */}
                                {hasRewards && (
                                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-20">
                                        <div className="w-full h-1 bg-white animate-scan" style={{ boxShadow: "0 0 20px 5px white" }}></div>
                                    </div>
                                )}

                                <h2 className={`text-2xl font-black uppercase tracking-widest ${teamInfo.text} mb-6`}>
                                    Equipe {teamInfo.name}
                                </h2>

                                <div className="flex-1 w-full flex flex-col items-center justify-center space-y-4">
                                    <div className="text-center w-full bg-black/60 rounded-lg py-4 border border-white/10">
                                        <div className="text-sm uppercase tracking-widest text-gray-400 mb-1">Armas</div>
                                        <div className={`text-5xl font-black ${reward.weapons > 0 ? "text-white" : "text-gray-600"}`}>
                                            {reward.weapons}
                                        </div>
                                    </div>

                                    <div className="text-center w-full bg-black/60 rounded-lg py-4 border border-white/10">
                                        <div className="text-sm uppercase tracking-widest text-gray-400 mb-1">Lupas</div>
                                        <div className={`text-5xl font-black ${reward.magnifying > 0 ? "text-white" : "text-gray-600"}`}>
                                            {reward.magnifying}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 w-full z-10">
                                    <button
                                        disabled={!hasRewards}
                                        onClick={() => handleDeliver(reward.teamId, teamInfo.name)}
                                        className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest transition-all duration-300 ${hasRewards
                                            ? `${teamInfo.btnBg} ${teamInfo.btnHover} text-white shadow-lg border border-${teamInfo.text.split('-')[1]}-400`
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {hasRewards ? "Entregar Tudo" : "ZeradO"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {rewards.length === 0 && (
                    <div className="text-center py-20 text-green-700 italic">
                        Nenhuma equipe encontrada.
                    </div>
                )}
            </div>

            <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(300px); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
        </div>
    );
}
