import React from "react";
import { v4 as uuidv4 } from 'uuid';
import DraggableBlock from "./DraggableBlock";



export default function Sidebar() {
  const blocks = [
    {  id: uuidv4(), type: "event", value: "flag", className: "bg-yellow-500", parentId: null },
    {  id: uuidv4(), type: "event", value: "spriteClick", className: "bg-yellow-500", parentId: null },
    {  id: uuidv4(), type: "move", value: 10, className: "bg-blue-500", parentId: null },
    {  id: uuidv4(), type: "turn", value: 15, className: "bg-blue-500", parentId: null },
    {  id: uuidv4(), type: "turn", value: -15, className: "bg-blue-500", parentId: null },
    {  id: uuidv4(), type: "goto", value: { x: 0, y: 0 }, className: "bg-blue-500",parentId: null },
  ];
  return (
    <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200">
      <div className="font-bold">Events</div>
      {blocks.map((block) => (
        <DraggableBlock key={block.id} block={block} className={block.className} />
      ))}
    </div>
  );
}
