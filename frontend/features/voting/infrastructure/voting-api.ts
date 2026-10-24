import type { VerifiedVoter } from "../domain/types";
import type {
  VerifyVoterInput,
  VoterVerificationPort,
} from "../application/verify-voter";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const votingApi: VoterVerificationPort = {
  async verify(input: VerifyVoterInput): Promise<VerifiedVoter> {
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL belum diatur.");
    }

    let response: Response;
    try {
      response = await fetch(`${apiUrl}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: input.nim,
          wallet_address: input.walletAddress,
        }),
      });
    } catch {
      throw new Error("Tidak dapat menghubungi server. Cek backend / CORS.");
    }

    let result: ApiResponse<VerifiedVoter> | null = null;
    try {
      result = (await response.json()) as ApiResponse<VerifiedVoter>;
    } catch {
      throw new Error(`Respons server tidak valid (HTTP ${response.status}).`);
    }

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Verifikasi pemilih gagal.");
    }

    return result.data;
  },
};