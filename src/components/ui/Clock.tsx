// import { useEffect, useState } from 'react'
import { getDateString, getTimeString, isHoliday } from '../../utils/timeHandlers'
import holidayData from '../../utils/Holidays.json'

type Props={
    now: Date
}

const Clock = ({ now }: Props) => {
  if(isHoliday({ date: now ,holidayData})) {
    return (
      <div className="top-3 left-3 z-10 fixed bg-white/15 dark:bg-black/40 shadow-lg backdrop-blur-md p-2 md:p-5 border border-white/20 dark:border-white/10 rounded-2xl w-auto md:w-1/3 text-black dark:text-white">
        <p suppressHydrationWarning={false} className="w-auto h-7 font-medium text-sm md:text-lg text-center">{getDateString(now)}</p>
        <p suppressHydrationWarning={false} className="w-auto h-7 font-medium text-lg md:text-2xl text-center">{getTimeString(now)}</p>
        <p className="text-red-500 text-xs md:text-base text-center">{isHoliday({ date: now, holidayData })}</p>
      </div>
    )
  }
  return (
    <div className="top-3 left-3 z-10 fixed bg-white/15 dark:bg-black/40 shadow-lg backdrop-blur-md p-2 md:p-5 border border-white/20 dark:border-white/10 rounded-2xl w-auto md:w-1/3 text-black dark:text-white">
      <p suppressHydrationWarning={false} className="w-auto h-7 font-medium text-sm md:text-lg text-center">{getDateString(now)}</p>
      <p suppressHydrationWarning={false} className="w-auto h-7 font-medium text-lg md:text-2xl text-center">{getTimeString(now)}</p>
    </div>
  )
}

export default Clock
// updated: JSDoc¥³¥á¥ó¥È×·¼Ó
