import React from 'react';
import { Bar } from 'react-chartjs-2';

// Displays Yearly Article Counts in a Bar Chart
const YearlyView = ({ data, onYearClick }) => {
    // Chart Data Preparation
    const chartData = {
        labels: data.map(item => item.year), // Map data to extract year labels
        datasets: [{
            label: 'Number of Articles',
            data: data.map(item => parseInt(item.article_count, 10)),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }],
    };

    // Click Event Handler for Chart Bars
    const handleBarClick = (event) => {
        const yearIndex = event[0].index; // Retrieve the index of the clicked bar
        const year = data[yearIndex].year; // Get the year based on the clicked bar's index
        onYearClick(year); // Execute the callback function with the selected year
    };

    // Options
    const options = {
        scales: {
            y: {
                beginAtZero: true, 
            },
            x: {
                title: {
                    display: true,
                    text: 'Year',
                    color: '#666',
                    font: {
                        size: 16,
                        family: 'Arial',
                    }
                },
            }
        },
        plugins: {
            legend: {
                display: true,
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const element = elements[0];
                const yearIndex = element.index;
                const year = data[yearIndex].year;
                onYearClick(year); // Execute the callback function on click
            }
        },
    };

    // Rendering the Bar Chart
    return (
        <Bar 
            data={chartData} 
            options={options} 
            onElementsClick={handleBarClick}  // Setup the click event handler for chart elements
        />
    );
};

export default YearlyView;
