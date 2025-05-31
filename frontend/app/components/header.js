'use client';

import Link from "next/link";
import Image from "next/image";
import votingAddress from "../contracts/votingAddress.json";

export default function Header(){
    const contractAddress = votingAddress.Token;
    const sepoliaEtherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
    
    return( 
        <header className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 w-full h-16 lg:h-20 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            {/* Logo and Brand */}
            <Link className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200" href={"/"}>
              <div className="relative">
                <Image 
                  src={"/favicon.ico"}
                  width={40}
                  height={40}
                  alt="OER Voting System"
                  className="rounded-lg shadow-md"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-lg lg:text-xl">BEV</h1>
                <p className="text-blue-200 text-xs hidden sm:block">Blockchain E-Voting</p>
              </div>
            </Link>
            
            {/* Compact Contract Link */}
            <div className="flex items-center space-x-2">
              <a 
                href={sepoliaEtherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                title={`View contract ${contractAddress} on Sepolia Etherscan`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                <span className="hidden md:inline">Contract</span>
                <span className="md:hidden">TX</span>
              </a>
            </div>
          </div>
        </header>
     )
}