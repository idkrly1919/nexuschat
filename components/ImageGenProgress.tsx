import React from 'react';

export const ImageGenProgress: React.FC = () => {
    return (
        <div className="flex justify-center w-full py-6">
            <div className="relative group cursor-default flex flex-col items-center gap-6 p-6 rounded-2xl bg-surfaceHighlight/30 border border-white/5">
                {/* The Orb */}
                <div className="relative w-24 h-24">
                    {/* Spinning Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 border-t-blue-400 animate-[spin_3s_linear_infinite]"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-purple-500/40 border-b-purple-400 animate-[spin_4s_linear_infinite_reverse]"></div>
                    
                    {/* Core */}
                    <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center shadow-2xl overflow-hidden border border-blue-400/30 backdrop-blur-md">
                        {/* Inner shine */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-blue-400/30 to-transparent pointer-events-none animate-pulse"></div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                     <h3 className="text-sm font-semibold text-white tracking-wide">CREATING</h3>
                     <p className="text-xs text-blue-300 animate-pulse">Calling Nexus Imagineer...</p>
                </div>
            </div>
        </div>
    );
};
