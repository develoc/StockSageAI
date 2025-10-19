-- Create portfolios for seed users
INSERT INTO portfolios (user_id, name, total_value, allocation)
VALUES
('admin123', 'Investment Portfolio', 254750.00, '{"GOLD": 30, "SILVER": 15, "OIL": 25, "BTC": 30}'),
('admin123', 'Retirement Fund', 525000.00, '{"GOLD": 40, "SILVER": 10, "OIL": 30, "BTC": 20}'),
('user123', 'My First Portfolio', 75000.00, '{"GOLD": 20, "SILVER": 15, "OIL": 15, "BTC": 50}');

-- Get the portfolio IDs
DO $$
DECLARE
  admin_port1_id integer;
  admin_port2_id integer;
  user_port_id integer;
BEGIN
  SELECT id INTO admin_port1_id FROM portfolios WHERE user_id = 'admin123' AND name = 'Investment Portfolio';
  SELECT id INTO admin_port2_id FROM portfolios WHERE user_id = 'admin123' AND name = 'Retirement Fund';
  SELECT id INTO user_port_id FROM portfolios WHERE user_id = 'user123' AND name = 'My First Portfolio';

  -- Insert positions for admin's investment portfolio
  INSERT INTO positions (portfolio_id, symbol, quantity, avg_price, current_price, unrealized_pnl)
  VALUES
  (admin_port1_id, 'GOLD', 38.5, 1850.25, 1913.70, 2445.33),
  (admin_port1_id, 'SILVER', 480.0, 23.15, 24.80, 792.00),
  (admin_port1_id, 'OIL', 82.5, 75.40, 77.25, 152.63),
  (admin_port1_id, 'BTC', 2.1, 37250.00, 42850.00, 11760.00);

  -- Insert positions for admin's retirement fund
  INSERT INTO positions (portfolio_id, symbol, quantity, avg_price, current_price, unrealized_pnl)
  VALUES
  (admin_port2_id, 'GOLD', 125.0, 1780.50, 1913.70, 16650.00),
  (admin_port2_id, 'SILVER', 1250.0, 22.35, 24.80, 3062.50),
  (admin_port2_id, 'OIL', 210.0, 72.15, 77.25, 1071.00),
  (admin_port2_id, 'BTC', 3.0, 32500.00, 42850.00, 31050.00);

  -- Insert positions for user's portfolio
  INSERT INTO positions (portfolio_id, symbol, quantity, avg_price, current_price, unrealized_pnl)
  VALUES
  (user_port_id, 'GOLD', 8.5, 1905.75, 1913.70, 67.58),
  (user_port_id, 'SILVER', 275.0, 24.30, 24.80, 137.50),
  (user_port_id, 'OIL', 20.5, 76.80, 77.25, 9.23),
  (user_port_id, 'BTC', 0.85, 40125.00, 42850.00, 2316.25);
END $$;
