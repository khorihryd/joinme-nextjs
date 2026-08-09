'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDateStr?: string;
}

export function CountdownTimer({ targetDateStr }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = targetDateStr ? new Date(targetDateStr).getTime() : Date.now() + 86400000 * 30;

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return (
    <div className="flex justify-center gap-4 py-4 text-center">
      <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 min-w-[65px]">
        <div className="text-xl font-bold text-amber-900">{timeLeft.days}</div>
        <div className="text-[10px] uppercase text-amber-700 font-bold">Hari</div>
      </div>
      <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 min-w-[65px]">
        <div className="text-xl font-bold text-amber-900">{timeLeft.hours}</div>
        <div className="text-[10px] uppercase text-amber-700 font-bold">Jam</div>
      </div>
      <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 min-w-[65px]">
        <div className="text-xl font-bold text-amber-900">{timeLeft.minutes}</div>
        <div className="text-[10px] uppercase text-amber-700 font-bold">Menit</div>
      </div>
      <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 min-w-[65px]">
        <div className="text-xl font-bold text-amber-900">{timeLeft.seconds}</div>
        <div className="text-[10px] uppercase text-amber-700 font-bold">Detik</div>
      </div>
    </div>
  );
}
