import { getAddress, isAddress, type Address } from "viem";

export const voxElectionAbi = [
  {
    type: "function",
    name: "candidatesCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getCandidate",
    stateMutability: "view",
    inputs: [{ name: "_candidateId", type: "uint256" }],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "string" },
      { name: "", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "vote",
    stateMutability: "nonpayable",
    inputs: [{ name: "_candidateId", type: "uint256" }],
    outputs: [],
  },
] as const;

export function getElectionAddress(): { address?: Address; error?: string } {
  const value = process.env.NEXT_PUBLIC_VOX_ELECTION_ADDRESS;

  if (!value) {
    return { error: "NEXT_PUBLIC_VOX_ELECTION_ADDRESS belum diatur." };
  }

  if (!isAddress(value)) {
    return { error: "Alamat VoxElection bukan alamat EVM yang valid." };
  }

  return { address: getAddress(value) };
}