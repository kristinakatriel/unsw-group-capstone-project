import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import '@atlaskit/css-reset'; // Atlassian's CSS reset

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
