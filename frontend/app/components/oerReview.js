'use client'
import Link from "next/link"
import Image from "next/image"
import { isValidUrl } from "../utils"
import useOERVote from "../hooks/useOERVote"
import { useEffect } from "react"

export default function OerReview({title, imgUrl, route, vote, order }){
    const OER_COVER_DEFAULT = '/oerTextBookCover.png';
    
    // Determine if this is a featured resource (top 3 with votes)
    const isFeatured = order <= 2 && vote > 0;
    
    return (
        <Link href={route} className="group block h-full">
            <div className={`relative h-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border ${isFeatured ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-blue-300'}`}>
                {/* Featured Badge */}
                {isFeatured && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span>#{order + 1}</span>
                        </div>
                    </div>
                )}

                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Image
                        src={isValidUrl(imgUrl) ? imgUrl : OER_COVER_DEFAULT}     
                        width={300}
                        height={200}
                        alt="Educational Resource Cover"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between h-32">
                    <div className="flex-1">
                        <h3 className={`font-semibold text-sm leading-tight mb-2 line-clamp-3 transition-colors duration-200 ${isFeatured ? 'text-yellow-800 group-hover:text-yellow-900' : 'text-gray-800 group-hover:text-blue-600'}`}>
                            {title}
                        </h3>
                    </div>
                    
                    {/* Vote Section */}
                    <div className={`w-full rounded-lg p-3 text-center transition-all duration-200 ${isFeatured ? 'bg-gradient-to-r from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100'}`}>
                        <div className="flex items-center justify-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    {vote > 0 ? (
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    ) : (
                                        <path fillRule="evenodd" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-3a1 1 0 00-.867.5L8 9H6a1 1 0 000 2h2l1.133 1.5A1 1 0 0010 12V8z" clipRule="evenodd"/>
                                    )}
                                </svg>
                            </div>                            <span className={`font-bold text-sm ${isFeatured ? 'text-yellow-700' : 'text-blue-700'}`}>
                                {Number(vote).toFixed(2)} {vote === 1 ? 'Vote' : 'Votes'}
                            </span>
                        </div>
                        
                        {vote === 0 && (
                            <p className="text-xs text-gray-500 mt-1">Be the first to vote!</p>
                        )}
                    </div>
                </div>

                {/* Bottom Gradient Border Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}></div>
            </div>
        </Link>
    )
}