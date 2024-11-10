import React, { useState, useEffect } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import CheckIcon from '@atlaskit/icon/glyph/check';
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import ArrowRightIcon from '@atlaskit/icon/core/arrow-right';
import Tooltip from '@mui/material/Tooltip';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import './QuizMode.css';
import { invoke } from '@forge/bridge'

const QuizMode = ({ deck }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [cardStatus, setCardStatus] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [endStatus, setEndStatus] = useState(0);
  const [flashcards, setFlashcards] = useState(deck.cards);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const totalCards = flashcards.length;

  console.log("pre Updated flashcards:", flashcards);

  useEffect(() => {
    console.log("useEffect triggered due to change in:", {
      currentCardIndex,
      flashcards,
      isQuizCompleted,
    });

    // // Cleanup function to track unmount
    // return () => {
    //   console.log("useEffect cleanup for dependencies:", {
    //     currentCardIndex,
    //     flashcards,
    //     isQuizCompleted,
    //   });
    // };
  }, [currentCardIndex, flashcards, isQuizCompleted]);

  console.log("pre Updated flashcards:", flashcards);

  useEffect(() => {
    setFlashcards(deck.cards);
  }, [deck.cards]);  // This ensures flashcards are updated when deck.cards changes

  useEffect(() => {

    console.log("USE EFFECT ENACTED IS QUIZ COMPLETED CHANGED:", isQuizCompleted);
    console.log("Deck received:", deck.cards); // Log the deck prop received

    const startQuizSession = async () => {
      try {
        const response = await invoke('startQuizSession', { deckId: deck.id });
        //console.log("response is " + JSON.stringify(response.cards)); // Log the full response object
        if (response.success) {
          setFlashcards(response.cards);

          // Log flashcards as a JSON string
          //console.log("flashcards is " + JSON.stringify(flashcards));

          // Log session details as JSON strings
          // console.log("sessionId is " + JSON.stringify(response.sessionId));
          // console.log("session is " + JSON.stringify(response.session));

          setSessionId(response.sessionId);
          setCurrentCardIndex(response.firstIndex);
        } else {
          // Log the user and error as JSON strings
          //console.log("response.user is " + JSON.stringify(response.user));
          console.error("response.error is " + JSON.stringify(response));
        }

      } catch (error) {
        console.error('response is invalid', error);
      }
    };
    //console.log("Updated flashcards:", flashcards);
    console.log("pre Updated flashcards:", flashcards);
    startQuizSession();
    console.log("pre Updated flashcards:", flashcards);

    //console.log("Updated flashcards:", flashcards);


    if (!isQuizCompleted) {
      console.log("pre Updated flashcards:", flashcards);
      console.log("printing flashcards: inside if isQuizCompleted true", flashcards);
      const timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
      //console.log("Updated flashcards:", flashcards);
      return () => clearInterval(timer);
    }
  }, [isQuizCompleted]);
  console.log("pre Updated flashcards:", flashcards);
  // useEffect(() => {
  //   const endQuizSession = async () => {
  //     try {
  //       await invoke('endQuizSession', { sessionId });
  //       console.log('Quiz session ended and data saved');
  //     } catch (error) {
  //       console.error('Failed to end session:', error);
  //     }
  //     setEndStatus(prevCount => prevCount + 1);
  //   };
  // }, [isQuizCompleted, sessionId]);
  console.log("pre Updated flashcards:", flashcards);
  const openHintModal = () => setIsHintModalOpen(true);
  const closeHintModal = () => setIsHintModalOpen(false);

  console.log("pre Updated flashcards:", flashcards);




  const goToNextCard = async (status) => {

    console.log("Updated flashcards:", flashcards);


    try {

      setIsFlipped(false);
      console.log("pre Updated flashcards:", flashcards);
      const response = await invoke('updateCardStatusQuiz', {
        currentIndex: currentCardIndex,
        status,
        sessionId,
      });


      console.log("responce :", response);


      console.log(status);
      if (response.success) {

        console.log("Updated flashcards:", flashcards);

        if (response.message === 'quiz is finished') {
          setIsQuizCompleted(true);


          console.log("Updated flashcards:", flashcards);

          try {
            const endExecution = await invoke('endQuizSession', { sessionId });
            console.log(endExecution)
            console.log("Updated flashcards:", flashcards);

            if (!endExecution.success) {
              console.error(endExecution.error);
            } else {
              console.log("attempt num is: " + endExecution.num_attempt);
              console.log("cards list is " + endExecution.cards);
              console.log("session is: " + endExecution.session);
              console.log("Quiz session successfully ended and stored.");
              setHintCount(endExecution.countHint);
              setSkipCount(endExecution.countSkip);
              setCorrectCount(endExecution.countCorrect);
              setIncorrectCount(endExecution.countIncorrect);
              console.log(incorrectCount);
              console.log("correct: " + correctCount);
              setEndStatus(1);
            }
          } catch (error) {
            console.error('response is invalid', error);
          }
        } else {
         // setCurrentCardIndex(response.nextIndex);
          setCardStatus(null);


          setCurrentCardIndex((prevIndex) => {
             if (prevIndex < totalCards - 1) {
               return prevIndex + 1;
             } else {
               return 0;
             }
            });
          };

     } else {
       console.error(response.error);
     }
   } catch (error) {
      console.error('response is invalid', error);
    }



    console.log("Updated flashcards:", flashcards);
  };





  console.log("pre Updated flashcards:", flashcards);
  const handleCorrect = () => {
    console.log("Updated flashcards:", flashcards);
    if (!isButtonDisabled) {
      setCardStatus('correct');
      setIsButtonDisabled(true);
      setTimeout(() => {
        goToNextCard('correct');
        setCardStatus(null);
        setIsButtonDisabled(false);
      }, 1000);
    }
  };
  console.log("pre Updated flashcards:", flashcards);

  const handleIncorrect = () => {
    console.log("Updated flashcards:", flashcards);
    if (!isButtonDisabled) {
      setCardStatus('incorrect');
      setIsButtonDisabled(true);
      setTimeout(() => {
        goToNextCard('incorrect');
        setCardStatus(null);
        setIsButtonDisabled(false);
      }, 1000);
      console.log("pre Updated flashcards:", flashcards);
    }
    console.log("pre Updated flashcards:", flashcards);
  };

  const handleSkip = () => {
    console.log("Updated flashcards:", flashcards);
    if (!isButtonDisabled) {
      setCardStatus('skip');
      setIsButtonDisabled(true);
      setTimeout(() => {
        goToNextCard('skip');
        setCardStatus(null);
        setIsButtonDisabled(false);
      }, 1000);
    }
  };

  console.log("pre Updated flashcards:", flashcards);
  const toggleFlip = () => {
    console.log("pre Updated flashcards:", flashcards);
    setIsFlipped((prevFlipped) => !prevFlipped);
  };

  const handleHintClick = (event) => {
    console.log("pre Updated flashcards:", flashcards);
    event.stopPropagation();
    openHintModal();
    goToNextCard('hint');
  };

  const formatTime = (seconds) => {
    console.log("pre Updated flashcards:", flashcards);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  console.log("pre Updated flashcards:", flashcards);

  console.log("pre Updated flashcards:", flashcards);
  console.log("pre Current card index:", currentCardIndex);
  console.log("preCurrent card:", flashcards[currentCardIndex]);
  const currentCard = flashcards[currentCardIndex];
  console.log("pre Updated flashcards:", flashcards);
  console.log("pre Current card index:", currentCardIndex);
  console.log("Current card:", currentCard);


  return (
    <div className='quiz-mode-container'>

      {/* Log flashcards every time the component renders */}
      {console.log("Current Flashcards:", flashcards)}

      {!isQuizCompleted ? (
        <>
          <div className='quiz-mode-title'>
            <h1>Quiz Mode for {deck.title}</h1>
          </div>
          <div className='quiz-mode-information'>
            <h4 className='quiz-mode-timer'>
              Time: {formatTime(elapsedTime)}
            </h4>
            <h4 className='quiz-mode-flashcard-counter'>
              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
              Current Flashcard: {currentCardIndex + 1}/{totalCards}

              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
            </h4>
          </div>
          <div
            className={`quiz-flip-card ${isFlipped ? 'flipped' : ''} ${cardStatus === 'correct' ? 'correct-card' : cardStatus === 'incorrect' ? 'incorrect-card' : ''}`}
            onClick={toggleFlip}
            id="flipCard"
          >
            <div className='quiz-flip-card-inner'>
              <div className='quiz-flip-card-front'>
                {/* Log flashcards every time the component renders */}
                {console.log("Current Flashcards:", flashcards)}
                {currentCard && currentCard.hint && (
                  <Tooltip title="Click to open hint!">
                    <div className='quiz-flip-card-front-hint' onClick={handleHintClick}>
                      <LightbulbIcon />
                    </div>
                  </Tooltip>
                )}
                {/* Log flashcards every time the component renders */}
                {console.log("Current Flashcards:", flashcards)}
                <h1>{currentCard.front}</h1>
                {/* Log flashcards every time the component renders */}
                {console.log("Current Flashcards:", flashcards)}
              </div>
              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
              <div className='quiz-flip-card-back'>
                {/* Log flashcards every time the component renders */}
                {console.log("Current Flashcards:", flashcards)}
                <h1>{currentCard.back}</h1>
                {/* Log flashcards every time the component renders */}
                {console.log("Current Flashcards:", flashcards)}
              </div>
              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
            </div>
            {/* Log flashcards every time the component renders */}
            {console.log("Current Flashcards:", flashcards)}
          </div>

          <div className='quiz-mode-bottom-buttons'>
            {/* Log flashcards every time the component renders */}
            {console.log("Current Flashcards:", flashcards)}
            <Tooltip title="Incorrect">
              <div
                className={`quiz-mode-incorrect-button ${isButtonDisabled ? 'disabled' : ''}`}
                onClick={handleIncorrect}
                style={{ pointerEvents: isButtonDisabled ? 'none' : 'auto', opacity: isButtonDisabled ? 0.5 : 1 }}
              >
                <CrossIcon />
              </div>
            </Tooltip>
            <Tooltip title="Skip Question">
              <div
                className={`quiz-mode-skip-button ${isButtonDisabled ? 'disabled' : ''}`}
                onClick={handleSkip}
                style={{ pointerEvents: isButtonDisabled ? 'none' : 'auto', opacity: isButtonDisabled ? 0.5 : 1 }}
              >
                <ArrowRightIcon />
              </div>
            </Tooltip>
            <Tooltip title="Correct">
              <div
                className={`quiz-mode-correct-button ${isButtonDisabled ? 'disabled' : ''}`}
                onClick={handleCorrect}
                style={{ pointerEvents: isButtonDisabled ? 'none' : 'auto', opacity: isButtonDisabled ? 0.5 : 1 }}
              >
                <CheckIcon />
              </div>
            </Tooltip>
             {/* Log flashcards every time the component renders */}
            {console.log("Current Flashcards:", flashcards)}
          </div>
           {/* Log flashcards every time the component renders */}
           {console.log("Current Flashcards:", flashcards)}
        </>
      ) : (

        <div className='quiz-completed'>
          {/* Log flashcards every time the component renders */}
          {console.log("Current Flashcards:", flashcards)}
          <h1>Quiz completed!!!</h1>
          <p>Completed in {formatTime(elapsedTime)}</p>
          <p>Number correct: {correctCount}</p>
          <p>Number skipped: {skipCount}</p>
          <p>Number of incorrect: {incorrectCount}</p>
          <p>Number that require hint: {hintCount}</p>
        </div>
      )}

      {/* Log flashcards every time the component renders */}
      {console.log("Current Flashcards:", flashcards)}



      <ModalTransition>
        {/* Log flashcards every time the component renders */}
        {console.log("Current Flashcards:", flashcards)}
        {isHintModalOpen && (
          <Modal onClose={closeHintModal}>
            {/* Log flashcards every time the component renders */}
            {console.log("Current Flashcards:", flashcards)}
            <ModalHeader>
              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
              <ModalTitle>Hint</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
              {currentCard && currentCard.hint}
              {/* Log flashcards every time the component renders */}
              {console.log("Current Flashcards:", flashcards)}
            </ModalBody>
            <ModalFooter>
              {/* Log flashcards every time the component renders */}
            {console.log("Current Flashcards:", flashcards)}
              <Button appearance="primary" onClick={closeHintModal}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
        {/* Log flashcards every time the component renders */}
        {console.log("Current Flashcards:", flashcards)}
      </ModalTransition>
    </div>


  );


};

export default QuizMode;