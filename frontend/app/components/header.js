'use client';

import Link from "next/link";
import Image from "next/image";

export default function Header(){
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
              </div>            </Link>
            
          </div>
        </header>
     )
}