import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import { Alert } from '@mui/material';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import Button, { IconButton } from '@atlaskit/button/new';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import UnlockIcon from '@atlaskit/icon/glyph/unlock';
import LockIcon from '@atlaskit/icon/glyph/lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Field } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import './ContextMenu.css';

const gridStyles = xcss({
  width: '100%',
});

const titleContainerStyles = xcss({
  gridArea: 'title',
});

function ContextMenu() {
  const [text, setText] = useState(''); // For input text to generate flashcards
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [closeError, setCloseError] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedFlashcardIndex, setSavedFlashcardIndex] = useState(null); // Track saved flashcard index
  const [isTextFetched, setIsTextFetched] = useState(false);
  const [front, setFront] = useState([]);
  const [back, setBack] = useState([]);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false); 
  const [locked, setLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  {/************************************* FIRST CALL WHEN MODULE IS LOADED ***************************************/}
  {/************************************* FETCHING SELECTED TEXT ***************************************/}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const context = await view.getContext();
        console.log(context);
        const selectedText = context.extension.selectedText; // Get selected text from context
        console.log("Selected Text:", selectedText); // Log the selected text for verification
        if (selectedText.length > 1500) {
          setShowWarning(true);
        } else {
          setText(selectedText);
          setIsTextFetched(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage('Failed to fetch selected text');
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array to run on mount

  {/********************** SECOND CALL WHEN MODULE IS LOADED, AND SELECTED TEXT HAS BEEN FETCHED *******************/}
  {/************************************* GENERATING THE AI FLASHCARDS ***************************************/}
  useEffect(() => {
    if (isTextFetched) {
      handleGenerateFlashcards();
    }
  }, [isTextFetched]); // Dependency on isTextFetched

  const handleGenerateFlashcards = async () => {
    console.log("Generating Flashcards...");
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await invoke('generateQA', { text:text });
      console.log("Received response from 'generateQA':", response);

      if (response && response.success) {
        setGeneratedFlashcards(response.data);
        setFront(response.data.map(fc => fc.question || ''));
        setBack(response.data.map(fc => fc.answer || ''));
        console.log("Flashcards Generated Successfully:", response.data);
      } else {
        setErrorMessage(response.error);
        console.log("Error Generating Flashcards:", response.error);
      }
    } catch (error) {
      setErrorMessage('Failed to generate Q&A from text');
      console.error("Exception in handleGenerateFlashcards:", error);
    } finally {
      setLoading(false);
      console.log("Finished Flashcard Generation. Loading State:", loading);
    }

  };

  const handleSaveFlashcard = async (flashcard, index) => {
    console.log("Saving Flashcard:", flashcard);
    setErrorMessage('');

    try {
      const response = await invoke('createFlashcard', {
        front: front[index],
        back: back[index],
        hint: hint,
        locked: locked
      });

      console.log("Received response from 'createFlashcard':", response);

      if (response && response.success) {
        setSaveSuccess(true);
        console.log("Flashcard Saved Successfully");
        setSavedFlashcardIndex(index); // Set the index of the flashcard being saved
        setTimeout(() => setSaveSuccess(false), 1000); // Display success message briefly
        // Delay updating `generatedFlashcards` by 1 second
        setTimeout(() => {
          setFront(front.filter((_, i) => i !== index));
          setBack(back.filter((_, i) => i !== index));
          setHint('');
          setLocked(false); 
          setGeneratedFlashcards(generatedFlashcards.filter(fc => fc !== flashcard));
          setSavedFlashcardIndex(null);  
        }, 1000); // Delay of 1 second (1000 ms)
      } else {
        setErrorMessage(response.error);
        console.log("Error Saving Flashcard:", response.error);
      }
    } catch (error) {
      setErrorMessage('Failed to save flashcard');
      console.error("Exception in handleSaveFlashcard:", error);
    }

  };

  console.log('Current Context Menu Data:', generatedFlashcards);

  return (
    <div className='context-menu'>
      <Grid templateAreas={['title close']} xcss={gridStyles}>
        <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
          <FlashOnIcon className="context-menu-flash-icon" />
          <h2>FLASH - AI Flashcard Generator!</h2>
        </Flex>
      </Grid>

      {showWarning ? (
        <Alert severity="warning" className='alert'>
          You must select less than 1500 characters to use this feature. Please try again, or use our other feature "Content Byline" if you want to AI generate flashcards for the entire page.
        </Alert>
      ) : (
        <>
          {generatedFlashcards.length === 0 && saveSuccess && (
            <div className="success-message">
              You have saved all the AI-generated flashcards! Select other text to generate more AI flashcards!
            </div>
          )}
          
          {generatedFlashcards.length > 0 ? (
            <div className="card-wrapper">
              {saveSuccess && (
                <Alert severity="success">New flashcard created successfully!</Alert>
              )}
              <ul className="card-list">
                {generatedFlashcards.map((flashcard, index) => (
                  <li key={index}>
                    <div className="card-link">
                      {/************************************* FLASHCARD FRONT FIELD ***************************************/}
                      <Field id={`flashcard-front-${index}`} name={`flashcard-front-${index}`} label="Flashcard Front">
                        {({ fieldProps }) => (
                          <Textfield
                            className="textfield"
                            {...fieldProps}
                            value={front[index] || ''} 
                            onChange={(e) => {
                                const newFront = [...front];
                                newFront[index] = e.target.value;
                                setFront(newFront);
                            }}
                            placeholder="Type the front of the flashcard here..."
                          />
                        )}
                      </Field>

                      {/************************************* FLASHCARD BACK FIELD ***************************************/}
                      <Field id={`flashcard-back-${index}`} name={`flashcard-back-${index}`} label="Flashcard Back">
                        {({ fieldProps }) => (
                          <Textfield
                            className="textfield"
                            {...fieldProps}
                            value={back[index] || ''}
                            onChange={(e) => {
                                const newBack = [...back];
                                newBack[index] = e.target.value;
                                setBack(newBack);
                            }}
                            placeholder="Type the back of the flashcard here..."
                          />
                        )}
                      </Field>

                      {/************************************* HINT FIELD ***************************************/}
                      <Field id="flashcard-hint" name="flashcard-hint" label={
                        <div onClick={() => setShowHint(!showHint)} className="label-clickable">
                          <span>Hint (Optional)</span>
                          <span className="toggle-icon">
                            {showHint ? <ExpandLessIcon fontSize="small"/> : <ExpandMoreIcon fontSize="small" />}
                          </span>
                        </div>
                      }>
                        {({ fieldProps }) => (
                          <>
                            {showHint && (
                              <Textfield
                                {...fieldProps}
                                value={hint}
                                onChange={(e) => setHint(e.target.value)}
                                placeholder="Type a hint for the flashcard..."
                              />
                            )}
                          </>
                        )}
                      </Field>

                      {/************************************* LOCK/UNLOCKED FIELD ***************************************/}
                      <Field>
                        {() => (
                          <span onClick={() => setLocked(!locked)} style={{ cursor: 'pointer', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                            {locked ? 'This flashcard will be locked' : 'This flashcard will be unlocked'}
                            <span> 
                              {locked ? (
                                <LockIcon label="Locked" />
                              ) : (
                                <UnlockIcon label="Unlocked" />
                              )}
                            </span>
                          </span>
                        )}
                      </Field>

                      <div className="context-menu-button-group">
                        <Button appearance="primary" onClick={() => handleSaveFlashcard(flashcard, index)}>Save Flashcard</Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            loading ? (
              <>
                <h4 className='deck-flashcard-amount'>Flashcards Generated with AI: Loading...</h4>
                <p>Generating Flashcards...</p>
              </>
            ) : null
          )}
        </>
      )}
    </div>
  );
}


export default ContextMenu;
