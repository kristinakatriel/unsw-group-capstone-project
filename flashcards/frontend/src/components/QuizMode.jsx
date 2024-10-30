import React, { useState, useEffect } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import CheckIcon from '@atlaskit/icon/glyph/check';
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import './QuizMode.css';

const QuizMode = ({ deck }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [cardStatus, setCardStatus] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const flashcards = deck.cards;
  const totalCards = flashcards.length;

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const response = await invoke('startQuizSession', { deckId: deck.id });
        if (response.success) {
          setSessionId(response.session.sessionId);
          setFlashcards(response.session.deckInSession.cards);
          setCurrentCardIndex(response.firstIndex);
        } else {
          console.error("Error starting quiz:", response.error);
        }
      } catch (error) {
        console.error("Failed to start quiz session:", error);
      }
    };
    startQuiz();
  }, [deck.id]);

  useEffect(() => {
    if (!isQuizCompleted) {
      const timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizCompleted]);

  const openHintModal = () => setIsHintModalOpen(true);
  const closeHintModal = () => setIsHintModalOpen(false);

  const updateCardStatus = async (status) => {
    try {
      const response = await invoke('updateCardStatusQuiz', {
        sessionId,
        currentIndex: currentCardIndex,
        status: status,
      });

      if (response.success) {
        if (response.message === 'quiz is finished') {
          handleEndQuiz();
          setIsQuizCompleted(true);
        } else {
          setCurrentCardIndex(response.nextIndex);
          setIsFlipped(false);
          setCardStatus(null);
        }
      } else {
        console.error("Error updating card status:", response.error);
      }
    } catch (error) {
      console.error("Failed to update card status:", error);
    }
  };

  const handleCorrect = () => {
    setCardStatus('correct');
    updateCardStatus('correct');
    setTimeout(() => {
      goToNextCard();
      setCardStatus(null); 
    }, 1000);
  };

  const handleIncorrect = () => {
    setCardStatus('incorrect');
    updateCardStatus('incorrect');
    setTimeout(() => {
      goToNextCard();
      setCardStatus(null); 
    }, 1000);
  };

  const handleSkip = () => {
    setCardStatus('skip');
    updateCardStatus('skip');
    setTimeout(() => {
      goToNextCard();
      setCardStatus(null); 
    }, 1000);
  };

  const handleHint = () => {
    setCardStatus('hint');
    updateCardStatus('hint');
    openHintModal();
    setTimeout(() => {
      goToNextCard();
      setCardStatus(null); 
    }, 1000);
  };

  const handleEndQuiz = async () => {
    try {
      const response = await invoke('endQuizSession', { sessionId });
      if (response.success) {
        console.log("Quiz session ended and results saved:", response);
      } else {
        console.error("Error ending quiz session:", response.error);
      }
    } catch (error) {
      console.error("Failed to end quiz session:", error);
    }
  };


  const toggleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped);
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
            <div className='quiz-mode-correct-button' onClick={handleCorrect}>
              <CheckIcon />
            </div>
          </div>
        </>
      ) : (
        <div className='quiz-completed'>
          <h1>Quiz completed!</h1>
          <p>Completed in {formatTime(elapsedTime)}</p>
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
