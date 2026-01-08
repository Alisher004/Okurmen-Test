import { useEffect, useState } from "react";

interface TimerProps {
  initialTime: number; // seconds
  onTimeUp: () => void;
  onTick?: (timeLeft: number) => void;
}

export default function Timer({ initialTime, onTimeUp, onTick }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    onTick?.(timeLeft);
  }, [timeLeft, onTick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Компонент работает в фоне, не рендерит UI (время отображается в Test.tsx)
  return null;
}