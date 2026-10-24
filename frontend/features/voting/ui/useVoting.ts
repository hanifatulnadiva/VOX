"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { getElectionAddress, voxElectionAbi } from "../infrastructure/vox-election";

export function useVoting() {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();
  const election = useMemo(() => getElectionAddress(), []);
  const contractAddress = election.address;

  const candidatesCountQuery = useReadContract({
    address: contractAddress,
    abi: voxElectionAbi,
    functionName: "candidatesCount",
    chainId: monadTestnet.id,
    query: { enabled: Boolean(contractAddress) },
  });

  async function vote(candidateId: bigint) {
    if (!address) {
      throw new Error("Hubungkan wallet terlebih dahulu.");
    }

    if (!contractAddress) {
      throw new Error(election.error ?? "Alamat kontrak belum diatur.");
    }

    if (chainId !== monadTestnet.id) {
      await switchChainAsync({ chainId: monadTestnet.id });
    }

    return writeContractAsync({
      address: contractAddress,
      abi: voxElectionAbi,
      functionName: "vote",
      args: [candidateId],
      chainId: monadTestnet.id,
    });
  }

  return {
    contractAddress,
    configError: election.error,
    candidatesCount: candidatesCountQuery.data,
    isLoadingCandidates: candidatesCountQuery.isLoading,
    candidatesError: candidatesCountQuery.error,
    vote,
    isVoting: isPending,
  };
}