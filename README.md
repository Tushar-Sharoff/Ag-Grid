# Getting Started with React and AG-Grid Community

This guide provides instructions on installing React and setting up AG-Grid Community in your project.

## Prerequisites

Ensure you have Node.js installed on your machine. You can download it from [Node.js official website](https://nodejs.org).

## Step 1: Install React

First, you need to create a new React app. Open your terminal and run the following command:

### `npm install create-react-app <app_name>`
### `cd <app_name>`

Replace `<app_name>` with your desired project name.

## Step 2: Install AG-Grid Community

Navigate to your project directory and install AG-Grid Community using npm:

### `npm install --save ag-grid-react ag-grid-community` 

This command installs both the AG-Grid Community library and its React bindings.

## Step 3: Import AG-Grid Styles

To ensure AG-Grid displays correctly, you need to import the necessary CSS files. Add these lines to your main component file (usually `App.js`):

# `import "ag-grid-community/styles/ag-grid.css";`
# `import "ag-grid-community/styles/ag-theme-quartz.css";`

There are themes other than `quartz`. For more information, you can checkout https://www.ag-grid.com/javascript-data-grid/themes/

The `ag-theme-quartz.css` is one of the themes provided by AG-Grid. You can choose another theme based on your preference.

## Step 4: Use AG-Grid in Your React Component

Now, you can start using AG-Grid in your React components. Here's a simple example of how to render a grid:

`import React, { useState } from 'react'; import { AgGridReact } from 'ag-grid-react';

function App() { const [rowData, setRowData] = useState([ { make: "Tesla", model: "Model S", price: 70000 }, { make: "Ford", model: "Mustang", price: 35000 }, { make: "Audi", model: "R8", price: 115000 } ]);

const columnDefs = [ { headerName: "Make", field: "make" }, { headerName: "Model", field: "model" }, { headerName: "Price", field: "price" } ];

return ( <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}> <AgGridReact rowData={rowData} columnDefs={columnDefs} /> </div> ); }

export default App;`

This example sets up a basic grid with three columns ("Make", "Model", "Price") and three rows of car data.

## Running Your Application

Run your React application using the following command:

### `npm start`


Visit `http://localhost:3000` in your web browser to view your AG-Grid in action.

## Next Steps

- Explore more about AG-Grid features and customization options in the [official documentation](https://www.ag-grid.com/react-data-grid/).
- Check out the [AG-Grid React API Reference](https://www.ag-grid.com/react-data-grid/component-api/) for detailed information on available methods and properties.







