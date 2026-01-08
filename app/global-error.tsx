"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
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

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Xin lỗi, đã có sự cố xảy ra. Chúng tôi đã được thông báo và đang xử lý.
            </p>

            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <Button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
