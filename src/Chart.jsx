import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftRight } from 'lucide-react';
import { addDays, subMonths, subYears, format } from 'date-fns';
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

const currencies = ['CAD', 'USD', 'EUR'];
const periods = {
    '7 days': 7,
    '1 month': 1,
    '3 months': 3,
    '6 months': 6,
    '1 year': 1,
    '2 years': 2,
};

export default function HistoricalExchangeChart() {
    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [reportingPeriod, setReportingPeriod] = useState('');
    const [chartData, setChartData] = useState(null);
    const lastSubmittedRef = useRef({ from: '', to: '', period: '' });

    const handleSwap = () => {
        if (fromCurrency && toCurrency) {
            const temp = fromCurrency;
            setFromCurrency(toCurrency);
            setToCurrency(temp);
        }
    };

    const handleSubmit = async () => {
        if (
            lastSubmittedRef.current.from === fromCurrency &&
            lastSubmittedRef.current.to === toCurrency &&
            lastSubmittedRef.current.period === reportingPeriod
        ) {
            console.log('Same values already submitted. Skipping fetch.');
            return;
        }

        const today = new Date();
        let startDate;

        if (reportingPeriod.includes('day')) {
            startDate = addDays(today, -periods[reportingPeriod]);
        } else if (reportingPeriod.includes('month')) {
            startDate = subMonths(today, periods[reportingPeriod]);
        } else if (reportingPeriod.includes('year')) {
            startDate = subYears(today, periods[reportingPeriod]);
        }

        const formattedDate = format(startDate, 'yyyy-MM-dd');
        const pair = `${fromCurrency}/${toCurrency}`;

        try {
            const res = await fetch(`/api/rates?pair=${pair}&from=${formattedDate}`);
            const data = await res.json();
            console.log('API Response:', data);

            const rates = data.data[pair];
            const labels = Object.keys(rates);
            const values = Object.values(rates);

            setChartData({
                labels,
                datasets: [
                    {
                        label: pair,
                        data: values,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        tension: 0.2,
                        pointRadius: 2,
                    },
                ],
            });

            lastSubmittedRef.current = {
                from: fromCurrency,
                to: toCurrency,
                period: reportingPeriod,
            };
        } catch (err) {
            console.error('API Error:', err);
        }
    };

    const isSubmitDisabled = !fromCurrency || !toCurrency || !reportingPeriod;
    const filteredFromCurrencies = currencies.filter((currency) => currency !== toCurrency);
    const filteredToCurrencies = currencies.filter((currency) => currency !== fromCurrency);

    return (
        <Card className="m-4 mx-auto w-fit">
            <CardContent className="flex justify-center flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <Select onValueChange={setFromCurrency} value={fromCurrency}>
                    <SelectTrigger className="w-full md:w-[120px]">
                        <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredFromCurrencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                                {currency}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="ghost" onClick={handleSwap} className="p-2">
                    <ArrowLeftRight className="w-4 h-4" />
                </Button>

                <Select onValueChange={setToCurrency} value={toCurrency}>
                    <SelectTrigger className="w-full md:w-[120px]">
                        <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredToCurrencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                                {currency}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setReportingPeriod} value={reportingPeriod}>
                    <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Reporting period" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(periods).map((period) => (
                            <SelectItem key={period} value={period}>
                                {period}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-blue-600 text-white w-full md:w-auto"
                >
                    Submit
                </Button>
            </CardContent>

            {chartData && (
                <div className="mt-6">
                    <Line
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
                </div>
            )}
        </Card>
    );
}
