"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (sessionStorage.getItem("admin_auth") === "true") {
            setIsAuthorized(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "na2626") {
            sessionStorage.setItem("admin_auth", "true");
            setIsAuthorized(true);
            setError("");
        } else {
            setError("Acesso Negado. Senha incorreta.");
            setPassword("");
        }
    };

    if (!isMounted) return null;

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-green-400 p-4">
                <div className="bg-black border-2 border-green-500 rounded-xl p-10 max-w-md w-full shadow-[0_0_40px_rgba(0,255,100,0.2)] flex flex-col items-center">
                    <Image src="/imgs/logo.gif" alt="Logo" width={80} height={80} className="mb-6" />
                    <h1 className="text-2xl font-black uppercase tracking-widest text-center mb-6" style={{ textShadow: "0 0 10px #00ff66" }}>
                        Acesso Restrito
                    </h1>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha..."
                            className="w-full bg-black border border-green-700 rounded p-3 text-center text-green-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 bg-green-900/50 hover:bg-green-800 text-green-300 border border-green-500 rounded-md transition-all shadow-[0_0_15px_#00ff6644] hover:shadow-[0_0_25px_#00ff66] uppercase font-bold tracking-widest mt-2"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
