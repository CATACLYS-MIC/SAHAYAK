import React from 'react';

interface SpeechAudioWaveProps {
  isActive: boolean;
  color?: 'red' | 'blue' | 'emerald';
  barCount?: number;
  className?: string;
}

export function SpeechAudioWave({
  isActive,
  color = 'red',
  barCount = 7,
  className = ''
}: SpeechAudioWaveProps) {
  const bars = Array.from({ length: barCount });

  const colorClasses = {
    red: 'bg-red-500 dark:bg-red-400',
    blue: 'bg-blue-500 dark:bg-blue-400',
    emerald: 'bg-emerald-500 dark:bg-emerald-400'
  };

  return (
    <div className={`flex items-center space-x-1 h-5 ${className}`}>
      {bars.map((_, i) => {
        // Staggered heights and animation delays
        const delays = [0, 0.2, 0.4, 0.1, 0.3, 0.5, 0.2];
        const delay = delays[i % delays.length];

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${colorClasses[color]} ${
              isActive
                ? 'animate-pulse'
                : 'h-1 opacity-40'
            }`}
            style={{
              height: isActive ? `${Math.sin((i + 1) * 0.8) * 12 + 10}px` : '4px',
              animationDuration: `${0.6 + (i % 3) * 0.2}s`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
    </div>
  );
}
