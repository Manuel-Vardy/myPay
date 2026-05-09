"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { HUBS } from "@/constants/hubs";

interface WorldMapProps {
  className?: string;
  activeHubIndex?: number;
  onHubChange?: (index: number) => void;
  isPaused?: boolean;
}

export default function WorldMap({ 
  className = "", 
  activeHubIndex = 0, 
  onHubChange, 
  isPaused = false 
}: WorldMapProps) {
  const chartDivRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const currentIndexRef = useRef(activeHubIndex);
  const isPausedRef = useRef(isPaused);

  // Sync refs with props
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    currentIndexRef.current = activeHubIndex;
  }, [activeHubIndex]);

  useLayoutEffect(() => {
    if (!chartDivRef.current) return;

    // Create root element
    const root = am5.Root.new(chartDivRef.current);
    rootRef.current = root;

    // Hide amCharts logo
    root._logo?.dispose();

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create the map chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoNaturalEarth1(),
        wheelY: "zoom",
        maxZoomLevel: 10,
        minZoomLevel: 1,
        homeZoomLevel: 1.2,
        homeGeoPoint: { longitude: 10, latitude: 15 }
      })
    );

    // Create main polygon series for countries
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"], // Exclude Antarctica
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x1a1a1a),
      stroke: am5.color(0x333333),
      strokeWidth: 0.5,
      interactive: true,
    });

    // Create point series for stationary hubs
    const citySeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    );

    citySeries.bullets.push((root, series, dataItem) => {
      const container = am5.Container.new(root, {
        interactive: true
      });

      container.children.push(
        am5.Circle.new(root, {
          radius: 6,
          fill: am5.color(0x92bd30),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          tooltipText: "[bold]{name}[/]\n{fact}",
          tooltipY: 0
        })
      );

      return am5.Bullet.new(root, {
        sprite: container
      });
    });

    const cityData = HUBS.map(hub => ({
      id: hub.id,
      name: hub.name,
      fact: hub.fact,
      geometry: { type: "Point", coordinates: [hub.longitude, hub.latitude] }
    }));
    citySeries.data.setAll(cityData);

    // Create line series for the storytelling path
    const lineSeries = chart.series.push(
      am5map.MapLineSeries.new(root, {})
    );

    lineSeries.mapLines.template.setAll({
      stroke: am5.color(0x92bd30),
      strokeOpacity: 0.1,
      strokeWidth: 1,
      strokeDasharray: [2, 2]
    });

    // Create point series for the moving dot and speech bubble
    const storytellingSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    );

    storytellingSeries.bullets.push((root, series, dataItem) => {
      const container = am5.Container.new(root, {});

      // The moving dot
      const dot = container.children.push(
        am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0x92bd30),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          shadowColor: am5.color(0x92bd30),
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        })
      );

      // Pulse the dot
      dot.animate({
        key: "scale",
        from: 1,
        to: 1.3,
        duration: 800,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      });

      return am5.Bullet.new(root, {
        sprite: container
      });
    });

    // Tooltip / Speech Bubble configuration
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false,
      pointerOrientation: "horizontal",
      labelText: "{fact}",
    });

    tooltip.get("background")?.setAll({
      fill: am5.color(0x111111),
      fillOpacity: 0.9,
      stroke: am5.color(0x92bd30),
      strokeWidth: 2,
    });

    tooltip.label.setAll({
      fill: am5.color(0xffffff),
      fontSize: 12,
      fontWeight: "500",
      maxWidth: 240,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16
    });

    storytellingSeries.set("tooltip", tooltip);

    // Sequential Animation Logic
    function moveNext() {
      if (isPausedRef.current) {
        setTimeout(moveNext, 1000);
        return;
      }

      const startHub = HUBS[currentIndexRef.current];
      const nextIndex = (currentIndexRef.current + 1) % HUBS.length;
      const endHub = HUBS[nextIndex];

      // Update parent state
      if (onHubChange) {
        onHubChange(nextIndex);
      } else {
        currentIndexRef.current = nextIndex;
      }

      // Create a line between hubs
      const lineDataItem = lineSeries.pushDataItem({
        geometry: {
          type: "LineString",
          coordinates: [
            [startHub.longitude, startHub.latitude],
            [endHub.longitude, endHub.latitude]
          ]
        }
      });

      // Create a point that follows the line
      const pointDataItem = storytellingSeries.pushDataItem({
        fact: endHub.fact
      } as any);

      (pointDataItem as any).set("lineDataItem", lineDataItem as any);
      (pointDataItem as any).set("locationX", 0);

      // Animate the point along the line
      const animation = (pointDataItem as any).animate({
        key: "locationX",
        from: 0,
        to: 1,
        duration: 4000,
        easing: am5.ease.inOut(am5.ease.quad)
      });

      animation?.events.on("stopped", () => {
        // Show tooltip on arrival
        storytellingSeries.showTooltip(pointDataItem as any);

        // Zoom to the hub
        chart.zoomToGeoPoint({ longitude: endHub.longitude, latitude: endHub.latitude }, 3, true, 1000);

        // Wait, then move to next
        setTimeout(() => {
          if (!root.isDisposed()) {
            storytellingSeries.hideTooltip();
            lineDataItem.dispose();
            pointDataItem.dispose();
            moveNext();
          }
        }, 5000);
      });
    }

    // Start the sequence after a short delay
    setTimeout(moveNext, 2000);

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [onHubChange]);

  return (
    <div
      ref={chartDivRef}
      className={`w-full h-full ${className}`}
    />
  );
}
