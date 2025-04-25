import React, { createContext, useContext, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext()
export const useApp = () => useContext(AppContext)

export function AppProvider ({ children }) {
  let catid = uuidv4()
  const [sprites, setSprites] = useState([
    {
      id: catid,
      x: 50,
      y: 50,
      blocks: []
    }
  ])
  const [selectedSpriteId, setSelectedSpriteId] = useState(catid)
  const [blocks, setBlocks] = useState({})
  const [commands, setCommands] = useState([])
  const [shakingSprites, setShakingSprites] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [loopAnimationQueue, setLoopAnimationQueue] = useState([])

  return (
    <AppContext.Provider
      value={{
        blocks,
        commands,
        isPlaying,
        selectedSpriteId,
        setBlocks,
        setCommands,
        setIsPlaying,
        setSelectedSpriteId,
        setShakingSprites,
        setSprites,
        shakingSprites,
        sprites,
        loopAnimationQueue,
        setLoopAnimationQueue
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
