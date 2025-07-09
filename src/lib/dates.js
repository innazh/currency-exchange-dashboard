import {TIME_PERIODS} from './constants';

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const subMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
};

const subYears = (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() - years);
    return result;
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calculateFromDate = (reportingPeriod) => {
    const today = new Date();
    let startDate;

    if (reportingPeriod.includes('day')) {
    startDate = addDays(today, -TIME_PERIODS[reportingPeriod]);
    } else if (reportingPeriod.includes('month')) {
    startDate = subMonths(today, TIME_PERIODS[reportingPeriod]);
    } else if (reportingPeriod.includes('year')) {
    startDate = subYears(today, TIME_PERIODS[reportingPeriod]);
    }
    return formatDate(startDate);
}
