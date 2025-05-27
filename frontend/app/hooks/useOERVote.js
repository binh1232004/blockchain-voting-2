'use client';

import { useEffect, useState } from "react";
import useEthers from "./useEthers";
import useSWRCustom from "./useSWRCustom";
import { compareFnToGetDecreaseVote } from "../utils";

/**
 * 
 * @param {number} oerId 
 * @description this hook used to get vote of one oer based on id
 */
export default function useOERVote(oerId, oer){
    const {getReadOnlyVotingContract} = useEthers();
    const [oneOERVote, setOneOERVote] = useState(0);
    const [OERDecreasedOnVote, setOERDecreasedOnVote] = useState([]);
    /**
     * 
     * @param {number} oerId 
     * @returns {Promise<number>} vote for one oer
     */    const setOneOERVoteFromEthereum = async () => {
        try {
            const votingContract = getReadOnlyVotingContract();
            
            // Debug: Check contract address and network
            console.log('Contract address:', await votingContract.getAddress());
            console.log('OER ID:', oerId);
            
            // Use getOerVotesInOERT to get votes in OERT units instead of wei
            const voteForOER = await votingContract.getOerVotesInOERT(oerId);
            console.log('Raw vote result (in OERT):', voteForOER);
            
            setOneOERVote(Number(voteForOER));
        } catch (error) {
            console.error('Error fetching OER vote:', error);
            setOneOERVote(0);
        }
    };

    const setDecreasedOERFromEthereum = async () => {
        if(!oer)
            return;
        // Deep Copy 
        const oerCopy = JSON.parse(JSON.stringify(oer.data));
        const length = oerCopy.length;        // Insert vote property in oerCopy
        for(let i = 0 ; i < length; i++){
            const OERId = oerCopy[i].id;
            const votingContract = getReadOnlyVotingContract();
            // Use getOerVotesInOERT to get votes in OERT units instead of wei
            const vote = await votingContract.getOerVotesInOERT(OERId);
            oerCopy[i].vote = Number(vote);
        }
        oerCopy.sort(compareFnToGetDecreaseVote);
        setOERDecreasedOnVote(oerCopy);
    };    const testContractCall = async () => {
        try {
            const votingContract = getReadOnlyVotingContract();
            const result = await votingContract.getOerVotesInOERT(1);
            console.log('Test contract call result (in OERT):', result);
        } catch (error) {
            console.error('Error in testContractCall:', error);
        }
    };
    return {
        setOneOERVoteFromEthereum,
        oneOERVote,
        setDecreasedOERFromEthereum,
        OERDecreasedOnVote,
    }
}