import React from "react";
import { useDrag } from "react-dnd";

export default function DraggableBlock({ block, className }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: block,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  function renderBlockText(block) {
    switch (block.type) {
      case "event":
        return block.value === "repeat"
          ? "Loop Animation"
          : "When sprite clicked";
      case "move":
        return `Move ${block.value} steps`;
      case "turn":
        return `Turn ${block.value} degrees`;
      case "goto":
        return `Go to x: ${block.value.x} y: ${block.value.y}`;
      case "show":
        return `Show`
      case "hide":
        return 'Hide'
      default:
        return "Unknown block";
    }
  }

  return (
    <div
      ref={drag}
      className={`flex flex-row items-center px-2 py-1 my-2 text-sm rounded cursor-pointer shadow ${className}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {renderBlockText(block)}
    </div>
  );
}
