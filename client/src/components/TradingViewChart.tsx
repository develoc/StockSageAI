
import { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  interval?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

function TradingViewChart({
  symbol = "NASDAQ:AAPL",
  theme = "dark",
  width = "100%",
  height = 400,
  interval = "D",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_widget"
}: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      // Clear any existing content
      container.current.innerHTML = '';
      
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": false,
        "symbol": symbol,
        "interval": interval,
        "timezone": "Etc/UTC",
        "theme": theme,
        "style": "1",
        "locale": "en",
        "enable_publishing": enable_publishing,
        "allow_symbol_change": allow_symbol_change,
        "calendar": false,
        "support_host": "https://www.tradingview.com",
        "width": width,
        "height": height,
        "toolbar_bg": toolbar_bg,
        "withdateranges": true,
        "hide_side_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "container_id": container_id,
        "backgroundColor": "rgba(19, 23, 34, 1)",
        "gridColor": "rgba(42, 46, 57, 1)",
        "hide_volume": false,
        "studies": [
          "STD;SMA",
          "STD;MACD",
          "STD;RSI"
        ]
      });

      container.current.appendChild(script);
    }
  }, [symbol, theme, width, height, interval, toolbar_bg, enable_publishing, allow_symbol_change, container_id]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div id={container_id} ref={container} style={{ height: "100%", width: "100%" }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewChart);
