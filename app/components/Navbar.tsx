'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

/**
 * @dev Navbar component for displaying the navigation bar.
 * @returns A React component that renders the navigation bar.
 */
export default function Navbar() {
  // Get the user and logout function from the authentication context.
  const { user, logout } = useAuth();
  const router = useRouter();

  /**
   * @dev Handles the logout action.
   */
  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-black">
                Customer Support GPT
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}