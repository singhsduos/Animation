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
    setCommands,
    sprites,
    setSprites,
    blocks,
    setBlocks,
    setSelectedSpriteId,
    selectedSpriteId,
    loopAnimationQueue,
    setLoopAnimationQueue
  } = useApp();

  const angleMapRef = useRef({});
  const [position, setPositions] = useState({});
  const [maxBound, setMaxBound] = useState({ x: null, y: null })
  const [angleTick, setAngleTick] = useState(0); 
  const [visibilty, setVisibilty] = useState({isVisible: true, spriteId: null});

  const spriteTimeoutsRef = useRef({});
  const swappedPairsRef = useRef(new Set());
  const loopingSpritesRef = useRef(new Map());

  const randomX = Math.floor(Math.random() * 200);
  const randomY = Math.floor(Math.random() * 200);
  const isShaking = shakingSprites.includes(sprites.id);

  const playAll = () => {
    if (Object.keys(blocks).length === 0) {
      alert("First Add Events To Your Workspace");
      return;
    }
    setIsPlaying(true);
    let parentIdObj = {
      isParent: false,
      parentId: null
    }
    sprites.forEach(sprite => {
      clearTimeout(spriteTimeoutsRef.current[sprite.id]); 
      executeCommandsForSpriteInLoop(
        sprites,
        blocks[sprite.id],
        blocks,
        setBlocks,
        sprite.id,
        angleMapRef,
        spriteTimeoutsRef,
        setPositions,
        setSprites,
        setShakingSprites,
        maxBound,
        setAngleTick,
        parentIdObj,
        setVisibilty
      );
    });
  };

  function pauseAll(){
    setIsPlaying(false);
    Object.values(spriteTimeoutsRef.current).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    console.log("spriteTimeoutsRef",spriteTimeoutsRef.current)
    spriteTimeoutsRef.current = {};
  };

  function resetAll() {
    pauseAll();
    spriteTimeoutsRef.current = {};
    swappedPairsRef.current = new Set();
    loopingSpritesRef.current = new Map();
    setBlocks({})
    setCommands([])
  }



   useEffect(() => {
     if (loopAnimationQueue.length === 0) return;
   
     const { spriteId, action, parentId } = loopAnimationQueue[0];
   
     if (action === "start") {
       if (!loopingSpritesRef.current.has(spriteId)) {
         loopingSpritesRef.current.set(spriteId, new Set());
       }
       loopingSpritesRef.current.get(spriteId).add(parentId);
   
       let parentIdObj = {
         isParent: true,
         parentId: parentId
       };
   
       executeCommandsForSpriteInLoop(
         sprites,
         blocks[spriteId],
         blocks,
         setBlocks,
         spriteId,
         angleMapRef,
         spriteTimeoutsRef,
         setPositions,
         setSprites,
         setShakingSprites,
         maxBound,
         setAngleTick,
         parentIdObj,
         setVisibilty
       );
     } else if (action === "stop") {
       clearTimeout(spriteTimeoutsRef.current[spriteId]);
       setIsPlaying(false);
   
       if (loopingSpritesRef.current.has(spriteId)) {
         const parentSet = loopingSpritesRef.current.get(spriteId);
         parentSet.delete(parentId);
         if (parentSet.size === 0) {
           loopingSpritesRef.current.delete(spriteId);
         }
       }
     }
   
     setLoopAnimationQueue(prev => prev.slice(1));
   }, [loopAnimationQueue]);
   
   useEffect(() => {
     sprites.forEach(sprite => {
       const spriteId = sprite.id;
   
       if (!loopingSpritesRef.current.has(spriteId)) return;
   
       const parentIds = loopingSpritesRef.current.get(spriteId);
       if (!parentIds || parentIds.size === 0) return;
   
       const newBlocks = blocks[spriteId];
       const prevBlocks = spriteTimeoutsRef.current[`__prevBlocks_${spriteId}`];
   
       const hasChanged = JSON.stringify(newBlocks) !== JSON.stringify(prevBlocks);
   
       if (hasChanged) {
         spriteTimeoutsRef.current[`__prevBlocks_${spriteId}`] = newBlocks;
         clearTimeout(spriteTimeoutsRef.current[spriteId]);
   
         loopingSpritesRef.current.delete(spriteId);
   
         parentIds.forEach(parentId => {
           let parentIdObj = {
             isParent: true,
             parentId: parentId
           };
   
           executeCommandsForSpriteInLoop(
             sprites,
             blocks[spriteId],
             blocks,
             setBlocks,
             spriteId,
             angleMapRef,
             spriteTimeoutsRef,
             setPositions,
             setSprites,
             setShakingSprites,
             maxBound,
             setAngleTick,
             parentIdObj,
             setVisibilty
           );
         });
       }
     });
   }, [blocks]);


  useEffect(() => {
    let i = 0;
    let newX = 50;
    let newY = 50;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const xAxisFinalValue = ((windowWidth * 0.40) / 2) - 50;
    const yAxisFinalValue = ((windowHeight) / 2) - 50;
    setMaxBound({
      x: xAxisFinalValue,
      y: yAxisFinalValue
    })

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
      let currentAngle = angleMapRef.current[selectedSpriteId] || 0;

      if (type === 'turn' && selectedSpriteId) {
        currentAngle += value;
        angleMapRef.current[selectedSpriteId] = currentAngle;
         setAngleTick(prev => prev + 1);
      }
      if (type === 'show' && selectedSpriteId) {
         setVisibilty({isVisible: true, spriteId:selectedSpriteId})
      }
      if (type === 'hide' && selectedSpriteId) {
         setVisibilty({isVisible: false, spriteId:selectedSpriteId})
      }

      if (type === 'goto' && selectedSpriteId) {
        newX = value.x || 50;
        newY = value.y || 50;

        setPositions(prev => {
         if (value.x > maxBound.x || value.y > maxBound.y || value.x < 0 || value.y < 0) {
           alert("Out of bound. Clamping position.");
           return {...prev}
         }
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
          const oldX = prev[selectedSpriteId]?.x || 0;
          const oldY = prev[selectedSpriteId]?.y || 0;
        
         newX = oldX + dx;
         newY = oldY + dy;
        
      
          const minX = 0;
          const minY = 0;
          const maxX = maxBound.x;
          const maxY = maxBound.y;
        
          let bounced = false;
          currentAngle = angleMapRef.current[selectedSpriteId] || 0;
        
          
          if (newX <= minX) {
            newX = minX + 10;
            bounced = true;
          }
        
         
          if (newX >= maxX) {
            newX = maxX - 10;
            bounced = true;
          }
        
        
          if (newY <= minY) {
            newY = minY + 10;
            bounced = true;
          }
        
         
          if (newY >= maxY) {
            newY = maxY - 10;
            bounced = true;
          }
        
          if (bounced) {
            currentAngle += 15;
            angleMapRef.current[selectedSpriteId] = currentAngle;
          }
        
          const updatedSprites = sprites.map(s =>
            s.id === selectedSpriteId ? { ...s, x: newX, y: newY } : s
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
    let parentIdObj = {
      isParent: false,
      parentId: null
    }
  
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
           angleMapRef,
           spriteTimeoutsRef,
           setPositions,
           setSprites,
           setShakingSprites,
           maxBound,
           setAngleTick,
          parentIdObj,
           setVisibilty
        );
      }
    });
  }, [blocks, isPlaying, sprites]);
  

  useEffect(() => {
    checkAndSwapBlocksIfOverlapping(sprites, setShakingSprites, blocks, setBlocks, position, swappedPairsRef);
  }, [position]);

   useEffect(() => {
     const updateBounds = () => {
       const windowWidth = window.innerWidth;
       const windowHeight = window.innerHeight;
       const xAxisFinalValue = ((windowWidth * 0.40) / 2) - 50;
       const yAxisFinalValue = (windowHeight / 2) - 50;
   
       setMaxBound({
         x: xAxisFinalValue,
         y: yAxisFinalValue
       });
     };
     updateBounds();
     window.addEventListener('resize', updateBounds);
     return () => {
       window.removeEventListener('resize', updateBounds);
     };
   }, []);

  return (
    <div className="relative h-[400px] w-full border bg-gray-100">
      <AddSpriteButton pauseAll={pauseAll} />
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
        onClick={resetAll}
      >
       Reset All
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
             const { x, y } = data;
             const maxX = maxBound.x;
             const maxY = maxBound.y;
           
             if (x < 0 || y < 0 || x > maxX || y > maxY) {
               return; 
             }
           
           
             if (x !== position[sprite.id]?.x || y !== position[sprite.id]?.y) {
               setPositions(prev => ({
                 ...prev,
                 [sprite.id]: { x, y }
               }));
           
               setSprites(prev =>
                 prev.map(s =>
                   s.id === sprite.id ? { ...s, x, y } : s
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
                key={angleTick}
                className={`cat-sprite ${isShaking ? 'shake' : ''} ${visibilty.spriteId == sprite.id &&  !visibilty.isVisible? 'looks-visiblity' : ''}`}
                style={{
                  transform: `translate(${position[sprite.id]?.x || 0}px, ${position[sprite.id]?.y || 0}px) rotate(${angleMapRef.current[sprite.id] || 0}deg)`,
                  transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) ',
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
  angleMapRef,
  spriteTimeoutsRef,
  setPositions,
  setSprites,
  setShakingSprites,
  maxBound,
  setAngleTick,
  parentIdObj,
  setVisibilty
) {
  let i = 0;
  let newX = 50, newY = 50;
  console.log(blocks)

  const runCommand = () => {
    if (parentIdObj.isParent) {
      blocksCommands = blocks[spriteId].filter(block => block.parentId === parentIdObj.parentId);
    } else {
      blocksCommands =  blocks[spriteId]
    }
    if (!blocksCommands || blocksCommands.length === 0) return;
    const { type, value } = blocksCommands[i];
    let currentAngle = angleMapRef.current[spriteId] || 0;

    if (type === 'turn') {
      currentAngle += value;
      angleMapRef.current[spriteId] = currentAngle;
      setAngleTick(prev => prev + 1);
    }
    
      if (type === 'show' ) {
        setVisibilty({isVisible: true, spriteId:spriteId})
        
      }
      if (type === 'hide') {
         setVisibilty({isVisible: false, spriteId:spriteId})
      }

    if (type === 'goto') {
      newX = value.x || 50;
      newY = value.y || 50;

      setPositions(prev => {
        if (value.x > maxBound.x || value.y > maxBound.y || value.x < 0 || value.y < 0) {
          alert("Out of bound. Clamping position.");
           return {...prev}
        }

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
          const oldX = prev[spriteId]?.x || 0;
          const oldY = prev[spriteId]?.y || 0;
        
          let newX = oldX + dx;
          let newY = oldY + dy;
        
      
          const minX = 0;
          const minY = 0;
          const maxX = maxBound.x;
          const maxY = maxBound.y;
        
          let bounced = false;
          let currentAngle = angleMapRef.current[spriteId] || 0;
        
          
          if (newX <= minX) {
            newX = minX + 10;
            bounced = true;
          }
        
         
          if (newX >= maxX) {
            newX = maxX - 10;
            bounced = true;
          }
        
        
          if (newY <= minY) {
            newY = minY + 10;
            bounced = true;
          }
        
         
          if (newY >= maxY) {
            newY = maxY - 10;
            bounced = true;
          }
        
          if (bounced) {
            currentAngle += 15;
            angleMapRef.current[spriteId] = currentAngle;
          }
        
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