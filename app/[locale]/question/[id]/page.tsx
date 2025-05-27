import {useTranslations} from 'next-intl';

// This page will be dynamic based on the question ID
export default function QuestionPage({ params }: { params: { id: string, locale: string } }) {
  // const t = useTranslations('QuestionPractice'); // Namespace for future translations
  return (
    <div>
      <h1>Question ID: {params.id}</h1>
      <p>Locale: {params.locale}</p>
      {/* Placeholder for question display and interaction */}
      {/* <p>{t('submitAnswer')}</p> */}
    </div>
  );
}
