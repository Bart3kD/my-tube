import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-red-600 hover:text-red-700">
                YourTube
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link 
                  href="/upload" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Upload
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">YourTube</h3>
              <p className="text-gray-600 text-sm">
                A modern video platform for sharing and discovering amazing content.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-gray-900">Browse Videos</Link></li>
                <li><Link href="/upload" className="text-gray-600 hover:text-gray-900">Upload</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <SignedOut>
                  <li><SignInButton><span className="text-gray-600 hover:text-gray-900 cursor-pointer">Sign In</span></SignInButton></li>
                </SignedOut>
                <SignedIn>
                  <li><Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link></li>
                </SignedIn>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 mt-8">
            <p className="text-center text-gray-600 text-sm">
              © 2025 YourTube. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}