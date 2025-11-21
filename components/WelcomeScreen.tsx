
import React from 'react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center animate-in fade-in duration-700">
      <div className="relative mb-8 group cursor-default">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-full group-hover:bg-blue-500/30 transition-all duration-1000"></div>
        
        {/* The Orb */}
        <div className="relative w-32 h-32">
            {/* Spinning Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 border-t-blue-400 animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute inset-3 rounded-full border-2 border-purple-500/40 border-b-purple-400 animate-[spin_5s_linear_infinite_reverse]"></div>
            
            {/* Core */}
            <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center shadow-2xl overflow-hidden border border-blue-400/30 backdrop-blur-md">
                 {/* Inner shine */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-blue-400/20 to-transparent pointer-events-none"></div>
                
                {/* Logo Text */}
                <span className="text-5xl font-bold text-white select-none tracking-tighter transform -translate-y-0.5 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                    7
                </span>
            </div>
        </div>
      </div>
      
      <h1 className="text-2xl font-semibold text-white mb-3 tracking-tight">
        How can I help you?
      </h1>
    </div>
  );
};
