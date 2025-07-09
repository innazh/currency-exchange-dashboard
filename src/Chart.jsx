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
                                mode: 'index',
                                intersect: false,
                            },
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: 'Exchange Rate Over Time' },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => {
                                            const datasetLabel = context.dataset.label || '';
                                            const value = context.parsed.y;
                                            return `${datasetLabel}: ${value}`;
                                        },
                                    },
                                    displayColors: true,
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