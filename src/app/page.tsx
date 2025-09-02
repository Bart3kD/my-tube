import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-red-600">
                YourTube
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/upload" className="text-gray-700 hover:text-gray-900">
                  Upload
                </Link>
                <Link href="/videos" className="text-gray-700 hover:text-gray-900">
                  Videos
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to YourTube Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload, share, and discover amazing videos
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Upload Videos</h3>
              <p className="text-gray-600 mb-4">Share your content with the world</p>
              <Link 
                href="/upload" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
              >
                Start Uploading
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Browse Videos</h3>
              <p className="text-gray-600 mb-4">Discover amazing content</p>
              <Link 
                href="/videos" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md inline-block"
              >
                Browse Now
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Your Channel</h3>
              <p className="text-gray-600 mb-4">Manage your content</p>
              <SignedOut>
                <SignInButton>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md">
                    Sign In to Continue
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md inline-block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}