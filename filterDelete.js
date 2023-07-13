import React, { useState, useEffect } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, useLazyQuery, gql } from '@apollo/client';
import { TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Chip } from '@material-ui/core';
import { Close } from '@material-ui/icons';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Replace with your server URL
  cache: new InMemoryCache(),
});

const GET_COLUMN_NAMES = gql`
  query GetColumnNames {
    columnNames
  }
`;

const GET_TABLE_DATA = gql`
  query GetTableData($filterColumns: [String!], $filterValues: [String!]) {
    tableData(filterColumns: $filterColumns, filterValues: $filterValues) {
      id
      column1
      column2
      // Add more fields for other columns
    }
  }
`;

const TableComponent = () => {
  const [filterData, setFilterData] = useState([]);
  const [columnNames, setColumnNames] = useState([]);
  const [rowValues, setRowValues] = useState([]);
  const [getTableData, { loading, data: tableData }] = useLazyQuery(GET_TABLE_DATA);

  useEffect(() => {
    getColumnNames();
  }, []);

  const [getColumnNames] = useLazyQuery(GET_COLUMN_NAMES, {
    onCompleted: (data) => {
      setColumnNames(data.columnNames || []);
    },
  });

  const handleApplyFilter = () => {
    getTableData({
      variables: {
        filterColumns: filterData.map((filter) => filter.column),
        filterValues: filterData.map((filter) => filter.value),
      },
    });
  };

  const handleDeleteFilter = (index) => {
    const updatedFilterData = [...filterData];
    updatedFilterData.splice(index, 1);
    setFilterData(updatedFilterData);
    setRowValues([]);
  };

  const handleColumnChange = (value, index) => {
    const updatedFilterData = [...filterData];
    updatedFilterData[index].column = value;
    setFilterData(updatedFilterData);
  };

  const handleValueChange = (value, index) => {
    const updatedFilterData = [...filterData];
    updatedFilterData[index].value = value;
    setFilterData(updatedFilterData);
  };

  const handleClearFilters = () => {
    setFilterData([]);
    setRowValues([]);
    getTableData();
  };

  const fetchRowValues = async (column) => {
    // Make a GraphQL query to fetch row values based on the selected column
    // and update the rowValues state
  };

  const handleColumnSelect = (value, index) => {
    handleColumnChange(value, index);
    setRowValues([]);
    if (value) {
      fetchRowValues(value);
    }
  };

  const handleRowValueChange = (value, index) => {
    const updatedRowValues = [...rowValues];
    updatedRowValues[index] = value;
    setRowValues(updatedRowValues);
  };

  return (
    <div>
      <div>
        {filterData.map((filter, index) => (
          <Chip
            key={index}
            label={`${filter.column}: ${filter.value}`}
            onDelete={() => handleDeleteFilter(index)}
            color="primary"
            style={{ marginRight: '5px' }}
            deleteIcon={<Close />}
          />
        ))}
      </div>
      <TextField
        select
        label="Column Name"
        value=""
        onChange={(e) => {
          const selectedColumn = e.target.value;
          const newFilter = {
            column: selectedColumn,
            value: '',
          };

          setFilterData([...filterData, newFilter]);
          setRowValues([]);
          if (selectedColumn) {
            fetchRowValues(selectedColumn);
          }
        }}
      >
        {columnNames.map((columnName) => (
          <MenuItem key={columnName} value={columnName}>
            {columnName}
          </MenuItem>
        ))}
      </TextField>
      {filterData.map((filter, index) => (
        <div key={index}>
          <TextField
            select
            label={`Row Value (${filter.column})`}
            value={rowValues[index] || ''}
            onChange={(e) => handleRowValueChange(e.target.value, index)}
          >
            {/* Fetch options for the selected column */}
          </TextField>
        </div>
      ))}
      <Button variant="contained" color="primary" onClick={handleApplyFilter}>
        Apply Filter
      </Button>
      <Button variant="contained" color="secondary" onClick={handleClearFilters}>
        Clear Filters
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column 1</TableCell>
            <TableCell>Column 2</TableCell>
            {/* Add more table header cells for each column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2}>Loading...</TableCell>
            </TableRow>
          ) : (
            tableData &&
            tableData.tableData &&
            tableData.tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.column1}</TableCell>
                <TableCell>{row.column2}</TableCell>
                {/* Add more table cells for each column */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <TableComponent />
    </ApolloProvider>
  );
};

export default App;
