"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { getElectionAddress, voxElectionAbi } from "../infrastructure/vox-election";

export function useVoting() {
  const { address, chainId } = useAccount();
  const contractAddress = getElectionAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const candidatesCountQuery = useReadContract({
    address: contractAddress,
    abi: voxElectionAbi,
    functionName: "candidatesCount",
    query: { enabled: Boolean(contractAddress) },
  });

  async function vote(candidateId: bigint) {
    if (!address) {
      throw new Error("Hubungkan wallet terlebih dahulu.");
    }

    if (chainId !== monadTestnet.id) {
      throw new Error("Pindahkan wallet ke Monad Testnet.");
    }

    if (!contractAddress) {
      throw new Error("Alamat kontrak belum diatur.");
    }

    return writeContractAsync({
      address: contractAddress,
      abi: voxElectionAbi,
      functionName: "vote",
      args: [candidateId],
    });
  }

  return {
    contractAddress,
    candidatesCount: candidatesCountQuery.data,
    isLoadingCandidates: candidatesCountQuery.isPending,
    candidatesError: candidatesCountQuery.error,
    vote,
    isVoting: isPending,
    voteError: error,
  };
}