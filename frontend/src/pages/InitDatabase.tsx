import { useState } from 'react';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';

interface InitDatabaseProps {
  onComplete: () => void;
}

export function InitDatabase({ onComplete }: InitDatabaseProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);

    try {
      const response = await fetch(
        'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-769bc21d/seed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed database');
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-gray-900 text-2xl mb-2">Initialize Database</h1>
          <p className="text-gray-600 text-sm">
            This will create the admin account and seed initial questions into the database.
          </p>
        </div>

        {!success && !error && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Admin Credentials:</strong>
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>Email: <code className="bg-blue-100 px-1 rounded">admin@example.com</code></li>
                <li>Password: <code className="bg-blue-100 px-1 rounded">admin123</code></li>
              </ul>
            </div>

            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSeeding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Initializing...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Initialize Database
                </>
              )}
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-800">
              Database initialized successfully! Redirecting...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium mb-1">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={handleSeed}
                  className="mt-3 text-sm text-red-700 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
