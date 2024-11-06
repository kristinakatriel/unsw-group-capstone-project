import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import './ContentByline.css';

function ContentByline() {
  const [allText, setAllText] = useState(null);
  const [deckTitle, setDeckTitle] = useState(null);
  const [deckInfo, setDeckInfo] = useState(null);
  const [qAPairs, setQAPairs] = useState([]);
  const [deckGenerated, setDeckGenerated] = useState(false);
  const [deckGen, setDeckGen] = useState(null);

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
        setDeckInfo(`Fetched from ${result.url}`);
      } catch (error) {
        console.error('Error fetching page content:', error);
      }
    };

    fetchContext();
  }, []);

  const generateDeckTitle = async () => {
    if (allText) {
      try {
        const resDeck = await invoke('getGeneratedDeckTitle', { text: allText });
        setDeckTitle(resDeck.title);
        setDeckGenerated(true);
      } catch (error) {
        console.log('Deck title too long to process.');
      }
    }
  };

  const generateFlashcards = async () => {
    if (allText) {
        const chunks = chunkText(allText, 1000);
        const allQAPairs = [];

        // Generate Q&A pairs
        for (const chunk of chunks) {
            try {
                const response = await invoke('generateQA', { text: chunk });
                if (response && response.success) {
                    allQAPairs.push(...response.data);
                }
            } catch (error) {
                console.error('Error generating flashcards:', error);
            }
        }

        setQAPairs(allQAPairs);

        // Create the deck
        try {
            const deckResponse = await invoke('createDeck', {
                title: deckTitle,
                description: deckInfo,
                flashcards: [],
                locked: true // by default for now
            });

            if (deckResponse && deckResponse.success) {
                const createdDeck = deckResponse.id;

                // Step 2: Add generated flashcards to the created deck
                const addResult = await invoke('addGeneratedFlashcards', {
                  deckId: createdDeck,
                  qAPairs: allQAPairs
                });
                if (addResult.success) {
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
};

  return (
    <div>
      <h2><FlashOnIcon className="context-menu-flash-icon" /> FLASH - AI Flashcard Generator!</h2>
      <div>{deckTitle || 'Do u want to use this Confluence Page\'s title as the Deck Title or use an AI generated title (REWORD)'}</div>
      <div>{deckTitle || 'Click to generate deck title.'}</div>
      <button onClick={generateDeckTitle} disabled={deckGenerated}>
        Generate Deck Title
      </button>
      <button onClick={generateFlashcards}>
        Create Deck With Flashcards
      </button>
      <div>
        {qAPairs.length > 0
          ? qAPairs.map((qa, index) => (
              <div key={index}> {index + 1}: {qa.question} - {qa.answer}</div>
            ))
          : 'Flashcards will appear here after generation.'}
      </div>
    </div>
  );
}

export default ContentByline;