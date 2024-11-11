import React from 'react';
import './QuizResults.css'; // Add CSS for styling if needed

const QuizResults = ({ viewQuizResult, pressedButton }) => {
  console.log('Rendering QuizResults component');
  console.log('Received viewQuizResult:', viewQuizResult);
  console.log('Received pressedbutton:', pressedButton);
  return (
    <div className="quiz-results-container">


      <h3>All Quiz Results</h3>
      {viewQuizResult && viewQuizResult.length > 0 ? (
        viewQuizResult.map((quiz, index) => (
          <div key={index} className="quiz-result">
            <h4>Quiz Session {index + 1}</h4>
            <p><strong>Date of Quiz:</strong> {quiz.date}</p>
            <p><strong>Number Correct:</strong> {quiz.numCorrect}</p>
            <p><strong>Number Incorrect:</strong> {quiz.numIncorrect}</p>
            <p><strong>Number Skipped:</strong> {quiz.numSkip}</p>
            <p><strong>Number with Hints:</strong> {quiz.numHint}</p>
          </div>
        ))
      ) : pressedButton ? ( // the line below is printed if there are no quiz results and the user presses button
        <p>No quiz results to display. Click "View Quiz Results" to see details.</p>
      ) : null}
    </div>
  );

};

export default QuizResults;
