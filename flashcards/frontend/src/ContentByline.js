import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

function ContentByline() {
  const [allText, setAllText] = useState(null);

  useEffect(() => {
    // Define an async function to call `getContext` and set `allText`
    const fetchContext = async () => {
      try {
        const smth = await view.getContext();
        console.log(smth.extension.content.id);
        const pageId = smth.extension.content.id;
        try {
          const result = await invoke('getAllContentQA', { pageId });
          console.log(JSON.parse(result.data));
          setAllText(JSON.parse(result.data)); // Assuming result.data is a JSON string
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
      <div>{allText ? allText : 'Wherever we go, please wait ...'}</div>
    </div>
  );
}

export default ContentByline;