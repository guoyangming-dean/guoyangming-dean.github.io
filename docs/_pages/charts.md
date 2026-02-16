---
permalink: /charts/
title: "Data Visualization"
layout: single
author_profile: true
---

# Data Visualization with ECharts

This page demonstrates interactive data visualization using ECharts library.

## Charts Container

<div style="display: flex; flex-direction: column; gap: 40px; margin: 30px 0;">
  <div id="lineChart" style="width: 100%; height: 400px;"></div>
  <div id="barChart" style="width: 100%; height: 400px;"></div>
  <div id="pieChart" style="width: 100%; height: 400px;"></div>
</div>

## About the Data

The charts above display simulated data for demonstration purposes:
- **Line Chart**: Monthly website traffic (January 2024 - December 2024)
- **Bar Chart**: Project completion statistics by category
- **Pie Chart**: Technology stack usage distribution

## How to Use

- Hover over chart elements to see detailed values
- Use the legend to toggle visibility of data series
- Click and drag to zoom in on line and bar charts
- Download chart as PNG using the toolbox icon

## Implementation Details

This visualization uses [ECharts](https://echarts.apache.org/), a powerful, interactive charting and visualization library for JavaScript. All charts are rendered client-side with simulated data.

<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Initialize ECharts instances
  const lineChart = echarts.init(document.getElementById('lineChart'));
  const barChart = echarts.init(document.getElementById('barChart'));
  const pieChart = echarts.init(document.getElementById('pieChart'));

  // Simulated data - Monthly website traffic
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trafficData = [1250, 1320, 1500, 1680, 1890, 2100, 2300, 2450, 2400, 2550, 2700, 2900];
  const uniqueVisitors = [850, 920, 1050, 1180, 1320, 1450, 1580, 1620, 1550, 1680, 1750, 1850];

  // Line chart configuration
  const lineOption = {
    title: {
      text: 'Monthly Website Traffic (2024)',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Total Visits', 'Unique Visitors'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      },
      right: 10
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months
    },
    yAxis: {
      type: 'value',
      name: 'Visits'
    },
    series: [
      {
        name: 'Total Visits',
        type: 'line',
        data: trafficData,
        smooth: true,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: 'Unique Visitors',
        type: 'line',
        data: uniqueVisitors,
        smooth: true,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  };

  // Bar chart configuration - Project completion by category
  const barOption = {
    title: {
      text: 'Project Completion Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['AI Research', 'Web Development', 'Data Analysis', 'MLOps', 'Documentation', 'Testing']
    },
    yAxis: {
      type: 'value',
      name: 'Projects Completed'
    },
    series: [
      {
        name: 'Q1 2024',
        type: 'bar',
        data: [12, 8, 15, 6, 10, 7],
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: 'Q2 2024',
        type: 'bar',
        data: [15, 10, 18, 8, 12, 9],
        itemStyle: {
          color: '#91cc75'
        }
      },
      {
        name: 'Q3 2024',
        type: 'bar',
        data: [18, 12, 22, 10, 15, 11],
        itemStyle: {
          color: '#fac858'
        }
      },
      {
        name: 'Q4 2024',
        type: 'bar',
        data: [20, 15, 25, 12, 18, 13],
        itemStyle: {
          color: '#ee6666'
        }
      }
    ]
  };

  // Pie chart configuration - Technology stack distribution
  const pieOption = {
    title: {
      text: 'Technology Stack Usage',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 30
    },
    series: [
      {
        name: 'Technology Usage',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: 'Python' },
          { value: 25, name: 'JavaScript/TypeScript' },
          { value: 15, name: 'C++' },
          { value: 10, name: 'SQL/Databases' },
          { value: 8, name: 'Docker/K8s' },
          { value: 7, name: 'Other' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // Apply options to charts
  lineChart.setOption(lineOption);
  barChart.setOption(barOption);
  pieChart.setOption(pieOption);

  // Handle window resize
  window.addEventListener('resize', function() {
    lineChart.resize();
    barChart.resize();
    pieChart.resize();
  });
});
</script>

<style>
.chart-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

#lineChart, #barChart, #pieChart {
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>