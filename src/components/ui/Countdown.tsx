import { useMemo } from "react";

type Props = {
  now: Date;
  targetDate: Date | undefined;
  labelBefore: string;
  labelAfter: string;
};

const Countdown = ({ now, targetDate, labelBefore, labelAfter }: Props) => {
  const { minutes, seconds, isPast } = useMemo(() => {
    if (!targetDate) return { minutes: 0, seconds: 0, isPast: true };
    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return { minutes: 0, seconds: 0, isPast: true };
    const totalSeconds = Math.floor(diff / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
      isPast: false,
    };
  }, [now, targetDate]);

  if (!targetDate || isPast) {
    return (
      <div className="flex justify-center items-center gap-1 py-1 text-white/60 text-sm">
        <span>{labelAfter}</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-2 py-1">
      <span className="text-white/70 text-sm">{labelBefore}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-bold text-2xl text-white tabular-nums">
          {String(minutes).padStart(2, "0")}
        </span>
        <span className="text-white/60 text-sm animate-pulse">:</span>
        <span className="font-mono font-bold text-2xl text-white tabular-nums">
          {String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export default Countdown;
