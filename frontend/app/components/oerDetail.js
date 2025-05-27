"use client";
import useNotificationCustom from "../hooks/useNotificationCustom";
import Image from "next/image";
import useMetaMask from "../hooks/useMetaMask";
import { isValidUrl } from "../utils";
import { useEffect, useState } from "react";
import useToken from "../hooks/useToken";
import useVoting from "../hooks/useVoting";
import useOERVote from "../hooks/useOERVote";
import useFaucet from "../hooks/useFaucet";
import { useRouter } from "next/navigation";
export default function OerDetail({
    title,
    imgUrl,
    description,
    oerId,
    author,
    slug, // Add slug prop
}) {
    const router = useRouter();
    const { openNotificationWithIcon, contextHolder } = useNotificationCustom();
    const [visibleBackgroundAuthor, setVisibleBackgroundAuthor] =
        useState(null);
    const [isVisibleDescriptionOER, setIsVisibleDescriptionOER] =
        useState(false);

    const { userWalletAddress, connectSetUserWallet } = useMetaMask(
        openNotificationWithIcon
    );
    const { inforToken, intializeGeneralInforToken } = useToken();

    const { updateCurrentToken, userToken, claimVotingTokens, voteTokens } =
        useVoting(openNotificationWithIcon);

    const { setOneOERVoteFromEthereum, oneOERVote } = useOERVote(oerId);
    useEffect(() => {
        if (userWalletAddress) updateCurrentToken(userWalletAddress);
    }, [userWalletAddress, updateCurrentToken]);

    useEffect(() => {
        setOneOERVoteFromEthereum();
    }, [setOneOERVoteFromEthereum]);
    const handleHoverAuthor = (index, isHovering) => {
        setVisibleBackgroundAuthor(isHovering ? index : null);
    };
    const handleButtonVisibleDescriptionOER = () => {
        setIsVisibleDescriptionOER(!isVisibleDescriptionOER);
    };
    const handleConnectWalletButton = async () => {
        try {
            await connectSetUserWallet();
            if (userWalletAddress) {
                await intializeGeneralInforToken();
            }
        } catch (error) {
            console.error("Error in connect wallet button:", error);
            openNotificationWithIcon(
                "error",
                "Connection Error",
                "Failed to connect wallet or initialize token information",
                5
            );
        }
    };
    const handleVoteButton = async () => {
        try {
            await voteTokens(oerId, 1, userWalletAddress);
            await setOneOERVoteFromEthereum();
            openNotificationWithIcon(
                "success",
                "Vote Successful",
                "Your vote has been recorded!",
                3
            );
        } catch (error) {
            console.error("Error voting:", error);
            openNotificationWithIcon(
                "error",
                "Vote Failed",
                `Failed to vote: ${error.message || "Unknown error"}`,
                5
            );
        }
    };
    const handleClaimVotingTokensButton = async () => {
        try {
            await claimVotingTokens(userWalletAddress);
            openNotificationWithIcon(
                "success",
                "Tokens Claimed",
                "Successfully claimed 10 voting tokens!",
                3
            );
        } catch (error) {
            console.error("Error claiming tokens:", error);
            openNotificationWithIcon(
                "error",
                "Claim Failed",
                `Failed to claim tokens: ${error.message || "Unknown error"}`,
                5
            );
        }
    };
    console.log(author);

    const OER_COVER_DEFAULT = "/oerTextBookCover.png";

    const handleEvaluateButtonClick = () => {
        if (!userWalletAddress) {
            openNotificationWithIcon(
                "error",
                "Wallet Not Connected",
                "Please connect your wallet to evaluate this resource.",
                3
            );
            return;
        }

        // Navigate to evaluation page
        router.push(`/oer/${slug}/evaluation`);
    };
    return (
        <div className="relative overflow-hidden">
            {contextHolder}

            {/* Modern Card Layout */}
            <div className="flex flex-col lg:flex-row gap-8 p-8">
                {/* Book Cover Section */}
                <div className="lg:w-1/3">
                    <div className="group relative">
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-6 h-96 flex items-center justify-center transform transition-all duration-300 group-hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Image
                                src={
                                    isValidUrl(imgUrl)
                                        ? imgUrl
                                        : OER_COVER_DEFAULT
                                }
                                width={280}
                                height={320}
                                alt="Educational Resource Cover"
                                className="rounded-lg shadow-lg object-cover relative z-10"
                            />
                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Vote Count Badge */}
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-4 py-2 font-bold text-sm shadow-lg z-20">
                            <div className="flex items-center space-x-1">
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{Number(oneOERVote).toFixed(2)} OERT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="lg:w-2/3 space-y-6">
                    {/* Title Section */}
                    <div className="space-y-4">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                            {title}
                        </h1>

                        {/* Authors Section */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                Authors
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {author.map((item, index) => (
                                    <div key={index} className="relative group">
                                        <button
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200 hover:border-blue-300"
                                            onMouseOver={() =>
                                                handleHoverAuthor(index, true)
                                            }
                                            onMouseOut={() =>
                                                handleHoverAuthor(index, false)
                                            }
                                        >
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {item.fullName}
                                        </button>

                                        {/* Author Background Tooltip */}
                                        <div
                                            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 z-50 ${
                                                visibleBackgroundAuthor ===
                                                index
                                                    ? "block"
                                                    : "hidden"
                                            }`}
                                        >
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4">
                                                <div className="text-sm text-gray-600">
                                                    {item.background}
                                                </div>
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Wallet & Voting Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        {!userWalletAddress ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Connect Your Wallet
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Connect your MetaMask wallet to participate
                                    in voting
                                </p>
                                <button
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    onClick={handleConnectWalletButton}
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Connect Wallet
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Token Balance */}
                                <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Your Balance
                                            </p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {(
                                                    userToken.balance || 0
                                                ).toFixed(2)}{" "}
                                                OERT
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClaimVotingTokensButton}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>{" "}
                                        <span>Claim 10 Tokens</span>
                                    </button>
                                </div>
                                {/* Evaluation & Vote Button */}
                                <button
                                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    onClick={handleEvaluateButtonClick}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                    <span>Evaluate & Vote</span>
                                    <div className="bg-white/20 rounded-full px-2 py-1 text-sm">
                                        Submit Review
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Description
                            </h3>
                            <div className="h-px bg-gray-300 flex-1"></div>
                        </div>

                        <div
                            className={`relative ${
                                !isVisibleDescriptionOER
                                    ? "max-h-48 overflow-hidden"
                                    : ""
                            }`}
                        >
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-600 leading-relaxed text-base">
                                    {description}
                                </p>
                            </div>

                            {!isVisibleDescriptionOER && (
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                            )}
                        </div>

                        <button
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                            onClick={handleButtonVisibleDescriptionOER}
                        >
                            <span>
                                {isVisibleDescriptionOER
                                    ? "Read less"
                                    : "Read more"}
                            </span>
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                    isVisibleDescriptionOER ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>{" "}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
