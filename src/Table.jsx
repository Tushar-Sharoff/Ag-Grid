import React, { useEffect, useState,useCallback } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css";
import CustomHeaderCheckbox from "./CustomHeaderSelection";
import { ApiClient, DefaultApi } from "@anansi-lineage/anansi-sdk";
import { fetchColData, fetchColInfo,callFetchAllEnumValues} from "./colInfo";


export const Table = () => {

//Required states
 const [init, setInit] = useState(false);
 const [rawColData, setRawColData] = useState();
 const [enumData, setEnumData] = useState(new Map());
 const [gridApi, setGridApi] = useState(null);
 const [gridColumnApi, setGridColumnApi] = useState(null);
 const [sortModel, setSortModel] = useState([]);
 const [filterModel, setFilterModel] = useState([]);
 
 
 
 
 var apiClient = new ApiClient();
 apiClient.basePath = "https://datalineage2.azurewebsites.net";
 apiClient.authentications["JWT"].apiKey = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI3NTM1NWM4MS04NTk4LTRiNTEtYjM3ZC05ZGFhMWFkZDU4NjciLCJuYW1lIjoiVHVzaGFyIFNSIiwiZW1haWxzIjpbInR1c2hhci5zckBzdWtldGEuaW4iXSwidGZwIjoiQjJDXzFfc2lnbnVwX3NpZ25pbiIsIm5vbmNlIjoiMSIsInNjcCI6InJlYWQiLCJhenAiOiJjOTBmZWQyMS1iMzhhLTQ5ZDctODE2Ni05MzBlZTg3ZjFiMmUiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE3MTY1NTk1NzUsImF1ZCI6ImM5MGZlZDIxLWIzOGEtNDlkNy04MTY2LTkzMGVlODdmMWIyZSIsImV4cCI6MTcxNjU2MzE3NSwiaXNzIjoiaHR0cHM6Ly9hbmFuc2lodWIuYjJjbG9naW4uY29tLzhlYzE4OWRmLTdkMTYtNDA2NC1hMDJlLTVmYTYzYjY1MWEzZi92Mi4wLyIsIm5iZiI6MTcxNjU1OTU3NX0.dWDplrdiyG2N9YyCImM2QHfnQMZH5QX-y4Wp0-lAvxm8QqkPW-BIUq2BHzckfp-8U8W2rRlgWfDtXQCcnvvP39vogZAjYDsu-GfeH9FB6VccsIL-zUFENPYdR2sWx1p7iJ3PRZk_V85unxCqUrI9Rl-gyNshLgjyTPfB3rIaH6pkBR7R4FCeHsbj0TTjwC0m5at4QJICB94gwZHVxTxDBCRpr7WIWf_ugwAPrAg_zJjcAnAKxH2HF91Q9v9C_wv1lXRj4T13R9HauiXnhtdZoV_2ixuWCUDdi9bQOKrqeyY6E68bvF-N-e7ero9MwNcX3ypVTLNak4FniQlOHrxi4Q";
 apiClient.authentications["JWT"].apiKeyPrefix = "Bearer";
 const defaultClient = new DefaultApi(apiClient);
 let tableName = "PropertyInfo";
 
 useEffect(() => {
  if (!init) {
    fetchColData(defaultClient, tableName, setRawColData);
    setInit(true);
  }
}, []);
useEffect(() => {
  if (rawColData !== undefined && rawColData !== null) {
    callFetchAllEnumValues(defaultClient, rawColData, setEnumData, enumData);
  }
}, [rawColData]);


//to fetcch filtered data using fetch method with infinite scrolling as well as sorting of filtered data
const fetchFilteredData = async (defaultClient, tableName,startRow,endRow, filterModel,sortModel) => {
  let filterUrl = '';
  if (filterModel && Object.keys(filterModel).length > 0) {

    let limit=endRow-startRow;

    let filterObjects = Object.keys(filterModel);
    let filterValues = Object.values(filterModel);
    let searchStrvale = filterValues.map(filter => filter.filter);
    let searchStr=searchStrvale[searchStrvale.length-1]; console.log("Search String:",searchStr);
    let columnName = filterObjects[filterObjects.length - 1];

    let orderInfoOrderProp =sortModel.length > 0? sortModel[0].colId : null;
    let orderInfoOrderType = sortModel.length > 0? sortModel[0].sort : null;

    console.log("FIF:",filterModel);
    
    
    if(filterValues[0].filterType === 'number'){
      let filterUrl1 = `${apiClient.basePath}/api/catalog/${tableName}?limit=${limit}&skip=${startRow}&orderInfo.orderProp=${orderInfoOrderProp}&orderInfo.orderType=${orderInfoOrderType}`;
      if(filterValues[0].type==='equals'){
        filterUrl = filterUrl1 + `&${columnName}=${searchStr}`;
        console.log("filter:",filterUrl);
      }else if(filterValues[0].type==='greaterThan')
      {
        filterUrl = filterUrl1 + `&${columnName}>${searchStr}`;
      }else if(filterValues[0].type==='lessThan')
      {
        filterUrl = filterUrl1 + `&${columnName}<${searchStr}`;
      }else if(filterValues[0].type==='greaterThanOrEqual')
      {
        filterUrl = filterUrl1 + `&${columnName}>=${searchStr}`;
      }else if(filterValues[0].type==='lessThanOrEqual')
      {
        filterUrl = filterUrl1 + `&${columnName}<=${searchStr}`;
      }else if(filterValues[0].type==='notEqual')
      {
        filterUrl = filterUrl1 + `&${columnName}!=${searchStr}`;
      }else if(filterValues[0].type==='blank')
      {
        filterUrl = filterUrl1 + `&${columnName}=null`;
      }else if(filterValues[0].type==='notBlank')
      {
        filterUrl = filterUrl1;
      }
    }else{
      filterUrl = `${apiClient.basePath}/api/catalog/${tableName}?limit=${limit}&skip=${startRow}&${columnName}=~'(?i).*${searchStr}.*'&orderInfo.orderProp=${orderInfoOrderProp}&orderInfo.orderType=${orderInfoOrderType}`;
    }
    
  }

  try {

    if (filterUrl) {

      console.log(filterUrl);
      const response = await fetch(filterUrl, {
        headers: {
          Authorization: `Bearer ${apiClient.authentications["JWT"].apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json(); 
      console.log("data inside fetchFilteredData:",data); // Convert the response body to JSON
      const totalCount = response.headers.get('x-total-count'); // Get the total count from the headers

      return { data, totalCount }; // Return the data and total count
    } else {
      // Fallback to original implementation if no filterModel is present
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};



 //Fetching data from backend (Sorted data if needed)
 const fetchData = async (defaultClient, tableName, startRow=0, endRow=20, sortModel) => {
 
  return new Promise((resolve, reject) => {
    let callback = function (error, data, response) {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        const totalCount = response.headers['x-total-count'];
        resolve({ data, totalCount });
        console.log("Response was:", response);
      }
    };
    try {        
      
    let orderInfoOrderProp =sortModel.length > 0? sortModel[0].colId : null;//assigns the colId of the selected column for sorting
    let orderInfoOrderType = sortModel.length > 0? sortModel[0].sort : null;//assigns the sorting direction i.e., ascending or descending
      
      defaultClient.getCatalogTablename(
        endRow - startRow,
        startRow,
        tableName,
        {
          optionalFilter:"",
          orderInfoOrderProp: orderInfoOrderProp,
          orderInfoOrderType: orderInfoOrderType,
        },
        callback
      );
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

 

//Performs Infinite Scrolling by fetching data in chunks 
const myDatasource = {
  rowCount: null,
  getRows: function(params) {

    const startRow = params.startRow;
    const endRow = params.endRow;
    const filterModel = params.filterModel;


    // Fetching data with filtering applied if filterModel exists
    if (Object.keys(filterModel).length > 0) {
      fetchFilteredData(defaultClient, tableName,startRow,endRow, filterModel,params.sortModel,params.cellDataType)
      .then(({ data, totalCount }) => {
        let lastRow = -1;
        if (data.length < endRow - startRow) {
          lastRow = startRow + data.length;
        }
        this.rowCount = totalCount;
        console.log(`Fetched ${data.length} rows from ${startRow} to ${lastRow}`);
        params.successCallback(data, lastRow);
      })
       .catch(error => {
          params.failCallback();
        });
    } else {

      // Fetching data without filtering if filterModel is empty
      fetchData(defaultClient, tableName, startRow, endRow, params.sortModel)
       .then(({ data, totalCount }) => {
          let lastRow = -1;
          if (data.length < endRow - startRow) {
            lastRow = startRow + data.length;
          }
          this.rowCount = totalCount;
          console.log(`Fetched ${data.length} rows from ${startRow} to ${lastRow}`);
          params.successCallback(data, lastRow);
        })
       .catch(error => {
          params.failCallback();
        });
    }
  }
};


//Creates a Grid with Infinite Scrolling
 const onGridReady = useCallback(params => {
  setGridApi(params.api);
  setGridColumnApi(params.columnApi);
 }, []);


 
 const onSortChanged = useCallback((params) => {
  // Update the data source with the new sort model
  setSortModel(params.sortModel);
}, []);

const onFilterChanged = useCallback((params) => {
  setFilterModel(params.filterModel);
}, []);


 const gridOptions = {
  rowModelType: 'infinite',
  pagination: false,
  rowSelection:'multiple',
  paginationPageSize: 20,
  cacheBlockSize: 20,
  maxBlocksInCache: 10,
  onGridReady: onGridReady,
  components:{
    customHeaderCheckbox:CustomHeaderCheckbox,
  },
  onSortChanged: onSortChanged,
  onFilterChanged: onFilterChanged, 
  
  
  
};

useEffect(() => {
  if (gridApi) {
    gridApi.setDatasource(myDatasource);
  }
}, [gridApi]);
 




//To fetch Column  information such as Header Names from rawColData and also checkboxes, HeaderCheckboxes and loading spinners
 const modifiedColDefs = rawColData ? fetchColInfo(rawColData, enumData) : [];
 
// modifiedColDefs is your array of column definitions fetched from fetchColInfo
modifiedColDefs.forEach(colDef => {
  colDef.filter = true; // Enable floating filters for each column
});

 if (modifiedColDefs.length > 0) {
    modifiedColDefs[0].checkboxSelection = true;
    modifiedColDefs[0].cellRenderer = props => {
      if (props.value !== undefined) {
        return props.value;
      } else {
        return <img src="/Loading.gif" />;
      }
    };
    modifiedColDefs[0].headerComponentParams = {
      onCheckboxChange: (checked) => {
        if (checked) {
          gridApi.forEachNode((node) => {
            node.selectThisNode(true);
          });
        } else {
          gridApi.forEachNode((node) => {
            node.selectThisNode(false);
          });
        }
      },
      displayName: modifiedColDefs[0].headerName,
    };
    modifiedColDefs[0].headerComponent = 'customHeaderCheckbox';
 }

 
 return (
    <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
      
      <AgGridReact
        gridOptions={gridOptions}
        columnDefs={modifiedColDefs}
      ></AgGridReact>
    </div>
 );
};