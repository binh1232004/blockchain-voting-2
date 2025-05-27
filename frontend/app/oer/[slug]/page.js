"use client";
import { use, useState, useEffect } from "react";
import OerDetail from "@/app/components/oerDetail";
import Link from "next/link";
import useSWRCustom from "@/app/hooks/useSWRCustom";

export default function Page({ params }) {
    const unwrappedParams = use(params);
    const [mounted, setMounted] = useState(false);
    const { oer, error, isLoading } = useSWRCustom();

    // Handle client-side mounting to prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until mounted to prevent hydration issues
    if (!mounted) {
        return null;
    }if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-600">An error has occurred while loading the content.</p>
            </div>
        </div>
    );
    
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center p-8">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto opacity-75" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
                <p className="text-gray-500">Please wait while we fetch the content for you.</p>
            </div>
        </div>
    );
    const detailOer = oer.data.find((item) => item.slug === unwrappedParams.slug);
    console.log("Detail OER:", detailOer);
    let author = [];
    detailOer.contributors.forEach((contributor) => {
        let title = contributor.title ? contributor.title + ". " : "";
        let firstName = contributor.first_name
            ? contributor.first_name + " "
            : "";
        let middleName = contributor.middle_name
            ? contributor.middle_name + " "
            : "";
        let lastName = contributor.last_name
            ? contributor.last_name + ", "
            : ", ";
        let fullName = title + firstName + middleName + lastName;
        author.push({
            fullName: fullName,
            background: contributor.background_text,
        });    });
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">                    <OerDetail
                        title={detailOer.title}
                        description={detailOer.description}
                        imgUrl={detailOer.img_url}
                        oerId={detailOer.id}
                        author={author}
                        slug={unwrappedParams.slug}
                    />
                </div>
                
                {/* Additional Actions */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/" className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span>Back to Resources</span>
                    </Link>
                    
                    <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                        </svg>
                        <span>Share Resource</span>
                    </button>
                    
                    <button className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        <span>Add to Favorites</span>
                    </button>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 -left-4 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-1/3 -right-4 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
        </div>
    );
}
