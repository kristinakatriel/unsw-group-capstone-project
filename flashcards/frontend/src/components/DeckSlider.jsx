import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './DeckSlider.css';

const DeckSlider = ({ decks = [], onDelete }) => {

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
              <SplideSlide key={deck.id} className='deck-item'>
                <div className="deck-link">
                  {/* Deck content wrapper to ensure banner placement */}
                  <div className="deck-content"></div>
                  <p className='badge blue'>Blue Tag</p>
                  <h4 className='deck-name'>{deck.title || 'Unnamed Deck'}</h4>
                  <h4 className='deck-description'>{deck.description || 'No description available'}</h4>
                  <h4 className='deck-flashcard-amount'>Flashcards: {deck.flashcards?.length || 0}</h4>
                  <h4 className='deck-owner'>By {deck.owner || 'Unknown'}</h4>
                  <div className='deck-button'>
                    <EditIcon className='deck-edit-button' />
                    <DeleteIcon
                        className='deck-delete-button'
                        onClick={() => {
                            console.log('Delete icon clicked for deck:', deck);  // Log the deck for which delete was clicked
                            onDelete(deck);
                        }}
                    />
                  </div>
                </div>
              </SplideSlide>
            ))}
          </Splide>
        </ul>
      </div>
    </div>
  );
};

export default DeckSlider;