
import React from 'react';

export const ImageGenProgress: React.FC = () => {
    return (
        <div className="flex justify-center w-full py-8">
            <div className="relative group cursor-default flex flex-col items-center gap-8">
                {/* The Orb */}
                <div className="relative w-32 h-32">
                    {/* Spinning Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 border-t-blue-400 animate-[spin_4s_linear_infinite]"></div>
                    <div className="absolute inset-3 rounded-full border-2 border-purple-500/40 border-b-purple-400 animate-[spin_5s_linear_infinite_reverse]"></div>
                    
                    {/* Core */}
                    <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center shadow-2xl overflow-hidden border border-blue-400/30 backdrop-blur-md">
                        {/* Inner shine */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-blue-400/20 to-transparent pointer-events-none"></div>
                        
                        {/* Icon or Text */}
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                     <h3 className="text-lg font-medium text-white">Generating Image...</h3>
                     <p className="text-sm text-gray-400 animate-pulse">Creating your visual masterpiece</p>
                </div>
            </div>
        </div>
    );
};
