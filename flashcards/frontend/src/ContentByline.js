import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

function ContentByline() {
  const [allText, setAllText] = useState(null);
  const [deckTitle, setDeckTitle] = useState(null);
  const [genInfo, setGenInfo] = useState(null);
  const [qAPairs, setQAPairs] = useState(null);

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
    // Add any remaining words to the last chunk
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
  };


  useEffect(() => {
    // Define an async function to call `getContext` and set `allText`
    const fetchContext = async () => {
      try {
        const smth = await view.getContext();
        console.log(smth.extension.content.id);
        const pageId = smth.extension.content.id;
        try {
          const result = await invoke('getAllContentQA', { pageId });
          // Setting all the text as what u get
          setAllText(result.data);
          setDeckTitle(result.title);
          const resDeck = await invoke('getGeneratedDeckInfo', { 
            text: result.data,
            pageId: pageId 
          });
          setGenInfo(resDeck.data);
          // Split the text into chunks of 1500 characters (or adjust based on token limit)
          const chunks = chunkText(result.data, 1500);

          // Generate Q&A for each chunk and accumulate results
          const allQAPairs = [];
          for (const chunk of chunks) {
            try {
              const response = await invoke('generateQA', { text: chunk });
              if (response && response.success) {
                  console.log(response.data);
                  allQAPairs.push(...response.data);
              }
            } catch (error) {
              console.error('Too long :(');
            }
          }
          setQAPairs(JSON.stringify(allQAPairs));
        } catch (error) {
          console.error('Could not reach backend:', error);
        }
      } catch (error) {
        console.error('Error getting context:', error);
      }
    };

    // Call the function to execute on mount
    fetchContext();
  }, []); // Correctly close useEffect dependencies

  return (
    <div>
      <div>{deckTitle ? deckTitle : 'Wherever we go, please wait ...\n'}</div>
      <div>{genInfo ? genInfo : 'Deck info ... yay\n'}</div>
      <div>{qAPairs ? qAPairs : 'Generating flashcards now...\n'}</div>
    </div>
  );
}

export default ContentByline;