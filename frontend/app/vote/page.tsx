"use client";

import { useState, useEffect } from "react";

interface Candidate {
  id: number;
  name: string;
  vision?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VotePage() {
  const [nim, setNim] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch(`${API_URL}/api/candidates`);
        if (res.ok) {
          const data = await res.json();
          setCandidates(data);
        } else {
          setCandidates([
            { id: 1, name: "Kandidat A" },
            { id: 2, name: "Kandidat B" },
            { id: 3, name: "Kandidat C" },
          ]);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar kandidat:", error);
        setCandidates([
          { id: 1, name: "Kandidat A" },
          { id: 2, name: "Kandidat B" },
          { id: 3, name: "Kandidat C" },
        ]);
      }
    }
    fetchCandidates();
  }, []);

  const handleVerifyNIM = async () => {
    if (!nim) {
      setStatusMessage("Masukkan NIM terlebih dahulu.");
      return;
    }

    setLoading(true);
    setStatusMessage("Memverifikasi NIM...");

    try {
      const res = await fetch(`${API_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim }),
      });

      if (res.ok) {
        setIsVerified(true);
        setStatusMessage("NIM terverifikasi! Silakan pilih kandidat.");
      } else {
        setStatusMessage("Verifikasi gagal atau NIM tidak terdaftar.");
      }
    } catch {
      setStatusMessage("Gagal menghubungi server backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId: number) => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setStatusMessage("Install ekstensi MetaMask terlebih dahulu!");
      return;
    }

    try {
      setStatusMessage("Membuka MetaMask...");
      const provider = (window as any).ethereum;
      await provider.request({ method: "eth_requestAccounts" });

      setStatusMessage("Menunggu konfirmasi transaksi di Monad Testnet...");
      // Simulasi interaksi smart contract / transaksi blockchain di sini

      setStatusMessage("Transaksi sukses! Mengunci status vote di database...");
      
      await fetch(`${API_URL}/api/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, candidateId }),
      });

      setStatusMessage("Terima kasih, suara Anda telah masuk ke kotak suara blockchain!");
    } catch {
      setStatusMessage("Transaksi dibatalkan atau terjadi kesalahan.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        
        <div className="text-center border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Pemilihan Ketua BEM - VOX
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Sistem Pemilihan Elektronik Terintegrasi Blockchain
          </p>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium text-center">
            {statusMessage}
          </div>
        )}

        {/* Step 1: Verifikasi NIM */}
        {!isVerified ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">1. Verifikasi Identitas</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Masukkan NIM Anda"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
              <button
                onClick={handleVerifyNIM}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? "Memeriksa..." : "Verifikasi"}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Pilih Kandidat */
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">2. Pilih Kandidat Ketua BEM</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500 transition shadow-sm bg-slate-50/50"
                >
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                      Kandidat #{candidate.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{candidate.name}</h3>
                  </div>
                  <button
                    onClick={() => handleVote(candidate.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow"
                  >
                    Vote
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}