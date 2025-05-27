'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
// import { useTranslations } from 'next-intl'; // For UI elements, not question content directly here yet

// Define a more specific Question type based on expected data
interface QuestionOption {
  id: string; // Or number, depending on your data
  text: string;
}

interface QuestionTextData { // If question_text is a JSON object
  stem: string;
  options?: QuestionOption[]; // Only for multiple-choice
  // Add other language-specific fields if necessary e.g. image_url
}

interface Question {
  id: string; // Or number
  parsed_question_text: QuestionTextData; // After processing/translation
  type: 'multiple-choice' | 'descriptive'; // Explicit type
  topic: string | null;
  unit: string | null;
  difficulty: string | null;
  question_text_translations: any; // JSONB, structure e.g., { "en": { "stem": "...", "options": [...] } }
  question_text: string | QuestionTextData; // Raw from DB, could be JSON string or object
  // Add other fields from your 'questions' table as needed (e.g., solution, hints)
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, session } = useAuth();
  
  const questionId = params.id as string;
  const currentLocale = params.locale as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true); // For question data fetching
  const [error, setError] = useState<string | null>(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false); // Tracks if initial auth check is done

  // const t = useTranslations('QuestionPractice'); // For UI like buttons, labels

  useEffect(() => { // Effect for authentication check
    if (!authLoading) {
      if (!session || !user) {
        // User is not authenticated, redirect to sign-in page
        // Constructing locale-aware path, though next-intl middleware might also handle this
        router.replace(`/${currentLocale}/auth/sign-in`);
      } else {
        // User is authenticated
        setAuthCheckComplete(true);
      }
    }
  }, [user, session, authLoading, router, currentLocale]);

  useEffect(() => { // Effect for fetching question data, runs after auth check is complete
    if (!authCheckComplete || !questionId) return; // Don't fetch if auth isn't confirmed or no ID

    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('questions')
          .select('*') // Select all fields for now
          .eq('id', questionId)
          .single();

        if (dbError) {
          throw dbError;
        }

        if (data) {
          let parsedText: QuestionTextData;
          const rawQuestionText = data.question_text; 
          const translations = data.question_text_translations;

          let contentToUse: string | QuestionTextData | undefined = undefined;

          if (translations && translations[currentLocale]) {
            contentToUse = translations[currentLocale];
          } else if (rawQuestionText) {
            contentToUse = rawQuestionText;
          }
          
          if (typeof contentToUse === 'object' && contentToUse !== null) {
            // If contentToUse is already an object (e.g. from translations or if rawQuestionText is an object)
            parsedText = contentToUse as QuestionTextData;
          } else if (typeof contentToUse === 'string') {
            // If contentToUse is a string, try to parse it as JSON
            // This handles cases where rawQuestionText or a translation string is stringified JSON
            try {
              parsedText = JSON.parse(contentToUse);
            } catch (e) {
              // If parsing fails AND it's a descriptive question, assume the string is the stem
              if (data.type === 'descriptive') {
                parsedText = { stem: contentToUse };
              } else {
                console.error('Failed to parse question_text string:', e);
                throw new Error('Question data is not in the expected format (stringified JSON or direct object).');
              }
            }
          } else {
             // Fallback or error if no usable content is found
            if (data.type === 'descriptive' && typeof rawQuestionText === 'string' && rawQuestionText.trim() !== '') {
                // Final fallback for descriptive if everything else failed but raw text is a simple string
                parsedText = { stem: rawQuestionText };
            } else {
                console.error('No valid question content found for parsing.');
                throw new Error('No question content available.');
            }
          }
          
          // Ensure options are an array if type is multiple-choice
          if (data.type === 'multiple-choice' && !Array.isArray(parsedText.options)) {
            parsedText.options = []; // Default to empty options if missing or wrong type
          }


          setQuestion({
            ...data, // Spread all fields from the fetched data
            parsed_question_text: parsedText,
          } as Question); // Assert type after processing

        } else {
          throw new Error('Question not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch question.');
        console.error("Error in fetchQuestion:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, authCheckComplete, currentLocale]); // Rerun if ID, auth status, or locale changes

  // Combined loading state: wait for auth check first, then question data loading
  if (authLoading || !authCheckComplete || loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading question...</p></div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-red-500">Error: {error}</p></div>;
  }

  if (!question) {
    // This case should ideally be covered by error state if fetch failed,
    // but as a fallback if question is somehow null without an error.
    return <div className="flex min-h-screen items-center justify-center"><p>Question not found or not loaded correctly.</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Topic: {question.topic || 'N/A'} | Unit: {question.unit || 'N/A'} | Difficulty: {question.difficulty || 'N/A'}
        </p>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">{question.parsed_question_text.stem}</h1>

      <div className="mb-8">
        {question.type === 'multiple-choice' && question.parsed_question_text.options ? (
          <ul className="space-y-2">
            {question.parsed_question_text.options.map((option, index) => ( // Added index for key if option.id is not unique/guaranteed
              <li key={option.id || `option-${index}`} className="p-3 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                {option.text}
              </li>
            ))}
          </ul>
        ) : question.type === 'descriptive' ? (
          <div>
            <textarea 
              rows={5} 
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white" 
              placeholder="Type your answer here..."
            />
          </div>
        ) : (
          <p>Unsupported question type: {question.type}</p>
        )}
      </div>

      <div className="mt-8 space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {/* {t('submitAnswerButton') } */} Submit Answer (Placeholder)
        </button>
        <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400">
          {/* {t('askAIButton') } */} Ask AI (Placeholder)
        </button>
      </div>
       <div className="mt-4">
        <p className="text-sm text-gray-500">Difficulty Selection (Placeholder): Easy | Medium | Hard</p>
      </div>
    </div>
  );
}
