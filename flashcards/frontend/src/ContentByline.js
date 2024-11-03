import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

function ContentByline() {
  const [data, setData] = useState(null);
  const [allText, setAllText] = useState(null);

  useEffect(() => {
    // Define an async function to call `getContext` and set `allText`
    const fetchContext = async () => {
      try {
        const smth = await view.getContext();
        console.log(smth.extension.content.id);
        const pageId = smth.extension.content.id
        try {
          const result = invoke('getAllContent', { pageId });
          console.log(result);
        } catch (error) {
          console.error('could not get to backend', error);
        }
        setAllText('I reached here!');
      } catch (error) {
        console.error('Error getting context:', error);
      }
    };

    // Call the function to execute on mount
    fetchContext();

    // Invoke function for 'helloWorld'
    invoke('helloWorld', { example: 'my-invoke-variable' })
      .then(setData)
      .catch(error => console.error('Error invoking helloWorld:', error));
  }, []);

  return (
    <div>
      {data ? data : 'Loading...'}
      <div>{allText ? allText : 'Wherever we go, please wait ...'}</div>
    </div>
  );
}

export default ContentByline;