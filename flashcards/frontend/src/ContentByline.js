import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { Field } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import { Flex, xcss } from '@atlaskit/primitives';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import './ContentByline.css';

const titleContainerStyles = xcss({
  gridArea: 'title',
});

function ContentByline() {
  const [allText, setAllText] = useState(null);
  const [deckTitle, setDeckTitle] = useState(null);
  const [pageTitle, setPageTitle] = useState(null);
  const [aiTitle, setAiTitle] = useState(null);
  const [deckInfo, setDeckInfo] = useState(null);
  const [qAPairs, setQAPairs] = useState([]);
  const [deckGenerated, setDeckGenerated] = useState(false);
  const [deckGenerating, setDeckGenerating] = useState(false);
  const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);
  const [flashcardsGenerating, setFlashcardsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deckGen, setDeckGen] = useState(null);
  const [savingDeck, setSavingDeck] = useState(false);
  const [deckSaved, setDeckSaved] = useState(false);

  const chunkText = (text, chunkSize) => {
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = [];

    for (let word of words) {
      currentChunk.push(word);
      if (currentChunk.join(' ').length >= chunkSize) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }
    return chunks;
  };

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const context = await view.getContext();
        const pageId = context.extension.content.id;
        const siteUrl = context.siteUrl;
        
        const result = await invoke('getAllContent', { pageId, siteUrl });
        setAllText(result.data);
        setDeckTitle(result.title);
        setPageTitle(result.title);
        setDeckInfo(`Fetched from ${result.url}`);
      } catch (error) {
        console.error('Error fetching page content:', error);
      }
    };

    fetchContext();
  }, []);

  const generateDeckTitle = async () => {
    setDeckGenerating(true); 
    if (allText) {
      try {
        const resDeck = await invoke('getGeneratedDeckTitle', { text: allText });
        setDeckTitle(resDeck.title);
        setAiTitle(resDeck.title);
        setDeckGenerating(false);
        setDeckGenerated(true);
      } catch (error) {
        console.log('Deck title too long to process.');
      }
    }
  };

  const generateFlashcards = async () => {
    setFlashcardsGenerating(true);
    if (allText) {
      const chunks = chunkText(allText, 500); // 500 for now during testing
      const allQAPairs = [];  // Initialize an array to hold all flashcards
  
      // Generate Q&A pairs
      for (const chunk of chunks) {
        try {
          const response = await invoke('generateQA', { text: chunk });
          if (response && response.success) {
            const newQAPairs = response.data;
            
            setQAPairs((prevQAPairs) => [...prevQAPairs, ...newQAPairs]);

            allQAPairs.push(...newQAPairs);
            console.log(response.data);
          }
        } catch (error) {
          console.error('Error generating flashcards:', error);
        }
      }
  
      // Update the state
      setFlashcardsGenerating(false);
      setFlashcardsGenerated(true);
    }
  };

  async function createAndPopulateDeck(deckTitle, deckInfo, allQAPairs) {
    try {
      // Create the deck
      const deckResponse = await invoke('createDeck', {
        title: deckTitle,
        description: deckInfo,
        flashcards: [],
        locked: true // by default for now
      });

      if (deckResponse && deckResponse.success) {
        const createdDeck = deckResponse.id;

        // Add generated flashcards to the created deck
        const addResult = await invoke('addGeneratedFlashcards', {
          deckId: createdDeck,
          qAPairs: allQAPairs
        });

        if (addResult.success) {
          setSaveSuccess(true);
          setSavingDeck(false);
          setDeckSaved(true);
          console.log("Flashcards added to deck successfully:", addResult.createdDeck);
        } else {
          console.error("Error adding flashcards to deck:", addResult.error);
        }
      } else {
        console.error("Error creating deck:", deckResponse.error);
      }
    } catch (error) {
      console.error("Error in deck creation or flashcard addition:", error);
    }
  }

  const handleSave = async () => {
    if (!deckTitle || !deckInfo || !qAPairs) {
      console.warn("Please fill in all required fields before saving.");
      return;
    }
    setSavingDeck(true);
    await createAndPopulateDeck(deckTitle, deckInfo, qAPairs);
  };

  const undoChanges = () => {
    setDeckTitle(pageTitle);
  };

  const redoChanges = () => {
    setDeckTitle(aiTitle);
  };

  const handleCheckboxChange = (index) => {
    console.log('Checkbox pressed!', index)
  };

  return (
    <div className="ai-deck-creation">
      <Flex xcss={titleContainerStyles} justifyContent="start" alignItems="center">
        <FlashOnIcon className="content-byline-flash-icon" />
        <h2>FLASH - AI Deck Generator!</h2>
      </Flex>

      {saveSuccess && <Alert severity="success" className='alert'> New deck created successfully! </Alert>}

      {/************************************* DECK TITLE/UNDO/REDO FIELD ***************************************/}
      <Field id="deckTitle" name="deckTitle" label={
        deckGenerated ? (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span>Deck Title </span>
            <UndoIcon 
              onClick={undoChanges} 
              fontSize="small" 
              style={{ cursor: 'pointer', marginLeft: '10px' }} 
            />
            <RedoIcon 
              onClick={redoChanges} 
              fontSize="small" 
              style={{ cursor: 'pointer', marginLeft: '10px' }} 
            />
          </span>
        ) : 'Deck Title'
      }>
        {({ fieldProps }) => (
          <Textfield 
            {...fieldProps} 
            value={deckTitle} 
            onChange={(e) => setDeckTitle(e.target.value)} 
            placeholder="Type the deck title here..." 
          />
        )}
      </Field>

      {/* ************************** DECK TITLE AI GENERATE FIELD ******************************/}
      {(!deckSaved && (deckGenerating || !deckGenerated)) && (
        <Field> 
          {() => (
            <span
              onClick={deckGenerating ? null : generateDeckTitle}
              style={{ cursor: 'pointer', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}
            >
              {deckGenerating ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />
                </Box>
              ) : (
                <>
                  {'AI generate a new deck title!'}
                  <span><AutoAwesomeIcon className="content-byline-ai-icon" fontSize="small" /></span>
                </>
              )}
            </span>
          )}
        </Field>
      )}

      {/************************************* DECK FLASHCARDS FIELD ***************************************/}
      <Field id="deckFlashcards" name="deckFlashcards" label="Deck Flashcards">
        {() => (
          <div>
            <div className="ai-flashcards-select-scroll">
              {qAPairs.length > 0 ? (
                qAPairs.map((qa, index) => (
                  <div key={index} className="ai-flashcards-select-scroll-item">
                    <input
                      type="checkbox"
                      id={`qa-${index}`}
                      checked={true}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <label htmlFor={`qa-${index}`}>
                      {index + 1}: {qa.question} - {qa.answer}
                    </label>
                  </div>
                ))
              ) : (
                <p>Flashcards will appear here after generation.</p>
              )}
            </div>
          </div>
        )}
      </Field>

      {/***************************** DECK FLASHCARDS AI GENERATE FIELD *******************************/}
      {(flashcardsGenerating || !flashcardsGenerated) && (
        <Field>
          {() => (
            <span
              onClick={flashcardsGenerating || flashcardsGenerated ? null : generateFlashcards}
              style={{ cursor: 'pointer', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}
            >
              {flashcardsGenerating ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress/>
                </Box>
              ) : (
                <>
                  {'AI generate flashcards for this deck!'}
                  <span><AutoAwesomeIcon className="content-byline-ai-icon" fontSize="small" /></span>
                </>
              )}
            </span>
          )}
        </Field>
      )}

      {/* ***************************** SAVE DECK FIELD ****************************** */}
      {flashcardsGenerated && !deckSaved && (
        <div className="content-byline-button-group">
          <button 
            className="content-byline-button" 
            onClick={() => handleSave()}
            disabled={savingDeck}
          >
            {savingDeck ? 'Saving Deck...' : 'Save Deck'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ContentByline;