import React, { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import './flashcardGlobalModule.css';
import './globalPageModule.js';
import DragNDrop from './components/DragNDrop.jsx';

function CreateFlashcardGlobal( { closeFlashcardModal }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  // const [questionImage, setQuestionImage] = useState(null);
  // const [answerImage, setAnswerImage] = useState(null);



  const handleCloseGlobal = () => {
    console.log('CLOSE BUTTON WAS JUST PRESSED (Function called: handleCloseGlobal)');
    if (typeof closeFlashcardModal === 'function') {
      closeFlashcardModal(); // Call the function passed as a prop
    } else {
      console.error('closeFlashcardModal is not a function:', closeFlashcardModal);
    }
  };


  const handleSaveGlobal = async () => {
    console.log('SAVE BUTTON WAS JUST PRESSED (Function called: handleSaveGlobal)');
    try {
      console.log('Function called: handleSaveGlobal');
      const response = await invoke('createFlashcard', {
        question_text: question,
        question_image: null,
        answer_text: answer,
        answer_image: null,
        hint: hint,
        tags: ['no', 'yes'],
      });

      // getUserEmail();
      //console.log(response.owner);
      console.log('Flashcard saved?:', response);

      setQuestion('');
      setAnswer('');
      setHint('');
      // setQuestionImage(null);
      // setAnswerImage(null);
      console.log('Flashcard saved?:', response.card);
      if (response && response.success) {
          // Pass the new flashcard back to the close function
          closeFlashcardModal(response.card);
      } else {
          console.error('Failed to create flashcard:', response.error);
      }
    } catch (error) {
      console.error('Error invoking createFlashcard:', error);
    }
  };

  // const handleQuestionImageSelected = (files) => {
  //   //console.log('Function called: handleQuestionImageSelected');
  //   if (files.length > 0) {
  //     setQuestionImage(files[0]);
  //   }
  // };

  // const handleAnswerImageSelected = (files) => {
  //   //console.log('Function called: handleAnswerImageSelected');
  //   if (files.length > 0) {
  //     setAnswerImage(files[0]);
  //   }
  // };

  return (
    <div className="global-flashcard-creation">
      <h2 className="flashcard-title">Create New Flashcard</h2>

      <div className="form-group">
        <label htmlFor="question">Question</label>
        <div className="input-drag-container">
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type the question here..."
            className="input-area"
          />
          {/* <DragNDrop onFilesSelected={handleQuestionImageSelected} /> */}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="answer">Answer</label>
        <div className="input-drag-container">
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the answer here..."
            className="input-area"
          />
          {/* <DragNDrop onFilesSelected={handleAnswerImageSelected} /> */}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="hint">Hint (Optional)</label>
        <div className="input-drag-container">
          <textarea
            id="hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Type the hint here..."
            className="input-area"
          />
          {/*<DragNDrop onFilesSelected={(files) => console.log('Files selected:', files)} />*/}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="select">Add to... (Optional)</label>

      </div>

      <div className="button-group">
        <button className="save-button" onClick={handleSaveGlobal}>Save</button>
        <button className="close-button" onClick={handleCloseGlobal}>Close</button>
      </div>
    </div>
  );
}

export default CreateFlashcardGlobal;

