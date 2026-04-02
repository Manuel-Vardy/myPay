"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface WorldMapProps {
  className?: string;
}

export default function WorldMap({ className = "" }: WorldMapProps) {
  const chartDivRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

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
        panX: "rotateX",
        panY: "translateY",
        projection: am5map.geoNaturalEarth1(),
        wheelY: "zoom",
        maxZoomLevel: 10,
        minZoomLevel: 1,
      })
    );

    // Create main polygon series for countries
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"], // Exclude Antarctica
      })
    );

    // Set default appearance for countries
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
      fill: am5.color(0xe5e7eb), // Gray-200 default
      stroke: am5.color(0xffffff),
      strokeWidth: 1,
    });

    // Hover state - lime green tint
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xb6ff3b), // --trite-lime
      stroke: am5.color(0x7dff00),
    });

    // Active/selected state - stronger lime green
    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0x7dff00), // --trite-lime-strong
      stroke: am5.color(0x0b0f14),
    });

    // Set clicking on "water" to zoom out
    chart.chartContainer.get("background")?.events.on("click", () => {
      chart.goHome();
    });

    // Add zoom control
    const zoomControl = chart.set(
      "zoomControl",
      am5map.ZoomControl.new(root, {})
    );

    // Style zoom control buttons with labels
    zoomControl.homeButton.setAll({
      visible: true,
      label: am5.Label.new(root, {
        text: "⌂",
        fontSize: 20,
        fill: am5.color(0x0b0f14),
        centerX: am5.p50,
        centerY: am5.p50,
      }),
      background: am5.Rectangle.new(root, {
        fill: am5.color(0xffffff),
        stroke: am5.color(0xd1d5db),
        strokeWidth: 1,
      }),
    });

    zoomControl.plusButton.setAll({
      label: am5.Label.new(root, {
        text: "+",
        fontSize: 20,
        fill: am5.color(0x0b0f14),
        centerX: am5.p50,
        centerY: am5.p50,
      }),
      background: am5.Rectangle.new(root, {
        fill: am5.color(0xffffff),
        stroke: am5.color(0xd1d5db),
        strokeWidth: 1,
      }),
    });

    zoomControl.minusButton.setAll({
      label: am5.Label.new(root, {
        text: "−",
        fontSize: 20,
        fill: am5.color(0x0b0f14),
        centerX: am5.p50,
        centerY: am5.p50,
      }),
      background: am5.Rectangle.new(root, {
        fill: am5.color(0xffffff),
        stroke: am5.color(0xd1d5db),
        strokeWidth: 1,
      }),
    });

    // Smooth entrance animation
    chart.appear(1000, 100);

    // Cleanup function
    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartDivRef}
      className={`w-full ${className}`}
      style={{ height: "400px" }}
    />
  );
}
