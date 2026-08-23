import React, { useEffect, useState } from 'react';
import { ChevronRight, ArrowDown, ChevronLeft } from 'lucide-react';

const heroImages = [
  { name: 'alejandra', ext: 'jpg', size: '85%', bgColor: '#2b3a24' },
  { name: 'awards', ext: 'jpg', size: '85%', bgColor: '#2e2a26' },
  { name: 'justo', ext: 'png' },
  { name: 'marea', ext: 'jpg' },
  { name: 'pilou', ext: 'jpg', size: 'contain', bgColor: '#000000' },
  { name: 'talend', ext: 'png' },
  { name: 'vogue1', ext: 'png', size: '85%', bgColor: '#d8c9a3' },
];

const HeroSection = ({ onGetStarted }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (direction) => {
    setCurrentSlide((prev) => {
      const nextIndex = (prev + direction + heroImages.length) % heroImages.length;
      return nextIndex;
    });
  };

  return (
    <section className="relative flex min-h-[760px] flex-col overflow-hidden px-6 pb-20 pt-16">
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image.name}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('/images/${image.name}.${image.ext}')`,
              backgroundPosition: 'center center',
              backgroundSize: image.size || 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundColor: image.bgColor || 'transparent',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(41,26,83,0.1),_rgba(13,9,24,0.22)_58%,_rgba(7,5,17,0.32))]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#201d47]/20 via-[#2b1d52]/8 to-[#1b103a]/28" />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goToSlide(-1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 flex h-50 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#2d214d]/60 text-white shadow-xl shadow-black/30 backdrop-blur-md transition hover:scale-105 hover:bg-[#35275d]/80 md:left-12"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        type="button"
        onClick={() => goToSlide(1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 flex h-50 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#2d214d]/60 text-white shadow-xl shadow-black/30 backdrop-blur-md transition hover:scale-105 hover:bg-[#35275d]/80 md:right-12"
      >
        <ChevronRight size={28} />
      </button>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center text-center">
        <div className="inline-block rounded-2xl border border-white/20 bg-white/10 px-1 pb-3 pt-1 backdrop-blur-md">
          <h1 className="text-5xl font-black leading-none tracking-[-0.04em] text-white md:text-7xl">
            The Web3{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Social Network
            </span>
          </h1>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.45)] transition-all hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Join the community
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            About IndaToken
            <ArrowDown size={18} />
          </button>
        </div>

        <div className="mt-70 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            {heroImages.map((image, index) => (
              <button
                key={image.name}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-1 text-sm text-gray-200">
            <span>Scroll to explore</span>
            <ArrowDown className="animate-bounce-slow" size={18} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;