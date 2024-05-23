import React, { useEffect, useState,useCallback } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css";
import CustomHeaderCheckbox from "./CustomHeaderSelection";
import { ApiClient, DefaultApi } from "@anansi-lineage/anansi-sdk";
import { fetchColData, fetchColInfo, callFetchAllEnumValues} from "./colInfo";


export const Table = () => {

//Required states
 const [init, setInit] = useState(false);
 const [rawColData, setRawColData] = useState();
 const [enumData, setEnumData] = useState(new Map());
 const [gridApi, setGridApi] = useState(null);
 const [gridColumnApi, setGridColumnApi] = useState(null);
 const [sortModel, setSortModel] = useState([]);
 
 
 
 
 var apiClient = new ApiClient();
 apiClient.basePath = "https://datalineage2.azurewebsites.net";
 apiClient.authentications["JWT"].apiKey = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiI3NTM1NWM4MS04NTk4LTRiNTEtYjM3ZC05ZGFhMWFkZDU4NjciLCJuYW1lIjoiVHVzaGFyIFNSIiwiZW1haWxzIjpbInR1c2hhci5zckBzdWtldGEuaW4iXSwidGZwIjoiQjJDXzFfc2lnbnVwX3NpZ25pbiIsIm5vbmNlIjoiMSIsInNjcCI6InJlYWQiLCJhenAiOiJjOTBmZWQyMS1iMzhhLTQ5ZDctODE2Ni05MzBlZTg3ZjFiMmUiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE3MTU3NjE3OTMsImF1ZCI6ImM5MGZlZDIxLWIzOGEtNDlkNy04MTY2LTkzMGVlODdmMWIyZSIsImV4cCI6MTcxNTc2NTM5MywiaXNzIjoiaHR0cHM6Ly9hbmFuc2lodWIuYjJjbG9naW4uY29tLzhlYzE4OWRmLTdkMTYtNDA2NC1hMDJlLTVmYTYzYjY1MWEzZi92Mi4wLyIsIm5iZiI6MTcxNTc2MTc5M30.qGe_6lgJR_gfl9bqkwz-dmEmIu5_ne83dgkf3jfAyM8XjrB23s9qF6i5a7U1k_cRsVGZy8wxlYPvT76gpVe9Q_t9z6SVeoxVDJPiMVE6can7pAkvjgtMtFGYZ0GKXlFc4lxEms0etdqLwZzyEi5tNdENZBHOLNurj8SwVNw2JDlvSEsai9X1ySSPvvJ6g4krZhi5x3K2KCq1AlbqVOvje7TpmExf_vbNWVHo1ExMK1JorozECCppTAOOL8oMbGY5xWqXcXS79e4HDXUbeTXOQH0aF73aXjGH-mCJ6iFPGKulsfUY4WIh1N2wzAAB4SZoPhIow8vPZy-8pHBNkiFK-g";
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
          optionalFilter: "",
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
    fetchData(defaultClient, tableName, startRow, endRow,params.sortModel).then(({ data, totalCount }) => {
      let lastRow = -1;
      if (data.length < endRow - startRow) {
        lastRow = startRow + data.length;
      }
      this.rowCount = totalCount;
      console.log(`Fetched ${data.length} rows from ${startRow} to ${lastRow}`);
      params.successCallback(data, lastRow);
    }).catch(error => {
      params.failCallback();
    });
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
  
  
};

useEffect(() => {
  if (gridApi) {
    gridApi.setDatasource(myDatasource);
  }
}, [gridApi]);
 




//To fetch Column  information such as Header Names from rawColData and also checkboxes, HeaderCheckboxes and loading spinners
 const modifiedColDefs = rawColData ? fetchColInfo(rawColData, enumData) : [];
 

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