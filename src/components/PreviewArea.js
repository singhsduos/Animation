import React, { useState, useEffect } from 'react';
import CatSprite from './CatSprite';
import { useApp } from '../context/AppContext';

export default function PreviewArea() {
  const { commands } = useApp(); 
  const [position, setPosition] = useState({ x: 200, y: 200 });
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let i = 0;

    const executeNext = () => {
      if (i >= commands.length) return;

      const { type, value } = commands[i];

      if (type === 'move') {
        const dx = value * Math.cos((angle * Math.PI) / 180);
        const dy = value * Math.sin((angle * Math.PI) / 180);
        setPosition(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
      } else if (type === 'turn') {
        setAngle(prev => prev + value);
      } else if (type === 'goto') {
        setPosition({ x: value.x, y: value.y });
      }

      i++;
      setTimeout(executeNext, 500);
    };

    if (commands.length > 0) {
      executeNext();
    }
  }, [commands]);

  return (
    <div className='Neelesh'
      style={{
        position: 'absolute',
        transform: `translate(${position.x}px, ${position.y}px) rotate(${angle}deg)`,
        transition: 'transform 0.3s ease',
      }}
    >
      <CatSprite />
    </div>
  );
}
