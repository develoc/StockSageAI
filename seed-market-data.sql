-- Create sample market data (limited sample for current day)
-- For GOLD
INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume, timeframe)
SELECT 
  'GOLD', 
  NOW() - (interval '1 hour' * generate_series(24, 0, -1)), 
  1800 + random() * 50,  -- open
  1800 + random() * 100, -- high
  1800 + random() * 10,  -- low
  1800 + random() * 50,  -- close
  100000 + random() * 500000, -- volume
  '1H'
FROM generate_series(1, 25);

-- For BTC
INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume, timeframe)
SELECT 
  'BTC', 
  NOW() - (interval '1 hour' * generate_series(24, 0, -1)), 
  40000 + random() * 5000,  -- open
  40000 + random() * 6000,  -- high
  40000 + random() * 4000,  -- low
  40000 + random() * 5500,  -- close
  5000 + random() * 10000,  -- volume
  '1H'
FROM generate_series(1, 25);

-- For OIL
INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume, timeframe)
SELECT 
  'OIL', 
  NOW() - (interval '1 hour' * generate_series(24, 0, -1)), 
  70 + random() * 10,  -- open
  70 + random() * 15,  -- high
  70 + random() * 8,   -- low
  70 + random() * 12,  -- close
  200000 + random() * 800000, -- volume
  '1H'
FROM generate_series(1, 25);

-- For SILVER
INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume, timeframe)
SELECT 
  'SILVER', 
  NOW() - (interval '1 hour' * generate_series(24, 0, -1)), 
  25 + random() * 5,   -- open
  25 + random() * 8,   -- high
  25 + random() * 3,   -- low
  25 + random() * 6,   -- close
  150000 + random() * 600000, -- volume
  '1H'
FROM generate_series(1, 25);
