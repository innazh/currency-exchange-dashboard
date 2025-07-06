import React, { useState, useRef } from 'react';
import CurrencyExchangeForm from './CurrencyExchangeForm';
import HistoricalExchangeLineChart from './Chart';
import { addDays, subMonths, subYears, formatDate } from './utils/dates';

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
    <div className='max-w-4xl mx-auto p-4 flex flex-col space-y-4'>
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