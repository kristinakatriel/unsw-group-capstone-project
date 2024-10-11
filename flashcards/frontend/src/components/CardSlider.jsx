import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './CardSlider.css';

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
                <h4 className='card-title'>Lorem ipsum dolor sit explicabo adipisicing elit</h4>
                <EditIcon />
                <DeleteIcon />
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge red'>Red Tag</p>
                <h4 className='card-title'>Lorem ipsum dolor sit explicabo adipisicing elit</h4>
                <EditIcon />
                <DeleteIcon />
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge orange'>Orange Tag</p>
                <h4 className='card-title'>Lorem ipsum dolor sit explicabo adipisicing elit</h4>
                <DeleteIcon className='card-button' />
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge green'>Green Tag</p>
                <h4 className='card-title'>Lorem ipsum dolor sit explicabo adipisicing elit</h4>
                <DeleteIcon className='card-button' />
              </div>
            </SplideSlide>
            <SplideSlide className='card-item'>
              <div className="card-link">
                <p className='badge yellow'>Yellow Tag</p>
                <h4 className='card-title'>Lorem ipsum dolor sit explicabo adipisicing elit</h4>
                <DeleteIcon className='card-button' />
              </div>
            </SplideSlide>
          </Splide>
        </ul>
      </div>
    </div>
  );
}

export default CardSlider;
