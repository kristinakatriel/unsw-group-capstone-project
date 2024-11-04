import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import { Alert } from '@mui/material';
import { Flex, Grid, xcss } from '@atlaskit/primitives';
import FlashOnIcon from '@mui/icons-material/FlashOn';
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

  {/************************************* FIRST CALL WHEN MODULE IS LOADED ***************************************/}
  {/************************************* FETCHING SELECTED TEXT ***************************************/}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const context = await view.getContext();
        console.log(context);
        const selectedText = context.extension.selectedText; // Get selected text from context
        console.log("Selected Text:", selectedText); // Log the selected text for verification
        setText(selectedText); // Set the selected text to the state
        setIsTextFetched(true)
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
        front: flashcard.question,
        back: flashcard.answer,
        hint: '',  // Optional hint, could be modified to allow user input
      });

      console.log("Received response from 'createFlashcard':", response);

      if (response && response.success) {
        setSaveSuccess(true);
        console.log("Flashcard Saved Successfully");
        setSavedFlashcardIndex(index); // Set the index of the flashcard being saved
        setTimeout(() => setSaveSuccess(false), 1000); // Display success message briefly
        // Delay updating `generatedFlashcards` by 1 second
        setTimeout(() => {
          setGeneratedFlashcards(generatedFlashcards.filter(fc => fc !== flashcard));
          setSavedFlashcardIndex(null); // Reset the saved flashcard index
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

      {generatedFlashcards.length > 0 ? (
        <>
          <h4 className='deck-flashcard-amount'>Flashcards Generated with AI: {generatedFlashcards.length || 0}</h4>
          {saveSuccess && (
            <Alert severity="success">New flashcard created successfully!</Alert>
          )}
          <div className="card-wrapper">
            <ul className="card-list">
              {generatedFlashcards.map((flashcard, index) => (
                <li key={index}>
                  <div className="card-link">
                    <h4 className="card-front">{flashcard.question || 'No front available'}</h4>
                    <h4 className="card-back">{flashcard.answer || 'No back available'}</h4>

                    <div className="card-button">
                      <button onClick={() => handleSaveFlashcard(flashcard, index)}>Save Flashcard</button>
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>

      ) : (
        <>
          <h4 className='deck-flashcard-amount'>Flashcards Generated with AI: Loading...</h4>
          <p>Generating Flashcards...</p>
        </>
      )}
    </div>

  );
}


export default ContextMenu;
