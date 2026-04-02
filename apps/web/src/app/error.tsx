'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
      <p className="text-sm text-gray-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-green-600 px-4 py-2 text-white"
      >
        Try Again
      </button>
    </div>
  );
}
