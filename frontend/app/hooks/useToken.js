import { useState } from 'react';
import useEthers from './useEthers';
/**
 * 
 * @description this hook used to initialize general information token like name, symbol
 */
export default function useToken(){
    
    /**
     * State to store general token information
     * @type {[{name: string, symbol: string, deployedContract: Proxy }, React.Dispatch<React.SetStateAction<TokenInfo>>]}
     */
    const [inforToken, setInforToken] = useState({});
    const {
        getSignedTokenContract,
    }  = useEthers();

    /**
     * update state inforToken token's name, symbol and deployedContract 
     */
    const intializeGeneralInforToken = async () => {
        try {
            const tokenContract = await getSignedTokenContract();
            if(!tokenContract)
                throw new Error('Contract not defined');
            const symbol = await tokenContract.symbol(); 
            const name = await tokenContract.name();
            setInforToken({
                "symbol": symbol,
                "name": name,
             });
        } catch (error) {
            console.error("Error initializing ethers:", error);
            
        }
    }
    return {
       intializeGeneralInforToken,
       inforToken 
    };
}
