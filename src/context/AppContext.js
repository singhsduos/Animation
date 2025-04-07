import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [sprites, setSprites] = useState([
    {
      id: "sprite-1",
      name: "Cat",
      x: 50,
      y: 50,
      direction: 90,
      blocks: [],
    },
  ]);
  const [selectedSpriteId, setSelectedSpriteId] = useState("sprite-1");
  const [running, setRunning] = useState(false);
  const [blocks, setBlocks] = useState([]); 
  const [commands, setCommands] = useState([]);

  const value = {
    sprites,
    setSprites,
    selectedSpriteId,
    setSelectedSpriteId,
    running,
    setRunning,
    blocks,
    setBlocks,
    commands,      
    setCommands,    
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
