import { useState } from 'react';
import { UserPlus, User, Lock, Mail } from 'lucide-react';

interface RegisterProps {
  onRegister: (username: string, email: string, password: string) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({
      username: false,
      email: false,
      password: false,
      confirmPassword: false
    });

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setFieldErrors({
        username: !username,
        email: !email,
        password: !password,
        confirmPassword: !confirmPassword
      });
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setFieldErrors({ username: true, email: false, password: false, confirmPassword: false });
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setFieldErrors({ username: false, email: true, password: false, confirmPassword: false });
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setFieldErrors({ username: false, email: false, password: true, confirmPassword: false });
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setFieldErrors({ username: false, email: false, password: true, confirmPassword: true });
      return;
    }

    onRegister(username, email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-xl">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-white mb-2">Math Learning Game</h1>
          <p className="text-blue-100">Create your account to start learning</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">Register</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2 text-sm">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className={`w-full pl-10 pr-4 py-3 border-2 ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2 text-sm">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full pl-10 pr-4 py-3 border-2 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`w-full pl-10 pr-4 py-3 border-2 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400`}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-4 py-3 border-2 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400`}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl active:scale-95 transition-transform shadow-lg"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}