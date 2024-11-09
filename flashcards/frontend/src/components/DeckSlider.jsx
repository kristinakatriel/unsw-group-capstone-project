import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { router } from '@forge/bridge';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './DeckSlider.css';

const DeckSlider = ({ decks = [], onDelete, onDeckClick, onEdit }) => {

  const handleLinkClick = async (url) => {
    try {
      await router.open(url);
    } catch (error) {
      console.error('Navigation failed or user declined to proceed:', error);
    }
  };

  return (
    <div className='container'>
      <div className='deck-wrapper'>
        <ul className='deck-list'>
          <Splide
            options={{
              type: 'slide',
              perPage: 5,
              pagination: false,
              gap: '10px',
              breakpoints: {
                640: {
                  perPage: 2,
                },
                1024: {
                  perPage: 3,
                },
              },
            }}
          >
            {decks.map((deck) => (
              deck.title && (
                <SplideSlide key={deck.id} className='deck-item'>
                  <div className="deck-link">
                    <div className="deck-content"></div>
                    {/* ** TODO ** */}
                    <p className='badge blue'>Blue Tag</p>
                    <h4 className='deck-name'>{deck.title || 'Unnamed Deck'}</h4>
                    {deck.description.includes("Fetched from https://") ? (
                      <div
                        onClick={() => handleLinkClick(deck.description.match(/https?:\/\/\S+/)[0])}
                        className='ai-deck-description'
                      >
                        View source page
                      </div>
                    ) : (
                      <h4 className='deck-description'>{deck.description}</h4>
                    )}
                    <h4 className='deck-flashcard-amount'>Flashcards: {deck.cards?.length || 0}</h4>
                    <h4 className='deck-owner'>By {deck.name || 'Unknown'}</h4>
                    <div className='deck-button'>
                      <EditIcon className='deck-edit-button'  onClick={() => onEdit(deck)}/>
                      <DeleteIcon
                          className='deck-delete-button'
                          onClick={() => {
                              console.log('Delete icon clicked for deck:', deck);
                              onDelete(deck);
                          }}
                      />
                      <OpenInNewIcon
                        className='deck-open-button'
                        onClick={() => {
                          console.log(`Deck ${deck.id} has been clicked by user`)
                          onDeckClick(deck)
                        }}
                      />
                    </div>
                  </div>
                </SplideSlide>
              )
            ))}
          </Splide>
        </ul>
      </div>
    </div>
  );
};

export default DeckSlider;