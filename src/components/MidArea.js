import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useApp } from "../context/AppContext";
import Draggable from "react-draggable";
import { v4 as uuidv4 } from "uuid";

export default function MidArea() {
  const {
    blocks,
    setBlocks,
    setCommands,
    sprites,
    selectedSpriteId,
  } = useApp();

  const [positions, setPositions] = useState([]);
  const containerRef = useRef(null);
  const blocksRef = useRef([]);
  const sprite = sprites.find((s) => s.id === selectedSpriteId);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const handleBlockClick = (block) => {
    if (["move", "turn", "goto"].includes(block.type)) {
      setCommands([block]);
    }
  };

  const updateBlockValue = (blockId, newValue) => {
    const updatedBlocks = blocks.map((b) =>
      b.id === blockId ? { ...b, value: newValue } : b
    );
    setBlocks(updatedBlocks);
  };

  const [, drop] = useDrop(() => ({
    accept: "BLOCK",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = offset.x - containerRect.left;
      const newY = offset.y - containerRect.top;

      let matchedGroupId = null;
      blocksRef.current.forEach((block) => {
        const distanceX = Math.abs(block.x - newX);
        const distanceY = Math.abs(block.y - newY);
        if (distanceX < 80 && distanceY < 30) {
          matchedGroupId = block.groupId;
        }
      });

      const newBlock = {
        ...item,
        id: uuidv4(),
        x: newX,
        y: newY,
        groupId: matchedGroupId || uuidv4(),
        className: item.className || "bg-orange-500 text-white",
        value:
          item.type === "goto"
            ? { x: sprite?.x ?? 0, y: sprite?.y ?? 0 }
            : item.defaultValue ?? item.value,
      };

      setBlocks((prev) => [...prev, newBlock]);
      setPositions((prev) => [...prev, { x: newX, y: newY }]);
    },
  }));

  const handleDrag = (e, data, index) => {
    const draggedBlock = blocks[index];
    const groupId = draggedBlock.groupId;

    const deltaX = data.x - (positions[index]?.x || 0);
    const deltaY = data.y - (positions[index]?.y || 0);

    const newBlocks = blocks.map((block, i) => {
      if (block.groupId === groupId) {
        return {
          ...block,
          x: (positions[i]?.x || 0) + deltaX,
          y: (positions[i]?.y || 0) + deltaY,
        };
      }
      return block;
    });

    const newPositions = positions.map((pos, i) => {
      if (blocks[i].groupId === groupId) {
        return {
          x: (pos?.x || 0) + deltaX,
          y: (pos?.y || 0) + deltaY,
        };
      }
      return pos;
    });

    setBlocks(newBlocks);
    setPositions(newPositions);
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        containerRef.current = node;
      }}
      className="flex-1 h-full bg-gray-100 p-4 overflow-y-auto rounded-xl relative"
    >
      <h2 className="font-bold mb-4">Workspace</h2>
      {blocks.map((block, index) => (
        <Draggable
          key={block.id}
          position={{ x: block.x, y: block.y }}
          onDrag={(e, data) => handleDrag(e, data, index)}
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
