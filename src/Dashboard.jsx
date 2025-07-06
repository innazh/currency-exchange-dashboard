import React, { useState, useRef } from 'react';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

import CurrencyExchangeForm from './CurrencyExchangeForm';
import HistoricalExchangeLineChart from './Chart';
import { addDays, subMonths, subYears, formatDate } from './lib/dates';
import { AVAILABLE_CURRENCIES } from './lib/constants.js';

const Dashboard = () => {
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState('');
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastSubmittedRef = useRef({ from: '', to: '', period: '' });

  const periods = {
    '7 days': 7,
    '1 month': 1,
    '3 months': 3,
    '6 months': 6,
    '1 year': 1,
    '2 years': 2,
  };

  const handleSubmit = async () => {
    // Check if same values were already submitted
    if (
      lastSubmittedRef.current.from === fromCurrency &&
      lastSubmittedRef.current.to === toCurrency &&
      lastSubmittedRef.current.period === reportingPeriod
    ) {
      console.log('Same values already submitted. Skipping fetch.');
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date();
      let startDate;

      if (reportingPeriod.includes('day')) {
        startDate = addDays(today, -periods[reportingPeriod]);
      } else if (reportingPeriod.includes('month')) {
        startDate = subMonths(today, periods[reportingPeriod]);
      } else if (reportingPeriod.includes('year')) {
        startDate = subYears(today, periods[reportingPeriod]);
      }

      const formattedDate = formatDate(startDate);
      const pair = `${fromCurrency}/${toCurrency}`;

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto mt-4 flex flex-col space-y-4'>
      <h1 className="mb-4 text-4xl capitalize font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Historical currency exchange <span class="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">data dashboard</span></h1>

      <div className="flex flex-wrap gap-2">
        <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Currently available:</p>
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AVAILABLE_CURRENCIES).map(([code, name]) => (
              <Tooltip key={code}>
                <TooltipTrigger asChild>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border cursor-default">
                    {code}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      <CurrencyExchangeForm
        fromCurrency={fromCurrency}
        setFromCurrency={setFromCurrency}
        toCurrency={toCurrency}
        setToCurrency={setToCurrency}
        reportingPeriod={reportingPeriod}
        setReportingPeriod={setReportingPeriod}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <HistoricalExchangeLineChart chartData={chartData} />
    </div>
  );

};

export default Dashboard;