import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import SpacePageApp from './SpacePageApp';
import '@atlaskit/css-reset';
import { invoke } from '@forge/bridge';

const MainComponent = () => {
  const [moduleKey, setModuleKey] = useState(null);

  useEffect(() => {
    invoke('getModule')
      .then((data) => {
        setModuleKey(data.moduleKey);
      })
      .catch((err) => {
        console.error('Error fetching module key:', err);
      });
  }, []);

  if (moduleKey === 'content-action-menu-flashcards') {
    return <App />;
  } else if (moduleKey === 'flashcard-space-page') {
    return <SpacePageApp />;
  }

  return <div>Loading...</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <MainComponent />
  </React.StrictMode>,
  document.getElementById('root')
);
