"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Question = {
    id: number;
    prompt: string;
    alt1: string;
    alt2: string;
    alt3: string;
    alt4: string;
    alt5: string;
    answer: number;
};

export default function QuestionsAdmin() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        prompt: "",
        alt1: "",
        alt2: "",
        alt3: "",
        alt4: "",
        alt5: "",
        answer: 1,
    });

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions");
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (e) {
            console.error("Failed to fetch questions", e);
        }
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchQuestions();
    }, []);

    if (!isMounted) return null; // Avoid hydration mismatch

    const handleOpenForm = (q?: Question) => {
        if (q) {
            setEditingId(q.id);
            setFormData({
                prompt: q.prompt,
                alt1: q.alt1,
                alt2: q.alt2,
                alt3: q.alt3,
                alt4: q.alt4,
                alt5: q.alt5,
                answer: q.answer,
            });
        } else {
            setEditingId(null);
            setFormData({ prompt: "", alt1: "", alt2: "", alt3: "", alt4: "", alt5: "", answer: 1 });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "answer" ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch("/api/questions", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                handleCloseForm();
                fetchQuestions();
            } else {
                alert("Failed to save question");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving question");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja apagar esta pergunta?")) return;

        try {
            const res = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchQuestions();
            } else {
                alert("Falha ao apagar");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao apagar");
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8 selection:bg-green-900 selection:text-green-100">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b border-green-800 pb-4">
                    <div className="flex items-center gap-4">
                        <Image src="/imgs/logo.gif" alt="Logo" width={60} height={60} />
                        <h1 className="text-3xl font-black uppercase tracking-widest" style={{ textShadow: "0 0 10px #00ff66" }}>
                            Admin: Perguntas
                        </h1>
                    </div>

                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-green-900/50 hover:bg-green-800 text-green-300 border border-green-500 px-6 py-2 rounded-md transition-all shadow-[0_0_15px_#00ff6644] hover:shadow-[0_0_25px_#00ff66]"
                    >
                        + NOVA PERGUNTA
                    </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-green-900 bg-black/50 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-green-950/80 border-b border-green-800">
                                <th className="p-4 w-16 text-center">ID</th>
                                <th className="p-4">Pergunta</th>
                                <th className="p-4 w-32 text-center">Resposta</th>
                                <th className="p-4 w-48 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-green-700">Nenhuma pergunta encontrada no banco de dados.</td>
                                </tr>
                            ) : questions.map(q => (
                                <tr key={q.id} className="border-b border-green-900/50 hover:bg-green-900/20 transition-colors">
                                    <td className="p-4 text-center font-bold">{q.id}</td>
                                    <td className="p-4">
                                        <div className="text-sm text-green-300 mb-2 truncate max-w-xl">{q.prompt}</div>
                                        <div className="flex gap-2 text-xs opacity-60">
                                            <span className={q.answer === 1 ? "text-green-400 font-bold" : ""}>1: {q.alt1.substring(0, 15)}...</span>
                                            <span className={q.answer === 2 ? "text-green-400 font-bold" : ""}>2: {q.alt2.substring(0, 15)}...</span>
                                            <span className={q.answer === 3 ? "text-green-400 font-bold" : ""}>3: {q.alt3.substring(0, 15)}...</span>
                                            <span className={q.answer === 4 ? "text-green-400 font-bold" : ""}>4: {q.alt4.substring(0, 15)}...</span>
                                            <span className={q.answer === 5 ? "text-green-400 font-bold" : ""}>5: {q.alt5.substring(0, 15)}...</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-block bg-green-800 text-green-100 rounded-full w-8 h-8 leading-8 text-center font-bold">
                                            {q.answer}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center space-x-3">
                                        <button
                                            onClick={() => handleOpenForm(q)}
                                            className="text-yellow-500 hover:text-yellow-300 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            className="text-red-500 hover:text-red-400 transition-colors"
                                        >
                                            Apagar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-black border-2 border-green-500 rounded-xl p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(0,255,100,0.2)] max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-green-800 pb-2">
                            {editingId ? "Editar Pergunta" : "Nova Pergunta"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-green-500 mb-1">Enunciado / Pergunta</label>
                                <textarea
                                    name="prompt"
                                    value={formData.prompt}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full bg-black border border-green-700 rounded p-2 text-green-300 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num} className={num === 5 ? "md:col-span-2" : ""}>
                                        <label className="block text-sm text-green-500 mb-1">Alternativa {num}</label>
                                        <input
                                            type="text"
                                            name={`alt${num}`}
                                            value={(formData as any)[`alt${num}`]}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-black border border-green-700 rounded p-2 text-green-300 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm text-green-500 mb-1 mt-4">Alternativa Correta (1 a 5)</label>
                                <select
                                    name="answer"
                                    value={formData.answer}
                                    onChange={handleChange}
                                    className="w-full bg-green-950 border border-green-700 rounded p-2 text-green-300 focus:outline-none focus:border-green-400"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-green-800">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-6 py-2 border border-green-800 text-green-600 rounded hover:bg-green-950 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-green-700 hover:bg-green-600 text-black font-bold rounded transition-colors shadow-[0_0_15px_#00ff00]"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
