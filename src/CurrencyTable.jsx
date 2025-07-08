import React, { useEffect, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

const CurrencyTable = ({ data, pairs }) => {
  const [rowData, setRowData] = useState([]);

  const [colDefs] = useState([
    { field: 'currency', headerName: 'Currency Pair', sortable: true, filter: true },
    { field: 'date', sortable: true, filter: true, },
    { field: 'rate', sortable: true, filter: true },
  ]);

  const defaultColDef = {
    flex: 1,
    resizable: true,
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

  return (
    <>
      {data && (
        <AgGridReact className='flex-1'
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          animateRows
          pagination={true}
          paginationPageSize={20}
        />
        // https://www.ag-grid.com/react-data-grid/server-side-model-pagination/
      )}
    </>
  );
};

export default CurrencyTable;
