import {Button, Result} from 'antd';
import Link from 'next/link';
export default function NoWalletMessage(){
    return (
        <Result
            status="500"
            title="500"
            subTitle="Sorry, no Ethereum wallet was detected. "
            extra={
                <div>
                    <span>Please install {" "}</span>
                    <Link href="http://metamask.io" target='_blank' className='text-red-400'>MetaMask</Link>
                </div>
            }
        />
    )
}