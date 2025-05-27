"use client";
import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseMarkdownCriteria } from "@/app/utils";
import useSWRCustom from "@/app/hooks/useSWRCustom";
import useNotificationCustom from "@/app/hooks/useNotificationCustom";
import useVoting from "@/app/hooks/useVoting";
import useMetaMask from "@/app/hooks/useMetaMask";
import useOERVote from "@/app/hooks/useOERVote";

export default function EvaluationPage({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [mounted, setMounted] = useState(false);
    
    // Data hooks
    const { oer, error, isLoading } = useSWRCustom();
    const { openNotificationWithIcon, contextHolder } = useNotificationCustom();
    const { userWalletAddress, connectSetUserWallet } = useMetaMask(openNotificationWithIcon);
    const { updateCurrentToken, userToken, voteTokens } = useVoting(openNotificationWithIcon);
    const { setOneOERVoteFromEthereum } = useOERVote();    // Evaluation state
    const [evaluationCriteria, setEvaluationCriteria] = useState(null);
    const [evaluationRatings, setEvaluationRatings] = useState({});
    const [activeEvaluationTab, setActiveEvaluationTab] = useState("content");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalTokens, setTotalTokens] = useState(0);

    // Handle client-side mounting to prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update total tokens whenever ratings change
    useEffect(() => {
        if (Object.keys(evaluationRatings).length > 0) {
            const calculated = calculateTotalTokens();
            setTotalTokens(calculated);
        } else {
            setTotalTokens(0);
        }
    }, [evaluationRatings]);

    // Load evaluation criteria from markdown file
    const loadEvaluationCriteria = useCallback(async () => {
        try {
            const response = await fetch("/evaluation_criteria.md");
            const markdown = await response.text();
              // Parse markdown using the utility function
            const parsedCriteria = parseMarkdownCriteria(markdown);
            console.log("Parsed criteria structure:", parsedCriteria);
            setEvaluationCriteria(parsedCriteria);
        } catch (error) {
            console.error("Error loading evaluation criteria:", error);
            openNotificationWithIcon(
                "error",
                "Error",
                "Failed to load evaluation criteria.",
                3
            );
        }
    }, [openNotificationWithIcon]);

    useEffect(() => {
        loadEvaluationCriteria();
    }, [loadEvaluationCriteria]);

    // Update token balance when wallet connects
    useEffect(() => {
        if (userWalletAddress) {
            updateCurrentToken(userWalletAddress);
        }
    }, [userWalletAddress, updateCurrentToken]);

    // Helper function to get total criteria count
    const getTotalCriteriaCount = () => {
        if (!evaluationCriteria) return 0;
        return Object.values(evaluationCriteria).reduce(
            (total, section) => total + section.criteria.length,
            0
        );
    };

    // Helper function to check if all criteria are rated
    const areAllCriteriaRated = () => {
        const totalCriteria = getTotalCriteriaCount();
        const ratedCriteria = Object.keys(evaluationRatings).length;
        return totalCriteria > 0 && ratedCriteria === totalCriteria;
    };

    const handleRatingChange = (criterion, rating) => {
        setEvaluationRatings((prev) => ({
            ...prev,
            [criterion]: rating,
        }));
    };

    const handleConnectWallet = async () => {
        try {
            await connectSetUserWallet();
        } catch (error) {
            console.error("Error connecting wallet:", error);
            openNotificationWithIcon(
                "error",
                "Connection Error",
                "Failed to connect wallet. Please try again.",
                3
            );
        }
    };    // Token distribution based on detailed voting structure
    const getTokenDistribution = () => {
        const tokenDistribution = {
            'content': {
                'accuracyofprofession': [0.15, 0.30, 0.45, 0.60, 0.75], // Accuracy of Professional Content
                'updateswithmoderntec': [0.15, 0.30, 0.45, 0.60, 0.75], // Updates with Modern Technology
                'practicalityandappli': [0.15, 0.30, 0.45, 0.60, 0.75], // Practicality and Application
                'completenessandcompr': [0.15, 0.30, 0.45, 0.60, 0.75]  // Completeness and Comprehensiveness
            },
            'design': {
                'learningcontentorgan': [0.13, 0.27, 0.40, 0.53, 0.67], // Learning Content Organization
                'presentationandlayou': [0.13, 0.27, 0.40, 0.53, 0.67], // Presentation and Layout
                'userguidance': [0.13, 0.26, 0.40, 0.53, 0.66]          // User Guidance
            },
            'technical': {
                'sourcecodeandexample': [0.20, 0.40, 0.60, 0.80, 1.00], // Source Code and Example Quality
                'practiceandtestingen': [0.20, 0.40, 0.60, 0.80, 1.00]  // Practice and Testing Environment
            },
            'assessment': {
                'assessmenttools': [0.40, 0.80, 1.20, 1.60, 2.00]       // Assessment Tools
            },
            'usability': {
                'errornotificationsan': [0.10, 0.20, 0.30, 0.40, 0.50], // Error Notifications and Guidance
                'technicalissues': [0.10, 0.20, 0.30, 0.40, 0.50]        // Technical Issues
            }
        };
        return tokenDistribution;
    };// Calculate total tokens based on ratings
    const calculateTotalTokens = useCallback(() => {
        const tokenDistribution = getTokenDistribution();
        let totalTokens = 0;

        console.log("Current evaluationRatings:", evaluationRatings);
        console.log("Token distribution:", tokenDistribution);

        Object.keys(evaluationRatings).forEach(criterion => {
            const rating = evaluationRatings[criterion];
            console.log(`Processing criterion: "${criterion}" with rating: ${rating}`);
            
            // Find which category this criterion belongs to
            let found = false;
            for (const [category, criteria] of Object.entries(tokenDistribution)) {
                if (criteria[criterion]) {
                    const tokenValue = criteria[criterion][rating - 1]; // rating is 1-5, array is 0-4
                    totalTokens += tokenValue;
                    console.log(`Found ${criterion} in ${category}, adding ${tokenValue} tokens`);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.warn(`Criterion "${criterion}" not found in token distribution`);
            }
        });

        console.log("Total tokens calculated:", totalTokens);
        return Math.round(totalTokens * 100) / 100; // Round to 2 decimal places
    }, [evaluationRatings]);

    const handleSubmitEvaluation = async () => {
        if (!userWalletAddress) {
            openNotificationWithIcon(
                "error",
                "Wallet Not Connected",
                "Please connect your wallet to submit an evaluation.",
                3
            );
            return;
        }

        const totalCriteria = getTotalCriteriaCount();
        const ratedCriteria = Object.keys(evaluationRatings).length;

        if (ratedCriteria === 0) {
            openNotificationWithIcon(
                "error",
                "No Ratings Provided",
                "Please rate at least one criterion before submitting.",
                3
            );
            return;
        }

        if (ratedCriteria < totalCriteria) {
            openNotificationWithIcon(
                "error",
                "Incomplete Evaluation",
                `Please rate all criteria before submitting. You have rated ${ratedCriteria} out of ${totalCriteria} criteria.`,
                4
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate total tokens based on ratings and detailed voting structure
            const totalTokens = calculateTotalTokens();
            
            // Check if user has enough tokens
            if (userToken.balance < totalTokens) {
                openNotificationWithIcon(
                    "error",
                    "Insufficient Tokens",
                    `You need ${totalTokens} tokens to submit this evaluation but only have ${userToken.balance} tokens.`,
                    4
                );
                setIsSubmitting(false);
                return;
            }            // Get the numeric OER ID for blockchain voting
            const detailOer = oer.data.find((item) => item.slug === unwrappedParams.slug);
            if (!detailOer || !detailOer.id) {
                throw new Error("Unable to find OER ID for blockchain voting");
            }
            
            // Submit blockchain vote with calculated tokens using numeric ID
            await voteTokens(detailOer.id, totalTokens, userWalletAddress);

            // Calculate average rating for OER vote
            const ratings = Object.values(evaluationRatings);
            const averageRating =
                ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

            // Submit evaluation to traditional voting system
            await setOneOERVoteFromEthereum(
                unwrappedParams.slug,
                Math.round(averageRating)
            );

            openNotificationWithIcon(
                "success",
                "Evaluation Submitted",
                `Your evaluation has been submitted successfully! Average rating: ${averageRating.toFixed(1)}/5`,
                3
            );

            // Navigate back to the OER detail page
            router.push(`/oer/${unwrappedParams.slug}`);
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            openNotificationWithIcon(
                "error",
                "Submission Failed",
                "Failed to submit your evaluation. Please try again.",
                3
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't render until mounted to prevent hydration issues
    if (!mounted) {
        return null;
    }

    if (error) {
        console.log("Error loading OER data:", error);  
        return (
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
    }

    if (isLoading) {
        return (
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
    }

    const detailOer = oer.data.find((item) => item.slug === unwrappedParams.slug);

    if (!detailOer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Resource Not Found</h2>
                    <p className="text-gray-600">The educational resource you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {contextHolder}

            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={`/oer/${unwrappedParams.slug}`}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back to Resource</span>
                        </Link>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <h1 className="text-xl font-semibold text-gray-800">Evaluate Resource</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Resource Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">{detailOer.title}</h2>
                            <p className="text-gray-600 text-sm">You&apos;re about to evaluate this educational resource</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Your Balance</p>
                            <p className="text-lg font-bold text-gray-800">
                                {userToken?.balance ? userToken.balance.toFixed(2) : "0.00"} OERT
                            </p>
                        </div>
                    </div>
                </div>

                {/* Evaluation Form */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    {!userWalletAddress ? (
                        /* Wallet Connection Prompt */
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                To evaluate this educational resource and submit your vote, you need to connect your MetaMask wallet first.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link
                                    href={`/oer/${unwrappedParams.slug}`}
                                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200"
                                >
                                    Go Back
                                </Link>
                                <button
                                    onClick={handleConnectWallet}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Connect Wallet</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="px-6 pt-6">
                                <div className="flex space-x-1 mb-6 overflow-x-auto">
                                    {evaluationCriteria &&
                                        Object.entries(evaluationCriteria).map(([key, { title, icon }]) => (
                                            <button
                                                key={key}
                                                onClick={() => setActiveEvaluationTab(key)}
                                                className={`flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
                                                    activeEvaluationTab === key
                                                        ? "bg-blue-600 text-white shadow-lg"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                <span className="text-lg">{icon}</span>
                                                <span className="whitespace-nowrap">{title}</span>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Evaluation Content */}
                            <div className="px-6 pb-6">
                                {!evaluationCriteria ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600 text-lg">Loading evaluation criteria...</p>
                                    </div>
                                ) : (
                                    Object.entries(evaluationCriteria).map(
                                        ([key, { title, icon, criteria }]) =>
                                            activeEvaluationTab === key && (
                                                <div key={key} className="space-y-8">
                                                    <div className="text-center py-6">
                                                        <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center space-x-3 mb-2">
                                                            <span className="text-3xl">{icon}</span>
                                                            <span>{title}</span>
                                                        </h3>
                                                        <p className="text-gray-600">Rate each criterion from 1 (Poor) to 5 (Excellent)</p>
                                                    </div>

                                                    {criteria.map(({ key: criterionKey, title: criterionTitle, descriptions }) => (
                                                        <div key={criterionKey} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                            <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">{criterionTitle}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                                {descriptions.map((description, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => handleRatingChange(criterionKey, index + 1)}
                                                                        className={`p-5 rounded-xl text-sm transition-all duration-200 border-2 hover:shadow-lg transform hover:-translate-y-1 ${
                                                                            evaluationRatings[criterionKey] === index + 1
                                                                                ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 shadow-lg scale-105"
                                                                                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
                                                                        }`}
                                                                    >
                                                                        <div className="text-center">
                                                                            <div className={`font-bold text-3xl mb-3 ${
                                                                                evaluationRatings[criterionKey] === index + 1
                                                                                    ? "text-white"
                                                                                    : "text-green-600"
                                                                            }`}>
                                                                                {index + 1}
                                                                            </div>
                                                                            <div className="leading-tight font-medium">{description}</div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                    )
                                )}                            </div>

                            {/* Token Calculation Display */}
                            {userWalletAddress && Object.keys(evaluationRatings).length > 0 && (
                                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Tokens Required for This Evaluation</p>
                                                <p className="text-xs text-gray-500">Based on your current ratings</p>
                                            </div>
                                        </div>                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {totalTokens} OERT
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Balance: {userToken?.balance ? userToken.balance.toFixed(2) : "0.00"} OERT
                                            </p>
                                            {userToken?.balance && totalTokens > userToken.balance && (
                                                <p className="text-xs text-red-500 font-medium">⚠️ Insufficient balance</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        {evaluationCriteria && Object.keys(evaluationRatings).length > 0 && (
                                            <span>
                                                Progress: {Object.keys(evaluationRatings).length} / {getTotalCriteriaCount()} criteria rated
                                                {areAllCriteriaRated() && (
                                                    <span className="ml-2 text-green-600 font-semibold">✓ Complete</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={`/oer/${unwrappedParams.slug}`}
                                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            onClick={handleSubmitEvaluation}
                                            disabled={!evaluationCriteria || !areAllCriteriaRated() || isSubmitting}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                                        >
                                            {isSubmitting && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            )}
                                            <span>
                                                {isSubmitting ? "Submitting..." : "Submit Evaluation & Vote"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
