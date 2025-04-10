import React, { useState, useEffect } from 'react';
import CatSprite from './CatSprite';
import AddSpriteButton from './AddSpriteButton';
import { useApp } from '../context/AppContext';
import '../CSS/CatSprite.css'


export default function PreviewArea() {
  const { shakingSprites, commands, sprites, setSprites, checkAndSwapBlocksIfOverlapping, setSelectedSpriteId, selectedSpriteId } = useApp(); 
  const [angleMap, setAngleMap] = useState({}); 
  const [position, setPositions] = useState({});
  const randomX = Math.floor(Math.random() * 400);
  const randomY = Math.floor(Math.random() * 400);
  const isShaking = shakingSprites.includes(sprites.id);
  useEffect(() => {
    let i = 0;
    let newX = 50
    let newY = 50

    setPositions((prev) => ({
      ...prev,
      [selectedSpriteId]: {
        x: (prev[selectedSpriteId]?.x || randomX),
        y: (prev[selectedSpriteId]?.y || randomY),
      }
    }));

    const executeNext = () => {
      if (i >= commands.length) return;

      const { type, value } = commands[i];
      const currentAngle = angleMap[selectedSpriteId] || 0;

      if (type === 'turn' && selectedSpriteId) {
        setAngleMap(prev => ({
          ...prev,
          [selectedSpriteId]: (prev[selectedSpriteId] || 0) + value
        }));

      }
      if (type === 'goto' && selectedSpriteId) {
        newX =  (value.x || 50),
        newY =  (value.y || 50),
        
        setPositions((prev) => {
          console.log("nex",newX)
          console.log("ney",newY)
      
          const updatedSprites = sprites.map(sprite =>
            sprite.id === selectedSpriteId
              ? { ...sprite, x: newX, y: newY }
              : sprite
          );
          
          setSprites(updatedSprites);
         return { ...prev,
          [selectedSpriteId]: {
            x: newX,
            y: newY
          }
        }
        });

        checkAndSwapBlocksIfOverlapping()

      }
      if (type === "move" && selectedSpriteId) {
        const dx = value * Math.cos((currentAngle * Math.PI) / 180);
        const dy = value * Math.sin((currentAngle * Math.PI) / 180);
        
        setPositions((prev) => {
           newX = (prev[selectedSpriteId]?.x || 0) + dx;
           newY = (prev[selectedSpriteId]?.y || 0) + dy;
           const updatedSprites = sprites.map(sprite =>
            sprite.id === selectedSpriteId
              ? { ...sprite, x: newX, y: newY }
              : sprite
          );
          
          setSprites(updatedSprites);
          return {
            ...prev,
            [selectedSpriteId]: {
              x: newX,
              y: newY,
            }
          };
        });
        console.log("nex",newX)
        console.log("ney",newY)
  
        checkAndSwapBlocksIfOverlapping();
      }
      

      i++;
      setTimeout(executeNext, 500);
    };

    if (commands.length > 0 && selectedSpriteId) {
      executeNext();
    }

    checkAndSwapBlocksIfOverlapping()
    

  }, [commands, selectedSpriteId]);

  return (
    <div className="relative h-[400px] w-full border bg-gray-100">
      <AddSpriteButton />

      {sprites.map(sprite => (
        <div 
          key={sprite.id}
          onClick={() => setSelectedSpriteId(sprite.id)}
          className={`cat-sprite ${isShaking ? 'shake' : ''}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${(position[sprite.id]?.x)}px, ${(position[sprite.id]?.y)}px) rotate(${angleMap[sprite.id] || 0}deg)`,
            transition: 'transform 0.3s ease',
            border: sprite.id === selectedSpriteId ? '2px solid blue' : 'none',
            borderRadius: '8px',
            zIndex: sprite.id === selectedSpriteId ? 10 : 1,
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          <CatSprite  sprite={sprite}/>
        </div>
      ))}
    </div>
  );
}
