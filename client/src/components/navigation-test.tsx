import { useState } from "react";
import { Menu, X } from "lucide-react";

export function NavigationTest() {
  const [isOpen, setIsOpen] = useState(false);

  console.log('NavigationTest render, isOpen:', isOpen);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/90">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-white font-bold">TEST MENU</div>
          
          <button
            onClick={() => {
              console.log('TEST: Menu button clicked, current state:', isOpen);
              setIsOpen(!isOpen);
              console.log('TEST: Menu state will be:', !isOpen);
            }}
            className="lg:hidden text-white p-2 border border-white rounded bg-blue-500"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Simple mobile menu without animations */}
        {isOpen && (
          <div className="lg:hidden bg-green-500 p-4 min-h-[200px] border-2 border-yellow-400">
            <div className="text-white text-xl font-bold">MENU IS OPEN!</div>
            <div className="text-white">Item 1</div>
            <div className="text-white">Item 2</div>
            <div className="text-white">Item 3</div>
          </div>
        )}
      </div>
    </div>
  );
}