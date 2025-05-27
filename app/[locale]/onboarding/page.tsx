import { useTranslations } from 'next-intl';

export default function OnboardingPage() {
  const t = useTranslations('UserOnboarding'); // Assuming 'UserOnboarding' namespace in messages
  return (
    <div>
      <h1>{t('selectCountry')}</h1>
      {/* Placeholder for country selection UI */}
    </div>
  );
}
