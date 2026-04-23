import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Thermometer, Wind, Droplets, TreeDeciduous, 
  Activity, Zap, AlertTriangle, X, CloudFog 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area  
} from 'recharts';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import './index.css';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import EndangeredAnimals from './components/EndangeredAnimals';
import { useNavigate, BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { REGION_DATA } from './data/regionData';
import { MARKER_LIST } from './data/markerConfig';
import EcoIssues from './components/EcoIssues';
import Profile from './components/Profile'; 
import NewsPage from './components/NewsPage';
import CommunityForum from './components/CommunityForum';

const NAV_ITEMS = [
  { id: 'dashboard', label: '全球看板', targetY: 0 },
  { id: 'species', label: '濒危物种', targetY: window.innerHeight },
  { id: 'data', label: '底层数据库', targetY: window.innerHeight * 2 },
];





// --- 着色器代码 ---
const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  void main() {
    // 1. pow 设为 3.0：比 5.0 丰满，比 2.0 锐利
    // 2. 0.5：起始点适中
    float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
    
    // 3. 系数设为 0.7：保证有足够的色彩饱和度
    
  }
`;
const haloVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  void main() {
    float dist = distance(vUv, vec2(0.5));
    float pulse = mod(uTime * 0.5, 1.0);
    float ring = smoothstep(pulse - 0.05, pulse, dist) * (1.0 - smoothstep(pulse, pulse + 0.05, dist));
    gl_FragColor = vec4(uColor, ring * (1.0 - pulse));
  }
`;

// --- 3D 组件 ---

function Atmosphere() {
  const atmosRef = useRef();
 
  const [atmosMap] = useLoader(THREE.TextureLoader, ['/aaa1.png']);


  const atmosVertex = `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const atmosFragment = `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    uniform sampler2D uMap;
    uniform vec3 uColor;

    void main() {
      // 1. 采样贴图颜色
      vec4 texColor = texture2D(uMap, vUv);
      
      // 2. 计算视角夹角（菲涅尔）
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float dotProduct = dot(normal, viewDir);
      
      // 3. 核心修改：增加中心基础亮度 (0.1) 和 边缘增强 (pow)
      // 这样确保中心有 0.1 的底色覆盖，不会看起来像个空环
      float intensity = 0.3 + pow(1.0 - dotProduct, 2.0) * 0.6;
      
      // 4. 混合贴图与发光
      // 最终颜色 = 贴图 * 基础色 * 强度
      gl_FragColor = vec4(uColor, 1.0) * texColor * intensity;
    }
  `;

  useFrame(() => {
    if (atmosRef.current) atmosRef.current.rotation.y += 0.0005;
  });

  return (
    <mesh ref={atmosRef} scale={[1.1, 1.1, 1.1]}>
      <sphereGeometry args={[2.2, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosVertex}
        fragmentShader={atmosFragment}
        transparent={true}
        blending={THREE.AdditiveBlending}
        // side 改回 FrontSide，让我们能看到覆盖在地球前面的大气
        side={THREE.FrontSide} 
        depthWrite={false}
        uniforms={{
          uMap: { value: atmosMap },
          uColor: { value: new THREE.Color("#ffffff") } // 这里控制大气的总色调
        }}
      />
    </mesh>
  );
}
function CloudShell() {
  const shellRef = useRef();


  const shellVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const shellFragmentShader = `
    precision highp float;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform vec3 uColor;
    void main() {
      // 计算视角方向
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // dot(normal, viewDir) 在中心为 1，在边缘为 0
      float dotProduct = dot(normal, viewDir);
      
      // 关键：增加一个基础透明度（0.2），确保中间不是空的
      // 然后再加上边缘增强效果
      float intensity = 0.2 + pow(1.0 - dotProduct, 2.0) * 0.5;
      
      gl_FragColor = vec4(uColor, intensity * 0.05); // 0.3 是整体总透明度
    }
  `;

  useFrame(() => {
    if (shellRef.current) {
      shellRef.current.rotation.y += 0.001;
    }
  });

  // return (
  //   <mesh ref={shellRef} scale={[1.08, 1.08, 1.08]} pointerEvents="none">
  //     <sphereGeometry args={[2.2, 128, 128]} /> {/* 提高细分数 */}
  //     <shaderMaterial
  //       vertexShader={shellVertexShader}
  //       fragmentShader={shellFragmentShader}
  //       transparent={true}
  //       blending={THREE.AdditiveBlending}
  //       side={THREE.DoubleSide} // 渲染双面，增加厚度感
  //       depthWrite={false}
  //       uniforms={{
  //         uColor: { value: new THREE.Color("#beff33") } // 这里改纯色颜色
  //       }}
  //     />
  //   </mesh>
  // );
}

function Marker({ position, onClick, label, data, tag,align = "right",color = "#66ff00" }) {
  const [hovered, setHover] = useState(false);
  const [isBehind, setIsBehind] = useState(false);
  
  const markerRef = useRef();
  const haloRef = useRef();
  const hoverColor = "#b4ff59";

  // 获取 y 轴坐标，判断是在北半球还是南半球
  // 地球半径是 2.2，如果 y > 1.2 说明靠近北极，引线需要向下
 // 极地自适应判断
  const isNorth = position[1] > 1.2; 
  const isLeft = align === "left";
  
  const offsetX = isLeft ? -70 : 70; 
  const offsetY = isNorth ? 70 : -70; 


  
  useFrame((state) => {
    if (!markerRef.current) return;


    
    // 1. 创建一个向量来存储世界坐标
    const worldPos = new THREE.Vector3();
    
    // 2. 获取当前 Marker 此时此刻在 3D 空间中的真实位置
    // 这会自动把父级 Earth 组的 rotation（[0, Math.PI / 1.5, 0]）计算进去
    markerRef.current.getWorldPosition(worldPos);
    
    // 3. 将坐标归一化（变成长度为 1 的方向向量）
    worldPos.normalize();

    // 4. 获取摄像机的位置向量并归一化
    const camPos = state.camera.position.clone().normalize();

    // 5. 计算点积：如果点积 < 0.2，说明该点转到了球体背面或边缘
    const dot = camPos.dot(worldPos);
    setIsBehind(dot < 0.2); 

    // --- 动画逻辑  ---
    const t = state.clock.getElapsedTime();
    if (markerRef.current.material) {
      markerRef.current.material.emissiveIntensity = hovered ? 6 : 2 + Math.sin(t * 3) * 2;
    }
  });

  return (
    <group position={position}>
 
      <mesh ref={markerRef} visible={!isBehind}>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshStandardMaterial 
          color={hovered ? hoverColor : color} 
          emissive={hovered ? hoverColor : color} 
          toneMapped={false} 
        />
      </mesh>


     {/* 感应区 */}
          <mesh 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (!isBehind) onClick(); 
        }} 
       
        onPointerOver={() => { if (!isBehind) setHover(true); }} 
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} /> 
        <meshBasicMaterial visible={false} transparent opacity={0} />
      </mesh>

    
      <AnimatePresence>
        {(hovered && !isBehind) && (
          <Html center distanceFactor={8} position={[0, 0, 0]} zIndexRange={[50, 100]} style={{ pointerEvents: 'none', userSelect: 'none',zIndex: 100 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              
            
              <svg className="absolute overflow-visible pointer-events-none" style={{ width: 1, height: 1, left: 0, top: 0 }}>
                <motion.line 
                  initial={{ x2: 0, y2: 0 }}
                  animate={{ x2: offsetX, y2: offsetY }}
                  x1="0" y1="0" 
                  stroke="black" 
                  strokeWidth="1.2" 
                />
                <circle cx="0" cy="0" r="2" fill="black" />
                <motion.circle initial={{ cx: 0, cy: 0 }} animate={{ cx: offsetX, cy: offsetY }} r="1.5" fill="black" />
              </svg>

              <motion.div 
                initial={{ x: offsetX * 0.5, y: offsetY * 0.5, scale: 0.8 }}
                animate={{ x: offsetX, y: offsetY, scale: 1 }}
                className={`
                  absolute w-44 bg-blue-600 border-2 border-black 
                 rounded-none overflow-hidden
                  ${isLeft ? 'translate-x-[-100%]' : ''}
                  ${isNorth ? (isLeft ? 'origin-top-right' : 'origin-top-left') : (isLeft ? 'origin-bottom-right' : 'origin-bottom-left')}
                `}
                style={{ left: 0, top: isNorth ? 0 : 'auto', bottom: isNorth ? 'auto' : 0 }}
              >
         
                <div className="bg-white text-black px-2 py-1.5 border-b-2 border-black flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-tight">
                    {tag || "DATA UNIT"}
                  </span>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                </div>

             
                <div className="h-24 w-full bg-white overflow-hidden border-b border-black/20">
                  {data?.image && <img src={data.image} alt={label} className="w-full h-full object-cover " />}
                </div>

           
                <div className="px-2 py-1 bg-white border-t border-black/10 flex justify-between items-center">
                   <span className="text-[7px] font-black uppercase opacity-30 italic">Satellite-Lnk</span>
                   {/* <div className="w-1 h-1 bg-emerald-500 rounded-none" /> */}
                </div>

              </motion.div>
            </motion.div>
          </Html>
        )}
      </AnimatePresence>

      {/* 4. 扩散波纹 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.0, 1.0, 1.0]} visible={!isBehind}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={haloRef}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={haloVertexShader}
          fragmentShader={haloFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(hovered ? hoverColor : color) }
          }}
        />
      </mesh>
      
      {/* 4. 常态文本框 */}
      {!isBehind && (
        <Html 
          distanceFactor={8} 
         
          position={[0, isNorth ? 0.22 : -0.22, 0]} 
          center 
           
          zIndexRange={[0, 10]} 
          style={{ 
            pointerEvents: 'none',
             userSelect: 'none',
            zIndex: 1 
            }}
          >
           <div className={`
      px-2 py-1 bg-white text-black font-bold text-[10px] whitespace-nowrap 
      border border-black transition-all duration-300
      ${hovered ? 'scale-110 border-[#FF5500]' : ''}
    `}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// 经纬度转三维坐标函数
// lat: 纬度 (-90 到 90), lng: 经度 (-180 到 180), radius: 地球半径
const convertCoords = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
};

function EarthOutline() {
  return (
   
    <mesh scale={[1.005, 1.005, 1.005]}>
      <sphereGeometry args={[2.2, 64, 64]} />
      <meshBasicMaterial 
        color="#000000" 
        side={THREE.BackSide} 
        transparent={false}
      />
    </mesh>
  );
}

// 处理单个导航节点的显示与隐藏 
function NavNode({ item, angle, radius, onNavigate, hoveredId, setHoveredId }) {
  const nodeRef = useRef();
  const [isBehind, setIsBehind] = useState(false);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((state) => {
    if (!nodeRef.current) return;
    const worldPos = new THREE.Vector3();
    nodeRef.current.getWorldPosition(worldPos);
    worldPos.normalize();
    const camPos = state.camera.position.clone().normalize();
    setIsBehind(camPos.dot(worldPos) < 0.3);
  });

  const isHovered = hoveredId === item.id;
  const nodeScale = isHovered ? 0.22 : 0.1;

  return (
    <group ref={nodeRef} position={[x, 0, z]}>
      {/* 感应区 */}
      <mesh 
        onPointerOver={(e) => {
          if (isBehind) return;
          e.stopPropagation();
          setHoveredId(item.id); // 这里会触发父组件停止旋转
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredId(null);    // 这里会触发父组件恢复旋转
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => { 
          if (isBehind) return;
          e.stopPropagation(); 
          onNavigate(item.targetY); 
        }}
      >
        <sphereGeometry args={[0.4, 16, 16]} /> 
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 视觉层 */}
      <group pointerEvents="none" visible={!isBehind}>
        <mesh scale={[1.12, 1.12, 1.12]}>
          <sphereGeometry args={[nodeScale, 32, 32]} />
          <meshBasicMaterial color="black" side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[nodeScale, 32, 32]} />
          <meshStandardMaterial color={isHovered ? "#fff95e" : "white"} roughness={0.4} />
        </mesh>
        <Html center pointerEvents="none" zIndexRange={[1000, 2000]} style={{ 
    pointerEvents: 'none',
    userSelect: 'none',
   
    zIndex: 9999 
  }}>
          <AnimatePresence>
            {isHovered && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                <span className="text-[24px] font-[1000] text-black uppercase select-none whitespace-nowrap tracking-[-0.1em] leading-none">
                  {item.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Html>
      </group>
    </group>
  );
}

//   OrbitalNav 主组件 
function OrbitalNav({ onNavigate }) {
  const orbitRef = useRef();
  const [hoveredId, setHoveredId] = useState(null);

const NAV_ITEMS = [
    { id: 'eco', label: '生态', path: '/eco',  },
    { id: 'news', label: '演化', path: '/news',},
    { id: 'forum', label: '失衡', path: '/forum', },
    { id: 'profile', label: '重构', path: '/profile', },
  ];


  useFrame((state, delta) => {
    // 只有当 orbitRef 存在，且没有任何节点被悬停（hoveredId 为空）时，才增加旋转角度
    if (orbitRef.current && !hoveredId) {
      orbitRef.current.rotation.y += delta * 0.05; 
    }
  });

  const radius = 3.4; 

  return (
    <group ref={orbitRef} rotation={[Math.PI / 16, 0, 0]}>
      {/* 轨道背景细圆环 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 16, 100]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>

      {/* 渲染导航节点 */}
      {NAV_ITEMS.map((item, index) => (
        <NavNode 
          key={item.id}
          item={item}
    
          angle={(index / NAV_ITEMS.length) * Math.PI * 2}
          radius={radius}
          onNavigate={onNavigate}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      ))}
    </group>
  );
}

function Earth({ onSelectRegion,setControlsEnabled,onNavigate }) {
  const earthRef = useRef();
  const [colorMap] = useLoader(THREE.TextureLoader, ['/img8.png']);

  
  const markerRadius = 2.25; 

  return (
    <group 

    
      onPointerEnter={() => setControlsEnabled(true)} 
      onPointerLeave={() => setControlsEnabled(false)}

      rotation={[0.1, Math.PI/0.8 , 0]} 
    >
      {/* 1. 地球本体 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap} 
          color="#ffffff" 
          roughness={0.7} 
          metalness={0.2}  
          emissive="#ffffff" 
          emissiveIntensity={0.2}
        />
      </mesh>


      <EarthOutline />
      <CloudShell />
      <Atmosphere />

      

      {/* 亚马逊：南纬 3.46, 西经 62.21 */}
     

 <OrbitalNav onNavigate={onNavigate} />

    {MARKER_LIST.map((item) => (
        <Marker 
          key={item.id}
          position={convertCoords(item.lat, item.lng, markerRadius)} 
          onClick={() => onSelectRegion(REGION_DATA[item.id])} // 自动匹配数据
          label={item.label} 
          data={REGION_DATA[item.id]} // 自动匹配图片和监测信息
          tag={item.tag}
          align={item.align || "right"}
        />
      ))}


    </group>
  );
}

const ImpactChain = ({ isVisible, regionName, chainData }) => {
  // 如果没有传入数据，则不渲染（或显示默认值）
  if (!chainData) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={regionName} // 关键：地区改变时重新触发动画
          initial={{ opacity: 0, x: -40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 90 }}
          className="absolute top-[100px] left-12 z-20 w-[300px] bg-white border-2 border-black rounded-[3rem] p-9 shadow-[15px_15px_0px_rgba(0,0,0,0.1)] pointer-events-none flex flex-col"
        >
          {/* 顶部标签 */}
          <div className="absolute -top-3 left-10 bg-black text-white px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
            Impact Logic
          </div>

          {/* 标题区 */}
          <div className="mb-10 border-b-2 border-black/10 pb-4 text-black">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1 italic">
              Target: {regionName}
            </div>
            <div className="text-3xl font-[1000] tracking-tighter uppercase leading-none">
              生态生物链
            </div>
          </div>

          {/* 动态链条内容 */}
          <div className="relative flex flex-col pl-2">
            {chainData.map((stage, index) => (
              <div key={stage.id} className="relative h-16 flex items-start gap-6">
                {/* 连线 */}
                {index < chainData.length - 1 && (
                  <svg className="absolute top-4 left-[7px] w-[2px] h-16 overflow-visible">
                    <motion.line
                      x1="0" y1="0"
                      x2="0" y2="64"
                      stroke="black"
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: index * 0.6 + 0.3, duration: 0.5 }}
                    />
                  </svg>
                )}

                {/* 节点 */}
                <div className="relative mt-2 flex items-center justify-center">
                  <motion.div
                    initial={{ backgroundColor: "#fff" }}
                    animate={{ 
                      backgroundColor: ["#fff", "#fbbf24", "#fff"], 
                      scale: [1, 1.5, 1],
                    }}
                    transition={{ delay: index * 0.6, duration: 0.6 }}
                    className="w-4 h-4 rounded-full border-2 border-black z-10 bg-white"
                  />
                  <motion.div 
                    animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                    transition={{ delay: index * 0.6, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute w-4 h-4 border-2 border-yellow-500 rounded-full"
                  />
                </div>

                {/* 文本 */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.6 + 0.2 }}
                  className="flex flex-col pt-1"
                >
                  <div className="text-[14px] font-black text-black leading-none uppercase tracking-tight">
                    {stage.label}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase mt-2 tracking-widest leading-none">
                    {stage.sub}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* 底部装饰 */}
          <div className="mt-6 pt-5 border-t border-black/5 flex justify-between items-center text-black">
            <span className="text-[8px] font-black uppercase opacity-30">Analysis Finalized</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RegionTempChart = ({ isVisible, data }) => {
  if (!isVisible || !data?.tempTrend) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={data.name + "_chart"}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        // 极简阴影：shadow-[4px_4px_0px_rgba(0,0,0,0.1)]
        className="absolute bottom-12 left-12 z-20 w-80 bg-white border-2 border-black rounded-[2rem] p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] pointer-events-auto"
      >
        <div className="absolute -top-3 left-8 bg-black text-white px-3 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full">
          Thermal Peak Analytics
        </div>

        <div className="flex justify-between items-start mb-4 text-black">
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase mb-1">
              {data.name} 
            </div>
            <div className="text-xl font-[1000] uppercase italic leading-none">
              区域年气温变化
            </div>
          </div>
          <div className="bg-[#fff95e] border-2 border-black px-2 py-0.5 text-[10px] font-black ">
            {data.tempDeviation}
          </div>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.tempTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sharpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff95e" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#fff95e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <XAxis dataKey="time" hide />
              
              {/* 【关键修改】收紧纵坐标范围 
                  domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                  这会让图表只显示数据波动的那一小段区间，起伏会变得非常巨大
              */}
              <YAxis hide domain={['dataMin - 0.2', 'dataMax + 0.2']} />
 
              <Tooltip 
                // 增加黑色参考线
                cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '0' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border-2 border-black p-2 ,0,1)]">
                        <div className="text-lg font-[1000] text-black leading-none">
                          {payload[0].value}°C
                        </div>
                        <div className="text-[7px] font-black text-slate-400 uppercase mt-1">
                          Ref_Time: {payload[0].payload.time}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#000" 
                strokeWidth={4} // 线条加粗更显眼
                fillOpacity={1} 
                fill="url(#sharpGradient)" 
                animationDuration={1200}
                // 悬停时的小圆点
                activeDot={{ r: 5, fill: '#fff', stroke: '#000', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black/5 flex justify-between items-center text-[7px] font-black text-slate-300 uppercase tracking-widest">
          <span>High Frequency Sampling</span>
          <div className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-none" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

//  右侧 UI 面板组件 
const SidePanel = ({ data, onClose }) => {

   const [realTimeWeather, setRealTimeWeather] = useState({
    temp: '--',
    humidity: '--',
    pressure: '--',
    condition: '--',
    bgColor: '#fff95e'
   
  });
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    if (!data || !data.lat) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
       const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
         const url = `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lng}&appid=${API_KEY}&units=metric&lang=zh_cn`;
        
        const response = await fetch(url);
        const resData = await response.json();

        if (response.ok) {
           const mainCondition = resData.weather[0].main;
            console.log("当前天气主分类:", mainCondition);


          const colorMap = {
            Clear: '#fff95e',        // 晴天：明黄色
            Clouds: '#d8dfe8',       // 多云：浅灰色
            Rain: '#7dd3fc',         // 下雨：天蓝色
            Drizzle: '#bae6fd',      // 毛毛雨：淡蓝色
            Thunderstorm: '#c084fc', // 雷暴：紫色
            Snow: '#ffffff',         // 下雪：纯白色
            Mist: '#fdba74',         // 雾气/烟尘：橙色
            Fog: '#fdba74',
            Haze: '#fdba74',
            Tornado: '#ef4444',      // 龙卷风：红色
};

 const matchedColor = colorMap[mainCondition] || '#fff95e';

          setRealTimeWeather({
            temp: `${Math.round(resData.main.temp)}°C`,
            humidity: `${resData.main.humidity}%`,
            pressure: `${resData.main.pressure}hPa`,
       
           condition: resData.weather[0].description.toUpperCase(),
             icon: `https://openweathermap.org/img/wn/${resData.weather[0].icon}@2x.png`,
             bgColor: matchedColor
             
          });
        }
      } catch (error) {
        console.error("天气数据获取失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [data]); // 当点击的地区改变时，重新抓取


  if (!data) return null;

  return (
    <motion.div
      // 从右往左滑入动画配置
      initial={{ x: '110%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '110%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      
     
      className="fixed right-6 top-6 bottom-6 w-[420px] bg-white border-2 border-black text-black shadow-[-20px_20px_60px_rgba(0,0,0,0.15)] z-50 rounded-[2.5rem] overflow-hidden flex flex-col"
    >
      {/* --- 1. 顶部标题栏 --- */}
      <div className="flex justify-between items-center p-5 border-b-2 border-black bg-white">
        <div>
          <h2 className="text-xl font-black italic tracking-tighter flex items-center gap-2 uppercase leading-none">
            <Activity className="text-black" size={20} /> {data.name}
          </h2>
          <div className="text-[8px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">
            Environmental Link Active
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 border border-black hover:bg-yellow-400 transition-colors rounded-lg"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      {/* --- 2. 内容区域  --- */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">

{/* 模块 A：基础气象检测 */}
<section>
  <h3 className="text-[10px] font-black uppercase mb-2 flex items-center gap-2 opacity-70">
    <CloudFog size={14} /> 基础气象实时检测 
  </h3>
  
  {/* 外层容器 */}
  <div className="grid grid-cols-2 gap-0 border-2 border-black rounded-[1.5rem] overflow-hidden  transition-colors duration-700">
  
      
    

    {/* 1. 温度/湿度 */}
    <div 
      className="p-5 border-r-2 border-black flex flex-col justify-center transition-colors duration-700"
      style={{ backgroundColor: realTimeWeather.bgColor }}
    >
      <div className="text-[11px] font-bold uppercase opacity-40 mb-1 leading-none">温度/湿度</div>
      <div className="text-2xl font-black text-black leading-none tracking-tight">
        {realTimeWeather.temp} <span className="mx-1 text-lg opacity-20">/</span> {realTimeWeather.humidity}
      </div>
    </div>

    {/* 2. 气压 */}
    <div 
      className="p-5 flex flex-col justify-center transition-colors duration-700"
      style={{ backgroundColor: realTimeWeather.bgColor }}
    >
      <div className="text-[11px] font-bold uppercase opacity-40 mb-1 leading-none">气压</div>
      <div className="text-2xl font-black text-black leading-none tracking-tight">
        {realTimeWeather.pressure}
      </div>
    </div>

    {/* 3. 底部通栏（天气描述） */}
    <div 
      className="p-4 border-t-2 border-black col-span-2 text-center flex flex-col items-center justify-center min-h-[80px] transition-colors duration-700"
      style={{ backgroundColor: realTimeWeather.bgColor }}
    >
      <div className="text-[11px] font-bold uppercase opacity-40 mb-1 leading-none tracking-tighter">天气</div>
      <div className="flex items-center gap-2">
        {realTimeWeather.icon && <img src={realTimeWeather.icon} className="w-12 h-12" alt="icon" />}
        <div className="text-2xl font-[1000] text-black leading-none uppercase italic tracking-widest">
          {realTimeWeather.condition}
        </div>
      </div>
    </div>

  </div>
</section>



       
       {/* 模块 B：生态综合体征 (雷达图) */}
<section>
  <h3 className="text-[10px] font-black uppercase mb-2 flex items-center gap-2 opacity-70">
    <Zap size={14} /> 生态综合体征 (Radar)
  </h3>
  <div className="h-64 w-full bg-[#fff95e] border-2 border-black p-2 rounded-[1.5rem]  flex items-center justify-center">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.ecoRadar || []}>
        <PolarGrid stroke="black" strokeOpacity={0.2} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'black', fontSize: 12, fontWeight: '900' }} 
        />
   
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        
        <Radar
          name="生态指标"
          dataKey="value"
          stroke="black"
          strokeWidth={3}
          fill="black"       
          fillOpacity={0.15} 
          animationDuration={1000}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '0px' }}
          itemStyle={{ color: 'black', fontWeight: 'bold', fontSize: '10px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
</section>

     
       {/* 模块 C：生态足迹数据 */}
<section>
  <h3 className="text-[10px] font-black uppercase mb-2 flex items-center gap-2 opacity-70">
    <TreeDeciduous size={14} /> 生态足迹数据
  </h3>
  <div className="bg-[#fff95e] border-2 border-black p-5 space-y-4 rounded-[1.5rem] ">
    <div>
      <div className="flex justify-between text-[9px] font-black mb-2 uppercase">
     
        <span>森林覆盖率</span>
        <span className="bg-black text-white px-1.5 py-0.5 rounded-sm">
          {data.eco.forestChange} 
        </span>
      </div>
      <div className="w-full bg-white border border-black h-3 rounded-full overflow-hidden p-[1px]">
  <div 
    className="bg-black h-full rounded-full transition-all duration-1000" 
  
    style={{ width: data.eco.forestChange }} 
  />
</div>
    </div>

    <div className="flex justify-between items-center pt-2 border-t border-black/10">
    
      <span className="text-[9px] font-black uppercase">生物多样性指数</span>
      <span className="text-xl font-black italic">{data.eco.speciesIndex}</span>
    </div>
  </div>
</section>

    

{/* 模块 C：生态风险指数 */}
<section>
  <h3 className="text-[10px] font-black uppercase mb-2 flex items-center gap-2 opacity-70">
    <TreeDeciduous size={14} /> 生态风险指数
  </h3>
  
  {(() => {
  
    const riskMap = {
      High:   { label: "高风险区域 ", color: "#ef4444", textColor: "text-white" },
      Medium: { label: "中风险区域 ", color: "#fff95e", textColor: "text-black" },
      Low:    { label: "低风险区域 ", color: "#1cc38b", textColor: "text-white" }
    };
    
    // 2. 获取当前地区的配置，默认为 Low
    const current = riskMap[data.ecoRisk] || riskMap.Low;

    return (
    
      <div 
        style={{ backgroundColor: current.color }}
        className={`
          border-2 border-black p-6 rounded-[1.5rem] 
          transition-colors duration-500
          flex items-center justify-center min-h-[80px]
        `}
      >
   
        <div className={`text-xl font-[1000] uppercase italic tracking-tight ${current.textColor}`}>
          {current.label}
        </div>
      </div>
    );
  })()}
</section>
      </div>

   
    </motion.div>
  );
};

const TopNavbar = ({ onNavigate, isVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navLinks = [{ id: 'home', label: '首页', path: '/' }, 
    { id: 'eco', label: '生态问题', path: '/eco' }, 
    { id: 'news', label: '新闻资讯', path: '/news' }, 
    { id: 'forum', label: '互动社区', path: '/forum' },
    { id: 'profile', label: '个人中心', path: '/profile' }];
  return (
    <AnimatePresence>{isVisible && (
      <motion.div initial={{ y: -60, x: '-50%', opacity: 0 }} animate={{ y: 0, x: '-50%', opacity: 1 }} exit={{ y: -60, x: '-50%', opacity: 0 }} className="fixed top-6 left-1/2 z-[5000] pointer-events-auto">
        <nav className="bg-white border-2 border-black rounded-full px-6 py-1.5 flex items-center shadow-none">
          <div className="w-1.5 h-1.5 bg-black rounded-full mr-5 shrink-0" />
          <div className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => { if(link.path === '/') window.scrollTo({top:0, behavior:'smooth'}); navigate(link.path); }} className={`px-4 py-1.5 rounded-lg font-black uppercase text-[11px] transition-all ${location.pathname === link.path ? 'bg-black text-white' : 'text-black hover:bg-slate-100'}`}>{link.label}</button>
            ))}
          </div>
        </nav>
      </motion.div>
    )}</AnimatePresence>
  );
};

// --- AI 助手子组件 ---
const AiAssistant = ({ currentData, isShifted,droppedAnimal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 48, y: window.innerHeight - 113 });
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState([{ 
    text: '我是环境数据助手。您可以直接问我：\n👉 解析当前数据\n👉 介绍亚马逊雨林的生态状况',  
    type: 'ai' 
  }]);
  const [input, setInput] = useState('');
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialMouseX: 0, initialMouseY: 0, hasMoved: false });
  const scrollRef = useRef(null);

  // 内部逻辑优化
useEffect(() => {
  if (droppedAnimal) {
    // 延迟 1 秒，等用户看清详情页大图后再弹出 AI
    const timer = setTimeout(() => {
      setIsOpen(true); 
      handleAnimalAnalysis(droppedAnimal);
    }, 1000);
    return () => clearTimeout(timer);
  }else {
      // 【关键逻辑】：如果数据被清空（详情页关闭了），则收起 AI 对话框
      setIsOpen(false);
    }
}, [droppedAnimal]);

const handleAnimalAnalysis = (animal) => {
  // 模拟 AI 的口吻
  const userMsg = `系统正在检测：${animal.name}`;
  setMessages(prev => [...prev, { text: userMsg, type: 'user' }]);

  setTimeout(() => {
    const response = `✅数据同步成功。这是一种${animal.status}物种。${animal.animalAnalysis}`;
    setMessages(prev => [...prev, { text: response, type: 'ai' }]);
  }, 1200);
};

  // 避让逻辑
  useEffect(() => {
    if (!dragRef.current.hasMoved) {
      if (isShifted) setPos({ x: 430, y: window.innerHeight - 113 });
      else setPos({ x: 48, y: window.innerHeight - 113 });
    }
  }, [isShifted]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  // --- 【核心升级：AI 实时分析逻辑】 ---
  const getAiResponse = async (userInput) => {
    const text = userInput.toLowerCase();
    const API_KEY = "8f39a5c16ead5988b59eebd2954d33f2";

    // 1. 处理“介绍某个特定地区”
    const regionKeys = Object.keys(REGION_DATA);
    const matchedKey = regionKeys.find(key => text.includes(REGION_DATA[key].name));

    if (matchedKey) {
      const r = REGION_DATA[matchedKey];
      return `【${r.name}】生态概览：\n\n${r.intro}\n\n✅生态链分析：${r. shortAnalysis }✅系统评估其风险等级为：${r.ecoRisk}。`;
    }

    // 2. 处理“解析当前数据” (抓取 OpenWeather 实时数据进行深度分析)
    if (text.includes("解析") || text.includes("分析") || text.includes("数据")) {
      if (!currentData) return "您当前还没有选中任何监测点。请先点击地球上的坐标点，我将为您建立卫星链路。";

      try {
        // AI 亲自去抓取最新的气象
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${currentData.lat}&lon=${currentData.lng}&appid=${API_KEY}&units=metric&lang=zh_cn`;
        const response = await fetch(weatherUrl);
        const realData = await response.json();

        const temp = Math.round(realData.main.temp);
        const condition = realData.weather[0].description;
        const wind = realData.wind.speed;

        // 结合静态生态数据进行 AI 综合诊断
        let diagnosis = "";
        if (currentData.ecoRisk === "High") {
            diagnosis = "警告：检测到该地区气象条件可能加剧生态风险。";
        } else {
            diagnosis = "分析：当前气象条件处于该地区生态承载力的正常阈值内，系统状态评估为【稳定】。";
        }

        return `卫星链路已连接，正在为您深度解析【${currentData.name}】的综合监测数据：\n\n` +
               `实时气象：${temp}°C / ${condition}，风速 ${wind}m/s。\n` +
               `生态风险：当前 ERI 指数为 ${currentData.ecoRisk}。\n` +
               `环境诊断：${diagnosis}\n\n` +
               `* 数据来源：OpenWeather 实时气象卫星 & Global_Alpha_01 传感器。`;
      } catch (err) {
        return "抱歉，由于卫星链路波动，我暂时无法获取该地区的实时气象。但根据我的本地档案，这里是一个 " + currentData.ecoRisk + " 风险区域。";
      }
    }

    return "收到指令。目前的监测数据显示全球环境指标处于波动状态。建议您点击感兴趣的地区，我可以为您做深度数据拆解。";
  };

  const executeAction = async (text) => {
    setMessages(prev => [...prev, { text: text, type: 'user' }]);
    
    // 添加一个“思考中”的动画效果
    setMessages(prev => [...prev, { text: "正在建立卫星连接...", type: 'ai', isTyping: true }]);

    const response = await getAiResponse(text);
    
    setMessages(prev => {
      const filtered = prev.filter(m => !m.isTyping); // 移除思考中消息
      return [...filtered, { text: response, type: 'ai' }];
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    executeAction(input);
    setInput('');
  };

  // 拖拽逻辑保持不变...
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragRef.current.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dist = Math.sqrt(Math.pow(clientX - dragRef.current.initialMouseX, 2) + Math.pow(clientY - dragRef.current.initialMouseY, 2));
      if (dist > 5) dragRef.current.hasMoved = true;
      setPos({ x: clientX - dragRef.current.startX, y: clientY - dragRef.current.startY });
    };
    const handleUp = () => { dragRef.current.isDragging = false; setIsDragging(false); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, []);

  return (
    <div className="fixed z-[9999]" style={{ left: pos.x, top: pos.y, transition: isDragging ? 'none' : 'left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.6s ease-in-out' }}>
      <style>{`
        .ai-window { position: absolute; bottom: 80px; width: 320px; max-height: 450px; background: white; border: 3px solid black; border-radius: 24px; display: flex; flex-direction: column; overflow: hidden; box-shadow: none; }
        .ai-msg-list { flex: 1; padding: 15px; overflow-y: auto; background: #f8f9fa; display: flex; flex-direction: column; gap: 12px; scrollbar-width: none; -ms-overflow-style: none; }
        .ai-msg-list::-webkit-scrollbar { display: none; }
        .ai-m { padding: 10px 14px; border: 2px solid black; font-size: 13px; font-weight: 800; line-height: 1.5; white-space: pre-wrap; }
        .ai-m-ai { background: #fff95e; align-self: flex-start; border-radius: 4px 18px 18px 18px; }
        .ai-m-user { background: white; align-self: flex-end; border-radius: 18px 18px 4px 18px; }
        .ai-link { color: #2563eb; text-decoration: underline; cursor: pointer; font-weight: 900; }
        .ai-btn { width: 65px; height: 65px; border-radius: 50%; background: #8cff8c; border: 3px solid black; display: flex; align-items: center; justify-content: center; cursor: grab; transition: transform 0.2s; }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0, y: 50 }} className="ai-window" style={{ left: pos.x > window.innerWidth / 2 ? -260 : 0 }}>
            <div className="bg-black text-white p-3 font-black text-[10px] uppercase flex justify-between items-center">
              <span>Voice of the Earth</span>
            </div>
            <div className="ai-msg-list">
              {messages.map((m, i) => (
                <div key={i} className={`ai-m ai-m-${m.type}`}>
                  {m.type === 'ai' && m.text.includes('👉') ? (
                    <div>我是环境数据助手。您可以直接问我：<br/>👉 <span className="ai-link" onClick={() => executeAction("解析当前数据")}>解析当前数据</span><br/>👉 <span className="ai-link" onClick={() => executeAction("介绍亚马逊雨林的生态状况")}>介绍亚马逊雨林的生态状况</span></div>
                  ) : m.text}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div className="p-3 bg-white border-t-2 border-black flex gap-2">
              <input className="flex-1 border-2 border-black p-2 text-xs font-black outline-none placeholder:opacity-30" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="INPUT COMMAND..." />
              <button onClick={handleSend} className="bg-black text-white px-4 font-black text-[10px] hover:bg-[#00ff00] transition-colors">GO</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="ai-btn" onMouseDown={e => { dragRef.current = { isDragging: true, startX: e.clientX - pos.x, startY: e.clientY - pos.y, initialMouseX: e.clientX, initialMouseY: e.clientY, hasMoved: false }; setIsDragging(true); }} onClick={() => { if (!dragRef.current.hasMoved) setIsOpen(!isOpen); }}>
        <img src="/笑脸.png" alt="AI" draggable="false" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};


//过渡页
const ScrollAssembleText = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start end", "end start"] });
  const text = "BIODIVERSITY";
  const chars = text.split("");

  const randomPositions = useMemo(() => {
    return chars.map((_, i) => ({
     
      xOffset: (i - chars.length / 2) * 30 + (Math.random() - 0.5) * 200,
      yStart: 400 + Math.random() * 300, 
      rotate: (Math.random() - 0.5) * 120,
      scale: 1.2 + Math.random() * 0.5,
    }));
  }, []);

  return (
  
    <section ref={targetRef} className="relative w-full h-[90vh] bg-transparent overflow-hidden">
      
  
      <div className="mx-auto max-w-[500px] h-full relative">
        
        <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none bg-transparent">
          <div className="relative flex">
            {chars.map((char, i) => {
              const pos = randomPositions[i];
              const x = useTransform(scrollYProgress, [0.1, 0.5], [pos.xOffset, 0]);
              const y = useTransform(scrollYProgress, [0.1, 0.5], [pos.yStart, 0]);
              const rotate = useTransform(scrollYProgress, [0.1, 0.5], [pos.rotate, 0]);
              const scale = useTransform(scrollYProgress, [0.1, 0.5], [pos.scale, 1]);
              const opacity = useTransform(scrollYProgress, [0, 0.1, 0.5], [0, 1, 1]);

              return (
                <motion.span
                  key={i}
                  style={{ x, y, rotate, scale, opacity, display: "inline-block", color: "white", WebkitTextStroke: "1.5px black" }}
               
                  className="text-5xl md:text-7xl font-[1000] italic tracking-tighter select-none px-1"
                >
                  {char}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
//滚动条
const ScrollingTicker = () => {
  // 滚动显示的文字内容
  const tickerText = "SYSTEM STATUS: MONITORING • BIODIVERSITY DATA SYNCING • GLOBAL WARMING ALERT • HABITAT LOSS DETECTED • SATELLITE LINK ACTIVE • ";

  return (
    <div className="w-full bg-white border-y-2 border-black py-2 overflow-hidden flex whitespace-nowrap z-30">

      <motion.div
        animate={{ x: ["0%", "-50%"] }} 
        transition={{
          duration: 20, // 数值越大速度越慢
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex"
      >
        <span className="text-sm font-[1000] uppercase tracking-[0.2em] text-black px-4">
          {tickerText}
        </span>
        <span className="text-sm font-[1000] uppercase tracking-[0.2em] text-black px-4">
          {tickerText}
        </span>
      </motion.div>
    </div>
  );
};






// --- 主页面布局 ---
function EnvironmentalDashboard({ selectedData, setSelectedData, isHomeActive, analyzeAnimal, setAnalyzeAnimal }) {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const handleNavigate = (targetY) => { window.scrollTo({ top: targetY, behavior: 'smooth' }); };
  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full h-screen overflow-hidden bg-transparent">
        <div className="absolute top-12 left-12 z-10 pointer-events-none flex flex-col gap-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          <h1 className="text-black text-5xl font-[1000] tracking-tighter uppercase leading-none">修复计划 · </h1>
          <h2 className="text-black text-5xl font-[1000] tracking-tighter uppercase leading-none">Restoration Protocol</h2>
        </div>
        <AnimatePresence>
          {(isHomeActive && selectedData) && (
            <>
              <ImpactChain isVisible={true} regionName={selectedData?.name} chainData={selectedData?.chain} />
              <RegionTempChart isVisible={true} data={selectedData} />
              <SidePanel data={selectedData} onClose={() => setSelectedData(null)} />
            </>
          )}
        </AnimatePresence>
        <div className={`w-full h-full transition-all duration-300 ${controlsEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
          <Canvas 
  gl={{ 
    toneMapping: THREE.ACESFilmicToneMapping, 
    toneMappingExposure: 1.5,               
    outputColorSpace: THREE.SRGBColorSpace    
  }}
>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
            <ambientLight intensity={2.1} /><pointLight position={[5, 3, 5]} intensity={30} color="#ffffff" /><Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
              <pointLight position={[-5, -2, -5]} intensity={15} color="#ffffff" />
            <Suspense fallback={null}><Earth onSelectRegion={setSelectedData} setControlsEnabled={setControlsEnabled} onNavigate={handleNavigate} /></Suspense>
            <OrbitControls enabled={controlsEnabled} enablePan={false} minDistance={3} maxDistance={12} enableDamping dampingFactor={0.08} />
            <EffectComposer><Bloom intensity={1.5} luminanceThreshold={1.0} mipmapBlur /></EffectComposer>
          </Canvas>
        </div>
        {!selectedData && isHomeActive && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] animate-bounce font-black uppercase tracking-[0.4em]">Scroll Down To Explore Species ↓</div>
        )}
      </div>
      <ScrollingTicker /><ScrollAssembleText />
      <section className="relative py-10 bg-transparent">
        <EndangeredAnimals onSelectAnimal={(a) => { setAnalyzeAnimal(null); setTimeout(()=>setAnalyzeAnimal(a),50); }} onCloseDetail={() => setAnalyzeAnimal(null)} />
      </section>
    </div>
  );
}

// --- 6. 路由根组件 ---

function App() {
  const [selectedData, setSelectedData] = useState(null);
  const [isHomeActive, setIsHomeActive] = useState(true);
  const [analyzeAnimal, setAnalyzeAnimal] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsHomeActive(window.scrollY < 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <div className="w-full min-h-screen bg-[url('/space1.png')] bg-cover bg-fixed bg-center">
        <TopNavbar isVisible={isHomeActive} />
        <AiAssistant currentData={selectedData} isShifted={!!selectedData && isHomeActive} droppedAnimal={analyzeAnimal} />
        <Routes>
          <Route path="/" element={<EnvironmentalDashboard selectedData={selectedData} setSelectedData={setSelectedData} isHomeActive={isHomeActive} analyzeAnimal={analyzeAnimal} setAnalyzeAnimal={setAnalyzeAnimal} />} />
          <Route path="/eco" element={<EcoIssues />} />
           <Route path="/profile" element={<Profile />} />
           <Route path="/news" element={<NewsPage/>} />
           <Route path="/forum" element={<CommunityForum />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;