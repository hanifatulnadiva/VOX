// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VoxElection {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    constructor(string[] memory candidateNames) {
        for (uint i = 0; i < candidateNames.length; i++) {
            addCandidate(candidateNames[i]);
        }
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint _candidateId) public {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Kandidat tidak valid");
        candidates[_candidateId].voteCount++;
    }

    function getCandidate(uint _candidateId) public view returns (uint, string memory, uint) {
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }
}