import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";

// === Building data ===
type BuildingDef = {
  name: string;
  nameEn: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  labelOffset?: number;
};

const buildings: BuildingDef[] = [
  { name: "ボアソナード・タワー", nameEn: "Boissonade Tower", position: [-2, 1.3, -2], size: [1.5, 2.6, 1.2], color: "#3b82f6" },
  { name: "富士見ゲート", nameEn: "Fujimi Gate", position: [1, 0.75, -2.5], size: [2, 1.5, 1.2], color: "#8b5cf6" },
  { name: "外濠校舎", nameEn: "Sotobori Bldg.", position: [3.5, 0.5, 1], size: [2.2, 1, 1.6], color: "#10b981" },
  { name: "富士見坂校舎", nameEn: "Fujimizaka Bldg.", position: [4, 0.45, -2], size: [1.5, 0.9, 1.2], color: "#f59e0b" },
  { name: "80年館（図書館�?, nameEn: "Library (80th Bldg.)", position: [-1, 0.55, 0.5], size: [1.6, 1.1, 1.4], color: "#ec4899" },
  { name: "大内山校�?, nameEn: "Ouchiyama Bldg.", position: [1.5, 0.5, 2], size: [1.4, 1, 1.4], color: "#06b6d4" },
  { name: "市ケ谷駅", nameEn: "Ichigaya Sta.", position: [-4.5, 0.25, 3], size: [1, 0.5, 0.6], color: "#ef4444", labelOffset: 0.8 },
];

// === Animated building component ===
function Building({ def, onHover }: { def: BuildingDef; onHover: (name: string | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 1.08 : 1;
    const s = meshRef.current.scale;
    s.x = THREE.MathUtils.lerp(s.x, target, delta * 8);
    s.y = THREE.MathUtils.lerp(s.y, target, delta * 8);
    s.z = THREE.MathUtils.lerp(s.z, target, delta * 8);
  });

  return (
    <group position={def.position}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={() => { setHovered(true); onHover(def.name); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = "auto"; }}
      >
        <boxGeometry args={def.size} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : def.color}
          emissive={def.color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Roof edge glow */}
      <mesh position={[0, def.size[1] / 2 + 0.02, 0]}>
        <boxGeometry args={[def.size[0] + 0.05, 0.04, def.size[2] + 0.05]} />
        <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      {/* Label �?use English to avoid loading a large CJK font */}
      <Float speed={2} floatIntensity={0.3} rotationIntensity={0}>
        <Text
          position={[0, def.size[1] / 2 + (def.labelOffset ?? 0.6), 0]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {def.nameEn}
        </Text>
      </Float>
    </group>
  );
}

// === Terrain with hills ===
function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 12, 64, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Gentle hills
      const height =
        Math.sin(x * 0.5) * 0.15 +
        Math.cos(y * 0.4) * 0.12 +
        Math.sin(x * 0.3 + y * 0.3) * 0.1;
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#2d5a27" roughness={0.9} flatShading />
    </mesh>
  );
}

// === Decorative trees ===
function Trees() {
  const treePositions: [number, number, number][] = [
    [-6, 0, -4], [-5.5, 0, -1], [-6, 0, 2], [-2, 0, 3.5],
    [2, 0, 4], [5, 0, 3.5], [6, 0, -1], [5.5, 0, -4],
    [-3, 0, -4.5], [3, 0, -4.5], [0, 0, 4.5], [-5, 0, 4],
  ];

  return (
    <>
      {treePositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Trunk */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.35, 8, 6]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#1a6b1a" : i % 3 === 1 ? "#228b22" : "#2d8b2d"} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// === Paths / roads ===
function Paths() {
  return (
    <>
      {/* Main road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[12, 0.4]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.95} />
      </mesh>
      {/* Cross path */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.01, 0]}>
        <planeGeometry args={[8, 0.3]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.95} />
      </mesh>
      {/* Bus road */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[-3, 0.01, 2]}>
        <planeGeometry args={[5, 0.35]} />
        <meshStandardMaterial color="#6b7280" roughness={0.95} />
      </mesh>
    </>
  );
}

// === Rotating campus label ===
function CampusTitle() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = 4.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <group ref={ref} position={[0, 4.5, 0]}>
      <Text
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#1e3a5f"
      >
        Hosei Univ. Ichigaya Campus
      </Text>
    </group>
  );
}

// === Main exported component ===
type CampusMap3DProps = {
  className?: string;
};

export default function CampusMap3D({ className }: CampusMap3DProps) {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 3, -5]} intensity={0.3} color="#93c5fd" />

        {/* Fog for depth */}
        <fog attach="fog" args={["#0f172a", 12, 25]} />

        {/* Scene */}
        <Terrain />
        <Paths />
        <Trees />
        {buildings.map((b) => (
          <Building key={b.name} def={b} onHover={setHoveredBuilding} />
        ))}
        <CampusTitle />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={18}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Tooltip overlay */}
      {hoveredBuilding && (
        <div className="bottom-4 left-1/2 absolute bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white -translate-x-1/2 pointer-events-none">
          {hoveredBuilding}
        </div>
      )}
    </div>
  );
}
// updated: 3D�ޥå� - �����ǥ�����
