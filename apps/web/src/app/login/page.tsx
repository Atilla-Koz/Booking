'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      router.push('/');
    } catch (caught: unknown) {
      if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError('Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Log In</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        {error ? <ErrorMessage message={error} /> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
