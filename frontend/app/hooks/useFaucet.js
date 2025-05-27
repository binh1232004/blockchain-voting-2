import useEthers from "./useEthers";

/**
 * @todo Use faucet still need eth to pay for gas fee
 * @param {*} openNotificationWithIcon 
 * @returns 
 */
export default function useFaucet(openNotificationWithIcon){
    const {getSignedFaucetContract}= useEthers();
    const ERROR_COOLDOWN = "Wait for next request";
    const ERROR_FAUCET_EMPTY = "Faucet is empty";
    const ERROR_UNKNOWN = "Unknown error";
    const MESSAGE_SUCCESS = "You've claimed 0.1 ETH";
    const requestEth = async () => {
        try{ 
            const faucetContract = await getSignedFaucetContract();
            const tx = await faucetContract.requestEth();
            await tx.wait();
            openNotificationWithIcon('info',"SUCCESS", MESSAGE_SUCCESS);
        }catch(error){
            const message = error.message; 
            if(message.includes(ERROR_COOLDOWN)) 
                openNotificationWithIcon('error', 'ERROR', ERROR_COOLDOWN);
            else if(message.includes(ERROR_FAUCET_EMPTY))
                openNotificationWithIcon('error', 'ERROR', ERROR_FAUCET_EMPTY);
            else
                openNotificationWithIcon('error', 'ERROR', ERROR_UNKNOWN);
        }
    }
    return {
        requestEth,
    }
}