import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './ContextMenu.css';

function ContextMenu() {
  const [data, setData] = useState(null); // Data from invoke method

  useEffect(() => {
    // Fetch data for context menu
    console.log('Fetching data for context menu...');
    invoke('getText', { example: 'context-menu-variable' })
      .then((response) => {
        console.log('Data fetched for context menu:', response);
        setData(response); // Set the fetched data
      })
      .catch((error) => {
        console.error('Error fetching data for context menu:', error); // Handle error
      });
  }, []);

  console.log('Current context menu data:', data);

  return (
    <div className="context-menu">
      <h2>Context Menu</h2>
      <div className="menu-content">
        <p>{data ? data : 'Loading...'}</p> {/* Conditionally render the data */}
      </div>
    </div>
  );
}

export default ContextMenu;