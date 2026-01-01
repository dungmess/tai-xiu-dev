
import React from 'react';
import TaiXiuGame from './components/TaiXiuGame';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-x-hidden bg-slate-950">
      <TaiXiuGame />
    </div>
  );
};

export default App;
