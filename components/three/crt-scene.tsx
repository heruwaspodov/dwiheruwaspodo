"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#142018";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(167, 213, 145, .18)";
  context.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  context.fillStyle = "#c49a74";
  context.beginPath();
  context.moveTo(190, 85);
  context.lineTo(310, 100);
  context.lineTo(350, 350);
  context.lineTo(245, 430);
  context.lineTo(135, 350);
  context.lineTo(150, 110);
  context.closePath();
  context.fill();

  context.fillStyle = "#262118";
  context.beginPath();
  context.moveTo(150, 160);
  context.lineTo(185, 70);
  context.lineTo(305, 75);
  context.lineTo(350, 160);
  context.lineTo(300, 125);
  context.lineTo(235, 145);
  context.closePath();
  context.fill();

  context.fillStyle = "#ec433a";
  context.beginPath();
  context.moveTo(450, 82);
  context.lineTo(585, 95);
  context.lineTo(635, 350);
  context.lineTo(535, 430);
  context.lineTo(420, 350);
  context.lineTo(425, 110);
  context.closePath();
  context.fill();

  context.fillStyle = "#171713";
  context.beginPath();
  context.ellipse(485, 235, 65, 90, -0.2, 0, Math.PI * 2);
  context.ellipse(575, 235, 65, 90, 0.2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#fff9ea";
  context.beginPath();
  context.ellipse(490, 235, 19, 42, -0.25, 0, Math.PI * 2);
  context.ellipse(570, 235, 19, 42, 0.25, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#171713";
  context.lineWidth = 16;
  context.beginPath();
  context.moveTo(180, 235);
  context.lineTo(220, 230);
  context.moveTo(270, 230);
  context.lineTo(315, 235);
  context.moveTo(215, 345);
  context.lineTo(285, 345);
  context.stroke();

  context.fillStyle = "#d7f0c8";
  context.font = "700 18px monospace";
  context.fillText("PROFILE://DWI_HERU", 24, 34);
  context.fillText("ONLINE", 660, 34);
  context.fillStyle = "rgba(9, 15, 10, .88)";
  context.fillRect(245, 434, 300, 34);
  context.fillStyle = "#d7f0c8";
  context.fillText("IDENTITY CONFIRMED █", 270, 457);

  for (let y = 0; y < canvas.height; y += 6) {
    context.fillStyle = "rgba(0, 0, 0, .13)";
    context.fillRect(0, y, canvas.width, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function ScreenMaterial() {
  const texture = useMemo(() => createScreenTexture(), []);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  return <meshBasicMaterial color="#ffffff" map={texture ?? undefined} toneMapped={false} />;
}

function Workstation() {
  const group = useRef<THREE.Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    const time = clock.getElapsedTime();
    group.current.rotation.y = reducedMotion.current ? -0.18 : -0.18 + pointer.x * 0.08;
    group.current.rotation.x = reducedMotion.current ? 0.04 : 0.04 - pointer.y * 0.04;
    group.current.position.y = reducedMotion.current ? 0 : Math.sin(time * 1.25) * 0.08;
  });

  const keys = Array.from({ length: 36 });

  return (
    <group ref={group} rotation={[0.04, -0.18, -0.02]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[4.15, 3.15, 1.2]} />
        <meshStandardMaterial color="#d3c29d" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.63, 0.64]}>
        <boxGeometry args={[3.55, 2.42, 0.12]} />
        <meshStandardMaterial color="#171713" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.63, 0.715]}>
        <planeGeometry args={[3.27, 2.15]} />
        <ScreenMaterial />
      </mesh>
      <mesh position={[1.7, -0.7, 0.66]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color="#ef3f38" emissive="#8d130e" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, -1.25, 0]} castShadow>
        <boxGeometry args={[1.65, 0.52, 0.82]} />
        <meshStandardMaterial color="#bea984" />
      </mesh>
      <mesh position={[0, -1.62, 0.15]} castShadow>
        <boxGeometry args={[2.85, 0.24, 1.25]} />
        <meshStandardMaterial color="#c9b58e" />
      </mesh>
      <group position={[0, -1.95, 1.15]} rotation={[-0.16, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.15, 0.2, 1.55]} />
          <meshStandardMaterial color="#d9c6a0" />
        </mesh>
        {keys.map((_, index) => {
          const column = index % 9;
          const row = Math.floor(index / 9);
          return (
            <mesh key={index} position={[-1.62 + column * 0.4, 0.16, -0.52 + row * 0.34]}>
              <boxGeometry args={[0.28, 0.12, 0.2]} />
              <meshStandardMaterial color={index === 32 ? "#ef3f38" : "#292822"} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function CrtScene() {
  return (
    <Canvas camera={{ position: [0, 0.35, 7.4], fov: 38 }} dpr={[1, 1.5]} shadows>
      <ambientLight intensity={1.55} />
      <directionalLight position={[4, 7, 6]} intensity={2.6} castShadow />
      <pointLight position={[-4, 1, 3]} color="#5bb7e8" intensity={10} distance={9} />
      <Workstation />
    </Canvas>
  );
}
