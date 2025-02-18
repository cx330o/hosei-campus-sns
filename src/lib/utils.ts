import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function resolveStationName(stationName:string){
  return stationName === "市ケ谷駅" ? "市ケ谷駅" : stationName === "飯田橋駅" ? "飯田橋駅" : stationName==="九段下駅"?"九段下駅":stationName
}

export {resolveStationName}