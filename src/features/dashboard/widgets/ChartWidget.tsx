/* ─── ChartWidget — Supports all chart types with live switching ───────── */
import React, { useMemo } from 'react';
import {
  AreaChart, BarChart, LineChart, PieChart, DonutChart,
  RadarChart,
} from '@mantine/charts';
import type { WidgetProps, ChartType } from './types';
import { tripHistory } from '@/data';
import styles from './ChartWidget.module.css';

/* ─── Dataset Mappings ────────────────────────────────────────────────── */
function getDataAndSeries(widgetType: string, config: any) {
  const ct: ChartType = config.chartType || 'area';

  switch (widgetType) {
    case 'chart-weekly-distance':
      return {
        data: tripHistory,
        dataKey: 'day',
        series: [
          { name: 'distance', color: config.series?.[0]?.color || 'blue.5', label: 'Distance (km)' },
          { name: 'fuel', color: config.series?.[1]?.color || 'cyan.4', label: 'Fuel (L)' },
        ],
        chartType: ct,
      };
    case 'chart-fuel-trend':
      return {
        data: tripHistory,
        dataKey: 'day',
        series: [
          { name: 'fuel', color: config.series?.[0]?.color || 'orange.5', label: 'Fuel (L)' },
        ],
        chartType: ct || 'line',
      };
    case 'chart-trip-count':
      return {
        data: tripHistory,
        dataKey: 'day',
        series: [
          { name: 'trips', color: config.series?.[0]?.color || 'violet.5', label: 'Trips' },
        ],
        chartType: ct || 'bar',
      };
    case 'chart-speed-distribution':
      return {
        data: tripHistory,
        dataKey: 'day',
        series: [
          { name: 'distance', color: config.series?.[0]?.color || 'teal.5', label: 'Distance' },
        ],
        chartType: ct || 'bar',
      };
    default:
      return {
        data: tripHistory,
        dataKey: 'day',
        series: [
          { name: 'distance', color: 'blue.5', label: 'Distance' },
        ],
        chartType: ct,
      };
  }
}

/* ─── Render chart by type ────────────────────────────────────────────── */
function renderChart(
  chartType: ChartType,
  data: any[],
  dataKey: string,
  series: any[],
  config: any,
  height: number,
) {
  const commonProps = {
    h: height,
    data,
    dataKey,
    tickLine: 'none' as const,
    withLegend: config.legend?.show !== false,
    withTooltip: config.tooltips !== false,
  };

  const curveType = config.curveType || 'monotone';
  const strokeWidth = config.strokeWidth || 2;
  const gridAxis = config.grid?.showX && config.grid?.showY ? 'xy' : config.grid?.showY ? 'y' : config.grid?.showX ? 'x' : 'none';

  switch (chartType) {
    case 'area':
      return (
        <AreaChart
          {...commonProps}
          series={series}
          curveType={curveType}
          withGradient
          gridAxis={gridAxis as any}
          strokeWidth={strokeWidth}
          withDots={false}
          fillOpacity={config.fillOpacity ?? 0.3}
        />
      );

    case 'line':
      return (
        <LineChart
          {...commonProps}
          series={series}
          curveType={curveType}
          gridAxis={gridAxis as any}
          strokeWidth={strokeWidth}
          withDots
        />
      );

    case 'bar':
      return (
        <BarChart
          {...commonProps}
          series={series}
          gridAxis={gridAxis as any}
          barProps={{ radius: 6 }}
        />
      );

    case 'pie': {
      const pieData = data.map((d, i) => ({
        name: d[dataKey],
        value: d[series[0]?.name] || 0,
        color: series[i]?.color || `blue.${3 + (i % 5)}`,
      }));
      return <PieChart data={pieData} size={height - 20} withLabels withTooltip />;
    }

    case 'doughnut': {
      const donutData = data.map((d, i) => ({
        name: d[dataKey],
        value: d[series[0]?.name] || 0,
        color: series[i]?.color || `blue.${3 + (i % 5)}`,
      }));
      return (
        <DonutChart
          data={donutData}
          size={height - 20}
          thickness={22}
          withLabels
          withTooltip
          paddingAngle={2}
        />
      );
    }

    case 'radar': {
      const radarSeries = series.map(s => ({
        name: s.name,
        color: s.color,
        opacity: config.fillOpacity ?? 0.15,
      }));
      return (
        <RadarChart
          {...commonProps}
          series={radarSeries}
          withPolarGrid
          withPolarAngleAxis
          withPolarRadiusAxis
        />
      );
    }

    default:
      return (
        <AreaChart
          {...commonProps}
          series={series}
          curveType={curveType}
          withGradient
          gridAxis={gridAxis as any}
          strokeWidth={strokeWidth}
          withDots={false}
        />
      );
  }
}

export default function ChartWidget({ instance }: WidgetProps) {
  const { data, dataKey, series, chartType } = useMemo(
    () => getDataAndSeries(instance.type, instance.config),
    [instance.type, instance.config]
  );

  const isPie = chartType === 'pie' || chartType === 'doughnut';

  return (
    <div className={styles.chart}>
      <div className={isPie ? styles.pieWrap : styles.chartWrap}>
        {renderChart(chartType, data, dataKey, series, instance.config, isPie ? 200 : 220)}
      </div>
    </div>
  );
}
