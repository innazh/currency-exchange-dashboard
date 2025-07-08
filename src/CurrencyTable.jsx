import React, { useEffect, useState, useRef } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { BrushCleaning, Save } from 'lucide-react';
import { toast } from "sonner"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Toaster } from "@/components/ui/sonner"

ModuleRegistry.registerModules([AllCommunityModule]);

const CurrencyTable = ({ data, pairs }) => {
  const tableRef = useRef();
  const [rowData, setRowData] = useState([]);

  const [colDefs] = useState([
    { field: 'currency', headerName: 'Currency Pair', sortable: true, filter: true },
    { field: 'date', sortable: true, filter: true, },
    {
      field: 'rate', sortable: true, filter: true, valueFormatter: (params) => {
        return params.value ? Number(params.value).toFixed(4) : '-';
      },
    },
  ]);

  const defaultColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
  };

  useEffect(() => {
    if (data && Array.isArray(pairs) && pairs.length > 0) {
      const transformed = pairs.flatMap(pair =>
        data[pair]
          ? Object.entries(data[pair]).map(([date, rate]) => ({
            currency: pair,
            date,
            rate,
          }))
          : []
      );
      setRowData(transformed);
    }
  }, [data, pairs]);

  // Load table settings if they exist in local storage
  const onGridReady = () => {
    const settings = localStorage.getItem('currencyTableSettings');

    if (!settings) {
      return;
    }

    const parsedSettings = JSON.parse(settings);

    if (parsedSettings.columns) {
      tableRef.current.api.applyColumnState({
        state: parsedSettings.columns,
        applyOrder: true
      });
    }
    if (parsedSettings.filters) {
      tableRef.current.api.setFilterModel(parsedSettings.filters);
    }
    if (parsedSettings.sort && parsedSettings.sort.length > 0) {
      tableRef.current.api.applyColumnState({
        state: parsedSettings.sort,
        defaultState: { sort: null }
      });
    }
  }

  const saveTableSettings = () => {
    const columnState = tableRef.current.api.getColumnState();
    const filterModel = tableRef.current.api.getFilterModel();
    const paginationSize = tableRef.current.api.paginationGetPageSize();
    const sortState = columnState
      .filter(s => s.sort != null)
      .map(s => ({
        colId: s.colId,
        sort: s.sort,
        sortIndex: s.sortIndex
      }));

    const gridState = {
      columns: columnState,
      filters: filterModel,
      sort: sortState,
      pagination: {
        pageSize: paginationSize,
      }
    };

    localStorage.setItem('currencyTableSettings', JSON.stringify(gridState));
    toast.success('Table settings have been saved');
  }

  const clearTableSettings = () => {
    localStorage.removeItem('currencyTableSettings');
    toast.info('Table settings cleared');
  }

  return (
    <>
      {data && (
        <Card className='w-full'>
          <CardHeader className='gap-0'>
            <div className='flex justify-end items-center gap-2'>
              <Button variant='outline' size='sm' onClick={clearTableSettings}>
                <BrushCleaning />
                Table Settings
              </Button>
              <Button size='sm' onClick={saveTableSettings}>
                <Save />
                Table Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <AgGridReact
              ref={tableRef}
              className='flex-1'
              rowData={rowData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              animateRows
              pagination={true}
              paginationPageSize={20}
              enableCellTextSelection={true}
              onGridReady={onGridReady} // load the settings from local storage
              onRowClicked={() => {
                // I want to add historical conversion functionality here
              }}
            />
          </CardContent>
        </Card>
        // https://www.ag-grid.com/react-data-grid/server-side-model-pagination/
      )}
      <Toaster richColors />
    </>
  );
};

export default CurrencyTable;
