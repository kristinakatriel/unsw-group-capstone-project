import React, { useEffect, useState } from 'react';
import './QuizResults.css'; 
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { PieChart } from '@mui/x-charts/PieChart';

const QuizResults = ({ viewQuizResult, pressedButton }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    if (viewQuizResult && viewQuizResult.length > 0) {
      setSelectedQuiz(viewQuizResult[0]);
    }
  }, [viewQuizResult]);

  const columns = [
    { id: 'date', label: 'Date of Quiz Completion'},
    { id: 'numCorrect', label: 'Amount Correct'},
    { id: 'numIncorrect', label: 'Amount Incorrect'},
    { id: 'numSkip', label: 'Amount Skipped'},
    { id: 'numHint', label: 'Hints Used'},
  ];

  const handleRowClick = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="quiz-results-container">
      <h3>All Quiz Results</h3>
      {viewQuizResult && viewQuizResult.length > 0 ? (
        <div className="results-and-statistics">
          <Paper className="results-table">
            <TableContainer className="table-container">
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align="left"
                        style={{ minWidth: column.minWidth }}
                        sx={{ fontWeight: 'bold', minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewQuizResult
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((quiz, index) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={index}
                        onClick={() => handleRowClick(quiz)}
                        selected={selectedQuiz === quiz}
                        className={`table-row ${selectedQuiz === quiz ? 'selected-row' : ''}`}
                      >
                        {columns.map((column) => {
                          const value = quiz[column.id];
                          return (
                            <TableCell key={column.id} align="left">
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={viewQuizResult.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>

          {selectedQuiz && (
            <Paper
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2, // Adjust padding as needed
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: selectedQuiz.numCorrect, color: '#A8E6A1' },
                        { id: 1, value: selectedQuiz.numIncorrect, color: '#FF8B8B' }, 
                        { id: 2, value: selectedQuiz.numSkip, color: '#B0B0B0' },
                      ],
                    },
                  ]}
                  width={400}
                  height={200}
                />
              </div>
              <div style={{ marginLeft: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <div
                      style={{
                        width: '15px',
                        height: '15px',
                        backgroundColor: '#A8E6A1',
                        marginRight: '8px',
                      }}
                    />
                    <span>Correct</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <div
                      style={{
                        width: '15px',
                        height: '15px',
                        backgroundColor: '#FF8B8B',
                        marginRight: '8px',
                      }}
                    />
                    <span>Incorrect</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <div
                      style={{
                        width: '15px',
                        height: '15px',
                        backgroundColor: '#B0B0B0',
                        marginRight: '8px',
                      }}
                    />
                    <span>Skipped</span>
                  </div>
                </div>
              </div>
            </Paper>
          )}
        </div>
      ) : (
        <p>No quiz results to display.</p>
      )}
    </div>
  );
};

export default QuizResults;
