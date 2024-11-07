import React, { useState, useEffect } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import CheckIcon from '@atlaskit/icon/glyph/check';
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import ArrowRightIcon from '@atlaskit/icon/core/arrow-right';
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
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [endStatus, setEndStatus] = useState(0);

  const flashcards = deck.cards;
  const totalCards = flashcards.length;

  useEffect(() => {
    const startQuizSession = async () => {
      try {
        const response = await invoke('startQuizSession', { deckId: deck.id });
        if (response.success) {
          console.log(response.sessionId);
          console.log(response.session);
          setSessionId(response.sessionId);
          setCurrentCardIndex(response.firstIndex);
        } else {
          console.log(response.user)
          console.error(response.error);
        }
      } catch (error) {
        console.error('response is invalid');
      }
    };
    startQuizSession();

    if (!isQuizCompleted) {
      const timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizCompleted]);

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

  const openHintModal = () => setIsHintModalOpen(true);
  const closeHintModal = () => setIsHintModalOpen(false);

  const goToNextCard = async (status) => {
    try {
      const response = await invoke('updateCardStatusQuiz', {
        currentIndex: currentCardIndex,
        status,
        sessionId,
      });
      if (response.success) {
        if (response.message === 'quiz is finished') {
          setIsQuizCompleted(true);
          try {
            const endExecution = await invoke('endQuizSession', { sessionId });
            if (!endExecution.success) {
              console.error(endExecution.error);
            } else {
              console.log("Quiz session successfully ended and stored.");
              setEndStatus(1);
            }
          } catch (error) {
            console.error('response is invalid');
          }
        } else {
          setCurrentCardIndex(response.nextIndex);
          setIsFlipped(false);
          setCardStatus(null);
        }
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('response is invalid');
    }
  };

  const handleCorrect = () => {
    setCardStatus('correct');
    setCorrectAnswersCount(prevCount => prevCount + 1)
    setTimeout(() => {
      goToNextCard('correct');
      setCardStatus(null); 
    }, 1000);
  };

  const handleIncorrect = () => {
    setCardStatus('incorrect');
    setIncorrectAnswersCount(prevCount => prevCount + 1)
    setTimeout(() => {
      goToNextCard('incorrect');
      setCardStatus(null); 
    }, 1000);
  };

  const toggleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped);
  };

  const handleHintClick = (event) => {
    event.stopPropagation();
    setHintCount(prevCount => prevCount + 1)
    openHintModal();
    goToNextCard('hint');
  };

  const handleSkip = () => {
    setCardStatus('skip');
    setSkipCount(prevCount => prevCount + 1)
    setTimeout(() => {
      goToNextCard('skip');
      setCardStatus(null); 
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className='quiz-mode-container'>
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
              Current Flashcard: {currentCardIndex + 1}/{totalCards}
            </h4>
          </div>
          <div
            className={`quiz-flip-card ${isFlipped ? 'flipped' : ''} ${cardStatus === 'correct' ? 'correct-card' : cardStatus === 'incorrect' ? 'incorrect-card' : ''}`}
            onClick={toggleFlip}
            id="flipCard"
          >
            <div className='quiz-flip-card-inner'>
              <div className='quiz-flip-card-front'>
                <div className='quiz-flip-card-front-hint' onClick={handleHintClick}>
                  <LightbulbIcon />
                  <div className='quiz-flip-card-front-hint-hidden'>Click to open hint!</div>
                </div>
                <h1>{currentCard.front}</h1>
              </div>
              <div className='quiz-flip-card-back'>
                <h1>{currentCard.back}</h1>
              </div>
            </div>
          </div>

          <div className='quiz-mode-bottom-buttons'>
            <div className='quiz-mode-incorrect-button' onClick={handleIncorrect}>
              <CrossIcon />
            </div>
            <div className='skip' onClick={handleSkip}>
              <ArrowRightIcon />
              <div className='skip message'>Click to skip!</div>
            </div>
            <div className='quiz-mode-correct-button' onClick={handleCorrect}>
              <CheckIcon />
            </div>
          </div>
        </>
      ) : (
        <div className='quiz-completed'>
          <h1>Quiz completed!!!</h1>
          <p>Completed in {formatTime(elapsedTime)}</p>
          <p>Number correct: {correctAnswersCount}</p>
          <p>Number skipped: {skipCount}</p>
          <p>Number of incorrect: {incorrectAnswersCount}</p>
          <p>Number that require hint: {hintCount}</p>
          <p>End Quiz Session Status: {endStatus}</p>
        </div>
      )}

      <ModalTransition>
        {isHintModalOpen && (
          <Modal onClose={closeHintModal}>
            <ModalHeader>
              <ModalTitle>Hint</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {currentCard && currentCard.hint}
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={closeHintModal}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </div>
  );
};

export default QuizMode;