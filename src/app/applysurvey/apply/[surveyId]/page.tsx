'use client'
import { useEffect, useState, use } from 'react';
import axios, { AxiosError } from 'axios';
import { Survey } from '@/app/types/survey';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle
} from "@/app/components/ui/alert-dialog";
import FormattedQuestionDisplay from '@/app/components/FormattedQuestionDisplay';
interface PageProps {
    params: Promise<{
        surveyId: string;
    }>;
}

const ApplySurveyPage = ({ params }: PageProps) => {
    const resolvedParams = use(params);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const variants = {
        enter: (direction: number) => ({
            y: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            y: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            y: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchSurveyDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8081/api/surveys/${resolvedParams.surveyId}`,
                    { signal: controller.signal }
                );
                setSurvey(response.data);
            } catch (error) {
                if (axios.isAxiosError(error) && error.name === 'CanceledError') {
                    return;
                }
                console.error('Error fetching survey details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyDetails();
        return () => controller.abort();
    }, [resolvedParams.surveyId]);

    const handleOptionSelect = (questionId: number, optionLevel: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionLevel
        }));
    };

    const handleNext = () => {
        if (survey?.questions && currentQuestionIndex < survey.questions.length - 1) {
            const currentQuestionId = survey.questions[currentQuestionIndex].id;

            if (answers[currentQuestionId] === undefined) {
                alert('Please select an answer before proceeding.');
                return;
            }

            setDirection(1);
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setDirection(-1);
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!survey?.questions || submitting || !user) return;

        try {
            setSubmitting(true);

            const allQuestionsAnswered = survey.questions.every(
                question => answers[question.id] !== undefined
            );

            if (!allQuestionsAnswered) {
                alert('Please answer all questions before submitting.');
                return;
            }

            const surveyResponse = {
                userId: user.id,
                surveyId: Number(resolvedParams.surveyId),
                answers: Object.entries(answers).map(([questionId, level]) => ({
                    questionId: Number(questionId),
                    selectedLevel: level
                }))
            };

            const responseResult = await axios.post(
                'http://localhost:8081/api/responses',
                surveyResponse,
                {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }
            );

            if (responseResult.status === 201 || responseResult.status === 200) {
                router.push(`/applysurvey/apply/${resolvedParams.surveyId}/result?new=true`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || error.message;
                alert(`Error: ${errorMessage}`);
            } else {
                alert('Failed to submit survey. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-2">Loading survey details...</span>
            </div>
        );
    }

    if (!survey || !survey.questions) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                Survey not found
            </div>
        );
    }

    const currentQuestion = survey.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Surveys
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {survey.title}
                        </CardTitle>
                        <div className="text-sm text-gray-600 mt-2">
                            Question {currentQuestionIndex + 1} of {survey.questions.length}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 overflow-hidden">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={currentQuestionIndex}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        y: { type: "tween", duration: 0.3 },
                                        opacity: { duration: 0.3 }
                                    }}
                                >
                                    <FormattedQuestionDisplay
                                        question={{
                                            content: currentQuestion.text,
                                            options: currentQuestion.options.map(option => ({
                                                level: option.level,
                                                description: option.description
                                            }))
                                        }}
                                        selectedLevel={answers[currentQuestion.id]}
                                        onAnswerSelect={(level) => handleOptionSelect(currentQuestion.id, level)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={submitting}>
                <AlertDialogContent className="flex flex-col items-center justify-center p-6 bg-white">
                    <AlertDialogTitle className="sr-only">
                        Processing Survey Responses
                    </AlertDialogTitle>
                    <div className="mb-4">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    </div>
                    <AlertDialogDescription className="text-center text-lg text-purple-600 font-medium">
                        Processing your survey responses...
                        <br />
                        <span className="text-purple-500">
                            Please wait while we calculate your results.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ApplySurveyPage;