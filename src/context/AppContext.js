import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";


const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
 let catid = uuidv4()
  const [sprites, setSprites] = useState([
    {
      id: catid,
      name: "Cat",
      x: 50,
      y: 50,
      direction: 90,
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


  const checkAndSwapBlocksIfOverlapping = () => {
    const overlappingSprites = [];
  
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
          if (isOverlapping(sprites[i], sprites[j])) {
          overlappingSprites.push([sprites[i].id, sprites[j].id]);
        }
      }
    }
  
    if (overlappingSprites.length > 0) {
      const [id1, id2] = overlappingSprites[0];
  
    
      setShakingSprites([id1, id2]); 
  
     
      setTimeout(() => {
        const sprite1 = sprites.find((s) => s.id === id1);
        const sprite2 = sprites.find((s) => s.id === id2);
  
        const updatedSprites = sprites.map((sprite) => {
          if (sprite.id === id1) return { ...sprite, blocks: sprite2.blocks };
          if (sprite.id === id2) return { ...sprite, blocks: sprite1.blocks };
          return sprite;
        });
        console.log("updatedSprites",updatedSprites)
  
        setSprites(updatedSprites);
        setShakingSprites([]);
      }, 300);
    }
  };
  



  return (
    <AppContext.Provider
      value={{
        sprites,
        setSprites,
        selectedSpriteId,
        setSelectedSpriteId,
        blocks,
        setBlocks,
        commands,
        setCommands,
        addSprite,
        updateSpriteBlocks,
        checkAndSwapBlocksIfOverlapping,
        shakingSprites,
        setShakingSprites,
        isPlaying, 
        setIsPlaying
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
  
function isOverlapping(spriteA, spriteB,  radius = 50) {
    const dx = spriteA.x - spriteB.x;
    const dy = spriteA.y - spriteB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    return distance < radius * 2;
  }
  