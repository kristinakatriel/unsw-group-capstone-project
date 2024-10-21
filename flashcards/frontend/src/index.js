import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import FlashcardContentActionModuleCreate from './flashcardContentActionModuleCreate';
import GlobalPageModule from './globalPageModule';
import '@atlaskit/css-reset';
import { invoke } from '@forge/bridge';
import ContextMenu from './ContextMenu';

const MainComponent = () => {
  const [moduleKey, setModuleKey] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');

  useEffect(() => {
    invoke('getModule')
      .then((data) => {
        setModuleKey(data.moduleKey);
      })
      .catch((err) => {
        console.error('Error fetching module key:', err);
      });
  }, []);

  // useEffect(() => {
  //   invoke('getSelectedText')
  //     .then((selectedText) => {
  //       setHighlightedText(selectedText || 'No text selected');
  //     })
  //     .catch((err) => {
  //       console.error('Error fetching selected text:', err);
  //     });
  // }, []);

  if (moduleKey === 'content-action-menu-flashcards') {
    return <FlashcardContentActionModuleCreate />;
  } else if (moduleKey === 'flashcard-global-page') {
    return <GlobalPageModule />;
  } else if (moduleKey === 'flashcard-context-menu') {
    return <ContextMenu />; 
  }
  return <div>Loading...</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <MainComponent />
  </React.StrictMode>,
  document.getElementById('root')
);
