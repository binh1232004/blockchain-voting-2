import { useEffect, useState } from 'react';
import useVoting from './useVoting';
/**
 * 
 * @description this hook used to do thing involve in metamask
 */
export default function useMetaMask(openNotificationWithIcon){
    if(!openNotificationWithIcon)
        throw new Error('useMetaMask hook needs argument')
    const [userWalletAddress, setUserWalletAddress] = useState(undefined);
    const {updateCurrentToken}  = useVoting();
    const [typeNotification, messageNotification, descriptionNotification] = [
        'error', 
        'Sorry, no Ethereum wallet was detected.', 
        "Please install MetaMask"
    ];    /**
     * 
     * @returns { Promise<string|void> }  Promise object represent address of user's wallet
     */    const connectSetUserWallet = async () => {
        try {
            // if user do not have MetaMask, open notification for user know
            if(!window.ethereum){
               openNotificationWithIcon(typeNotification, messageNotification, descriptionNotification);
               return;
            }
            // request user to connect to their ethereum accounts by metamask
            const [selectedWallet] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setUserWalletAddress(selectedWallet);
            
         
            
            // Show success notification
            openNotificationWithIcon("success", "Wallet Connected", `Connected to ${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}`, 3);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            
            // Handle specific error cases
            if (error.code === 4001) {
                openNotificationWithIcon("warning", "Connection Rejected", "User rejected the connection request", 3);
            } else if (error.code === -32002) {
                openNotificationWithIcon("info", "Connection Pending", "Please check MetaMask for a pending connection request", 5);
            } else {
                openNotificationWithIcon("error", "Connection Failed", `Failed to connect wallet: ${error.message || 'Unknown error'}`, 5);
            }
        }
    }    /**
     * @description handle account changed
     */
    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            try {
                openNotificationWithIcon("info", "Changed account", "You've successfully changed account", 2)
                setUserWalletAddress(accounts[0]);
                if (accounts[0]) {
                    updateCurrentToken(accounts[0]);
                }
            } catch (error) {
                console.error('Error handling account change:', error);
                openNotificationWithIcon("error", "Account Change Error", "Failed to update account information", 3);
            }
        }
        
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
        }
        
        return () => {
            if(window.ethereum)
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
    }, [])
    return {
        userWalletAddress,
        setUserWalletAddress,
        connectSetUserWallet
    };
}
