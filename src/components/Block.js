import React from "react";
import Icon from "./Icon";

export default function Block({ block }) {
  const baseClass = "flex flex-row flex-wrap text-white px-2 py-1 my-2 text-sm rounded-md shadow-md";

  switch (block.type) {
    case "event":
      return (
        <div className={`${baseClass} bg-yellow-500`}>
          {block.value === "flag" ? (
            <>
              {"When "}
              <Icon name="flag" size={15} className="text-green-600 mx-2" />
              {"clicked"}
            </>
          ) : (
            "When sprite clicked"
          )}
        </div>
      );

    case "move":
      return (
        <div className={`${baseClass} bg-blue-500`}>
          {`Move ${block.value} steps`}
        </div>
      );

    case "turn":
      return (
        <div className={`${baseClass} bg-blue-500`}>
          {block.value > 0 ? (
            <>
              {"Turn "}
              <Icon name="undo" size={15} className="text-white mx-2" />
              {`${block.value} degrees`}
            </>
          ) : (
            <>
              {"Turn "}
              <Icon name="redo" size={15} className="text-white mx-2" />
              {`${Math.abs(block.value)} degrees`}
            </>
          )}
        </div>
      );

    case "goto":
      return (
        <div className={`${baseClass} bg-blue-500`}>
          {`Go to x: ${block.value.x} y: ${block.value.y}`}
        </div>
      );

    default:
      return (
        <div className={`${baseClass} bg-gray-500`}>
          {"Unknown block"}
        </div>
      );
  }
}
