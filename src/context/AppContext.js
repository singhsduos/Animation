import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";


const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
 let catid = uuidv4()
  const [sprites, setSprites] = useState([
    {
      id: catid,
      x: 50,
      y: 50,
      blocks: [],
    },
  ]);
  const [selectedSpriteId, setSelectedSpriteId] = useState(catid);
  const [blocks, setBlocks] = useState({});
  const [commands, setCommands] = useState([]);
  const [shakingSprites, setShakingSprites] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  


  const addSprite = () => {
    const newId = `sprite-${Date.now()}`;
    const randomX = Math.floor(Math.random() * 400);
    const randomY = Math.floor(Math.random() * 400);
    setSprites((prev) => [
      ...prev,
      {
        id: newId,
        name: `Cat ${prev.length + 1}`,
        x: randomX,
        y: randomY,
        direction: 90,
        blocks: [],
      },
    ]);
    setSelectedSpriteId(newId);
  };

  const updateSpriteBlocks = (spriteId, newBlocks) => {
    setSprites((prevSprites) =>
      prevSprites.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, blocks: newBlocks } : sprite
      )
    );
  };




  return (
    <AppContext.Provider
      value={{
        addSprite,
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
        updateSpriteBlocks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
  

  