import React, { useState, useRef } from 'react';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

import CurrencyExchangeForm from './CurrencyExchangeForm';
import HistoricalExchangeLineChart from './Chart';
import CurrencyTable from './CurrencyTable';
import { addDays, subMonths, subYears, formatDate } from './lib/dates';
import { AVAILABLE_CURRENCIES } from './lib/constants.js';

const Dashboard = () => {
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [reportingPeriod, setReportingPeriod] = useState('');
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastSubmittedRef = useRef({ pairs: '', period: '' });
  const [tableData, setTableData] = useState({});

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
    // Could be optimized so that if only one pair has changed, we just fetch that one pair instead of all pairs
    if (
      lastSubmittedRef.current.pairs === selectedPairs.join(',') &&
      lastSubmittedRef.current.period === reportingPeriod
    ) {
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

      const pairParams = selectedPairs.map(pair => `pair=${encodeURIComponent(pair)}`).join('&');
      const res = await fetch(`/api/rates?${pairParams}&from=${formattedDate}`);
      const data = await res.json();
      console.log('API Response:', data);

      const firstPair = selectedPairs[0];
      const ratesForFirstPair = data.data[firstPair] || {};
      const labels = Object.keys(ratesForFirstPair);

      const datasets = selectedPairs.map((pair, idx) => {
        const values = Object.values(data.data[pair] || {});
        const colors = [
          'rgb(56, 189, 248)',
          'rgb(45, 212, 191)',
          'rgb(5, 150, 105)',
        ];
        return {
          label: pair,
          data: values,
          borderColor: colors[idx % colors.length],
          backgroundColor: `${colors[idx % colors.length].replace('rgb', 'rgba').replace(')', ', 0.2)')}`,
          tension: 0.2,
          pointRadius: 2,
        };
      });

      setChartData({
        labels,
        datasets,
      });

      setTableData(data.data);

      lastSubmittedRef.current = {
        pairs: selectedPairs.join(','),
        period: reportingPeriod,
      };
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 flex flex-col space-y-4">
      <h1 className="mb-4 text-4xl capitalize font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Historical currency exchange <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">data dashboard</span></h1>

      <div className="flex flex-wrap gap-2">
        <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Currently available:</p>
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
        selectedPairs={selectedPairs}
        setSelectedPairs={setSelectedPairs}
        reportingPeriod={reportingPeriod}
        setReportingPeriod={setReportingPeriod}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <HistoricalExchangeLineChart chartData={chartData} />
      {lastSubmittedRef.current.pairs!='' && <CurrencyTable data={tableData} pairs={selectedPairs} />}
    </div>
  );

};

export default Dashboard;