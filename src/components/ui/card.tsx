import React from 'react'
type CardProps={children:React.ReactNode,className?:string}
const Card = ({children,className}:CardProps) => {
  return (
    <div className={`
      bg-white/10 backdrop-blur-md border border-white/20 dark:bg-black/30 dark:border-white/10
      shadow-lg shadow-black/5 dark:shadow-black/30 p-2 rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export default Card
