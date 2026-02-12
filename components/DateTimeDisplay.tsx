import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DateTimeDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <Calendar size={14} className="text-accent" />
      <span className="text-sm text-zinc-300">{formatDate(currentTime)}</span>
      <span className="text-zinc-700">|</span>
      <span className="text-sm font-medium text-white tabular-nums">{formatTime(currentTime)}</span>
    </div>
  );
};

export default DateTimeDisplay;
