"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full bg-red-50 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-red-900 text-center mb-2">
              Application Error
            </h2>

            <p className="text-sm text-red-700 text-center mb-6">
              {error.message ||
                "A critical error occurred. Please refresh the page."}
            </p>

            {error.digest && (
              <p className="text-xs text-red-600 text-center mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Try again
              </button>

              <Link
                href="/dashboard"
                className="w-full bg-white hover:bg-gray-50 text-red-600 font-medium py-2.5 px-4 rounded-lg border border-red-200 text-center transition-colors duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
