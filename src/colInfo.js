function handleError(error) {
  console.error(error);
}

function handleSuccess(response) {
  console.log("Response was:", response);
  //console.log("API called successfully. Returned data: ", data);
}

const fetchEnumValues = async (enumName, callback, defaultClient) => {
  async function fetchRawEnumData(enumName, callback, defaultClient) {
    let temp = "enumName:'" + enumName + "'";
    try {
      defaultClient.getCatalogTablename(
        500,
        0,
        "EnumValues",
        { optionalFilter: temp },
        callback
      );
    } catch (err) {
      handleError(err);
    }
  }
  await fetchRawEnumData(enumName, callback, defaultClient);
};

async function fetchAllEnumValues(defaultClient, rawColData, setEnumData, enumData) {

  const callbackEnumValues = function (error, data, response) {
    if (error) {
      handleError(error);
    } else {
      if (data.length !== 0) {
        let enumValues = data.map((e) => {
          return e["Enum Value"];
        })
        let enumName = data[0]["Enum Name"];
        setEnumData(p => (new Map(p)).set(enumName, enumValues));
        handleSuccess(response);
      } else {
        handleError("Empty DropDown Values!");
      }
    };
  }

  let enumValues = rawColData
    .filter((PropertyInfo) => {
      return PropertyInfo["Data Type"] === "Enum";
    }).map((PropertyInfo) => { return PropertyInfo["Property Name"] });

  if (enumValues.length !== 0) {
    await Promise.all(enumValues.map(async (enumValue) => {
      await fetchEnumValues(enumValue, callbackEnumValues, defaultClient);
    }))

  }
}


function getDataType(dataType) {
  if (dataType === "Boolean") {
    return "checkbox";
  } else if (dataType === "Integer" || dataType === "Float") {
    return "numeric";
  } else if (dataType === "Enum") {
    return "dropdown";
  } else {
    return "text";
  }
}

function isReadOnly(propertyType) {
  if (
    propertyType === "IS_IDENTITY" ||
    propertyType === "IS_SYSTEM_GENERATED"
  ) {
    return true;
  } else {
    return false;
  }
}


function mapPropertyInfoToColInfo(enumData) {
  return function (PropertyInfo) {
    if (PropertyInfo["Data Type"] !== "Enum") {
      return {
        propName: PropertyInfo["Property Name"],
        headerInfo:
        {
          headerName: PropertyInfo["Display Name"],
          field: PropertyInfo["Display Name"],
          editable: !isReadOnly(PropertyInfo["Property Type"]),
        }
      };
    } else {
      return {
        propName: PropertyInfo["Property Name"],
        headerInfo:
        {
          headerName: PropertyInfo["Display Name"],
          field: PropertyInfo["Display Name"],
          editable: !isReadOnly(PropertyInfo["Property Type"]),
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: enumData.get(PropertyInfo["Property Name"])
          }
        }
      };
    }
  };
}


 
 


export function fetchColInfo(rawColData, enumData) {
  if (rawColData !== undefined && rawColData !== null) {
    console.log("Rawdata:",rawColData);
    return rawColData.map(mapPropertyInfoToColInfo(enumData));
    
  }
}

export async function callFetchAllEnumValues(defaultClient, rawColData, setEnumData, enumData) {
  await fetchAllEnumValues(defaultClient, rawColData, setEnumData, enumData);
}

export async function fetchColData(
  defaultClient,
  tableName,
  setRawColData
) {
  async function fetchRawColData(defaultClient, tableName, setRawColData) {
    const callbackPropertyInfo = function (error, data, response) {
      if (error) {
        console.error(error);
      } else {
        //Sort by display order so we dont have to do this again!
        data.sort((a, b) => a["Display Order"] - b[["Display Order"]]);
        setRawColData(data);
        console.log("Data:",data);
        handleSuccess(response);
      }
    };

    let temp = "nodeLabel:'" + tableName + "'";
    try {
      defaultClient.getCatalogTablename(
        1000,
        0,
        "PropertyInfo",
        { optionalFilter: temp },
        callbackPropertyInfo
      );
    } catch (err) {
      console.log(err);
    }
  }

  await fetchRawColData(defaultClient, tableName, setRawColData);
}
