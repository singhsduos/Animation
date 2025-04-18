import React, { useRef } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AppProvider } from "./context/AppContext";


export default function App() {
  return (
    <AppProvider>
    <DndProvider backend={HTML5Backend}>
    <div className="bg-blue-100 pt-6 font-sans">
      <div className="h-screen overflow-hidden flex flex-row  ">
        <div className="flex-1 h-screen overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2">
          <Sidebar /> <MidArea />
        </div>
        <div style={{width:"40%"}} className="overflow-hidden flex flex-row bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
              <PreviewArea />
        </div>
      </div>
    </div>
    </DndProvider>
    </AppProvider>
  );
}
