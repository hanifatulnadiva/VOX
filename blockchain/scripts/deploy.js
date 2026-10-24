
import { network } from "hardhat";

const connection = await network.create();
const { ethers } = connection;

async function main() {
  const candidateNames = [
    "Kandidat A",
    "Kandidat B",
    "Kandidat C",
  ];

  const election = await ethers.deployContract(
    "VoxElection",
    [candidateNames]
  );

  await election.waitForDeployment();

  console.log(
    "VoxElection deployed to:",
    await election.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
