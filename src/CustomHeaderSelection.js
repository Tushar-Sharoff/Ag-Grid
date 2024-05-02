// CustomHeaderCheckbox.js
import React, { useEffect, useState } from 'react';

const CustomHeaderCheckbox = (props) => {
 const [isChecked, setIsChecked] = useState(false);

 const onCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
    props.onCheckboxChange(event.target.checked);
 };

 useEffect(() => {
    // Listen for changes in the grid's selection state
    const onSelectionChanged = () => {
      const selectedNodes = props.api.getSelectedNodes();
      const allSelected = selectedNodes.length === props.api.getDisplayedRowCount();
      setIsChecked(allSelected);
    };

    props.api.addEventListener('selectionChanged', onSelectionChanged);
    return () => props.api.removeEventListener('selectionChanged', onSelectionChanged);
 }, [props.api]);

 return (
    <div>
      <input type="checkbox" checked={isChecked} onChange={onCheckboxChange} />
      <span>{props.displayName}</span> 
    </div>
 );
};

export default CustomHeaderCheckbox;
