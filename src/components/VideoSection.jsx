import React from 'react';

const VideoSection = () => {
  return (
    <div className="py-20 px-6 bg-gradient-to-br from-[#1c0f2e] via-[#2c1338] to-[#170f2e]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white">
          Conoce{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Indasocial
          </span>
        </h2>

        <div className="rounded-2xl p-[3px] bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 shadow-2xl shadow-fuchsia-900/40">
          <div className="rounded-[calc(1rem-1px)] overflow-hidden bg-black">
            <video
              src="/video/trailer-inda.mp4"
              controls
              preload="metadata"
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;