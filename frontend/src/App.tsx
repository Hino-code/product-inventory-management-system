import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="max-w-[1280px] mx-auto p-8 text-center">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img
              src={viteLogo}
              className="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
              alt="Vite logo"
            />
          </a>
          <a href="https://react.dev" target="_blank">
            <img
              src={reactLogo}
              className="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-spin-slow"
              alt="React logo"
            />
          </a>
        </div>
        <h1 className="text-4xl font-bold text-blue-600 underline mb-4">
          Vite + React
        </h1>
        <div className="p-8">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="mt-4">
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="text-gray-500">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </>
  );
}

export default App;
