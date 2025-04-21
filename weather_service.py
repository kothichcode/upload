import httpx
from app.core.config import settings
from fastapi import HTTPException

async def get_current_weather(city: str):
    """Get current weather for a city"""
    async with httpx.AsyncClient() as client:
        params = {
            "q": city,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        response = await client.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params=params
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail="Error fetching weather data"
            )
            
        return response.json()

async def get_forecast(city: str):
    """Get 7-day forecast for a city"""
    async with httpx.AsyncClient() as client:
        # First get coordinates
        params = {
            "q": city,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        geo_response = await client.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params=params
        )
        
        if geo_response.status_code != 200:
            raise HTTPException(
                status_code=geo_response.status_code, 
                detail="Error fetching location data"
            )
            
        weather_data = geo_response.json()
        lat = weather_data["coord"]["lat"]
        lon = weather_data["coord"]["lon"]
        
        # Then get forecast with coordinates
        forecast_params = {
            "lat": lat,
            "lon": lon,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric",
            "exclude": "minutely,hourly,alerts"
        }
        
        forecast_response = await client.get(
            "https://api.openweathermap.org/data/3.0/onecall",
            params=forecast_params
        )
        
        if forecast_response.status_code != 200:
            raise HTTPException(
                status_code=forecast_response.status_code, 
                detail="Error fetching forecast data"
            )
            
        forecast_data = forecast_response.json()
        
        # Add city name to response
        forecast_data["city_name"] = city
        
        return forecast_data

async def get_global_weather():
    """Get weather for major cities around the world"""
    major_cities = [
        "London", "New York", "Tokyo", "Beijing", "Sydney", 
        "Moscow", "Paris", "Cairo", "Rio de Janeiro", "Mumbai",
        "Los Angeles", "Berlin", "Toronto", "Dubai", "Singapore"
    ]
    
    async with httpx.AsyncClient() as client:
        results = []
        
        for city in major_cities:
            params = {
                "q": city,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
            
            try:
                response = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results.append({
                        "id": data["id"],
                        "name": data["name"],
                        "temp": data["main"]["temp"],
                        "weather": data["weather"][0]["main"],
                        "icon": data["weather"][0]["icon"],
                        "coord": data["coord"]
                    })
            except Exception as e:
                print(f"Error fetching weather for {city}: {e}")
                
        return results