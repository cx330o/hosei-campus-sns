import React from 'react'
import { cn } from '../../lib/utils'
type StationButtonProps = {
  station: string
  selectedStation: string
  onClick: () => void
  ref: React.RefObject<HTMLButtonElement>
  children: React.ReactNode
}
const StationButton = React.forwardRef<HTMLButtonElement, StationButtonProps>(({ station, onClick, selectedStation, children }, ref) => {
  return (
    <button 
      onClick={onClick} 
      ref={ref} 
      className={cn(
        "shadow-lg rounded-xl p-2 min-w-[44px] min-h-[44px] transition-all duration-300 backdrop-blur-sm border",
        station === selectedStation 
          ? 'bg-white/25 dark:bg-white/15 text-white dark:text-white border-white/40 shadow-white/20 dark:shadow-blue-500/20 scale-105' 
          : 'bg-black/20 dark:bg-white/5 text-white/80 dark:text-white/60 border-white/10 hover:bg-white/15 hover:border-white/25'
      )}
      aria-pressed={station === selectedStation}
      aria-label={station}
      type="button"
    >
      {children}   
    </button>
  );
});

StationButton.displayName = 'StationButton';

export default StationButton;
