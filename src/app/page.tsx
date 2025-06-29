// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to profile
    if (!loading && currentUser) {
      router.push('/profile');
    }
  }, [currentUser, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  // If user is not logged in, show landing page
  if (!currentUser) {
    return <LandingPage />;
  }

  // This shouldn't render due to the useEffect redirect, but just in case
  return null;
}


// src/app/page.tsx
// 'use client';

// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function Home() {
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect to login page
//     router.push('/login');
//   }, [router]);

//   return (
//     <div className="loading-container">
//       <div className="spinner">Loading...</div>
//     </div>
//   );
// }