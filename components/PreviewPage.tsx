import React, { useState, useEffect } from 'react';
import type { Presentation, Slide, InfographicData, InfographicType } from '../types';

// -- Sub-components defined in the same file for cohesion --

// Renders a simple, elegant bar chart placeholder
const BarChart: React.FC<{ data: InfographicData }> = ({ data }) => {
  const maxValue = Math.max(...(data.values || [0]));
  return (
    <div className="w-full h-full p-4 border border-black/10 flex flex-col justify-end space-y-2">
      <h4 className="text-sm font-bold tracking-widest uppercase text-center mb-4">{data.title}</h4>
      <div className="flex-grow flex items-end justify-around">
        {(data.values || []).map((value, index) => (
          <div key={index} className="flex flex-col items-center w-1/5">
            <div className="w-full bg-black/10" style={{ height: `${(value / maxValue) * 100}%` }}></div>
            <p className="text-xs mt-2 text-black/60">{data.labels?.[index]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Renders a large statistic for impact
const Statistic: React.FC<{ data: InfographicData }> = ({ data }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center">
    <p className="font-serif text-7xl md:text-9xl font-bold">{data.value}<span className="text-5xl">{data.unit}</span></p>
    <p className="text-lg md:text-xl uppercase tracking-widest mt-4">{data.title}</p>
  </div>
);

// Renders a minimalist timeline
const Timeline: React.FC<{ data: InfographicData }> = ({ data }) => (
  <div className="w-full h-full p-8 flex flex-col justify-center">
      <h4 className="text-sm font-bold tracking-widest uppercase text-center mb-8">{data.title}</h4>
      <div className="relative border-l border-black/20 pl-6 space-y-10">
          {(data.years || []).map((year, index) => (
              <div key={index} className="relative">
                  <div className="absolute -left-[30px] top-1 w-2 h-2 rounded-full bg-black"></div>
                  <p className="font-bold text-lg">{year}</p>
                  <p className="text-md text-black/70">{data.values?.[index]}</p>
              </div>
          ))}
      </div>
  </div>
);

// Dispatches to the correct infographic component
const InfographicDisplay: React.FC<{ type: InfographicType; data: InfographicData }> = ({ type, data }) => {
  switch (type) {
    case 'bar chart': return <BarChart data={data} />;
    case 'statistic highlight': return <Statistic data={data} />;
    case 'timeline': return <Timeline data={data} />;
    default: return <div className="p-4 border border-black/10 text-center text-black/50">Infographic: {type}</div>;
  }
};


// Renders the full slide content within the modal
const SlideDetailView: React.FC<{ slide: Slide }> = ({ slide }) => {
  const imageUrl = `https://picsum.photos/seed/${slide.image_prompt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}/1280/720`;
  const hasVisual = slide.layout.startsWith('visual') && slide.image_prompt;
  const hasData = slide.layout === 'data-centric' && slide.infographic && slide.data;

  const textContent = (
    <div className="flex flex-col justify-center p-12 md:p-16">
      <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-widest">{slide.title}</h2>
      {slide.subtitle && <p className="font-sans text-xl mt-4 text-black/70">{slide.subtitle}</p>}
      <ul className="space-y-4 mt-8">
        {slide.bullets.map((point, index) => (
          <li key={index} className="font-sans text-lg md:text-xl">{point}</li>
        ))}
      </ul>
    </div>
  );

  const visualContent = hasVisual ? (
    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}></div>
  ) : hasData ? (
    <div className="p-12"><InfographicDisplay type={slide.infographic!} data={slide.data!} /></div>
  ) : null;

  if (slide.layout === 'title-only') {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center p-16">
            <h1 className="font-serif text-5xl md:text-7xl uppercase tracking-[0.2em]">{slide.title}</h1>
            {slide.subtitle && <p className="font-sans text-2xl mt-6 text-black/80">{slide.subtitle}</p>}
        </div>
    );
  }

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
      {slide.layout === 'visual-left' ? (
        <>
          {visualContent}
          {textContent}
        </>
      ) : (
        <>
          {textContent}
          {visualContent}
        </>
      )}
    </div>
  );
};

// The modal component that displays the slide detail
const SlideDetailModal: React.FC<{ slide: Slide; onClose: () => void }> = ({ slide, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-6xl aspect-video bg-white shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 font-sans text-black text-2xl leading-none">&times;</button>
        <SlideDetailView slide={slide} />
      </div>
       <style>{`.animate-fade-in { animation: fadeIn 0.3s ease; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

// Thumbnail card for the main grid view
const SlideCard: React.FC<{ slide: Slide; onClick: () => void }> = ({ slide, onClick }) => {
    const hasVisual = slide.layout.startsWith('visual') && slide.image_prompt;
    const imageUrl = `https://picsum.photos/seed/${slide.image_prompt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}/400/300`;

    return (
        <button onClick={onClick} className="w-full aspect-[4/3] bg-white p-4 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-black/10">
            <div className="w-full h-full flex flex-col text-left overflow-hidden">
                <h3 className="font-serif text-lg tracking-wider truncate mb-2">{slide.title}</h3>
                {hasVisual ? (
                    <div className="flex-grow bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}></div>
                ) : (
                    <div className="flex-grow text-xs text-black/60 font-sans space-y-1">
                        {slide.bullets.slice(0, 3).map((b, i) => <p key={i} className="truncate">&bull; {b}</p>)}
                    </div>
                )}
            </div>
        </button>
    );
};


// -- Main Preview Page Component --

interface PreviewPageProps {
  presentation: Presentation;
  onExport: () => void;
  onBack: () => void;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ presentation, onExport, onBack }) => {
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen w-full transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <header className="fixed top-0 left-0 right-0 bg-[#F8F8F2]/80 backdrop-blur-sm z-40">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center p-4 md:p-6">
          <button onClick={onBack} className="font-sans tracking-wider text-sm uppercase transition-opacity duration-300 hover:opacity-60 group">
            &larr; New Topic
          </button>
          <button onClick={onExport} className="font-sans tracking-wider text-sm uppercase transition-opacity duration-300 hover:opacity-60 group">
            Export to .pptx
          </button>
        </div>
      </header>
      
      <main className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {presentation.slides.map((slide, index) => (
                <SlideCard key={index} slide={slide} onClick={() => setSelectedSlide(slide)} />
            ))}
        </div>
      </main>

      {selectedSlide && <SlideDetailModal slide={selectedSlide} onClose={() => setSelectedSlide(null)} />}
    </div>
  );
};

export default PreviewPage;
