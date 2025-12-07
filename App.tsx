import React, { useState, useEffect, useCallback } from 'react';
import { Country, GameState, GameStats, Question } from './types';
import { COUNTRIES } from './constants';
import { getCountryFact } from './services/geminiService';
import { Header } from './components/Header';
import { GameCard } from './components/GameCard';
import { FactCard } from './components/FactCard';
import { Button } from './components/Button';
import { ArrowRight, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0
  });
  
  // Fact state
  const [fact, setFact] = useState<string | null>(null);
  const [loadingFact, setLoadingFact] = useState<boolean>(false);

  // Helper to get random item from array
  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  // Helper to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateQuestion = useCallback(() => {
    const target = getRandomItem(COUNTRIES);
    const distractors: Country[] = [];
    
    while (distractors.length < 3) {
      const randomCountry = getRandomItem(COUNTRIES);
      // Ensure unique distractors and distinct from target
      if (
        randomCountry.code !== target.code && 
        !distractors.find(d => d.code === randomCountry.code)
      ) {
        distractors.push(randomCountry);
      }
    }

    const options = shuffleArray([target, ...distractors]);
    
    setCurrentQuestion({ target, options });
    setSelectedOption(null);
    setFact(null);
    setGameState(GameState.PLAYING);
  }, []);

  // Initial load
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleGuess = async (country: Country) => {
    if (gameState !== GameState.PLAYING || !currentQuestion) return;

    const isCorrect = country.code === currentQuestion.target.code;
    setSelectedOption(country);
    setGameState(GameState.RESULT);

    // Update stats
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });

    // Fetch AI Fact
    setLoadingFact(true);
    const factText = await getCountryFact(currentQuestion.target.name, isCorrect);
    setFact(factText);
    setLoadingFact(false);
  };

  const handleNext = () => {
    generateQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentQuestion) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading Game...</div>;

  return (
    <div className="min-h-screen pb-12 pt-24 px-4 bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
      <Header stats={stats} />

      <main className="max-w-2xl mx-auto flex flex-col items-center">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Guess the Flag
          </h2>
          <p className="text-slate-400">
            Select the correct country for the flag below.
          </p>
        </div>

        <GameCard 
          question={currentQuestion}
          onGuess={handleGuess}
          disabled={gameState === GameState.RESULT}
          selectedOption={selectedOption}
        />

        {/* Results Area */}
        {gameState === GameState.RESULT && (
          <div className="w-full animate-fade-in space-y-6">
            
            {/* Fact Card */}
            <FactCard 
              fact={fact} 
              loading={loadingFact} 
              isCorrect={selectedOption?.code === currentQuestion.target.code}
              countryName={currentQuestion.target.name}
            />

            {/* Next Button */}
            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                onClick={handleNext} 
                className="w-full sm:w-auto min-w-[200px] shadow-xl shadow-indigo-500/20"
              >
                <span>Next Flag</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;