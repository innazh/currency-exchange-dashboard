import React from 'react';
// Given time constraints, I have used an existing implementation insread of coding my own:
import ReactSelect from 'react-select';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@components/ui/select';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';

import { CURRENCY_PAIRS } from './lib/constants.js';

const CurrencyExchangeForm = ({
    selectedPairs,
    setSelectedPairs,
    reportingPeriod,
    setReportingPeriod,
    onSubmit,
    isLoading = false,
}) => {
    const periods = {
        '7 days': 7,
        '1 month': 1,
        '3 months': 3,
        '6 months': 6,
        '1 year': 1,
        '2 years': 2,
    };

    const isSubmitDisabled = !selectedPairs.length || !reportingPeriod || isLoading;

    return (
        <Card>
            <CardContent className="flex justify-center flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <ReactSelect
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
                        {Object.keys(periods).map((period) => (
                            <SelectItem key={period} value={period}>
                                {period}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-blue-600 text-white w-full md:w-auto"
                >
                    {isLoading ? 'Loading...' : 'Submit'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default CurrencyExchangeForm;