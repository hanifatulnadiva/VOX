export type VerifiedVoter = {
  nama: string;
  nim: string;
};

export type Candidate = {
  id: bigint;
  name: string;
  voteCount: bigint;
};