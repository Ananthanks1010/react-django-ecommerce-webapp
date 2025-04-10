// GLBViewerPage.jsx
import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

export default function GLBViewerPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [glbUrl, setGlbUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlbUrl(inputUrl.trim());
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start py-10 px-4">
      <h1 className="text-white text-3xl font-bold mb-6">GLB 3D Viewer</h1>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex items-center space-x-2 mb-6">
        <input
          type="text"
          placeholder="Enter GLB model URL"
          className="flex-grow px-4 py-2 rounded-lg outline-none bg-gray-800 text-white border border-gray-600"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Load Model
        </button>
      </form>

      {/* Viewer or message */}
      {!glbUrl ? (
        <p className="text-gray-400 text-center">
          Enter a valid GLB model URL above. Example:  
          <br />
          <code>https://tobiramasset.s3.us-east-1.amazonaws.com/products/1/Black_Pant.glb</code>
        </p>
      ) : (
        <div className="w-full max-w-4xl h-[600px] bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 5, 5]} intensity={1} />
            <Suspense fallback={null}>
              <Model url={glbUrl} />
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
      )}
    </div>
  );
}
