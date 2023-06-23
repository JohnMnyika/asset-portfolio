import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { TextField, Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { useSpring, animated } from 'react-spring';

const App = () => {
  const [startDate, setStartDate] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [allocationAAPL, setAllocationAAPL] = useState('');
  const [allocationGOOG, setAllocationGOOG] = useState('');
  const [allocationMSFT, setAllocationMSFT] = useState('');
  const [portfolioValue, setPortfolioValue] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeIn = useSpring({ opacity: 1, from: { opacity: 0 } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!startDate || !initialBalance || !allocationAAPL || !allocationGOOG || !allocationMSFT) {
      setError('Please fill in all the fields.');
      setLoading(false);
      return;
    }

    if (allocationAAPL + allocationGOOG + allocationMSFT !== 100) {
      setError('Allocation percentages must sum up to 100.');
      setLoading(false);
      return;
    }

    const currentDate = new Date();
    const formattedStartDate = formatDate(new Date(startDate));

    if (currentDate < new Date(startDate)) {
      setError('Start date cannot be in the future.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
          `https://api.worldtradingdata.com/api/v1/history?symbol=AAPL,GOOG,MSFT&date_from=${formattedStartDate}&date_to=${formatDate(
              currentDate
          )}&sort=newest&api_token=8853cfdaf8e3255bebcb482fad6d9f56`
      );

      const data = response.data.history;

      const portfolioValue = Object.keys(data).map((date) => {
        const aaplValue = data[date].AAPL.close * (initialBalance * (allocationAAPL / 100));
        const googValue = data[date].GOOG.close * (initialBalance * (allocationGOOG / 100));
        const msftValue = data[date].MSFT.close * (initialBalance * (allocationMSFT / 100));
        return aaplValue + googValue + msftValue;
      });

      setPortfolioValue(portfolioValue);

      const chartData = {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Portfolio Value',
            data: portfolioValue,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
          },
        ],
      };

      setChartData(chartData);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch data from the API. Please try again later.');
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
      <Container maxWidth="sm">
        <animated.div style={fadeIn}>
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h4" component="h1" align="center" color="primary">
              Asset Portfolio Calculator
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
              />
              <TextField
                  label="Initial Balance"
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(parseFloat(e.target.value))}
                  placeholder="Enter initial balance"
                  fullWidth
                  required
                  margin="normal"
              />
              <TextField
                  label="Allocation AAPL (%)"
                  type="number"
                  value={allocationAAPL}
                  onChange={(e) => setAllocationAAPL(parseFloat(e.target.value))}
                  placeholder="Enter allocation percentage"
                  fullWidth
                  required
                  margin="normal"
              />
              <TextField
                  label="Allocation GOOG (%)"
                  type="number"
                  value={allocationGOOG}
                  onChange={(e) => setAllocationGOOG(parseFloat(e.target.value))}
                  placeholder="Enter allocation percentage"
                  fullWidth
                  required
                  margin="normal"
              />
              <TextField
                  label="Allocation MSFT (%)"
                  type="number"
                  value={allocationMSFT}
                  onChange={(e) => setAllocationMSFT(parseFloat(e.target.value))}
                  placeholder="Enter allocation percentage"
                  fullWidth
                  required
                  margin="normal"
              />
              {error && (
                  <Typography variant="body1" color="error" align="center" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button type="submit" disabled={loading} variant="contained" color="primary">
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate'}
                </Button>
              </Box>
            </form>
          </Box>
          {portfolioValue.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Line
                    data={chartData}
                    options={{
                      plugins: {
                        legend: {
                          labels: {
                            color: 'primary',
                          },
                        },
                      },
                    }}
                />
              </Box>
          )}
        </animated.div>
      </Container>
  );
};

export default App;
