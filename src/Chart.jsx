import React from 'react';
import { Card } from '@/components/ui/card';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HistoricalExchangeLineChart = ({ chartData }) => {

    return (
        <>
            {chartData && (
                <Card className="p-0">
                    <Line className="p-4"
                        data={chartData}
                        options={{
                            responsive: true,
                            interaction: {
                                mode: 'nearest',
                                intersect: false,
                            },
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: 'Exchange Rate Over Time' },
                                tooltip: {
                                    callbacks: {
                                        title: (context) => `\u2022 ${context[0].parsed.y}`, // Value on top
                                        label: (context) => `${context.label}`, // Date below
                                    },
                                    displayColors: false,
                                    bodyFont: { weight: 'normal' },
                                    titleFont: { weight: 'bold' },
                                },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        maxTicksLimit: 10,
                                        maxRotation: 0,
                                        minRotation: 0,
                                    },
                                },
                            },
                        }}
                    />
                </Card>
            )}
        </>
    );
}
export default HistoricalExchangeLineChart;