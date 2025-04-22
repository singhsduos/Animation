import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import { useApp } from "../context/AppContext";
import Draggable from "react-draggable";
import { v4 as uuidv4 } from "uuid";
import "../CSS/index.css"

export default function MidArea() {
  const {
    setCommands,
    sprites,
    selectedSpriteId,
    setBlocks,
    blocks,
    setIsPlaying,
    setLoopAnimationQueue
  } = useApp();

  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);
  const draggedGroupIdRef = useRef(null);

  const handleDragStart = (block) => {
    draggedGroupIdRef.current = block.groupId;
  };


  const sprite = sprites.find((s) => s.id === selectedSpriteId);
  const selectedSpriteIdRef = useRef(selectedSpriteId);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    selectedSpriteIdRef.current = selectedSpriteId;
    const currentBlocks = blocks[selectedSpriteId] || [];
    const posObj = {};
    currentBlocks.forEach((block) => {
      posObj[block.id] = { x: block.x, y: block.y };
    });
    setPositions((prev) => ({ ...prev, [selectedSpriteId]: posObj }));
  }, [selectedSpriteId, blocks]);

  const updateBlockValue = (blockId, newValue) => {
    setBlocks((prev) => {
      const updated = (prev[selectedSpriteId] || []).map((b) =>
        b.id === blockId ? { ...b, value: newValue } : b
      );
      return { ...prev, [selectedSpriteId]: updated };
    });
  };
    const moveNumberOfSteps = (blockId, newValue) => {
       setBlocks((prev) => {
         const updated = (prev[selectedSpriteId] || []).map((b) =>
           b.id === blockId ? { ...b, value: newValue } : b
         );
         return { ...prev, [selectedSpriteId]: updated };
       });
    }


   const handleBlockClick = (block, spriteId) => {
     const allBlocks = blocks[spriteId] || [];
      setLoopAnimationQueue(prev => {
         const alreadyQueued = prev.some(
           (q) => q.spriteId === spriteId && q.action === "stop"
         );
         return alreadyQueued ? prev : [...prev, { spriteId, action: "stop", parentId: block.id }];
       });
   
     if (["move", "turn", "goto", "show", "hide"].includes(block.type)) {
       setCommands([block]);
       return;
     }
   
     if (block.type === "event") {
       const childBlocks = allBlocks
         .filter((b) => b.parentId === block.id)
         .sort((a, b) => a.y - b.y);
   
       const executionList = [block, ...childBlocks];
       setCommands(executionList);
       
       if (block.value == "repeat") {
          setLoopAnimationQueue(prev => {
            const alreadyQueued = prev.some(
              (q) => q.spriteId === spriteId && q.action === "start"
            );
            return alreadyQueued ? prev : [...prev, { spriteId, action: "start", parentId: block.id }];
          });
       }
     }
   };



 const handleDeleteBlock = (blockId) => {
   setLoopAnimationQueue(prev => {
      const alreadyQueued = prev.some(
        (q) => q.spriteId === selectedSpriteId && q.action === "stop"
      );
      return alreadyQueued ? prev : [...prev, { spriteId: selectedSpriteId, action: "stop" }];
    });
 
   setBlocks((prev) => {
     const spriteBlocks = prev[selectedSpriteId] || [];
     const blockToDelete = spriteBlocks.find((b) => b.id === blockId);
     const blockY = blockToDelete?.y || 0;
     const parentId = blockToDelete?.parentId;
 
     let updatedBlocks = [...spriteBlocks];
 
     if (blockToDelete?.type === "event" && blockToDelete?.parentId === null) {
       updatedBlocks = updatedBlocks.filter(
         (block) => block.id !== blockId && block.parentId !== blockId
       );
     } else {
       console.log("else delete")
       updatedBlocks = updatedBlocks.filter((block) => block.id !== blockId);
 
       const siblingsToShift = spriteBlocks.filter(
         (b) =>
           b.parentId === parentId &&
           b.id !== blockId &&
           b.y > blockY
       );
 
       siblingsToShift.forEach((sibling) => {
         const index = updatedBlocks.findIndex((b) => b.id === sibling.id);
         if (index !== -1) {
           updatedBlocks[index] = {
             ...updatedBlocks[index],
             y: updatedBlocks[index].y - 40,
           };
         }
       });
     }
 
     return {
       ...prev,
       [selectedSpriteId]: updatedBlocks,
     };
   });

  setPositions((prev) => {
      const currentPositions = { ...prev[selectedSpriteId] };
      const blockToDelete = blocks[selectedSpriteId]?.find((b) => b.id === blockId);
      const blockY = blockToDelete?.y || 0;
      const parentId = blockToDelete?.parentId;
  
      delete currentPositions[blockId];
      if (blockToDelete?.type === "event" && blockToDelete?.parentId === null) {
        blocks[selectedSpriteId]
          .filter((b) => b.parentId === blockId)
          .forEach((child) => {
            delete currentPositions[child.id];
          });
      } else {
        blocks[selectedSpriteId]
          .filter(
            (b) =>
              b.parentId === parentId &&
              b.id !== blockId &&
              b.y > blockY
          )
          .forEach((sibling) => {
            if (currentPositions[sibling.id]) {
              currentPositions[sibling.id] = {
                ...currentPositions[sibling.id],
                y: currentPositions[sibling.id].y - 40,
              };
            }
          });
      }
  
      return {
        ...prev,
        [selectedSpriteId]: currentPositions,
      };
    });
  };


  const [, drop] = useDrop(() => ({
    accept: "BLOCK",
    drop: (item, monitor) => {
      const currentSpriteId = selectedSpriteIdRef.current;
      const offset = monitor.getSourceClientOffset();
      const containerRect = containerRef.current.getBoundingClientRect();

      let newX = offset.x - containerRect.left;
      let newY = offset.y - containerRect.top;

      let matchedGroupId = null;
      const currentBlocks = blocksRef.current[currentSpriteId] || [];
      let parentId = null;
      let parentBlock = null;
      let samePostionOfEventBlock = false;
      let sameEventDifferentValue = false;
      let currentIsParent = false

      for (const block of currentBlocks) {
        const dx = Math.abs(block.x - newX);
        const dy = Math.abs(block.y - newY)
        if (dx <= 100 && dy <= 100) {
          if (block.value === item.value && block.type==="event" && item.type==="event") {
              samePostionOfEventBlock = true;
              matchedGroupId = null;
          }

          if (block.type === "event" && item.value != block.value) {
            parentId = block.id;
            parentBlock = block;
            matchedGroupId = block.groupId;
            if (block.value !== item.value && block.type === "event" && item.type === "event") {
              sameEventDifferentValue = true;
            }
          }
          if (item.type === "event" && block.type != "event") {
            currentIsParent = true;
            matchedGroupId = block.groupId;
            newX = block.x;
            newY = block.y - 40;
          }
          break;
        }
      }
      if (parentId) {
        const children = currentBlocks.filter((b) => b.parentId === parentId);
        let last = null;
        if (children.length === 1 && !sameEventDifferentValue) {
          last = children[0];
        } else if (children.length > 1 && !sameEventDifferentValue) {
          last = children.reduce((a, b) => (a.y > b.y ? a : b));
        }

      
        if (last) {
          newX = last.x;
          newY = last.y + 40;
        } else if (parentBlock) {
          newX = parentBlock.x;
          newY = parentBlock.y + 40;
        } 
      }
      const newBlockId = uuidv4();
      const newBlock = {
        ...item,
        id: newBlockId,
        x: samePostionOfEventBlock ? newX+101: newX,
        y: samePostionOfEventBlock? newY+101: newY,
        groupId: matchedGroupId || uuidv4(),
        parentId: parentId || null,
        className: item.className || "bg-orange-500 text-white",
        value:
          item.type === "goto"
            ? { x: sprite?.x ?? 0, y: sprite?.y ?? 0 }
            : item.defaultValue ?? item.value,
      };

      if (sameEventDifferentValue) {
        setBlocks((prev) => {
          const spriteBlocks = prev[currentSpriteId] || [];
          let updatedBlocks = [...spriteBlocks];
          updatedBlocks = updatedBlocks.filter((block) => block.id !== newBlockId);
  
          const siblingsToShift = spriteBlocks.filter(
            (b) =>
              b.parentId === parentId &&
              b.id !== newBlockId
          );
          siblingsToShift.forEach((sibling) => {
            const index = updatedBlocks.findIndex((b) => b.id === sibling.id);
            if (index !== -1) {
              updatedBlocks[index] = {
                ...updatedBlocks[index],
                y: updatedBlocks[index].y + 40,
              };
            }
          });
            
          const updated = {
          ...prev,
          [currentSpriteId]:[...updatedBlocks,newBlock],
        };
        blocksRef.current = updated;
        return updated;

      }) 
        setPositions((prev) => {
        const currentPositions = { ...prev[currentSpriteId] };
        const allBlocks = [...(blocksRef.current[currentSpriteId] || [])];
        const siblingsToShift = allBlocks.filter(
          (b) =>
            b.parentId === parentId &&
            b.id !== newBlockId 
        );
  
        siblingsToShift.forEach((sibling) => {
          if (currentPositions[sibling.id]) {
            currentPositions[sibling.id] = {
              ...currentPositions[sibling.id],
              y: currentPositions[sibling.id].y + 40,
            };
          }
        });

        return {
          ...prev,
          [currentSpriteId]: currentPositions,
        };

       });
      }
      else {
        setBlocks((prev) => {
           const updatedBlocks = (prev[currentSpriteId] || []).map((block) => {
                const dx = Math.abs(block.x - newBlock.x);
    const dy = Math.abs(block.y - newBlock.y);

    if (currentIsParent && dx <= 100 && dy <= 100) {
      return {
        ...block,
        parentId: newBlockId,
        groupId: newBlock.groupId,
      };
    }
             return block; 
           });
         
          let updated = {}
          if (currentIsParent) {
            updated = {
             ...prev,
             [currentSpriteId]: [newBlock,...(updatedBlocks || [])],
           };
            
          } else {
             updated = {
             ...prev,
             [currentSpriteId]: [...(updatedBlocks || []),newBlock],
           };
          }
         
           blocksRef.current = updated;
           return updated;
        });

        
        setPositions((prev) => ({
          ...prev,
          [currentSpriteId]: {
            ...(prev[currentSpriteId] || {}),
            [newBlockId]: { x: newX, y: newY },
          },
        }));
      }

    },
  }));

  const handleDrag = useCallback((e, data, block, index) => {
    const spriteBlocks = blocks[selectedSpriteId] || [];
    const currentPositions = positions[selectedSpriteId] || {};
  
    let newX = data.x;
    let newY = data.y;
  
    let matchedGroupId = null;
    let matchedParentId = null;
    let samePostionOfEventBlock = false;
    let sameEventDifferentValue = false;

    for (const b of spriteBlocks) {
      if (b.id !== block.id && b.type === "event") {
      const dx = Math.abs((currentPositions[b.id]?.x || 0) - newX);
        const dy = Math.abs((currentPositions[b.id]?.y || 0) - newY);
  
        if (dx <= 100 && dy <= 100) {
          matchedGroupId = b.groupId;
          if (b.value === block.value && b.type==="event" && block.type==="event") {
            samePostionOfEventBlock = true;
            matchedGroupId = null;
          }

         if (b.type === "event" && block.value != b.value) {
           matchedParentId = b.id;  
          if (block.value !== block.value && b.type === "event" && block.type === "event") {
            sameEventDifferentValue = true;
          }
        }
          
  
          newX = currentPositions[b.id]?.x || 0;
  
          const children = spriteBlocks.filter(
            (child) => child.parentId === b.id && child.id !== block.id
          );
  
          if (children.length > 0) {
            const lastChild = children.reduce((a, b) =>
              (currentPositions[a.id]?.y || 0) > (currentPositions[b.id]?.y || 0) ? a : b
            );
            newY = (currentPositions[lastChild.id]?.y || 0) + 40;
          } else  {
            newY = (currentPositions[b.id]?.y || 0) + 40;
          }
          break;
        }
      }
    }
  
    const deltaX = newX - (currentPositions[block.id]?.x || 0);
    const deltaY = newY - (currentPositions[block.id]?.y || 0);
  
    const draggedGroupId = draggedGroupIdRef.current;
  
    const updatedBlocks = spriteBlocks.map((b) => {
      const isDraggedBlock = b.id === block.id;
      const isInDraggedGroup = b.groupId === draggedGroupId;
  
      return {
        ...b,
        x: isInDraggedGroup ? (currentPositions[b.id]?.x || 0) + deltaX : b.x,
        y: isInDraggedGroup ? (currentPositions[b.id]?.y || 0) + deltaY : b.y,
        groupId: isDraggedBlock && matchedGroupId ? matchedGroupId : b.groupId,
        parentId: isDraggedBlock && matchedParentId ? matchedParentId : b.parentId,
      };
    });
  
    const updatedPositions = { ...currentPositions };
    spriteBlocks.forEach((b) => {
      if (b.groupId === draggedGroupId) {
        updatedPositions[b.id] = {
          x: (currentPositions[b.id]?.x || 0) + deltaX,
          y: (currentPositions[b.id]?.y || 0) + deltaY,
        };
      }
    });
          if (sameEventDifferentValue) {
        setBlocks((prev) => {
          const spriteBlocks = prev[selectedSpriteId] || [];
          let updatedBlocks = [...spriteBlocks];
          updatedBlocks = updatedBlocks.filter((block) => block.id !== newBlockId);
  
          const siblingsToShift = spriteBlocks.filter(
            (b) =>
              b.parentId === parentId &&
              b.id !== newBlockId
          );
          siblingsToShift.forEach((sibling) => {
            const index = updatedBlocks.findIndex((b) => b.id === sibling.id);
            if (index !== -1) {
              updatedBlocks[index] = {
                ...updatedBlocks[index],
                y: updatedBlocks[index].y + 40,
              };
            }
          });
            
          const updated = {
          ...prev,
          [selectedSpriteId]:[...updatedBlocks,newBlock],
        };
        return updated;

      }) 
        setPositions((prev) => {
        const currentPositions = { ...prev[selectedSpriteId] };
        const allBlocks = [...(blocksRef.current[selectedSpriteId] || [])];
        const siblingsToShift = allBlocks.filter(
          (b) =>
            b.parentId === parentId &&
            b.id !== newBlockId 
        );
  
        siblingsToShift.forEach((sibling) => {
          if (currentPositions[sibling.id]) {
            currentPositions[sibling.id] = {
              ...currentPositions[sibling.id],
              y: currentPositions[sibling.id].y + 40,
            };
          }
        });

        return {
          ...prev,
          [currentSpriteId]: currentPositions,
        };

       });
      }
      else {
            setBlocks((prev) => ({
      ...prev,
      [selectedSpriteId]: updatedBlocks,
    }));
  
    setPositions((prev) => ({
      ...prev,
      [selectedSpriteId]: updatedPositions,
    }));
      }
  

  
    setIsPlaying(false);
  }, [blocks, positions, selectedSpriteId]);

  return (
    <div
      ref={(node) => {
        drop(node);
        containerRef.current = node;
      }}
      className="flex-1 h-full bg-gray-100 p-4 overflow-y-auto rounded-xl relative"
    >
      <h2 className="font-bold mb-4">
        Workspace for CatSprite Id - {selectedSpriteId}
      </h2>

      {(blocks[selectedSpriteId] || []).map((block, index) => (
        <Draggable
          key={block.id}
          position={{ x: block.x, y: block.y }}
          onStart={(e, data) => handleDragStart(block)} 
          onDrag={(e, data) => handleDrag(e, data, block, index)}
        >
          <div
             className={`absolute ${block.className} ${
               ["event"].includes(block.type) ? "block-expanded" : ""
             } px-4 py-2 rounded-md shadow-md cursor-move text-sm height-40`}

            style={{
              zIndex: block.parentId ? 1 : 0,
              display: "flex",
              flexDirection: "row"
            }}
            onClick={() => handleBlockClick(block,selectedSpriteId)}
          >
            {renderBlockText(block)}
            <button
              onClick={() => handleDeleteBlock(block.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ❌
            </button>
          </div>
        </Draggable>
      ))}
    </div>
  );

  function renderBlockText(block) {
    switch (block.type) {
      case "event":
        return block.value === "repeat"
          ? "Loop Anmiation"
          : "When sprite clicked";
      case "move":
      return (
          <div className="flex items-center space-x-2">
            <span>Move</span>
            <input
              type="number"
              value={block.value}
              onChange={(e) =>
                moveNumberOfSteps(block.id, e.target.value)
              }
              className="w-14 px-1 py-0.5 rounded text-black"
            />
            <span>steps</span>
          </div>
        );
      case "turn":
        return `Turn ${block.value} degrees`;
      case "show":
        return `Show`;
      case "hide":
        return 'Hide';
      case "goto":
        return (
          <div className="flex items-center space-x-2">
            <span>Go to</span>
            <input
              type="number"
              value={block.value?.x ?? sprite?.x ?? 0}
              onChange={(e) =>
                updateBlockValue(block.id, {
                  ...block.value,
                  x: parseInt(e.target.value),
                })
              }
              className="w-14 px-1 py-0.5 rounded text-black"
            />
            <span>,</span>
            <input
              type="number"
              value={block.value?.y ?? sprite?.y ?? 0}
              onChange={(e) =>
                updateBlockValue(block.id, {
                  ...block.value,
                  y: parseInt(e.target.value),
                })
              }
              className="w-14 px-1 py-0.5 rounded text-black"
            />
          </div>
        );
      default:
        return "Unknown block";
    }
  }
}
