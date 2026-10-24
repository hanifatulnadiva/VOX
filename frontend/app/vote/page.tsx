"use client";

import { useState } from "react";
import { ethers } from "ethers";
import VoxElectionABI from "../../utils/VoxElectionABI.json";

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
        body: JSON.stringify({ nim }),
      });

      setStatusMsg("Terima kasih, suara Anda telah masuk ke kotak suara blockchain!");
      setIsEligible(false); // Sembunyikan tombol kandidat agar tidak ditekan lagi
    } catch (error) {
      setStatusMsg("Transaksi dibatalkan atau terjadi kesalahan.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Pemilihan Ketua BEM - VOX</h1>
      
      {!isEligible ? (
        <div>
          <input 
            type="text" 
            placeholder="Masukkan NIM Anda" 
            value={nim} 
            onChange={(e) => setNim(e.target.value)} 
          />
          <button onClick={handleVerifyNim}>Masuk</button>
        </div>
      ) : (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => handleVote(1)}>Vote Kandidat A</button>
          <button onClick={() => handleVote(2)}>Vote Kandidat B</button>
          <button onClick={() => handleVote(3)}>Vote Kandidat C</button>
        </div>
      )}

      <p style={{ marginTop: "20px", fontWeight: "bold" }}>{statusMsg}</p>
    </div>
  );
}