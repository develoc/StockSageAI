  /**
   * Update stock market data using Alpha Vantage API
   */
  async updateStockData() {
    try {
      console.log('🔄 Updating stock market data from Alpha Vantage...');
      
      for (const symbol of STOCKS) {
        try {
          console.log(`📊 Fetching data for ${symbol}...`);
          
          // Use Alpha Vantage API with our key
          const response = await axios.get<AlphaVantageTimeSeriesResponse>(
            'https://www.alphavantage.co/query',
            {
              params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: symbol,
                interval: '5min',
                apikey: ALPHA_VANTAGE_API_KEY,
                outputsize: 'compact'
              }
            }
          );
          
          // Check if we have valid data
          if (response.data && response.data['Time Series (5min)']) {
            // Get the latest data point (first entry in the time series)
            const timeSeriesData = response.data['Time Series (5min)'];
            const latestTimestamp = Object.keys(timeSeriesData)[0];
            const latestData = timeSeriesData[latestTimestamp];
            
            if (latestData) {
              // Create market data point
              const marketData: MarketDataPoint = {
                symbol: symbol,
                timestamp: new Date(latestTimestamp),
                open: parseFloat(latestData['1. open']),
                high: parseFloat(latestData['2. high']),
                low: parseFloat(latestData['3. low']),
                close: parseFloat(latestData['4. close']),
                volume: parseFloat(latestData['5. volume']),
                timeframe: '5m'
              };
              
              // Save to database
              await this.saveMarketData(symbol, marketData);
              console.log(`✅ Updated ${symbol} price: $${marketData.close}`);
            }
          } else {
            console.warn(`⚠️ No valid data received for ${symbol}`);
            
            // Example of using the Alpha Vantage API for IBM as shown in the Python code
            console.log(`🔍 Attempting alternative request for ${symbol}...`);
            const altResponse = await axios.get(
              `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`
            );
            
            if (altResponse.data && altResponse.data['Time Series (5min)']) {
              console.log(`✅ Alternative request successful for ${symbol}`);
              // Process data as above...
              const timeSeriesData = altResponse.data['Time Series (5min)'];
              const latestTimestamp = Object.keys(timeSeriesData)[0];
              const latestData = timeSeriesData[latestTimestamp];
              
              if (latestData) {
                const marketData: MarketDataPoint = {
                  symbol: symbol,
                  timestamp: new Date(latestTimestamp),
                  open: parseFloat(latestData['1. open']),
                  high: parseFloat(latestData['2. high']),
                  low: parseFloat(latestData['3. low']),
                  close: parseFloat(latestData['4. close']),
                  volume: parseFloat(latestData['5. volume']),
                  timeframe: '5m'
                };
                
                await this.saveMarketData(symbol, marketData);
                console.log(`✅ Updated ${symbol} price via alternative method: $${marketData.close}`);
              }
            } else {
              console.error(`❌ Both data fetch attempts failed for ${symbol}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error updating ${symbol} data:`, error);
        }
        
        // Add delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
      
    } catch (error) {
      console.error('❌ Error updating stock market data:', error);
    }
  }
