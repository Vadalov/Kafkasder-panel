import { redirect } from 'next/navigation';

export default function HomePage() {
  // Server-side redirect to login page
  // This avoids hydration mismatch by redirecting on the server
  redirect('/login');
}
