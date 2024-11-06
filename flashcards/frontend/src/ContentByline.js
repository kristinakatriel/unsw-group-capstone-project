import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import './ContentByline.css';

function ContentByline() {
  const [allText, setAllText] = useState(null);
  const [deckTitle, setDeckTitle] = useState(null);
  const [genInfo, setGenInfo] = useState(null);
  const [qAPairs, setQAPairs] = useState([]);

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
      let pageId;
      let siteUrl;
      try {
        const context = await view.getContext();
        pageId = context.extension.content.id;
        siteUrl = context.siteUrl;
      } catch (error) {
        console.error('Error getting context:', error);
        return;
      }

      try {
        const result = await invoke('getAllContentQA', { pageId: pageId, siteUrl: siteUrl });
        setAllText(result.data);
        setDeckTitle(result.title);
        console.log(result.url);

        try {
          const resDeck = await invoke('getGeneratedDeckTitle', { text: result.data });
          console.log("Deck Title Generation Success:", resDeck.success);
          setGenInfo(resDeck.title);
        } catch (error) {
          console.log("Deck title too long to process.");
        }

        const chunks = chunkText(result.data, 1000);
        const allQAPairs = [];

        for (const chunk of chunks) {
          try {
            const response = await invoke('generateQA', { text: chunk });
            if (response && response.success) {
                allQAPairs.push(...response.data);
            }
          } catch (error) {
            console.error('Chunk processing error:', error);
          }
        }
        setQAPairs(allQAPairs);
      } catch (error) {
        console.error('Backend invocation error:', error);
      }
    };

    fetchContext();
  }, []);

  return (
    <div>
      <h2><FlashOnIcon className="context-menu-flash-icon" /> FLASH - AI Flashcard Generator!</h2>
      <div>{deckTitle || 'Loading deck title...'}</div>
      <div>{genInfo || 'Loading deck information...'}</div>
      <div>
        {qAPairs.length > 0
          ? qAPairs.map((qa, index) => <div key={index}> {index}: {qa.question} - {qa.answer}</div>)
          : 'Generating flashcards...'}
      </div>
    </div>
  );
}

export default ContentByline;