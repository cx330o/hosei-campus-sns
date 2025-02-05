import { typeColor } from '../../utils/color';

type Props = {
  trainType: string;
  destination: string;
  direction: string;
  line: string;
  hour: number;
  minute: number;
  isNext?: boolean;
}

const TrainDetail = (props: Props) => {
  const colors = typeColor({ line: props.line, trainType: props.trainType });

  if (props.isNext) {
    return (
      <div className='bg-gradient-to-r from-pink-500/90 to-rose-500/90 dark:from-pink-600/80 dark:to-rose-600/80 shadow-lg shadow-pink-400/20 mb-3 p-4 border border-pink-300/30 rounded-2xl text-white'>
        <div className='flex justify-between items-center'>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center gap-2'>
              <span className={`rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm ${colors.lineStyles || 'bg-white/20'}`}>{props.line}</span>
              <span className={`rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm ${colors.trainTypeStyles || 'bg-white/20'}`}>{props.trainType}</span>
            </div>
            <p className='text-base font-medium'>{props.destination}</p>
          </div>
          <div className='text-right'>
            <p className='font-mono font-bold text-4xl tabular-nums tracking-tight'>{props.hour}<span className='animate-pulse'>:</span>{props.minute.toString().padStart(2, "0")}</p>
            <p className='text-pink-200 text-xs'>Ê¨°„ÅÆÈõªËªä</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white/20 dark:bg-white/5 backdrop-blur-sm mb-1.5 p-2.5 border border-pink-200/20 dark:border-pink-800/20 rounded-xl text-gray-800 dark:text-white hover:bg-white/30 dark:hover:bg-white/10 transition-colors'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold md:text-xs ${colors.lineStyles || 'bg-pink-200/50 dark:bg-white/20'}`}>{props.line}</span>
          <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold md:text-xs ${colors.trainTypeStyles || 'bg-pink-100/50 dark:bg-white/10'}`}>{props.trainType}</span>
          <span className='text-sm text-gray-600 dark:text-white/70'>{props.destination}</span>
        </div>
        <p className='font-mono font-semibold text-lg tabular-nums ml-2 shrink-0'>{props.hour}:{props.minute.toString().padStart(2, "0")}</p>
      </div>
    </div>
  )
}

export default TrainDetail
// updated: TrainDetail§Œ•π•ø•§•Î’{’˚
