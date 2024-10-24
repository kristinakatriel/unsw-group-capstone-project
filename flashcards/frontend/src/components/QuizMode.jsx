import React, { useState } from 'react';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import ArrowRightIcon from '@atlaskit/icon/glyph/arrow-right';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import QuestionIcon from '@atlaskit/icon/glyph/question';
import CheckIcon from '@atlaskit/icon/glyph/check';
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb'
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import './QuizMode.css';

const QuizMode = ({ deck }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false); 

  const openHintModal = () => setIsHintModalOpen(true);
  const closeHintModal = () => setIsHintModalOpen(false);

  const flashcards = deck.cards;
  const totalCards = flashcards.length;

  const goToPreviousCard = () => {
    setCurrentCardIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    setIsFlipped(false); 
  };

  const goToNextCard = () => {
    setCurrentCardIndex((prevIndex) => Math.min(prevIndex + 1, totalCards - 1));
    setIsFlipped(false); 
  };

  const toggleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped); 
  };

  const handleHintClick = (event) => {
    event.stopPropagation();
    console.log("HINT BUTTON HAS BEEN PRESSED");
    console.log(currentCard.hint);
    openHintModal();
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className='quiz-mode-container'>
      <div className='quiz-mode-title'>
        <h1>Quiz Mode for {deck.title}</h1>
      </div>
      <div className='quiz-mode-progress-bar'></div>
      <div className='quiz-mode-timer'></div>
      {currentCard ? (
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={toggleFlip} id="flipCard">
          <div className='flip-card-inner'>
            <div className='flip-card-front'>
              <div className='flip-card-front-hint' onClick={handleHintClick}>
                <LightbulbIcon />
                <div class='flip-card-front-hint-hidden'>Click to open Hint!</div>
              </div>
              <h1>{currentCard.question_text}</h1>
            </div>
            <div className='flip-card-back'>
              <h1>{currentCard.answer_text}</h1>
            </div>
          </div>
        </div>
      ) : (
        <p>No flashcards available.</p>
      )}
      <div className='quiz-mode-bottom-buttons'>
        <div className='quiz-mode-left-buttons'>
          <div className='quiz-mode-prev-button' onClick={goToPreviousCard}>
            <ArrowLeftIcon />
          </div>
        </div>
        <div className='quiz-mode-middle-buttons'>
          <div className='quiz-mode-wrong-button'><CrossIcon /></div>
          <div className='quiz-mode-unsure-button'><QuestionIcon /></div>
          <div className='quiz-mode-correct-button'><CheckIcon /></div>
        </div>
        <div className='quiz-mode-right-buttons'>
          <div className='quiz-mode-next-button' onClick={goToNextCard}>
            <ArrowRightIcon />
          </div>
        </div>
      </div>
      <ModalTransition>
        {isHintModalOpen && (
          <Modal onClose={closeHintModal}>
            <ModalHeader>
              <ModalTitle>Hint</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {currentCard.hint}
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
