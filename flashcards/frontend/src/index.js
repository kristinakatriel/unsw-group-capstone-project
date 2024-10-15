import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import FlashcardContentActionModuleCreate from './flashcardContentActionModuleCreate';
import GlobalPageModule from './globalPageModule';
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
    return <FlashcardContentActionModuleCreate />;
  } else if (moduleKey === 'flashcard-global-page') {
    return <GlobalPageModule />;
  }
  return <div>Loading...</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <MainComponent />
  </React.StrictMode>,
  document.getElementById('root')
);
