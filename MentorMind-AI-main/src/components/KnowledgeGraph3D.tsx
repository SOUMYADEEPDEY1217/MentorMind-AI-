import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { KnowledgeNode, KnowledgeLink } from "../types";

interface KnowledgeGraph3DProps {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
  selectedNodeId: string | null;
  onSelectNode: (node: KnowledgeNode) => void;
  searchQuery: string;
  bookmarks: string[];
}

// Fixed beautiful 3D coordinates for the static layout
const NODE_COORDS: Record<string, { x: number; y: number; z: number }> = {
  // Computer Science Branch
  "cs-root": { x: -4.5, y: 0.5, z: 0 },
  "cs-python": { x: -3.0, y: -1.5, z: -1.0 },
  "cs-loops": { x: -1.5, y: -3.0, z: -2.0 },
  "cs-functions": { x: -4.0, y: -3.0, z: 1.0 },
  "cs-recursion": { x: -2.5, y: -4.5, z: 2.0 },
  "cs-binary-trees": { x: -1.0, y: -6.0, z: 0.5 },
  "cs-dp": { x: -3.5, y: -6.0, z: 3.5 },

  // Mathematics Branch
  "math-root": { x: 4.5, y: 0.5, z: 0 },
  "math-la": { x: 3.0, y: -1.5, z: -1.0 },
  "math-matrices": { x: 1.5, y: -3.0, z: -2.0 },
  "math-eigen": { x: 0.5, y: -4.5, z: -3.0 },
  "math-calc": { x: 4.5, y: -2.5, z: 1.5 },
  "math-derivatives": { x: 3.5, y: -4.5, z: 2.5 },
  "math-integrals": { x: 5.5, y: -4.5, z: 0.5 },

  // Learning Psychology Branch
  "psy-root": { x: 0, y: 4.0, z: 0 },
  "psy-curve": { x: -2.0, y: 5.0, z: -1.5 },
  "psy-load": { x: 2.0, y: 5.0, z: 1.5 }
};

export default function KnowledgeGraph3D({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  searchQuery,
  bookmarks
}: KnowledgeGraph3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamically calculate coordinates for any node that does not have static coordinates
  const calculatedCoords = React.useMemo(() => {
    const coords: Record<string, { x: number; y: number; z: number }> = { ...NODE_COORDS };
    
    // We want to process nodes that are not in NODE_COORDS
    nodes.forEach((node, index) => {
      if (coords[node.id]) return;
      
      if (node.parentId) {
        const parentPos = coords[node.parentId] || { x: 0, y: 0, z: 0 };
        const angle = (index * 1.618 * 2 * Math.PI) % (2 * Math.PI);
        const dist = 1.8 + (index % 4) * 0.4;
        coords[node.id] = {
          x: parentPos.x + Math.cos(angle) * dist,
          y: parentPos.y - 1.2 - (index % 3) * 0.3,
          z: parentPos.z + Math.sin(angle) * dist
        };
      } else {
        // Arrange root nodes on a circular ring around the origin
        const indexInRoots = nodes.filter(n => !n.parentId).indexOf(node);
        const angle = (indexInRoots * 1.618 * 2 * Math.PI) % (2 * Math.PI);
        const dist = 5.0 + (index % 3) * 1.0;
        coords[node.id] = {
          x: Math.cos(angle) * dist,
          y: 1.0 + (index % 3) * 0.5,
          z: Math.sin(angle) * dist
        };
      }
    });
    
    return coords;
  }, [nodes]);

  // Fallback states
  const [useFallback, setUseFallback] = useState(false);
  const [frame, setFrame] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 600, height: 550 });
  const fallbackRotationRef = useRef({ x: -0.1, y: 0 });
  const fallbackDistanceRef = useRef(12);

  // Proactive WebGL support detection
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      if (!support) {
        console.warn("WebGL is not supported in this environment. Activating vector fallback.");
        setUseFallback(true);
      }
    } catch (e) {
      setUseFallback(true);
    }
  }, []);

  // Update fallback frame tick
  useEffect(() => {
    if (!useFallback) return;

    let animId: number;
    const tick = () => {
      if (!isDragging.current) {
        fallbackRotationRef.current.y += 0.0025; // Gentler cosmic rotation
      }
      setFrame((f) => f + 1);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [useFallback]);

  // Dimension tracker
  useEffect(() => {
    if (!mountRef.current) return;
    const handleResize = () => {
      if (mountRef.current) {
        setDimensions({
          width: mountRef.current.clientWidth,
          height: mountRef.current.clientHeight || 550
        });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(mountRef.current);
    return () => observer.disconnect();
  }, []);

  // Projection state to overlay HTML labels on 3D nodes
  const [projectedLabels, setProjectedLabels] = useState<
    Array<{
      id: string;
      name: string;
      subject: string;
      mastery: number;
      x: number;
      y: number;
      visible: boolean;
      nodeRef: KnowledgeNode;
    }>
  >([]);

  // Orbit rotation states (mouse/touch controls)
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: -0.1, y: 0 });
  const cameraDistance = useRef(12);

  // Synchronize props to refs for the animation loop to prevent stale closures
  const propsRef = useRef({ nodes, selectedNodeId, searchQuery, bookmarks, calculatedCoords });
  useEffect(() => {
    propsRef.current = { nodes, selectedNodeId, searchQuery, bookmarks, calculatedCoords };
  }, [nodes, selectedNodeId, searchQuery, bookmarks, calculatedCoords]);

  useEffect(() => {
    if (useFallback) return;
    if (!mountRef.current || !canvasRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 550;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    scene.background = null; // Transparent to allow beautiful CSS backgrounds

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistance.current);

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to 2D vector projection:", e);
      setUseFallback(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Monitor for WebGL context loss dynamically
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL Context Lost, switching to high-performance vector fallback.");
      setUseFallback(true);
    };
    canvasRef.current.addEventListener("webglcontextlost", handleContextLost, false);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xa0c0ff, 0.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff80b0, 0.3);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // --- NODE & LINK MESHES ---
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const meshesMap = new Map<string, THREE.Mesh>();
    const nodeSpheres: Array<{ id: string; mesh: THREE.Mesh }> = [];

    // Create 3D spheres representing concepts
    nodes.forEach((node) => {
      const coords = calculatedCoords[node.id] || { x: 0, y: 0, z: 0 };

      // Sphere size varies slightly with tree depth
      const radius = node.parentId ? 0.35 : 0.55;
      const geometry = new THREE.SphereGeometry(radius, 32, 32);

      // Distinct, glowy color based on mastery levels
      let color = 0xef4444; // Low mastery / Red
      if (node.mastery >= 80) {
        color = 0x10b981; // High mastery / Green
      } else if (node.mastery >= 50) {
        color = 0xf59e0b; // Moderate / Amber
      }

      // Special styling based on subject types to make branches distinct
      let emissive = color;
      let emissiveIntensity = 0.2;

      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.1,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(coords.x, coords.y, coords.z);
      nodeGroup.add(mesh);

      meshesMap.set(node.id, mesh);
      nodeSpheres.push({ id: node.id, mesh });
    });

    // Create 3D connection lines (links)
    const linksGroup = new THREE.Group();
    scene.add(linksGroup);

    links.forEach((link) => {
      const srcId = typeof link.source === "string" ? link.source : (link.source as any).id;
      const tgtId = typeof link.target === "string" ? link.target : (link.target as any).id;

      const srcPos = calculatedCoords[srcId];
      const tgtPos = calculatedCoords[tgtId];

      if (srcPos && tgtPos) {
        const points = [
          new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z),
          new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        // Elegant semi-transparent light lines connecting knowledge graph
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x4f46e5,
          transparent: true,
          opacity: 0.35,
          linewidth: 1
        });

        const line = new THREE.Line(lineGeo, lineMat);
        linksGroup.add(line);
      }
    });

    // Outer glow wireframe for selected node
    const selectionRingGeometry = new THREE.RingGeometry(0.7, 0.8, 32);
    const selectionRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const selectionRing = new THREE.Mesh(selectionRingGeometry, selectionRingMaterial);
    selectionRing.visible = false;
    scene.add(selectionRing);

    // --- RESIZE OBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      camera.aspect = newWidth / (newHeight || 550);
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight || 550);
    });
    resizeObserver.observe(mountRef.current);

    // --- ANIMATION / RENDER LOOP ---
    let animationId: number;
    const tempV = new THREE.Vector3();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth camera orbit rotation based on dragging state
      const targetX = rotation.current.x;
      const targetY = rotation.current.y;

      camera.position.x = cameraDistance.current * Math.sin(targetY) * Math.cos(targetX);
      camera.position.y = cameraDistance.current * Math.sin(targetX);
      camera.position.z = cameraDistance.current * Math.cos(targetY) * Math.cos(targetX);
      camera.lookAt(0, 0, 0);

      // Rotate group gently for passive cosmic rotation
      if (!isDragging.current) {
        rotation.current.y += 0.0015;
      }

      // Check selected node
      const currentSelectedId = propsRef.current.selectedNodeId;
      if (currentSelectedId) {
        const selectedCoords = propsRef.current.calculatedCoords[currentSelectedId];
        if (selectedCoords) {
          selectionRing.position.set(selectedCoords.x, selectedCoords.y, selectedCoords.z);
          // Face the camera
          selectionRing.quaternion.copy(camera.quaternion);
          selectionRing.visible = true;

          // Pulse scale
          const time = Date.now() * 0.005;
          const pulse = 1.0 + Math.sin(time) * 0.12;
          selectionRing.scale.set(pulse, pulse, pulse);
        }
      } else {
        selectionRing.visible = false;
      }

      // Animate node scales based on search / selection focus
      const query = propsRef.current.searchQuery.toLowerCase();
      nodeSpheres.forEach(({ id, mesh }) => {
        let targetScale = 1.0;

        if (query) {
          const match = propsRef.current.nodes.find(n => n.id === id);
          const isMatch = match?.name.toLowerCase().includes(query) || match?.subject.toLowerCase().includes(query);
          targetScale = isMatch ? 1.35 : 0.55;

          // Visual cue: fade colors for non-matches
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = isMatch ? 1.0 : 0.3;
        } else {
          // Standard size pulses gently based on retention
          const nodeData = propsRef.current.nodes.find(n => n.id === id);
          const isBookmarked = propsRef.current.bookmarks.includes(id);

          if (nodeData) {
            const time = Date.now() * 0.002 + parseInt(id.substring(id.length - 1)) * 0.5 || 0;
            const floatScale = 1.0 + Math.sin(time) * 0.06;
            targetScale = currentSelectedId === id ? 1.3 * floatScale : (isBookmarked ? 1.15 : floatScale);

            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.transparent = false;
            mat.opacity = 1.0;
          }
        }

        mesh.scale.set(
          THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.1),
          THREE.MathUtils.lerp(mesh.scale.y, targetScale, 0.1),
          THREE.MathUtils.lerp(mesh.scale.z, targetScale, 0.1)
        );
      });

      // Update projected labels coordinates for React overlays
      const newLabels = propsRef.current.nodes.map((node) => {
        const coords = propsRef.current.calculatedCoords[node.id];
        if (!coords) return { id: node.id, name: node.name, subject: node.subject, mastery: node.mastery, x: 0, y: 0, visible: false, nodeRef: node };

        tempV.set(coords.x, coords.y, coords.z);
        // Apply node group rotation to node positions
        tempV.project(camera);

        const x = (tempV.x * 0.5 + 0.5) * width;
        const y = (tempV.y * -0.5 + 0.5) * height;

        // Hide node labels that are behind the camera view limits
        const visible = tempV.z <= 1.0;

        return {
          id: node.id,
          name: node.name,
          subject: node.subject,
          mastery: node.mastery,
          x,
          y,
          visible,
          nodeRef: node
        };
      });

      setProjectedLabels(newLabels);

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("webglcontextlost", handleContextLost);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [nodes, links, useFallback]);

  // --- INTERACTION HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousPointerPosition.current.x;
    const deltaY = e.clientY - previousPointerPosition.current.y;

    const rotFactor = 0.007;
    if (useFallback) {
      fallbackRotationRef.current.y += deltaX * rotFactor;
      fallbackRotationRef.current.x += deltaY * rotFactor;
      fallbackRotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, fallbackRotationRef.current.x));
    } else {
      rotation.current.y += deltaX * rotFactor;
      rotation.current.x += deltaY * rotFactor;
      rotation.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotation.current.x));
    }

    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (useFallback) {
      fallbackDistanceRef.current += e.deltaY * 0.005;
      fallbackDistanceRef.current = Math.max(6, Math.min(22, fallbackDistanceRef.current));
    } else {
      cameraDistance.current += e.deltaY * 0.005;
      cameraDistance.current = Math.max(6, Math.min(22, cameraDistance.current));
    }
  };

  if (useFallback) {
    const cosY = Math.cos(fallbackRotationRef.current.y);
    const sinY = Math.sin(fallbackRotationRef.current.y);
    const cosX = Math.cos(fallbackRotationRef.current.x);
    const sinX = Math.sin(fallbackRotationRef.current.x);

    const { width, height } = dimensions;

    const projectedFallbackNodes = nodes.map((node) => {
      const coords = calculatedCoords[node.id] || { x: 0, y: 0, z: 0 };
      
      // Rotate around Y-axis
      let x1 = coords.x * cosY - coords.z * sinY;
      let z1 = coords.x * sinY + coords.z * cosY;
      
      // Rotate around X-axis
      let y1 = coords.y * cosX - z1 * sinX;
      let z2 = coords.y * sinX + z1 * cosX;
      
      // Perspective division
      const d = fallbackDistanceRef.current;
      const scale = (d / (d + z2)) * 75; // Adjust zoom scale factor
      
      const screenX = width / 2 + x1 * scale;
      const screenY = height / 2 - y1 * scale;
      
      return {
        ...node,
        screenX,
        screenY,
        depthZ: z2,
        scale
      };
    });

    const fallbackNodesMap = new Map<string, typeof projectedFallbackNodes[0]>();
    projectedFallbackNodes.forEach((pn) => {
      fallbackNodesMap.set(pn.id, pn);
    });

    // Check query filters
    const query = searchQuery.toLowerCase();

    return (
      <div
        ref={mountRef}
        id="3d-graph-container"
        className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] bg-[#050505] border border-white/10 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl flex select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Background neural network lines inside SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="glow-fallback">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="line-grad-fallback" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#e879f9" stopOpacity="0.35"/>
            </linearGradient>
          </defs>

          {/* Connection Lines */}
          {links.map((link, idx) => {
            const srcId = typeof link.source === "string" ? link.source : (link.source as any).id;
            const tgtId = typeof link.target === "string" ? link.target : (link.target as any).id;
            
            const src = fallbackNodesMap.get(srcId);
            const tgt = fallbackNodesMap.get(tgtId);
            
            if (!src || !tgt) return null;
            
            // Adjust opacity based on search query focus
            let opacity = 0.35;
            if (query) {
              const srcMatch = src.name.toLowerCase().includes(query) || src.subject.toLowerCase().includes(query);
              const tgtMatch = tgt.name.toLowerCase().includes(query) || tgt.subject.toLowerCase().includes(query);
              opacity = srcMatch && tgtMatch ? 0.7 : 0.1;
            }
            
            return (
              <line
                key={`fallback-link-${idx}`}
                x1={src.screenX}
                y1={src.screenY}
                x2={tgt.screenX}
                y2={tgt.screenY}
                stroke="url(#line-grad-fallback)"
                strokeWidth={1.5}
                strokeOpacity={opacity}
              />
            );
          })}

          {/* Pulsing Selection Rings */}
          {projectedFallbackNodes.map((pn) => {
            if (selectedNodeId !== pn.id) return null;
            return (
              <g key={`selection-ring-grp-${pn.id}`}>
                <circle
                  cx={pn.screenX}
                  cy={pn.screenY}
                  r={12 * (pn.scale / 75) + 8}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                />
                <circle
                  cx={pn.screenX}
                  cy={pn.screenY}
                  r={12 * (pn.scale / 75) + 8 + Math.sin(frame * 0.15) * 4}
                  fill="none"
                  stroke="#e879f9"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  filter="url(#glow-fallback)"
                />
              </g>
            );
          })}
        </svg>

        {/* Ambient background indicators */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono tracking-wider text-cyan-400 flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          IMMERSIVE KNOWLEDGE VECTOR ENGINE
        </div>

        <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-slate-400">
          🖱️ Drag to orbit • Scroll to zoom
        </div>

        {/* HTML Labels overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {projectedFallbackNodes.map((label) => {
            // Check visibility by depth/z limits
            const isVisible = label.depthZ <= 10;
            if (!isVisible) return null;

            // Check if matching query
            let isFocused = true;
            let targetScale = 1.0;
            if (query) {
              const isMatch = label.name.toLowerCase().includes(query) || label.subject.toLowerCase().includes(query);
              isFocused = isMatch;
              targetScale = isMatch ? 1.15 : 0.75;
            } else {
              const isBookmarked = bookmarks.includes(label.id);
              if (selectedNodeId === label.id) {
                targetScale = 1.15;
              } else if (isBookmarked) {
                targetScale = 1.05;
              }
            }

            // Adjust sizing based on perspective scale
            const depthFactor = label.scale / 75;

            return (
              <button
                key={label.id}
                id={`fallback-node-label-${label.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(label);
                }}
                style={{
                  transform: `translate3d(-50%, -50%, 0) scale(${targetScale * depthFactor})`,
                  left: `${label.screenX}px`,
                  top: `${label.screenY}px`,
                  opacity: isFocused ? 1.0 : 0.3,
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease"
                }}
                className={`absolute pointer-events-auto flex flex-col items-center group cursor-pointer ${
                  selectedNodeId === label.id ? "z-30" : "z-20"
                }`}
              >
                {/* Node display card */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-lg flex items-center gap-2 transition-all duration-300 ${
                    selectedNodeId === label.id
                      ? "bg-cyan-500 text-black border-cyan-400 font-bold shadow-cyan-500/20"
                      : bookmarks.includes(label.id)
                      ? "bg-black/80 text-yellow-300 border-yellow-500/50 hover:bg-black"
                      : label.mastery >= 80
                      ? "bg-black/80 text-emerald-400 border-emerald-500/30 hover:bg-black"
                      : label.mastery >= 50
                      ? "bg-black/80 text-amber-400 border-amber-500/30 hover:bg-black"
                      : "bg-black/80 text-rose-400 border-rose-500/30 hover:bg-black"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      label.mastery >= 80
                        ? "bg-emerald-500 animate-pulse"
                        : label.mastery >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <span className="font-sans">{label.name}</span>
                  <span className={`text-[9px] font-mono font-bold ${
                    selectedNodeId === label.id ? "text-black/70" : "opacity-60"
                  }`}>
                    {label.mastery}%
                  </span>
                </div>

                {/* Subtitle subject tag on hover or selection */}
                <div
                  className={`mt-1.5 px-1.5 py-0.5 rounded text-[8px] tracking-wide uppercase font-bold transition-all duration-200 font-mono ${
                    selectedNodeId === label.id
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 opacity-100"
                      : "bg-black text-slate-400 border border-white/10 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {label.subject}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      id="3d-graph-container"
      className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner flex select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Three.js canvas layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Ambient background indicators */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
        3D KNOWLEDGE MAPPING ENGINE
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400">
        🖱️ Drag to rotate • Wheel to zoom
      </div>

      {/* HTML overlay labels projected onto 3D coordinate vectors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {projectedLabels.map(
          (label) =>
            label.visible && (
              <button
                key={label.id}
                id={`node-label-${label.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(label.nodeRef);
                }}
                style={{
                  transform: `translate3d(-50%, -50%, 0)`,
                  left: `${label.x}px`,
                  top: `${label.y}px`
                }}
                className={`absolute pointer-events-auto transition-all duration-200 flex flex-col items-center group cursor-pointer ${
                  selectedNodeId === label.id ? "z-30 scale-110" : "z-20 hover:scale-105"
                }`}
              >
                {/* Node display card */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-lg flex items-center gap-2 transition-all duration-300 ${
                    selectedNodeId === label.id
                      ? "bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/30"
                      : bookmarks.includes(label.id)
                      ? "bg-slate-900/90 text-yellow-300 border-yellow-500/50 hover:bg-slate-800"
                      : label.mastery >= 80
                      ? "bg-slate-900/90 text-emerald-400 border-emerald-500/30 hover:bg-slate-800"
                      : label.mastery >= 50
                      ? "bg-slate-900/90 text-amber-400 border-amber-500/30 hover:bg-slate-800"
                      : "bg-slate-900/90 text-rose-400 border-rose-500/30 hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      label.mastery >= 80
                        ? "bg-emerald-500"
                        : label.mastery >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <span>{label.name}</span>
                  <span className="text-[10px] opacity-60 font-mono font-bold">
                    {label.mastery}%
                  </span>
                </div>

                {/* Subtitle subject tag on hover or selection */}
                <div
                  className={`mt-1.5 px-1.5 py-0.5 rounded text-[8px] tracking-wide uppercase font-bold transition-all duration-200 ${
                    selectedNodeId === label.id
                      ? "bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 opacity-100"
                      : "bg-slate-950 text-slate-400 border border-slate-800/80 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {label.subject}
                </div>
              </button>
            )
        )}
      </div>
    </div>
  );
}
