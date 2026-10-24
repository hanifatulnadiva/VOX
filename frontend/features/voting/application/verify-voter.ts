import type { VerifiedVoter } from "../domain/types";

export type VerifyVoterInput = {
  nim: string;
  walletAddress: string;
};

export type VoterVerificationPort = {
  verify(input: VerifyVoterInput): Promise<VerifiedVoter>;
};

export async function verifyVoter(
  input: VerifyVoterInput,
  port: VoterVerificationPort,
): Promise<VerifiedVoter> {
  const nim = input.nim.trim();

  if (!nim) {
    throw new Error("NIM wajib diisi.");
  }

  if (nim.length > 11) {
    throw new Error("NIM maksimal 11 karakter.");
  }

  if (!input.walletAddress) {
    throw new Error("Hubungkan wallet terlebih dahulu.");
  }

  return port.verify({
    nim,
    walletAddress: input.walletAddress,
  });
}