import React, { useState } from 'react';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left'
import ArrowRightIcon from '@atlaskit/icon/glyph/arrow-right'
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import LikeIcon from '@atlaskit/icon/glyph/like'
import EditIcon from '@atlaskit/icon/glyph/edit'
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import './StudyMode.css';

const StudyMode = ({ deck }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // const [isLikeModalOpen, setIsLikeModalOpen] = useState(false); TODO
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false); TODO
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
  }

  const goToNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    }
    setIsFlipped(false);
  };

  const toggleFlip = () => {
    setIsFlipped((prevFlipped) => !prevFlipped);
  };

  const handleLikeClick = (event) => {
    event.stopPropagation();
    console.log('Like Clicked!')
    //openLikeModal(); TODO
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    console.log('Edit Clicked!')
    //openEditModal(); TODO
  };

  const handleHintClick = (event) => {
    event.stopPropagation();
    openHintModal();
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className='study-mode-container'>
      <div className='study-mode-title'>
        <h1>Study Mode for {deck.title}</h1>
      </div>
      <div className='study-mode-information'>
        <h4 className='study-mode-flashcard-counter'>
          Current Flashcard: {currentCardIndex + 1}/{totalCards}
        </h4>
      </div>
      <div
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
        onClick={toggleFlip}
        id="flipCard"
      >
        <div className='flip-card-inner'>
          <div className='flip-card-front'>
            <div className='flip-card-header'>
              <div className='flip-card-like' onClick={handleLikeClick}>
                <LikeIcon />
              </div>            
              <div className='flip-card-edit' onClick={handleEditClick}>
                <EditIcon />
              </div>
              <div className='flip-card-hint' onClick={handleHintClick}>
                <LightbulbIcon />
              </div>
            </div>

            <h1>{currentCard.question_text}</h1>
          </div>
          <div className='flip-card-back'>
            <div className='flip-card-header'>
                <div className='flip-card-like' onClick={handleLikeClick}>
                  <LikeIcon />
                </div>            
                <div className='flip-card-edit' onClick={handleEditClick}>
                  <EditIcon />
                </div>
                <div className='flip-card-hint' onClick={handleHintClick}>
                  <LightbulbIcon />
                </div>
              </div>
            <h1>{currentCard.answer_text}</h1>
          </div>
        </div>
      </div>

      <div className='study-mode-bottom-buttons'>
        <div className='study-mode-left-button' onClick={goToPrevCard}>
          <ArrowLeftIcon />
        </div>
        <div className='study-mode-right-button' onClick={goToNextCard}>
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
