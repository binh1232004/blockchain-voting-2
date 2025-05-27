'use client';
import {  useState } from 'react';
import useEthers from './useEthers';
import {ethers} from "ethers"
/**
 * @param {function|undefined} openNotificationWithIcon
 * @description this hook used to do thing involve with vote 
 */
export default function useVoting(openNotificationWithIcon){
    const ERROR_MESSAGE_TIME = "Waiting for next claim";
    const ERROR_MESSAGE_MAX_USER_TOKEN = "Max tokens per user reached";
    const ERROR_MESSAGE_MAX_TOKEN = "Max tokens reached";
    /**
     * State to store user's token information
     * @type {[{balance: number}, React.Dispatch<React.SetStateAction<TokenInfo>>]}
     */
    const [userToken, setUserToken] = useState({});
    const {
        getSignedTokenContract,
        getSignedVotingContract,
        transformWeiToEther,
        transformEtherToWei
    } = useEthers();

    /**
     * 
     * @param {string} userAddress 
     */
    const updateCurrentToken = async (userAddress) => {
        const tokenContract = await getSignedTokenContract(userAddress);
        const balance = await tokenContract.balanceOf(userAddress);
        const actualBalance = Number(transformWeiToEther( balance ));
        setUserToken({ balance: actualBalance })
    }
    /**
     * 
     * @param {string} userAddress 
     * @description claim for user with 10 tokens
     */
    const claimVotingTokens = async (userAddress) => {
        try{ 
            const tokenContract = await getSignedTokenContract(userAddress);
            const tx = await tokenContract.claimVotingTokens();
            await tx.wait();
            await updateCurrentToken(userAddress);
        }catch(error){
            console.log(error.message);
            const errorMessage = error.message;
            if(errorMessage.includes(ERROR_MESSAGE_TIME))
                openNotificationWithIcon("error", "ERROR", ERROR_MESSAGE_TIME, 2);
            else if(errorMessage.includes(ERROR_MESSAGE_MAX_USER_TOKEN))
                openNotificationWithIcon("error", "ERROR", ERROR_MESSAGE_MAX_USER_TOKEN, 2);
            else if(errorMessage.includes(ERROR_MESSAGE_MAX_TOKEN))
                openNotificationWithIcon("error", "ERROR", ERROR_MESSAGE_MAX_TOKEN, 2);
            else
                openNotificationWithIcon("error", "ERROR", "An unknown error", 2);


        }
    }

    /**
     * 
     * @param {number} oerId 
     * @param {number} tokenAmount 
     * @param {string} userAddress 
     */
    const voteTokens = async (oerId, tokenAmount, userAddress) => {
        try{
            // initialize contract
            const tokenContract = await getSignedTokenContract(userAddress);
            const votingContract = await getSignedVotingContract(userAddress);
            // Get and ask for amount of vote token
            const actualTokenAmount = transformEtherToWei(tokenAmount.toString());
            const votingContractAddress = await votingContract.getAddress(); 
            const approveForTransaction = await tokenContract.approve(votingContractAddress, actualTokenAmount);
            await approveForTransaction.wait();
            // Confirm for that amount
            const voteForOER = await votingContract.voteToken(oerId, actualTokenAmount);
            await voteForOER.wait();
            await updateCurrentToken(userAddress);
        } catch (error){
            console.log("Error in voteTokens:", error);
            throw error;
        }
    }

    return {
        updateCurrentToken,
        setUserToken,
        userToken,
        claimVotingTokens,
        voteTokens
    };
}
