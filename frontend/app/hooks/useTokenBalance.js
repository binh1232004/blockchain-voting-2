'use client';

import { useState, useEffect } from 'react';
import useEthers from './useEthers';

export default function useTokenBalance(userWalletAddress) {
    const [balance, setBalance] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const { getReadOnlyTokenContract, transformWeiToEther } = useEthers();

    const fetchBalance = async () => {
        if (!userWalletAddress) {
            setBalance('0');
            return;
        }

        setIsLoading(true);
        try {
            const tokenContract = getReadOnlyTokenContract();
            const rawBalance = await tokenContract.balanceOf(userWalletAddress);
            const formattedBalance = transformWeiToEther(rawBalance);
            setBalance(parseFloat(formattedBalance).toFixed(2));
        } catch (error) {
            console.error('Error fetching token balance:', error);
            setBalance('0');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [userWalletAddress]);

    return {
        balance,
        isLoading,
        refetchBalance: fetchBalance
    };
}
