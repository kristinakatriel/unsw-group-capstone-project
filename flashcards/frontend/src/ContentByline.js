import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

function ContentByline() {
  const [allText, setAllText] = useState(null);
  const [qAPairs, setQAPairs] = useState(null);

  useEffect(() => {
    // Define an async function to call `getContext` and set `allText`
    const fetchContext = async () => {
      try {
        const smth = await view.getContext();
        console.log(smth.extension.content.id);
        const pageId = smth.extension.content.id;
        try {
          const result = await invoke('getAllContentQA', { pageId });
          // console.log(result.data);
          setAllText(result.data); // Assuming result.data is a JSON string
          try {
            const response = await invoke('generateQA', { text:result.data });
            if (response && response.success) {
              setQAPairs(response.data);
            }
          } catch (error) {
            console.error('Could not generate flashcards:', error);
          }
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
      <div>{allText ? allText : 'Wherever we go, please wait ...\n'}</div>
      <div>{qAPairs ? qAPairs : 'Generating flashcards now...\n'}</div>
    </div>
  );
}

export default ContentByline;