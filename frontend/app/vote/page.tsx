"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import VoxElectionABI from "../../utils/VoxElectionABI.json";

const CANDIDATES = [
  { id: 1, name: "Kandidat A", tag: "A" },
  { id: 2, name: "Kandidat B", tag: "B" },
  { id: 3, name: "Kandidat C", tag: "C" },
];

export default function VoxVotingPage() {
  const [nim, setNim] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // 1. Fase Gatekeeper (Memanggil API Backend)
  const handleVerifyNim = async () => {
    setStatusMsg("Memverifikasi NIM...");
    try {
      const res = await fetch("http://localhost:3000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim }),
      });
      const data = await res.json();

      if (data.success) {
        setIsEligible(true);
        setStatusMsg("NIM terverifikasi! Silakan pilih kandidat.");
      } else {
        setStatusMsg(data.message);
      }
    } catch (error) {
      setStatusMsg("Gagal menghubungi server backend.");
    }
  };

  // 2. Fase Blockchain & Sinkronisasi (Menggunakan Ethers.js)
  const handleVote = async (idKandidat: number) => {
    if (!(window as any).ethereum) return alert("Install ekstensi MetaMask terlebih dahulu!");

    setStatusMsg("Membuka MetaMask...");
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
      const contract = new ethers.Contract(contractAddress, VoxElectionABI.abi, signer);

      // Eksekusi transaksi ke smart contract Monad
      setStatusMsg("Menunggu konfirmasi transaksi di Monad Testnet...");
      const tx = await contract.vote(idKandidat);
      await tx.wait(); 

      // 3. Fase Penguncian (Memanggil API Backend)
      setStatusMsg("Transaksi sukses! Mengunci status vote di database...");
      await fetch("http://localhost:3000/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, wallet_address: walletAddress }),
      });

      setStatusMsg("Terima kasih, suara Anda telah masuk ke kotak suara blockchain!");
      setIsEligible(false); // Sembunyikan tombol kandidat agar tidak ditekan lagi
    } catch (error) {
      setStatusMsg("Transaksi dibatalkan atau terjadi kesalahan.");
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <div className="w-full max-w-xl space-y-6 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
          Monad Testnet Secured
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pemilihan Ketua BEM - VOX
        </h1>
        <p className="text-slate-300 text-base">
          {isEligible
            ? "Pilih satu kandidat. Suara tidak dapat diubah setelah dikirim."
            : "Masukkan NIM untuk memastikan Anda terdaftar sebagai pemilih."}
        </p>
 
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg backdrop-blur">
          {!isEligible ? (
            <div className="space-y-4">
              <label htmlFor="nim" className="block text-sm font-medium text-slate-300">
                NIM
              </label>
              <input
                id="nim"
                type="text"
                placeholder="Masukkan NIM Anda"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                onClick={handleVerifyNim}
                className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/25"
              >
                Masuk
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {CANDIDATES.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/20 text-lg font-bold text-indigo-300">
                      {c.tag}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-slate-400">Kandidat nomor {c.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVote(c.id)}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/25"
                  >
                    Vote {c.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {statusMsg && (
          <p className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-200">
            {statusMsg}
          </p>
        )}
 
        <Link
          href="/"
          className="inline-block text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}