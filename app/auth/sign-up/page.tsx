"use client";
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Authentication logic here
    setTimeout(() => setIsLoading(false), 2000);
  };


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


//   <IoIosEyeOff />
// <IoMdEye />
  return (
    <div className="min-h-screen bg-galaxy bg-cover bg-center flex items-center justify-center p-4 overflow-hidden">
      <Head>
        <title>Ai-Assignment Writer</title>
      </Head>

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-[100px] opacity-20 animate-float1"></div>
        {/* <div className="absolute top-2/3 right-1/3 w-80 h-80 bg-purple-500 rounded-full filter blur-[120px] opacity-15 animate-float2"></div> */}
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500 rounded-full filter blur-[90px] opacity-15 animate-float3"></div>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-opacity-30 bg-gray-900 border border-opacity-30 border-gray-500 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-neon">
        {/* Holographic header */}
        <div className="relative h-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500 opacity-70 animate-pulse"></div>
        </div>

        <div className="p-8">
          {/* Logo/Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 mb-2">
              AI-Assignment Writer
            </div>
            <div className="text-gray-400 text-sm">AUTHENTICATION</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Name *"
                    required
                  />
                <div className="absolute right-3 top-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 100 8 4 4 0 000-8zm-7 14a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                        />
                    </svg>
                </div>

                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Email Address *"
                    required
                  />
                  <div className="absolute right-3 top-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Password *"
                    required
                  />
                  <div className="absolute right-3 top-3 text-gray-500">
                    {showPassword ? <IoIosEyeOff className="h-6 w-6 cursor-pointer" onClick={() => setShowPassword(!showPassword)} /> : <IoMdEye className="h-6 w-6 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Confirm Password *"
                    required
                  />
                  <div className="absolute right-3 top-3 text-gray-500">
                    {showConfirmPassword ? <IoIosEyeOff className="h-6 w-6 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : <IoMdEye className="h-6 w-6 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
                  </div>
                </div>
              </div>
              <>
                <div className="flex items-center justify-between mt-6 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded bg-gray-800"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                      Remember this device
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already Have An Account?{' '}
            <Link href="/auth/sign-in" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>

        {/* Holographic footer */}
        <div className="relative h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-70"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: `${Math.random() * 5 + 1}px`,
              height: `${Math.random() * 5 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '-' : ''}${Math.random() * 100}px);
            opacity: 0;
          }
        }
        
        @keyframes float1 {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float2 {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(15px);
          }
        }
        
        @keyframes float3 {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-10px) translateX(10px);
          }
        }
        
        .bg-galaxy {
          background-image: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
        }
        
        .shadow-neon {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(124, 58, 237, 0.2);
        }
        
        .animate-float1 {
          animation: float1 8s ease-in-out infinite;
        }
        
        .animate-float2 {
          animation: float2 10s ease-in-out infinite;
        }
        
        .animate-float3 {
          animation: float3 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}