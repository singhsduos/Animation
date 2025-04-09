import React, { useState, useEffect } from 'react';
import CatSprite from './CatSprite';
import AddSpriteButton from './AddSpriteButton';
import { useApp } from '../context/AppContext';

export default function PreviewArea() {
  const { commands, sprites, setSprites, setSelectedSpriteId, selectedSpriteId } = useApp(); 
  const [angleMap, setAngleMap] = useState({}); 
  const [position, setPositions] = useState({});
  const randomX = Math.floor(Math.random() * 400);
  const randomY = Math.floor(Math.random() * 400);
  useEffect(() => {
    let i = 0;

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
        setPositions((prev) => ({
          ...prev,
          [selectedSpriteId]: {
            x: (value.x || 50),
            y: (value.y || 50),
          }
        }));
      }
      if (type === "move" && selectedSpriteId) {
        const dx = value * Math.cos((currentAngle * Math.PI) / 180);
        const dy = value * Math.sin((currentAngle * Math.PI) / 180);

        setPositions((prev) => ({
          ...prev,
          [selectedSpriteId]: {
            x: (prev[selectedSpriteId]?.x || 0) + dx,
            y: (prev[selectedSpriteId]?.y || 0) + dy
          }
        }));
       
      }

      i++;
      setTimeout(executeNext, 500);
    };

    if (commands.length > 0 && selectedSpriteId) {
      executeNext();
    }
  }, [commands, selectedSpriteId]);

  return (
    <div className="relative h-[400px] w-full border bg-gray-100">
      <AddSpriteButton />

      {sprites.map(sprite => (
        <div 
          key={sprite.id}
          onClick={() => setSelectedSpriteId(sprite.id)}
          className='Neelesh'
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
          <CatSprite />
        </div>
      ))}
    </div>
  );
}
