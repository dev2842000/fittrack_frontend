import Link from 'next/link';
import AuthRedirect from './AuthRedirect';
import LandingPage from './LandingPage';

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <LandingPage />
    </>
  );
}
