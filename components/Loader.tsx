import React, { useState, useEffect } from 'react';

const Loader: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length < 3 ? d + '.' : ''));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="font-serif text-2xl uppercase tracking-[0.3em]">
        Generating{dots}
      </p>
    </div>
  );
};

export default Loader;
