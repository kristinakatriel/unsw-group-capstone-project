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
    if (!isQuizCompleted) {
      const timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizCompleted]);

  const openHintModal = () => setIsHintModalOpen(true);
  const closeHintModal = () => setIsHintModalOpen(false);

  const goToNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsQuizCompleted(true); 
    }
    setIsFlipped(false);
    setCardStatus(null);
  };

  const handleCorrect = () => {
    setCardStatus('correct');
    setTimeout(() => {
      goToNextCard();
      setCardStatus(null); 
    }, 1000);
  };

  const handleWrong = () => {
    setCardStatus('wrong');
    setTimeout(() => {
      goToNextCard();
      setCardStatus(null); 
    }, 1000);
  };

  const toggleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped);
  };

  const handleHintClick = (event) => {
    event.stopPropagation();
    openHintModal();
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
            className={`flip-card ${isFlipped ? 'flipped' : ''} ${cardStatus === 'correct' ? 'correct-card' : cardStatus === 'wrong' ? 'wrong-card' : ''}`}
            onClick={toggleFlip}
            id="flipCard"
          >
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div className="flip-card-front-hint" onClick={handleHintClick}>
                  <LightbulbIcon />
                  <div className="flip-card-front-hint-hidden">Click to open Hint!</div>
                </div>
                <h1>{currentCard.question_text}</h1>
              </div>
              <div className="flip-card-back">
                <h1>{currentCard.answer_text}</h1>
              </div>
            </div>
          </div>

          <div className='quiz-mode-bottom-buttons'>
            <div className='quiz-mode-wrong-button' onClick={handleWrong}>
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
