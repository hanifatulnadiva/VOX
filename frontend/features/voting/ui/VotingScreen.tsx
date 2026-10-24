"use client";

import { useState, type FormEvent } from "react";
import { useAccount, useReadContracts, useWaitForTransactionReceipt } from "wagmi";
import type { Hash } from "viem";

import { ConnectWalletButton } from "@/features/wallet/ui/ConnectWalletButton";
import { verifyVoter } from "@/features/voting/application/verify-voter";
import type { Candidate, VerifiedVoter } from "@/features/voting/domain/types";
import { votingApi } from "@/features/voting/infrastructure/voting-api";
import {
  voxElectionAbi,
} from "@/features/voting/infrastructure/vox-election";
import { useVoting } from "@/features/voting/ui/useVoting";

export function VotingScreen() {
  const { address, isConnected } = useAccount();
  const {
    contractAddress,
    candidatesCount,
    isLoadingCandidates,
    candidatesError,
    vote,
    isVoting,
  } = useVoting();

  const [nim, setNim] = useState("");
  const [verifiedVoter, setVerifiedVoter] = useState<VerifiedVoter | null>(null);
  const [verifiedWallet, setVerifiedWallet] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [transactionHash, setTransactionHash] = useState<Hash>();

  const candidateCalls =
    contractAddress && candidatesCount !== undefined && candidatesCount <= 100n
      ? Array.from({ length: Number(candidatesCount) }, (_, index) => ({
          address: contractAddress,
          abi: voxElectionAbi,
          functionName: "getCandidate" as const,
          args: [BigInt(index + 1)] as const,
        }))
      : [];

  const candidatesQuery = useReadContracts({
    contracts: candidateCalls,
    query: { enabled: candidateCalls.length > 0 },
  });

  const receiptQuery = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const candidates: Candidate[] = (candidatesQuery.data ?? []).flatMap((item) => {
    if (item.status !== "success" || !item.result) {
      return [];
    }

    const [id, name, voteCount] = item.result;
    return [{ id, name, voteCount }];
  });

  const voterVerifiedForCurrentWallet =
    Boolean(address) && verifiedWallet === address && verifiedVoter !== null;

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerificationError("");
    setVerifiedVoter(null);
    setVerifiedWallet(null);

    if (!address) {
      setVerificationError("Hubungkan wallet terlebih dahulu.");
      return;
    }

    try {
      const result = await verifyVoter(
        { nim, walletAddress: address },
        votingApi,
      );

      setVerifiedVoter(result);
      setVerifiedWallet(address);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Verifikasi gagal.",
      );
    }
  }

  async function handleVote(candidateId: bigint) {
    setTransactionError("");
    setTransactionHash(undefined);

    if (!voterVerifiedForCurrentWallet) {
      setTransactionError("Verifikasi NIM terlebih dahulu.");
      return;
    }

    try {
      const hash = await vote(candidateId);
      setTransactionHash(hash);
    } catch (error) {
      setTransactionError(
        error instanceof Error ? error.message : "Transaksi vote gagal.",
      );
    }
  }

  return (
    <main>
      <h1>Voting VOX</h1>

      <section>
        <h2>1. Hubungkan wallet</h2>
        <ConnectWalletButton />
        {isConnected && address && (
          <p>Wallet aktif: {address}</p>
        )}
      </section>

      {isConnected && (
        <section>
          <h2>2. Verifikasi pemilih</h2>

          <form onSubmit={handleVerify}>
            <label htmlFor="nim">NIM</label>
            <input
              id="nim"
              value={nim}
              onChange={(event) => setNim(event.target.value)}
              maxLength={11}
              required
            />
            <button type="submit">Verifikasi NIM</button>
          </form>

          {verificationError && <p role="alert">{verificationError}</p>}

          {voterVerifiedForCurrentWallet && verifiedVoter && (
            <p>
              Verifikasi berhasil untuk {verifiedVoter.nama} ({verifiedVoter.nim}).
            </p>
          )}
        </section>
      )}

      {voterVerifiedForCurrentWallet && (
        <section>
          <h2>3. Pilih kandidat</h2>

          {!contractAddress && (
            <p>Alamat kontrak belum diatur di environment frontend.</p>
          )}

          {isLoadingCandidates && <p>Memuat jumlah kandidat...</p>}

          {candidatesError && (
            <p role="alert">Gagal membaca kontrak: {candidatesError.message}</p>
          )}

          {candidatesCount !== undefined && candidatesCount > 100n && (
            <p role="alert">Jumlah kandidat di luar batas yang didukung UI.</p>
          )}

          {candidatesQuery.isPending && candidateCalls.length > 0 && (
            <p>Memuat daftar kandidat...</p>
          )}

          {candidatesQuery.error && (
            <p role="alert">
              Gagal memuat kandidat: {candidatesQuery.error.message}
            </p>
          )}

          {candidates.map((candidate) => (
            <article key={candidate.id.toString()}>
              <h3>{candidate.name}</h3>
              <p>Suara: {candidate.voteCount.toString()}</p>
              <button
                type="button"
                disabled={isVoting || Boolean(transactionHash)}
                onClick={() => handleVote(candidate.id)}
              >
                {isVoting ? "Menunggu wallet..." : "Pilih kandidat"}
              </button>
            </article>
          ))}
        </section>
      )}

      {transactionError && <p role="alert">{transactionError}</p>}

      {transactionHash && (
        <section aria-live="polite">
          <p>Hash transaksi: {transactionHash}</p>
          {receiptQuery.isLoading && <p>Menunggu konfirmasi transaksi...</p>}
          {receiptQuery.isSuccess && (
            <p>
              Transaksi berhasil dicatat di blockchain. Status database belum
              diperbarui oleh backend.
            </p>
          )}
          {receiptQuery.isError && (
            <p role="alert">
              Transaksi belum terkonfirmasi: {receiptQuery.error.message}
            </p>
          )}
        </section>
      )}
    </main>
  );
}