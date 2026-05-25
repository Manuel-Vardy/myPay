"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { geoEquirectangular, geoPath, geoInterpolate } from "d3-geo";
import worldLow from "@amcharts/amcharts5-geodata/worldLow";

const CONNECTIONS = [
  { start: [5.6037, -0.1870], end: [51.5074, -0.1278], color: "#22c55e" }, // Accra to London
  { start: [6.5244, 3.3792], end: [40.7128, -74.0060], color: "#22c55e" }, // Lagos to New York
  { start: [-1.2921, 36.8219], end: [1.3521, 103.8198], color: "#22c55e" }, // Nairobi to Singapore
  { start: [-26.2041, 28.0473], end: [51.5074, -0.1278], color: "#22c55e" }, // Johannesburg to London
  { start: [5.6037, -0.1870], end: [6.5244, 3.3792], color: "#eab308" }, // Accra to Lagos
  { start: [6.5244, 3.3792], end: [-1.2921, 36.8219], color: "#eab308" }, // Lagos to Nairobi
];

const HUBS = [
  { name: "Accra", lat: 5.6037, lng: -0.1870 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
  { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
];

// Helper to convert lat/lng to 3D Cartesian coordinates
const toXYZ = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lng * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
};

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current || !containerRef.current) return;

    // SCENARIO DIMENSIONS
    const width = containerRef.current.clientWidth;
    const height = 550; // Set standard height

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 4000);
    camera.position.z = 1000;

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // CONTAINERS
    const globeContainer = new THREE.Group();
    globeContainer.rotation.y = -Math.PI / 4; // Rotate to show Africa more to the left
    scene.add(globeContainer);

    // --- GENERATE WORLD MAP SILHOUETTE ---
    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = 2048;
    mapCanvas.height = 1024;
    const mapCtx = mapCanvas.getContext("2d");

    if (mapCtx) {
      mapCtx.fillStyle = "#000000";
      mapCtx.fillRect(0, 0, 2048, 1024);

      const projection = geoEquirectangular()
        .translate([1024, 512])
        .scale(1024 / Math.PI);
      const pathGenerator = geoPath(projection, mapCtx);

      // Draw map features
      worldLow.features.forEach((feature: any) => {
        const countryCode = feature.id || feature.properties?.id;
        // Highlight Trite active countries (Green)
        if (["GH", "NG", "KE", "ZA"].includes(countryCode)) {
          mapCtx.fillStyle = "#22c55e";
        } else {
          // Regular land (Slate Gray)
          mapCtx.fillStyle = "#334155";
        }
        mapCtx.beginPath();
        pathGenerator(feature);
        mapCtx.fill();
      });
    }

    const mapData = mapCtx?.getImageData(0, 0, 2048, 1024);

    const checkLand = (u: number, v: number): { isLand: boolean; isHighlighted: boolean } => {
      if (!mapData) return { isLand: false, isHighlighted: false };
      const x = Math.floor(u * 2048);
      const y = Math.floor(v * 1024);
      const idx = (y * 2048 + x) * 4;

      const r = mapData.data[idx];
      const g = mapData.data[idx + 1];
      const b = mapData.data[idx + 2];

      const isGreen = r === 0x22 && g === 0xc5 && b === 0x5e;
      const isSlate = r === 0x33 && g === 0x41 && b === 0x55;

      return {
        isLand: isGreen || isSlate,
        isHighlighted: isGreen,
      };
    };

    // --- CREATE GLOBE DOTS ---
    const GLOBE_RADIUS = 300;
    const DOT_COUNT = 35000; // optimized for performance while maintaining high density
    
    // Circle geometries for instanced mesh
    const greenGeometry = new THREE.CircleGeometry(1.6, 5);
    const slateGeometry = new THREE.CircleGeometry(1.4, 5);

    const greenMaterial = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
    });
    const slateMaterial = new THREE.MeshBasicMaterial({
      color: 0x475569,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });

    // Temp lists to store transforms
    const greenPositions: THREE.Vector3[] = [];
    const slatePositions: THREE.Vector3[] = [];

    const dummy = new THREE.Object3D();
    const vector = new THREE.Vector3();

    for (let i = 0; i < DOT_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
      const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

      // Convert phi & theta to latitude & longitude coordinates
      const lat = 90 - phi * (180 / Math.PI);
      const thetaWrapped = (theta % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const lng = (thetaWrapped * (180 / Math.PI)) - 180;

      // Convert to UV space for image/canvas sampling
      const u = (lng + 180) / 360;
      const v = (90 - lat) / 180;

      const { isLand, isHighlighted } = checkLand(u, v);

      if (isLand) {
        const pos = toXYZ(lat, lng, GLOBE_RADIUS);
        if (isHighlighted) {
          greenPositions.push(pos);
        } else {
          slatePositions.push(pos);
        }
      }
    }

    // Instanced Mesh for Green Dots
    const greenMesh = new THREE.InstancedMesh(greenGeometry, greenMaterial, greenPositions.length);
    greenPositions.forEach((pos, idx) => {
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      greenMesh.setMatrixAt(idx, dummy.matrix);
    });
    greenMesh.instanceMatrix.needsUpdate = true;
    globeContainer.add(greenMesh);

    // Instanced Mesh for Slate Dots
    const slateMesh = new THREE.InstancedMesh(slateGeometry, slateMaterial, slatePositions.length);
    slatePositions.forEach((pos, idx) => {
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      slateMesh.setMatrixAt(idx, dummy.matrix);
    });
    slateMesh.instanceMatrix.needsUpdate = true;
    globeContainer.add(slateMesh);

    // --- DRAW HUBS & LABELS ---
    HUBS.forEach((hub) => {
      const pos = toXYZ(hub.lat, hub.lng, GLOBE_RADIUS);
      
      // Pin Sphere
      const pinGeom = new THREE.SphereGeometry(3.5, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: hub.lat === 5.6037 || hub.lat === 6.5244 ? 0xeab308 : 0x22c55e,
      });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      globeContainer.add(pin);
    });

    // --- DRAW ANIMATED ARCS ---
    const arcTubes: { mesh: THREE.Mesh; progress: number; speed: number; geometry: THREE.TubeGeometry }[] = [];

    CONNECTIONS.forEach((conn) => {
      const startXYZ = toXYZ(conn.start[0], conn.start[1], GLOBE_RADIUS);
      const endXYZ = toXYZ(conn.end[0], conn.end[1], GLOBE_RADIUS);

      const d3Interpolate = geoInterpolate(
        [conn.start[1], conn.start[0]],
        [conn.end[1], conn.end[0]]
      );
      
      const control1 = d3Interpolate(0.25);
      const control2 = d3Interpolate(0.75);

      const dist = startXYZ.distanceTo(endXYZ);
      const arcHeight = GLOBE_RADIUS + dist * 0.28;

      const controlXYZ1 = toXYZ(control1[1], control1[0], arcHeight);
      const controlXYZ2 = toXYZ(control2[1], control2[0], arcHeight);

      const curve = new THREE.CubicBezierCurve3(startXYZ, controlXYZ1, controlXYZ2, endXYZ);
      
      // Create Tube
      const geometry = new THREE.TubeGeometry(curve, 44, 0.8, 8, false);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(conn.color),
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      geometry.setDrawRange(0, 0); // start invisible
      globeContainer.add(mesh);

      arcTubes.push({
        mesh,
        geometry,
        progress: Math.random() * -0.5, // staggered start
        speed: 0.007 + Math.random() * 0.004,
      });
    });

    // --- ANIMATION LOOP ---
    let frameId: number;
    let lastScrollY = window.scrollY;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    // Rotate on Scroll Handler
    const handleScroll = () => {
      isScrolling = true;
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      
      globeContainer.rotation.y += delta * 0.0012;
      lastScrollY = currentScrollY;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Render loop
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Auto rotation when not scrolling
      if (!isScrolling) {
        globeContainer.rotation.y += 0.0016;
      }

      // Animate Arcs
      arcTubes.forEach((arc) => {
        arc.progress += arc.speed;
        if (arc.progress > 1) {
          arc.progress = -0.3; // Loop with small pause
        }

        if (arc.progress < 0) {
          arc.geometry.setDrawRange(0, 0);
        } else {
          const indexCount = arc.geometry.index?.count || 0;
          arc.geometry.setDrawRange(0, Math.floor(arc.progress * indexCount));
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(scrollTimeout);
      renderer.dispose();
      greenGeometry.dispose();
      slateGeometry.dispose();
      greenMaterial.dispose();
      slateMaterial.dispose();
      arcTubes.forEach((arc) => {
        arc.geometry.dispose();
        if (Array.isArray(arc.mesh.material)) {
          arc.mesh.material.forEach((mat) => mat.dispose());
        } else {
          arc.mesh.material.dispose();
        }
      });
    };
  }, [mounted]);

  if (!mounted) {
    return <div className="h-[550px] w-full bg-slate-950/5 rounded-3xl" />;
  }

  return (
    <div ref={containerRef} className="relative w-full h-[550px] overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full max-w-full" />
    </div>
  );
}
