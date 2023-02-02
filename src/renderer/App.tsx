import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

import React, { useState, useRef } from 'react'
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { ToggleButton } from 'primereact/togglebutton';
import { Image } from 'primereact/image';
import { Card } from 'primereact/card'

import Papa from "papaparse";
import { FilterMatchMode, FilterOperator } from 'primereact/api';

import llama from "../../assets/icons/llama.png"


// check if path points to an image by checking if it ends with ".png" or ".jpg" or ".jpeg"
function isImagePath(value: string) {
  return value.endsWith(".png") || value.endsWith(".jpg") || value.endsWith(".jpeg");
}

//----- App --------------------------------------------------------------------
export default function App() {

  //----- State declarations --------------------------------------------------
  const [data, setData] = React.useState<any | null>();
  const [dataPath, setDataPath] = React.useState<string>("");

  const [columns, setColumns] =React.useState<any>([]);
  const [columnComponents, setColumnComponents] = React.useState<any>();
  const [rows, setRows] = React.useState<any>();
  const [selectedColumns, setSelectedColumns] = React.useState<any>();
  // Plots
  const [showPlots, setShowPlots] = React.useState<boolean>(true);
  const [plotsizeSliderValue, setPlotsizeSliderValue] = React.useState<number>(20);

  // Filters
  const [filters, setFilters] = React.useState<DataTableFilterMeta>(null);
  const [globalFilterValue, setGlobalFilterValue] = React.useState<any>('');

  const csvFile = useRef(null);


React.useEffect(() => {
  if (data !== null && data !== undefined && data.data !== undefined) {

    const nColumns = data.data[0].length;
    const nRows = data.data.length;

    //----- Header ---------------------------------------------------------------
    const headerArray = new Array(nColumns);
    const isImageArray = new Array(nColumns);
    // const filters_: { [key: string]: any } = {};

    for (let i = 0; i < nColumns; i++) {
      isImageArray[i] = isImagePath(data.data[1][i])

      headerArray[i] = {
        field: `column${i}`, 
        header: data.data[0][i], 
        headerStringLength:data.data[0][i].length, 
        isPlot: isImageArray[i]
      };

      // // Filters: 
      // for (let i = 0; i < nColumns; i++) {
      //   filters_[`column${i}`] = {
      //     operator: FilterOperator.AND,
      //     constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      //   };
      // }
    }

    //----- Data -----------------------------------------------------------------
    const dataArray = new Array(nRows-1); // skip header row

    for (let r = 0; r < nRows-1; r++) {
      dataArray[r] = {}; // create one object for each row
      
      for (let c = 0; c < nColumns; c++) {
        if (isImageArray[c] && showPlots){
        const hsl = 5+0.52*headerArray[c].headerStringLength
        const plotWidth =  hsl+15*plotsizeSliderValue;

        // TODO: better names
        let ndataPath = dataPath.endsWith("/") ? dataPath.slice(0, -1) : dataPath;
        let plotPath = data.data[r+1][c]
        let nplotPath = plotPath.startsWith("/") ? plotPath.slice(0, 1) : plotPath;
    
        let s = ndataPath + "/" + nplotPath

        //dataArray[r][headerArray[c].field] = <img src={s} width={`${plotWidth}em`} title={data.data[r+1][c]} />;
        dataArray[r][headerArray[c].field] = <Image src={s} template={} width={`${plotWidth}em`} preview title={data.data[r+1][c]} downloadable alt={data.data[r+1][c]} />;

        } else {
          dataArray[r][headerArray[c].field] = data.data[r+1][c]
        }
      }
    }

    setColumns(headerArray);
    setRows(dataArray);

    setSelectedColumns(headerArray);
    // setFilters(filters_);
  }
}, [data, showPlots, plotsizeSliderValue])



// Filters
React.useEffect(() => {
  if (columns !== null && columns !== undefined) {
    const filters_: { [key: string]: any } = {};

    for (let i = 0; i < columns.length; i++) {
      filters_[`column${i}`] = {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      };
    }
    setFilters(filters_);
  }
},[data]
)


React.useEffect(() => {
  if(selectedColumns !== null && selectedColumns !== undefined){

    const temp = [...selectedColumns].map((col: any)=> {
      const hsl = 5+0.52*col.headerStringLength;
      const plotWidth = plotsizeSliderValue;

      if (col.isPlot){
        return <Column key={col.field} field={col.field} 
        header={col.header} sortable filter style={{width: `${plotWidth}em`}} />;
      }
  
      return <Column key={col.field} field={col.field} 
      header={col.header} sortable filter style={{width: `${hsl}em`}}/>;
    });

    setColumnComponents(temp);
  }
}, [selectedColumns, plotsizeSliderValue]);


  //---- CSV upload handler ----------------------------------------------------
  const uploadFileHandler = async (event: any) => {

    const csvPath = event.target.files[0].path.substring(0, event.target.files[0].path.lastIndexOf("\\"));

    const dataPath = csvPath.replaceAll("\\", "/"); // for Windows-style paths
    setDataPath(dataPath);

    Papa.parse(event.target.files[0], {
      skipEmptyLines: true,
      complete: function (results) {
        setData(results);
      },
    });
  };


  const onUploadButtonClick = () => {
    csvFile.current.click();
  };


  const uploadFileButton = (
    <Button 
      type="button" icon="pi pi-file" label="Load CSV" className="mr-2" data-pr-tooltip="CSV" onClick={onUploadButtonClick}
    >

    <input
        style={{ display: "none" }}
        accept=".csv"
        ref={csvFile}
        onChange={uploadFileHandler}
        type="file"
      />
    </Button>
  );

  //----- Plot options -------------------------------------------------------
  const plotToggleButton = (
    <ToggleButton checked={showPlots} onChange={(e) => setShowPlots(e.value)} 
      onIcon="pi pi-check" onLabel="Show plots" offLabel= "Plots hidden" offIcon="pi pi-times" 
      className="w-full sm:w-10rem" aria-label="ShowPlotsButton" 
    />
  );

  const  plotSizeSlider = (
    <Slider value={plotsizeSliderValue} onChange={(e: any) => setPlotsizeSliderValue(e.value)} />
  );
  //----------------------------------------------------------------------------

  //---- Filters ---------------------------------------------------------------
  const clearFilters = () => {
    const filters_: { [key: string]: any } = {};
    const nColumns = data.data[0].length;

    for (let i = 0; i < nColumns; i++) {
      filters_[`column${i}`] = {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      };
    }
    setFilters(filters_)
  }

  const clearAllFiltersButton = (
    <Button type="button" icon="pi pi-filter-slash" label="Clear all filters" 
    className="p-button-outlined" onClick={() => clearFilters()} 
    />
  );
  //----------------------------------------------------------------------------


  //----- select which columns to show ------------------------------------------
  // const [selectedColumns, setSelectedColumns] = useState(columns);

  const onColumnToggle = (event: any) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = columns.filter((col: any) => selectedColumns.some((sCol: any) => sCol.field === col.field));
    setSelectedColumns(orderedSelectedColumns);
  }

  // multi select button to select columns
  const columnSelector = (
    <MultiSelect placeholder="Select columns" filter={true} fixedPlaceholder={true} 
    value={selectedColumns} options={columns} optionLabel="header" 
    onChange={onColumnToggle} style={{width:'20em'}}
    />
  );
  


  //----- Header buttons -------------------------------------------------------
  const headerButtons = (
    <div style={{ textAlign:'left', display: "flex"}}> 
    {columnSelector}
      <div style={{ marginLeft: "20px" }}>{clearAllFiltersButton} </div>

      <div style={{ marginLeft: "60px"}}> {plotToggleButton} </div>

      <div style={{ marginLeft: "40px", width: "200px"}}> 
        <div style={{ textAlign:'left', display: "flex", marginBottom: "5px"}}> 
        Plot size:  {plotsizeSliderValue} 
        </div>
        {plotSizeSlider}
      </div>
     
      <div style={{ marginLeft: "150px" }}>{uploadFileButton}</div>
    </div>
  );
 

 
  //----- Build the data table -------------------------------------------------
  return (
      <div>
        {data ? ( // if data is already defined

          <div className="card"  style={{ height: 'calc(100vh - 4vh)' }}>
            
            <DataTable value={rows}  header = {headerButtons} resizableColumns 
            columnResizeMode="expand" showGridlines removableSort scrollable 
            scrollDirection="both" stripedRows scrollHeight="flex" size="small"
            filters = {filters} filterDisplay="menu">
              
            {columnComponents}
      
            </DataTable>
          </div>
        ) : ( // else (data not yet defined)
          
        <div>
        <Card title="Llama Viewer">
          <p className="m-0">
             Llama - Llama Logs All My Analyses
          </p>
        </Card>


        <img src={llama} width="500vh"/>
        <div style={{ marginLeft: "150px" }}> {uploadFileButton}</div>
        </div>

      
        ) 
        }
      </div>
  );
  //----------------------------------------------------------------------------
}                 