import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './CardSlider.css';

const CardSlider = ({ cards = [], type }) => {


  return (
    <div className='container'>
      <div className='card-wrapper'>
        <ul className='card-list'>
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
            {cards.map((card) => (
              <SplideSlide key={card.id} className='card-item'>
                <div className="card-link">
                  <p className={`badge ${type === 'flashcard' ? 'blue' : 'orange'}`}>
                    {type === 'flashcard' ? 'Flashcard' : 'Deck'}
                  </p>
                  <h4 className='card-name'>{card.title || 'Untitled'}</h4>
                  {type === 'flashcard' ? (
                    <>
                      <h4 className='card-description'>{card.question_text || 'No question available'}</h4>
                      <h4 className='card-owner'>By {card.owner || 'Unknown'}</h4>
                    </>
                  ) : (
                    <>
                      <h4 className='card-description'>{card.description || 'No description available'}</h4>
                      <h4 className='card-flashcard-amount'>Flashcards: {card.flashcards?.length || 0}</h4>
                      <h4 className='card-owner'>By {card.owner || 'Unknown'}</h4>
                    </>
                  )}
                  <div className='card-button'>
                    <EditIcon className='card-edit-button' />
                    <DeleteIcon className='card-delete-button' />
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

export default CardSlider;
