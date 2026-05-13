/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw, User, UserCheck, Zap } from 'lucide-react';

// --- Types ---

interface Problem {
  id: string;
  question: string;
  answer: number;
  options: number[];
}

enum Side {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

// --- Constants ---

const WIN_THRESHOLD = 5; // How many steps to win
const STEP_PERCENT = 20; // Visibility offset per step

// --- Utils ---

const generateProblem = (): Problem => {
  const operators = ['+', '-'];
  const op = operators[Math.floor(Math.random() * operators.length)];
  let a, b, answer;

  if (op === '+') {
    // 1-2 grade: sums up to 20
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    answer = a + b;
  } else {
    // Subtraction: positive results within 20
    a = Math.floor(Math.random() * 15) + 5;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  }

  // Generate options
  const options = new Set<number>();
  options.add(answer);
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 6) - 3; // Smaller offsets
    const alt = answer + offset;
    if (offset !== 0 && alt >= 0 && !options.has(alt)) {
      options.add(alt);
    } else {
      // Emergency generation if offsets fail
      options.add(Math.floor(Math.random() * 20));
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    question: `${a} ${op === '*' ? '×' : op} ${b}`,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

export default function App() {
  const [ropePosition, setRopePosition] = useState(0); // -WIN_THRESHOLD to WIN_THRESHOLD
  const [leftProblem, setLeftProblem] = useState<Problem>(generateProblem());
  const [rightProblem, setRightProblem] = useState<Problem>(generateProblem());
  const [winner, setWinner] = useState<Side | null>(null);
  const [pullingSide, setPullingSide] = useState<Side | null>(null);

  const handleAnswer = (side: Side, selected: number) => {
    if (winner) return;

    const problem = side === Side.LEFT ? leftProblem : rightProblem;
    const isCorrect = selected === problem.answer;

    if (isCorrect) {
      setPullingSide(side);
      setTimeout(() => setPullingSide(null), 300);

      const change = side === Side.LEFT ? -1 : 1;
      const nextPos = ropePosition + change;

      if (Math.abs(nextPos) >= WIN_THRESHOLD) {
        setWinner(nextPos < 0 ? Side.LEFT : Side.RIGHT);
      }
      setRopePosition(nextPos);

      // Refresh problem for the side that answered
      if (side === Side.LEFT) {
        setLeftProblem(generateProblem());
      } else {
        setRightProblem(generateProblem());
      }
    } else {
      // Wrong answer - maybe some visual feedback or penalty?
      // For now, just shake and refresh problem
      if (side === Side.LEFT) {
        setLeftProblem(generateProblem());
      } else {
        setRightProblem(generateProblem());
      }
    }
  };

  const resetGame = () => {
    setRopePosition(0);
    setLeftProblem(generateProblem());
    setRightProblem(generateProblem());
    setWinner(null);
    setPullingSide(null);
  };

  return (
    <div className="min-h-screen bg-[#87CEEB] flex flex-col items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      {/* Background Decor - Hills */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-[#7cfc00] rounded-t-[100%] scale-x-125 translate-y-32 -z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]" />
      <div className="absolute bottom-0 right-0 w-full h-48 bg-[#32cd32] rounded-t-[100%] scale-x-150 translate-y-24 -z-20 opacity-80" />
      
      {/* Floating Clouds */}
      <motion.div 
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-10 text-white/40 drop-shadow-sm select-none"
      >
        <span className="text-8xl">☁️</span>
      </motion.div>
      <motion.div 
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-40 right-20 text-white/30 drop-shadow-sm select-none"
      >
        <span className="text-7xl">☁️</span>
      </motion.div>

      {/* Sun */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 left-1/2 -translate-x-1/2 text-9xl z-0 pointer-events-none drop-shadow-[0_0_30px_#facc15]"
      >
        ☀️
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight drop-shadow-[0_4px_0_#4a5568] flex items-center justify-center gap-4 text-white">
          <span className="animate-bounce text-6xl">🎈</span>
          Matematik Duel
          <span className="animate-bounce text-6xl" style={{ animationDelay: '0.2s' }}>🎈</span>
        </h1>
        <p className="text-2xl font-black mt-4 bg-white/20 px-8 py-3 rounded-full backdrop-blur-sm border-4 border-white/40 text-white shadow-xl">
          To'g'ri javobni tanla va arqonni tort! 🚩
        </p>
      </motion.div>

      {/* Main Stage */}
      <div className="relative w-full max-w-5xl h-[350px] flex items-center justify-center mb-12 z-10">
        {/* The Rope */}
        <div className="absolute w-[120%] h-6 bg-amber-900/30 rounded-full blur-md -z-10" />
        <motion.div
          animate={{ x: ropePosition * STEP_PERCENT }}
          className="relative w-full flex items-center justify-center"
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {/* Rope Core */}
          <div className="absolute w-[150%] h-3 bg-amber-200 border-y-2 border-amber-900 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex justify-center items-center">
             {/* Center Marker */}
             <div className="w-1 h-12 bg-red-600 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
          </div>

          {/* Left Child (Girl) */}
          <motion.div
            animate={{
              scale: pullingSide === Side.LEFT ? [1, 1.1, 1] : 1,
              rotate: pullingSide === Side.LEFT ? [-15, -25, -15] : -15,
              x: -120
            }}
            className="absolute flex flex-col items-center"
          >
            <div className="w-24 h-32 bg-pink-500 rounded-b-[3rem] border-4 border-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
              {/* Atlas/National Pattern Effect */}
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ 
                backgroundImage: 'repeating-linear-gradient(45deg, #facc15 0, #facc15 5px, transparent 5px, transparent 10px)' 
              }} />
              <div className="text-5xl mb-2 z-10">👧</div>
              <div className="absolute top-1 px-4 py-0.5 bg-indigo-600 rounded-full text-[8px] font-black text-white border border-white z-20">MIL-LIY</div>
            </div>
            <div className="mt-3 bg-pink-600 px-4 py-1.5 rounded-full text-[10px] font-black border-2 border-white uppercase tracking-tighter whitespace-nowrap shadow-lg">
              Milliy Kiyimli Qiz
            </div>
            {/* Arms holding the rope */}
            <div className="w-20 h-5 bg-pink-400 rounded-full mt-2 -rotate-45 border-2 border-pink-700/30" />
          </motion.div>

          {/* Right Child (Boy) */}
          <motion.div
            animate={{
              scale: pullingSide === Side.RIGHT ? [1, 1.1, 1] : 1,
              rotate: pullingSide === Side.RIGHT ? [15, 25, 15] : 15,
              x: 120
            }}
            className="absolute flex flex-col items-center"
          >
            <div className="w-24 h-32 bg-indigo-600 rounded-b-[3rem] border-4 border-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
              {/* Chapan Pattern Effect */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                backgroundImage: 'repeating-conic-gradient(#fbbf24 0% 25%, transparent 0% 50%)',
                backgroundSize: '15px 15px'
              }} />
              <div className="text-5xl mb-2 z-10">👦</div>
              <div className="absolute top-1 px-4 py-0.5 bg-yellow-400 rounded-full text-[8px] font-black text-indigo-900 border border-white z-20">MIL-LIY</div>
            </div>
            <div className="mt-3 bg-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black border-2 border-white uppercase tracking-tighter whitespace-nowrap shadow-lg">
              Milliy Kiyimli Bola
            </div>
            {/* Arms holding the rope */}
            <div className="w-20 h-5 bg-indigo-400 rounded-full mt-2 rotate-45 border-2 border-indigo-700/30" />
          </motion.div>
        </motion.div>

        {/* Win Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-x-0 top-0 h-[450px] bg-white rounded-[4rem] flex flex-col items-center justify-center z-50 p-8 text-center shadow-2xl border-x-[12px] border-b-[12px] border-yellow-400"
            >
              <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none text-8xl flex flex-wrap gap-4">
                {Array.from({length: 20}).map((_, i) => <span key={i}>🎉</span>)}
              </div>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className={`w-32 h-32 mb-6 ${winner === Side.LEFT ? 'text-pink-500' : 'text-indigo-500'} drop-shadow-xl`} />
              </motion.div>
              <h2 className="text-6xl font-black mb-8 uppercase tracking-widest text-gray-800 leading-tight">
                {winner === Side.LEFT ? 'Qizaloq' : 'Polvon'} G'olibi Bo'ldi! 🏆
              </h2>
              <button
                onClick={resetGame}
                className="bg-yellow-400 text-yellow-900 border-b-8 border-yellow-600 font-black px-12 py-6 rounded-3xl text-3xl flex items-center gap-3 hover:scale-110 active:border-b-0 active:translate-y-2 transition-all shadow-xl"
              >
                <RefreshCcw className="w-8 h-8" />
                Yana O'ynash
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl z-10">
        {/* Left Team Controls */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`bg-white p-8 rounded-[3rem] shadow-[0_20px_0_#db2777] border-8 border-pink-400 ${winner ? 'opacity-50 pointer-events-none' : ''} transition-transform hover:scale-[1.02]`}
        >
          <div className="text-center mb-8">
            <span className="text-2xl font-black uppercase tracking-widest text-pink-500 block mb-2">Qizaloq Savoli</span>
            <div className="text-8xl font-black text-pink-600 drop-shadow-sm">
              {leftProblem.question}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {leftProblem.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(Side.LEFT, opt)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black text-5xl py-8 rounded-[2rem] shadow-[0_12px_0_#9d174d] active:shadow-none active:translate-y-[12px] transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right Team Controls */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`bg-white p-8 rounded-[3rem] shadow-[0_20px_0_#4f46e5] border-8 border-indigo-400 ${winner ? 'opacity-50 pointer-events-none' : ''} transition-transform hover:scale-[1.02]`}
        >
          <div className="text-center mb-8">
            <span className="text-2xl font-black uppercase tracking-widest text-indigo-500 block mb-2">Polvon Savoli</span>
            <div className="text-8xl font-black text-indigo-600 drop-shadow-sm">
              {rightProblem.question}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {rightProblem.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(Side.RIGHT, opt)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black text-5xl py-8 rounded-[2rem] shadow-[0_12px_0_#3730a3] active:shadow-none active:translate-y-[12px] transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Instructions and Author */}
      <footer className="mt-auto pt-12 pb-8 flex flex-col items-center gap-6 z-10">
        {!winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-black bg-white/20 px-10 py-4 rounded-full border-4 border-white/40 shadow-xl text-white backdrop-blur-sm"
          >
            Tezroq hisobla va g'alaba qozon! 🚩
          </motion.div>
        )}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 px-8 py-3 rounded-3xl shadow-2xl border-b-8 border-gray-200 flex flex-col items-center gap-1 hover:scale-105 transition-transform"
        >
          <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] leading-none">O'yin Muallifi:</span>
          <span className="text-blue-600 font-black text-xl tracking-tight">Sa'dullayeva Farangiz</span>
        </motion.div>
      </footer>
    </div>
  );
}
