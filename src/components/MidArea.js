import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import { useApp } from "../context/AppContext";
import Draggable from "react-draggable";
import { v4 as uuidv4 } from "uuid";

export default function MidArea() {
  const {
    setCommands,
    sprites,
    selectedSpriteId,
    setSprites,
    setBlocks,
    blocks,
    checkAndSwapBlocksIfOverlapping,
    setIsPlaying,
  } = useApp();

  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);

  const sprite = sprites.find((s) => s.id === selectedSpriteId);
  const selectedSpriteIdRef = useRef(selectedSpriteId);

  useEffect(() => {
    selectedSpriteIdRef.current = selectedSpriteId;

    // Sync positions if not already initialized
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

  const handleBlockClick = (block) => {
    if (["move", "turn", "goto"].includes(block.type)) {
      setCommands([block]);
    }
  };

  const [, drop] = useDrop(() => ({
    accept: "BLOCK",
    drop: (item, monitor) => {
      const currentSpriteId = selectedSpriteIdRef.current;
      const offset = monitor.getClientOffset();
      const containerRect = containerRef.current.getBoundingClientRect();

      const newX = offset.x - containerRect.left;
      const newY = offset.y - containerRect.top;

      let matchedGroupId = null;
      const currentBlocks = blocks[currentSpriteId] || [];

      for (const block of currentBlocks) {
        const dx = Math.abs(block.x - newX);
        const dy = Math.abs(block.y - newY);
        if (dx < 80 && dy < 30) {
          matchedGroupId = block.groupId;
          break;
        }
      }

      const newBlockId = uuidv4();
      const newBlock = {
        ...item,
        id: newBlockId,
        x: newX,
        y: newY,
        groupId: matchedGroupId || uuidv4(),
        className: item.className || "bg-orange-500 text-white",
        value:
          item.type === "goto"
            ? { x: sprite?.x ?? 0, y: sprite?.y ?? 0 }
            : item.defaultValue ?? item.value,
      };

      setBlocks((prev) => ({
        ...prev,
        [currentSpriteId]: [...(prev[currentSpriteId] || []), newBlock],
      }));

      setPositions((prev) => ({
        ...prev,
        [currentSpriteId]: {
          ...(prev[currentSpriteId] || {}),
          [newBlockId]: { x: newX, y: newY },
        },
      }));

      checkAndSwapBlocksIfOverlapping();
    },
  }));

  const handleDrag = useCallback((e, data, block, index) => {
    const groupId = block.groupId;
    const spriteBlocks = blocks[selectedSpriteId] || [];
    const currentPositions = positions[selectedSpriteId] || {};

    const deltaX = data.x - (currentPositions[block.id]?.x || 0);
    const deltaY = data.y - (currentPositions[block.id]?.y || 0);

    const updatedBlocks = spriteBlocks.map((b) => {
      if (b.groupId === groupId) {
        return {
          ...b,
          x: (currentPositions[b.id]?.x || 0) + deltaX,
          y: (currentPositions[b.id]?.y || 0) + deltaY,
        };
      }
      return b;
    });

    const updatedPositions = { ...currentPositions };
    spriteBlocks.forEach((b) => {
      if (b.groupId === groupId) {
        updatedPositions[b.id] = {
          x: (currentPositions[b.id]?.x || 0) + deltaX,
          y: (currentPositions[b.id]?.y || 0) + deltaY,
        };
      }
    });

    setBlocks((prev) => ({
      ...prev,
      [selectedSpriteId]: updatedBlocks,
    }));

    setPositions((prev) => ({
      ...prev,
      [selectedSpriteId]: updatedPositions,
    }));

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
          onDrag={(e, data) => handleDrag(e, data, block, index)}
        >
          <div
            className={`absolute ${block.className} px-4 py-2 rounded-md shadow-md cursor-move text-sm`}
            onClick={() => handleBlockClick(block)}
          >
            {renderBlockText(block)}
          </div>
        </Draggable>
      ))}
    </div>
  );

  function renderBlockText(block) {
    switch (block.type) {
      case "event":
        return block.value === "flag"
          ? "When 🏁 clicked"
          : "When sprite clicked";
      case "move":
        return `Move ${block.value} steps`;
      case "turn":
        return `Turn ${block.value} degrees`;
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
