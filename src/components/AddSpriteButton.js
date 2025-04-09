import React from 'react'
import { useApp } from '../context/AppContext'
import { v4 as uuidv4 } from "uuid";


export default function AddSpriteButton () {
    const { sprites, setSprites, setSelectedSpriteId } = useApp();
const handleAddSprite = () => {
    const newSprite = {
      id: uuidv4(),
      x: Math.random() * 300,
      y: Math.random() * 300,
      blocks: [],
    };
    setSprites(prev => [...prev, newSprite]);
    setSelectedSpriteId(newSprite.id);
}

  return (
    <button
      onClick={handleAddSprite}
      style={{
        padding: '10px 20px',
        fontWeight: 'bold',
        backgroundColor: '#ffa726',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        margin: '10px'
      }}
    >
      ➕ Add More Sprite
    </button>
  );    
}
