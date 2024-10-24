import React, { useState } from 'react';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left'
import ArrowRightIcon from '@atlaskit/icon/glyph/arrow-right'
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import './QuizMode.css';

const StudyMode = ({ deck }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);

  const flashcards = deck.cards;
  const totalCards = flashcards.length;

  const openHintModal = () => setIsHintModalOpen(true);
  const closeHintModal = () => setIsHintModalOpen(false);

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prevIndex) => prevIndex - 1);
    }
    setIsFlipped(false);
    setCardStatus(null);
  }

  const goToNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    }
    setIsFlipped(false);
    setCardStatus(null);
  };

  const toggleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped);
  };

  const handleHintClick = (event) => {
    event.stopPropagation();
    openHintModal();
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className='quiz-mode-container'>
      <div className='quiz-mode-title'>
        <h1>Study Mode for {deck.title}</h1>
      </div>
      <div className='quiz-mode-information'>
        <h4 className='quiz-mode-flashcard-counter'>
          Current Flashcard: {currentCardIndex + 1}/{totalCards}
        </h4>
      </div>
      <div
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
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
        <div className='quiz-mode-left-button' onClick={goToPrevCard}>
          <ArrowLeftIcon />
        </div>
        <div className='quiz-mode-right-button' onClick={goToNextCard}>
          <ArrowRightIcon />
        </div>
      </div>

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

export default StudyMode;
