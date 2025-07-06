import React from 'react';
import { Card, CardContent } from '@components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@components/ui/select';
import { Button } from '@components/ui/button';
import { ArrowLeftRight } from 'lucide-react';

const CurrencyExchangeForm = ({
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    reportingPeriod,
    setReportingPeriod,
    onSubmit,
    isLoading = false
}) => {
    const currencies = ['CAD', 'USD', 'EUR'];
    const periods = {
        '7 days': 7,
        '1 month': 1,
        '3 months': 3,
        '6 months': 6,
        '1 year': 1,
        '2 years': 2,
    };

    const handleSwap = () => {
        if (fromCurrency && toCurrency) {
            const temp = fromCurrency;
            setFromCurrency(toCurrency);
            setToCurrency(temp);
        }
    };

    const isSubmitDisabled = !fromCurrency || !toCurrency || !reportingPeriod || isLoading;
    const filteredFromCurrencies = currencies.filter((currency) => currency !== toCurrency);
    const filteredToCurrencies = currencies.filter((currency) => currency !== fromCurrency);

    return (
        <Card>
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