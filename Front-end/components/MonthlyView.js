import React from 'react';
import { Bar } from 'react-chartjs-2';
import './MonthlyView.css';

// Labels for each month of the year
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Component to display a bar chart of monthly data but defaults to empty array if data is undefined
const MonthlyView = ({ data = [], onMonthClick }) => {
    // Ensure data is treated as an array to prevent errors
    if (!Array.isArray(data)) {
      console.error('Expected data to be an array', data);
      data = []; 
    }

    // Initialize an array for chart data with zeros for all months
    const monthlyData = new Array(12).fill(0);
    // Populate monthlyData array with actual data
    data.forEach(item => {
        const monthIndex = parseInt(item.month, 10) - 1; // Convert month to zero-based index for JavaScript arrays
        monthlyData[monthIndex] = parseInt(item.article_count, 10); 
    });

    // Chart configuration
    const chartData = {
        labels: monthLabels, 
        datasets: [{
            label: 'Number of Articles',
            data: monthlyData, 
            backgroundColor: 'rgba(54, 162, 235, 0.5)', 
        }],
    };
    
    // Chart options
    const options = {
        scales: {
            y: {
                beginAtZero: true, 
            },
            x: { 
                title: {
                    display: true, 
                    text: 'Month', 
                    color: '#666', 
                    font: {
                        size: 16, 
                        family: 'Arial', 
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: true, 
            }
        },
        // Handles click events on the chart and gets month index
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const month = elements[0].index + 1; 
                onMonthClick(month); 
            }
        },
    };

    // Render the bar chart with the configured data and options
    return <Bar data={chartData} options={options} />;
};

export default MonthlyView;
