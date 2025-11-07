"use client";
import { useRouter } from "next/navigation";
import Spline from "@splinetool/react-spline";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row items-center text-center md:text-left px-6 md:px-12 relative z-10">
        {/* Left Side - Text and Button */}
        <div className="md:w-1/2 mb-8 md:mb-0 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-400/30 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse mr-2"></span>
            <span className="text-orange-300 text-sm font-medium">
              AI-Powered Interview Practice
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 text-transparent bg-clip-text animate-gradient">
              AceMock
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl">
            Master your interview skills with{" "}
            <span className="text-orange-400 font-semibold">
              AI-driven feedback
            </span>{" "}
            and real-time practice sessions.
          </p>

          {/* Features List */}
          <div className="flex flex-col md:flex-row gap-4 text-left pt-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span className="text-gray-300 text-sm">Real-time Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span className="text-gray-300 text-sm">Personalized Tips</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span className="text-gray-300 text-sm">Track Progress</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* <p className="text-slate-400 text-sm mt-3">
              No credit card required • Start practicing in seconds
            </p> */}
          </div>
        </div>

        {/* Right Side - Spline 3D Model */}
        <div className="md:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-[600px] h-[500px] flex justify-center items-center relative">
            {/* Glow effect behind 3D model */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 to-red-500/15 rounded-full filter blur-3xl"></div>

            {/* 3D Model Container */}
            <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden border border-gray-700/50 backdrop-blur-sm bg-gray-800/30 shadow-2xl">
              <Spline scene="https://prod.spline.design/2HNnWZeEu7QY5R6X/scene.splinecode" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
