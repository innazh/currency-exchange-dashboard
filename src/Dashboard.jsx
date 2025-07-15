import React, { useState, useRef, useEffect } from 'react';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

import CurrencyExchangeForm from './CurrencyExchangeForm';
import HistoricalExchangeLineChart from './Chart';
import CurrencyTable from './CurrencyTable';
import { calculateFromDate } from './lib/dates';
import { AVAILABLE_CURRENCIES } from './lib/constants.js';

const prepChartData = (data, selectedPairs) => {
  return selectedPairs.map((pair, idx) => {
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
}

const Dashboard = () => {
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [reportingPeriod, setReportingPeriod] = useState('');
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastSubmittedRef = useRef({ pairs: '', period: '' });
  const [tableData, setTableData] = useState({});

  const updateUrlParams = (pairs, period) => {
    const queryParams = new URLSearchParams();
    queryParams.set('pairs', pairs.join(','));
    queryParams.set('period', period);
    window.history.replaceState({}, '', `${window.location.pathname}?${queryParams}`);
  }

  const handleSubmit = async (existingPairParam, existingPeriodParam) => {
    const pairsToSubmit = existingPairParam !== null && existingPairParam !== undefined
      ? existingPairParam
      : selectedPairs;

    const periodToSubmit = existingPeriodParam !== null && existingPeriodParam !== undefined
      ? existingPeriodParam
      : reportingPeriod;

    // Check if same values were already submitted
    // Could be optimized so that if only one pair has changed, we just fetch that one pair instead of all pairs
    if (lastSubmittedRef.current.pairs === pairsToSubmit.join(',') && lastSubmittedRef.current.period === periodToSubmit) {
      return;
    }

    setIsLoading(true);

    try {
      const fromDate = calculateFromDate(periodToSubmit);

      const pairParams = pairsToSubmit.map(pair => `pair=${encodeURIComponent(pair)}`).join('&');
      const res = await fetch(`/api/rates?${pairParams}&from=${fromDate}`);
      const data = await res.json();

      const firstPair = pairsToSubmit[0];
      const ratesForFirstPair = data.data[firstPair] || {};
      const labels = Object.keys(ratesForFirstPair);

      const datasets = prepChartData(data, pairsToSubmit);

      // set data, persist form input as query params
      setChartData({
        labels,
        datasets,
      });

      setTableData(data.data);

      lastSubmittedRef.current = {
        pairs: pairsToSubmit.join(','),
        period: periodToSubmit,
      };

      updateUrlParams(pairsToSubmit, periodToSubmit);

    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pairsParam = params.get('pairs');
    const periodParam = params.get('period');

    if (pairsParam) {
      setSelectedPairs(pairsParam.split(','));
    }

    if (periodParam) {
      setReportingPeriod(periodParam);
    }
    if (pairsParam && periodParam) {
      handleSubmit(pairsParam.split(','), periodParam);
    }
  }, []);

  return (
    <div className="max-w-4xl px-4 mx-auto mt-4 md:px-0 flex flex-col space-y-4">
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
        onSubmit={() => handleSubmit()}
        isLoading={isLoading}
      />
      <HistoricalExchangeLineChart chartData={chartData} />
      {lastSubmittedRef.current.pairs != '' && <CurrencyTable data={tableData} pairs={selectedPairs} />}
    </div>
  );

};

export default Dashboard;