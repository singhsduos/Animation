import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import CatSprite from './CatSprite';
import AddSpriteButton from './AddSpriteButton';
import { useApp } from '../context/AppContext';
import '../CSS/CatSprite.css';

export default function PreviewArea() {
  const {
    isPlaying,
    setIsPlaying,
    setShakingSprites,
    shakingSprites,
    commands,
    sprites,
    setSprites,
    blocks,
    setBlocks,
    setSelectedSpriteId,
    selectedSpriteId
  } = useApp();

  const [angleMap, setAngleMap] = useState({});
  const [position, setPositions] = useState({});
  const spriteTimeoutsRef = useRef({});
  const swappedPairsRef = useRef(new Set());

  const randomX = Math.floor(Math.random() * 400);
  const randomY = Math.floor(Math.random() * 400);
  const isShaking = shakingSprites.includes(sprites.id);

  const playAll = () => {
    if (Object.keys(blocks).length === 0) {
      alert("First Add Events To Your Workspace");
      return;
    }
    setIsPlaying(true);
    sprites.forEach(sprite => {
      executeCommandsForSpriteInLoop(
        sprites,
        blocks[sprite.id],
        blocks,
        setBlocks,
        sprite.id,
        setAngleMap,
        angleMap,
        spriteTimeoutsRef,
        setPositions,
        setSprites,
        setShakingSprites
      );
    });
  };

  const pauseAll = () => {
    setIsPlaying(false);
    Object.values(spriteTimeoutsRef.current).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    spriteTimeoutsRef.current = {};
  };

  useEffect(() => {
    let i = 0;
    let newX = 50;
    let newY = 50;

    setPositions(prev => {
      const x = prev[selectedSpriteId]?.x || randomX;
      const y = prev[selectedSpriteId]?.y || randomY;

      const updatedSprites = sprites.map(sprite =>
        sprite.id === selectedSpriteId
          ? { ...sprite, x, y }
          : sprite
      );
      setSprites(updatedSprites);

      return {
        ...prev,
        [selectedSpriteId]: { x, y }
      };
    });

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
        newX = value.x || 50;
        newY = value.y || 50;

        setPositions(prev => {
          const updatedSprites = sprites.map(sprite =>
            sprite.id === selectedSpriteId
              ? { ...sprite, x: newX, y: newY }
              : sprite
          );
          setSprites(updatedSprites);

          return {
            ...prev,
            [selectedSpriteId]: { x: newX, y: newY }
          };
        });
      }

      if (type === 'move' && selectedSpriteId) {
        const dx = value * Math.cos((currentAngle * Math.PI) / 180);
        const dy = value * Math.sin((currentAngle * Math.PI) / 180);

        setPositions(prev => {
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
            [selectedSpriteId]: { x: newX, y: newY }
          };
        });
      }

      i++;
      setTimeout(executeNext, 500);
    };

    if (commands.length > 0 && selectedSpriteId) {
      executeNext();
    }
  }, [commands, selectedSpriteId]);

  useEffect(() => {
    if (!isPlaying) return;
  
    sprites.forEach(sprite => {
      const spriteId = sprite.id;
      const newBlocks = blocks[spriteId];
      const prevBlocks = spriteTimeoutsRef.current[`__prevBlocks_${spriteId}`];
  
      const hasChanged = JSON.stringify(newBlocks) !== JSON.stringify(prevBlocks);
  
      if (hasChanged) {
        spriteTimeoutsRef.current[`__prevBlocks_${spriteId}`] = newBlocks;
  
        clearTimeout(spriteTimeoutsRef.current[spriteId]);

        executeCommandsForSpriteInLoop(
        sprites,
        blocks[sprite.id],
        blocks,
        setBlocks,
        sprite.id,
        setAngleMap,
        angleMap,
        spriteTimeoutsRef,
        setPositions,
        setSprites,
        setShakingSprites
        );
      }
    });
  }, [blocks, isPlaying, sprites]);
  

  useEffect(() => {
    checkAndSwapBlocksIfOverlapping(sprites, setShakingSprites, blocks, setBlocks, position, swappedPairsRef);
  }, [position]);

  return (
    <div className="relative h-[400px] w-full border bg-gray-100">
      <AddSpriteButton />
      <button
        style={{
          padding: '10px 20px',
          fontWeight: 'bold',
          backgroundColor: '#ffa726',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          margin: '10px'
        }}
        onClick={isPlaying ? pauseAll : playAll}
      >
        {isPlaying ? 'Pause' : 'Play All'}
      </button>

      {sprites.map(sprite => (
          <Draggable
            key={sprite.id}
            position={{
              x: position[sprite.id]?.x || 0,
              y: position[sprite.id]?.y || 0
            }}
            bounds="parent"
            onDrag={(e, data) => {
              if (data.x !== position[sprite.id]?.x || data.y !== position[sprite.id]?.y) {
                setPositions(prev => ({
                  ...prev,
                  [sprite.id]: { x: data.x, y: data.y }
                }));
          
                setSprites(prev =>
                  prev.map(s =>
                    s.id === sprite.id ? { ...s, x: data.x, y: data.y } : s
                  )
                );
              }
            }}
          >
            <div
              onClick={() => setSelectedSpriteId(sprite.id)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: sprite.id === selectedSpriteId ? 10 : 1,
                cursor: 'pointer'
              }}
            >
              <div
                className={`cat-sprite ${isShaking ? 'shake' : ''}`}
                style={{
                  transform: `translate3d(${position[sprite.id]?.x || 0}px, ${position[sprite.id]?.y || 0}px, 0) rotate(${angleMap[sprite.id] || 0}deg)`,
                  transition: 'transform 0.1s ease-out',
                  border: sprite.id === selectedSpriteId ? '2px solid blue' : 'none',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}
              >
                <CatSprite sprite={sprite} />
              </div>
            </div>
          </Draggable>
      ))}
    </div>
  );
}

function executeCommandsForSpriteInLoop(
  sprites,
  blocksCommands,
  blocks,
  setBlocks,
  spriteId,
  setAngleMap,
  angleMap,
  spriteTimeoutsRef,
  setPositions,
  setSprites,
  setShakingSprites
) {
  let i = 0;
  let newX = 50, newY = 50;
  let currentAngle = angleMap[spriteId] || 0;

  const runCommand = () => {
    if (!blocksCommands || blocksCommands.length === 0) return;

    const { type, value } = blocksCommands[i];

    if (type === 'turn') {
      currentAngle += value;
      setAngleMap(prev => ({
        ...prev,
        [spriteId]: (prev[spriteId] || 0) + value
      }));
    }

    if (type === 'goto') {
      newX = value.x || 50;
      newY = value.y || 50;

      setPositions(prev => {
        const updatedSprites = sprites.map(s =>
          s.id === spriteId ? { ...s, x: newX, y: newY } : s
        );
        setSprites(updatedSprites);

        return {
          ...prev,
          [spriteId]: { x: newX, y: newY }
        };
      });
    }

    if (type === 'move') {
      const dx = value * Math.cos((currentAngle * Math.PI) / 180);
      const dy = value * Math.sin((currentAngle * Math.PI) / 180);

      setPositions(prev => {
        newX = (prev[spriteId]?.x || 0) + dx;
        newY = (prev[spriteId]?.y || 0) + dy;

        const updatedSprites = sprites.map(s =>
          s.id === spriteId ? { ...s, x: newX, y: newY } : s
        );
        setSprites(updatedSprites);

        return {
          ...prev,
          [spriteId]: { x: newX, y: newY }
        };
      });
    }

    i = (i + 1) % blocksCommands.length;
    spriteTimeoutsRef.current[spriteId] = setTimeout(runCommand, 500);
  };

  runCommand();
}

function checkAndSwapBlocksIfOverlapping(sprites, setShakingSprites, blocks, setBlocks, position, swappedPairsRef) {
  const overlappingSprites = [];
  const distanceThreshold = 50; 
  let radius = 20;

  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      const id1 = sprites[i].id;
      const id2 = sprites[j].id;
      const key = `${id1}-${id2}`;

      const pos1 = position[id1] || { x: 0, y: 0 };
      const pos2 = position[id2] || { x: 0, y: 0 };
      const distance = isOverlapping(pos1, pos2)

      if (distance<2*radius) {
        if (!swappedPairsRef.current.has(key) && !swappedPairsRef.current.has(`${id2}-${id1}`)) {
          swappedPairsRef.current.add(key);
          swappedPairsRef.current.add(`${id2}-${id1}`);
          setShakingSprites([id1, id2]);
          
          setTimeout(() => {
            const block1 = blocks[id1] || [];
            const block2 = blocks[id2] || [];

            setBlocks(prev => ({
              ...prev,
              [id1]: block2,
              [id2]: block1
            }));

            setShakingSprites([]);
          }, 300);
        }
      }

      if(distance>=distanceThreshold && swappedPairsRef.current.has(key) && swappedPairsRef.current.has(`${id2}-${id1}`)) {
        swappedPairsRef.current.delete(key);
        swappedPairsRef.current.delete(`${id2}-${id1}`);
      }
    }
  }
}

function isOverlapping(spriteA, spriteB, radius = 20) {
  const dx = spriteA.x - spriteB.x;
  const dy = spriteA.y - spriteB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance;
}
