import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, vec3 } from '@react-three/rapier';
import {
  OrbitControls,
  Environment,
  useGLTF,
  Stats,
  MeshTransmissionMaterial,
} from '@react-three/drei';
import * as THREE from 'three';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MouseInteraction({ onClick }) {
  const { camera, gl, scene } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  useEffect(() => {
    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        onClick(intersection.point, intersection.object);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, onClick]);

  return null;
}

function ClothModel({ modelUrl }) {
  const groupRef = useRef();
  const rigidRef = useRef();
  const gltf = useGLTF(modelUrl);
  const [clothMeshes, setClothMeshes] = useState([]);
  const forceRef = useRef(new THREE.Vector3());
  const clickPointRef = useRef(new THREE.Vector3());
  const forceActiveRef = useRef(false);
  const forceDecayRef = useRef(0);

  useEffect(() => {
    if (gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      const clothParts = [];
      gltf.scene.traverse((child) => {
        if (
          child.isMesh &&
          (child.name.toLowerCase().includes('cloth') ||
            child.name.toLowerCase().includes('shirt') ||
            child.name.toLowerCase().includes('garment'))
        ) {
          clothParts.push(child);
        }
      });
      setClothMeshes(clothParts);
    }
  }, [gltf]);

  const handleModelClick = (point, hitObject) => {
    let isCloth = false;
    groupRef.current?.traverse((child) => {
      if (child === hitObject) isCloth = true;
    });

    if (isCloth) {
      clickPointRef.current.copy(point);
      const modelCenter = new THREE.Vector3();
      groupRef.current.getWorldPosition(modelCenter);
      forceRef.current
        .subVectors(point, modelCenter)
        .normalize()
        .multiplyScalar(15);
      forceActiveRef.current = true;
      forceDecayRef.current = 30;
    }
  };

  useFrame(() => {
    if (forceActiveRef.current && forceDecayRef.current > 0) {
      if (rigidRef.current) {
        rigidRef.current.applyImpulse(vec3(forceRef.current), true);
        forceDecayRef.current--;
      }
    } else {
      forceActiveRef.current = false;
    }
  });

  return (
    <>
      <RigidBody
        ref={rigidRef}
        colliders="trimesh"
        mass={1}
        type="dynamic"
        linearDamping={0.8}
        angularDamping={0.8}
        position={[0, 10, 0]} // Raised above floor
      >
        <group ref={groupRef}>
          <primitive object={gltf.scene} scale={1} />
        </group>
      </RigidBody>

      {forceActiveRef.current && (
        <mesh position={clickPointRef.current}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <MeshTransmissionMaterial color="red" roughness={0} />
        </mesh>
      )}
    </>
  );
}

export default function InteractiveCloth() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [modelUrl, setModelUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const res = await axios.post('http://127.0.0.1:8000/Product/get-model-url/', {
          product_id: productId,
        });
        setModelUrl(res.data.model_url);
        console.log('Model URL:', res.data.model_url);
      } catch (err) {
        console.error(err);
        setError('Failed to load model.');
      }
    };
    fetchModel();
  }, [productId]);

  const handleClick = (point, object) => {
    const cloth = document.getElementById('cloth-model');
    cloth?.click && cloth.click(point, object);
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!modelUrl) return <div className="p-4 text-center">Loading 3D model...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Cancel button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded shadow"
      >
        Cancel
      </button>

      {/* Viewer */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 4], fov: 50 }}
        className="w-full h-full"
      >
        <color attach="background" args={['white']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

        <Physics gravity={[0, -9.8, 0]}>
          <ClothModel modelUrl={modelUrl} />
          <RigidBody type="fixed">
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        </Physics>

        <MouseInteraction onClick={handleClick} />
        <OrbitControls target={[0, 1, 0]} />
        <Environment preset="sunset" />
        <Stats />
      </Canvas>

      {/* Tip */}
      <div className="absolute bottom-4 left-4 z-50 text-sm bg-white/80 text-black px-4 py-2 rounded shadow max-w-xs">
        💡 Click on the garment to simulate cloth physics
      </div>
    </div>
  );
}
