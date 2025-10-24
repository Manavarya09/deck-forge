
import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onGenerate: (topic: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 text-center transition-opacity duration-1000" style={{ opacity: isVisible ? 1 : 0 }}>
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6">
          Generate decks that speak for you.
        </h1>
        <p className="font-sans text-lg md:text-xl font-light text-[#111] max-w-xl mx-auto mb-12">
          Type a topic. Watch AI craft your slides. Precision, clarity, and design — all in black and white.
        </p>
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic..."
            className="w-full px-0 py-3 text-center bg-transparent text-xl md:text-2xl font-sans placeholder:text-black/30 focus:outline-none border-b border-black"
          />
          <button
            type="submit"
            disabled={!topic.trim()}
            className="mt-10 font-sans tracking-wider text-sm uppercase transition-opacity duration-300 enabled:hover:opacity-60 disabled:opacity-30 group"
          >
            Generate Slides
            <span className="block h-[1px] bg-black max-w-0 group-hover:max-w-full transition-all duration-500"></span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
