import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import { RigidBody, Physics } from '@react-three/rapier';

// Error boundary class
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Canvas error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 font-semibold p-4">
          ❌ Failed to render model. Please check your GLB URL or CORS settings.
        </div>
      );
    }
    return this.props.children;
  }
}

function Model({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  const modelRef = useRef();

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <RigidBody type="fixed" colliders="hull" position={[0, 0, 0]} ref={modelRef}>
      <primitive object={gltf.scene} scale={1} />
    </RigidBody>
  );
}

function Floor() {
  return (
    <RigidBody type="fixed">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </RigidBody>
  );
}

function LoadingIndicator() {
  return (
    <Html center>
      <div className="text-lg font-semibold text-gray-700">Loading 3D model...</div>
    </Html>
  );
}

export default function ModelViewer() {
  const [url, setUrl] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      setSubmittedUrl(url.trim());
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter .glb model URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 py-2 w-[400px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View
        </button>
      </form>

      <div className="w-full h-[75vh] bg-white shadow rounded">
        {submittedUrl ? (
          <CanvasErrorBoundary>
            <Canvas
              shadows
              camera={{ position: [5, 5, 5], fov: 50 }}
              style={{ width: '100%', height: '100%' }}
            >
              <color attach="background" args={['#ffffff']} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <Physics>
                <Suspense fallback={<LoadingIndicator />}>
                  <Model url={submittedUrl} />
                  <Floor />
                </Suspense>
              </Physics>
              <OrbitControls />
              <Environment preset="sunset" />
            </Canvas>
          </CanvasErrorBoundary>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
            Paste a GLB model URL above to preview it.
          </div>
        )}
      </div>
    </div>
  );
}
