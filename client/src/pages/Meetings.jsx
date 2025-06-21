import { useEffect } from "react";

const Meetings = () => {
  useEffect(() => {
    window.location.href = "https://meet.systemnotfound.xyz";
  }, []);

  return(
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Animations */}
      <p className="text-lg ">Redirecting...</p>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse delay-200" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
  );
};

export default Meetings;
