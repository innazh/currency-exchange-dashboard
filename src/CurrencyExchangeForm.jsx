import React from 'react';
// Given time constraints, I have used an existing implementation insread of coding my own:
import ReactSelect from 'react-select';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@components/ui/select';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';

import { CURRENCY_PAIRS, TIME_PERIODS } from './lib/constants.js';

const CurrencyExchangeForm = ({
    selectedPairs,
    setSelectedPairs,
    reportingPeriod,
    setReportingPeriod,
    onSubmit,
    isLoading = false,
}) => {

    const isSubmitDisabled = !selectedPairs.length || !reportingPeriod || isLoading;

    const resetParams = () => {
        setSelectedPairs([]);
        setReportingPeriod('');
        window.history.replaceState({}, '', window.location.pathname);
    }

    return (
        <Card>
            <CardContent className="flex justify-center flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <ReactSelect
                    className='z-50'
                    isMulti
                    options={CURRENCY_PAIRS.map(pair => ({ value: pair, label: pair }))}
                    value={selectedPairs.map(pair => ({ value: pair, label: pair }))}
                    onChange={opts => setSelectedPairs(opts.map(opt => opt.value))}
                    closeMenuOnSelect={false}
                    placeholder="Select up to 3 pairs"
                    isOptionDisabled={() => selectedPairs.length >= 3}
                />
                <Select onValueChange={setReportingPeriod} value={reportingPeriod}>
                    <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Reporting period" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(TIME_PERIODS).map((period) => (
                            <SelectItem key={period} value={period}>
                                {period}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className='flex flex-col md:flex-row gap-1.5'>
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-blue-600 text-white w-full md:w-auto"
                >
                    {isLoading ? 'Loading...' : 'Submit'}
                </Button>
                <Button variant='destructive' onClick={resetParams}>Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrencyExchangeForm;