import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Snowflake, Zap, CloudFog } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
  description: string;
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  latitude = 43.0014, // Saint Johns, MI 48879
  longitude = -84.5592 
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // Using Open-Meteo API (free, no key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2&temperature_unit=fahrenheit`
        );
        
        if (!response.ok) {
          throw new Error('Weather data unavailable');
        }
        
        const data = await response.json();
        
        // Map WMO weather codes to conditions
        const getWeatherCondition = (code: number): { condition: WeatherData['condition'], description: string } => {
          if (code === 0) return { condition: 'sunny', description: 'Clear' };
          if (code >= 1 && code <= 3) return { condition: 'cloudy', description: 'Cloudy' };
          if (code >= 45 && code <= 48) return { condition: 'foggy', description: 'Foggy' };
          if (code >= 51 && code <= 67) return { condition: 'rainy', description: 'Rain' };
          if (code >= 71 && code <= 77) return { condition: 'snowy', description: 'Snow' };
          if (code >= 80 && code <= 82) return { condition: 'rainy', description: 'Showers' };
          if (code >= 85 && code <= 86) return { condition: 'snowy', description: 'Snow' };
          if (code >= 95) return { condition: 'stormy', description: 'Storm' };
          return { condition: 'cloudy', description: 'Cloudy' };
        };
        
        const currentCondition = getWeatherCondition(data.current_weather.weathercode);
        const tomorrowCondition = getWeatherCondition(data.daily.weathercode[1]);
        
        setCurrentWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: currentCondition.condition,
          description: currentCondition.description
        });
        
        setTomorrowWeather({
          temp: Math.round(data.daily.temperature_2m_max[1]),
          condition: tomorrowCondition.condition,
          description: tomorrowCondition.description
        });
        
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Weather unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  const getWeatherIcon = (condition: WeatherData['condition'], size: number = 16) => {
    switch (condition) {
      case 'sunny': return <Sun size={size} className="text-yellow-400" />;
      case 'cloudy': return <Cloud size={size} className="text-zinc-400" />;
      case 'rainy': return <CloudRain size={size} className="text-blue-400" />;
      case 'snowy': return <Snowflake size={size} className="text-cyan-300" />;
      case 'stormy': return <Zap size={size} className="text-purple-400" />;
      case 'foggy': return <CloudFog size={size} className="text-zinc-500" />;
      default: return <Sun size={size} className="text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-500">
        <div className="animate-pulse bg-zinc-800 h-4 w-16 rounded"></div>
      </div>
    );
  }

  if (error || !currentWeather) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 text-xs">
        <Cloud size={14} />
        <span>--°</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Today's Weather */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-zinc-800">
        {getWeatherIcon(currentWeather.condition, 16)}
        <span className="text-sm font-medium text-white">{currentWeather.temp}°</span>
        <span className="text-xs text-zinc-500 hidden sm:inline">{currentWeather.description}</span>
      </div>

      {/* Tomorrow's Weather */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
        <span className="text-[10px] text-zinc-600 uppercase font-bold">Tomorrow</span>
        {tomorrowWeather && getWeatherIcon(tomorrowWeather.condition, 14)}
        <span className="text-sm text-zinc-400">{tomorrowWeather?.temp}°</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
