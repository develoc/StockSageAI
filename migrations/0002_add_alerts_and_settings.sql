-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL,
  asset VARCHAR NOT NULL,
  condition VARCHAR NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  triggered BOOLEAN NOT NULL DEFAULT false,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  theme VARCHAR NOT NULL DEFAULT 'dark',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  market_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_reports BOOLEAN NOT NULL DEFAULT true,
  timezone VARCHAR NOT NULL DEFAULT 'UTC',
  default_currency VARCHAR NOT NULL DEFAULT 'USD',
  risk_level VARCHAR NOT NULL DEFAULT 'moderate',
  max_position_size DECIMAL(15,2),
  stop_loss_percentage DECIMAL(5,2),
  take_profit_percentage DECIMAL(5,2),
  allowed_symbols JSONB DEFAULT '["GOLD", "BTC", "OIL", "SILVER"]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_asset ON alerts(asset);
CREATE INDEX idx_alerts_active ON alerts(active);
CREATE UNIQUE INDEX idx_user_settings_user_id ON user_settings(user_id);
