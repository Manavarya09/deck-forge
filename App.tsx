import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import PreviewPage from './components/PreviewPage';
import Loader from './components/Loader';
import { generatePresentation } from './services/geminiService';
import { exportToPptx } from './services/presentationService';
import type { Presentation } from './types';

type AppState = 'home' | 'loading' | 'preview' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (newTopic: string) => {
    setTopic(newTopic);
    setAppState('loading');
    setError(null);
    try {
      const presentationData = await generatePresentation(newTopic);
      if (presentationData && presentationData.slides.length > 0) {
        setPresentation(presentationData);
        setAppState('preview');
      } else {
        throw new Error("The generated presentation was empty. Please try a different topic.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('error');
    }
  }, []);

  const handleExport = useCallback(() => {
    if (presentation) {
      exportToPptx(presentation, topic);
    }
  }, [presentation, topic]);
  
  const handleBack = useCallback(() => {
      setPresentation(null);
      setTopic('');
      setAppState('home');
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader />;
      case 'preview':
        return presentation && <PreviewPage presentation={presentation} onExport={handleExport} onBack={handleBack} />;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center p-8">
            <h2 className="font-serif text-2xl uppercase tracking-widest mb-4">Generation Failed</h2>
            <p className="font-sans text-lg mb-8 max-w-lg">{error}</p>
            <button
              onClick={handleBack}
              className="font-sans tracking-wider text-sm uppercase transition-opacity duration-300 hover:opacity-60"
            >
              Try Again
            </button>
          </div>
        );
      case 'home':
      default:
        return <HomePage onGenerate={handleGenerate} />;
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F8F2] text-black antialiased">
        {renderContent()}
    </main>
  );
};

export default App;