import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-lg w-full flex flex-col items-center border border-blue-100">
        
        <h1 className="text-4xl font-extrabold text-blue-800 mb-3 text-center tracking-tight">
          Move Ahead 🚀
        </h1>
        <p className="text-gray-700 text-center mb-10 text-lg leading-relaxed">
          Take the next step in your journey. <span className="font-semibold text-blue-600">Join our community</span> and unlock new opportunities for growth and success.
        </p>
        <a
          href="/login"
          className="px-10 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
