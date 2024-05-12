import React, { useEffect, useState,useCallback } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css";
import CustomHeaderCheckbox from "./CustomHeaderSelection";
import { ApiClient, DefaultApi } from "@anansi-lineage/anansi-sdk";
import { fetchColData, fetchColInfo, callFetchAllEnumValues, fetchPropInfo} from "./colInfo";


export const Table = () => {
 const [init, setInit] = useState(false);
 const [rawColData, setRawColData] = useState();
 const [enumData, setEnumData] = useState(new Map());
 const [gridApi, setGridApi] = useState(null);
 const [gridColumnApi, setGridColumnApi] = useState(null);
 const [propInfo, setPropInfo] = useState([]);
 const [sortModel, setSortModel] = useState([]);
 
 
 
 
 var apiClient = new ApiClient();
 apiClient.basePath = "https://datalineage2.azurewebsites.net";
 apiClient.authentications["JWT"].apiKey = "API_TOKEN";
 apiClient.authentications["JWT"].apiKeyPrefix = "Bearer";
 const defaultClient = new DefaultApi(apiClient);
 let tableName = "Bank1";
 
 useEffect(() => {
  if (!init) {
    fetchColData(defaultClient, tableName, setRawColData);
    setInit(true);
  }
}, []);
useEffect(() => {
  if (rawColData !== undefined && rawColData !== null) {
    callFetchAllEnumValues(defaultClient, rawColData, setEnumData, enumData);
    fetchPropInfo(rawColData).then(setPropInfo); 
  }
}, [rawColData]);




 //Fetching data from backend
 const fetchData = async (defaultClient, tableName, startRow=0, endRow=20, sortModel,propInfo) => {
 
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
    console.log("propInfo Inside fetchData:",propInfo);
    let orderInfoOrderProp = null;
    let orderInfoOrderType = null;
      
    // Check if sortModel has items and find matching DisplayName in propInfo
    if (sortModel.length > 0) {
      const displayNameToMatch = sortModel[0].colId;
      const matchingPropInfo = propInfo.find(prop => prop.DisplayName === displayNameToMatch);

      if (matchingPropInfo) {
        orderInfoOrderProp = matchingPropInfo.PropertyName;
      }
      orderInfoOrderType = sortModel[0].sort;
    }
      
      
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

 

//Performs Infinite Scrolling
const getMyDataSource = (propInfo) => ({
  rowCount: null,
  getRows: function (params) {
    const startRow = params.startRow;
    const endRow = params.endRow;
    const sortModel=params.sortModel;
    
    console.log("PP:",propInfo);
    fetchData(defaultClient, tableName, startRow, endRow,sortModel, propInfo).then(({ data, totalCount }) => {
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
});

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
    gridApi.setDatasource(getMyDataSource(propInfo));
  }
}, [propInfo, gridApi]);
 




//To fetch Column  information such as Header Names from rawColData and also checkboxes and loading spinners
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
