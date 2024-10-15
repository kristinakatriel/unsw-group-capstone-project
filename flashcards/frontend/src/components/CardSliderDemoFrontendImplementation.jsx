import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './CardSliderDemoFrontendImplementation.css';

const CardSlider = () => {
  return (
    <div className='container'>
      <div className='card-wrapper'>
        <ul className='card-list'>
          <Splide
            options={{
              type       : 'slide',
              perPage    : 5,
              pagination : false,
              gap        : '10px',
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
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge blue'>Blue Tag</p>
                <h4 className='card-name'>Flashcard</h4>
                <h4 className='card-description'>If it is a flashcard, it shows the question. What's 1 + 1?</h4>
                <h4 className='card-owner'>By exmaple@ad.unsw.edu.au</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button'/>
                  <DeleteIcon className='card-delete-button'/>
                </div>
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <div className='card-tags'>
                  <p className='badge red'>Red Tag</p>
                  <p className='badge blue'>Blue Tag</p>
                </div>
                <h4 className='card-name'>Deck</h4>
                <h4 className='card-description'>If it is a flashcard, it shows the question. What's 1 + 1?</h4>
                <h4 className='card-owner'>By exmaple@ad.unsw.edu.au</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button'/>
                  <DeleteIcon className='card-delete-button'/>
                </div>
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
              <p className='badge orange'>Orange Tag</p>
              <h4 className='card-name'>Deck</h4>
              <h4 className='card-description'>If it is a deck, it shows the deck description and/or the number of flashcards in deck</h4>
                <h4 className='card-flashcard-amount'>Flashcards: 7</h4>
                <h4 className='card-owner'>By exmaple@ad.unsw.edu.au</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button'/>
                  <DeleteIcon className='card-delete-button'/>
                </div>
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge green'>Green Tag</p>
                <h4 className='card-name'>Deck</h4>
                <h4 className='card-description'>If it is a deck, it shows the deck description and/or the number of flashcards in deck</h4>
                <h4 className='card-flashcard-amount'>Flashcards: 7</h4>
                <h4 className='card-owner'>By exmaple@ad.unsw.edu.au</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button'/>
                  <DeleteIcon className='card-delete-button'/>
                </div>
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge orange'>Orange Tag</p>
                <h4 className='card-name'>Deck</h4>
                <h4 className='card-description'>If it is a deck, it shows the deck description and/or the number of flashcards in deck</h4>
                <h4 className='card-flashcard-amount'>Flashcards: 7</h4>
                <h4 className='card-owner'>By exmaple@ad.unsw.edu.au</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button'/>
                  <DeleteIcon className='card-delete-button'/>
                </div>
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge blue'>Blue Tag</p>
                <h4 className='card-name'>Deck</h4>
                <h4 className='card-description'>If it is a deck, it shows the deck description and/or the number of flashcards in deck</h4>
                <h4 className='card-flashcard-amount'>Flashcards: 7</h4>
                <h4 className='card-owner'>By exmaple@ad.unsw.edu.au</h4>
                <div className='card-button'>
                  <EditIcon className='card-edit-button'/>
                  <DeleteIcon className='card-delete-button'/>
                </div>
              </div>
            </SplideSlide>
          </Splide>
        </ul>
      </div>
    </div>
  );
}

export default CardSlider;
