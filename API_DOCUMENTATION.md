# WeatherNow API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## Weather Endpoints

### Get Current Weather

**GET** `/api/weather`

Fetches current weather data for a city or coordinates.

**Query Parameters:**

| Parameter | Type   | Required | Description                                |
|-----------|--------|----------|--------------------------------------------|
| city      | string | Yes*     | City name (e.g., "London" or "London,GB") |
| lat       | number | Yes*     | Latitude coordinate                        |
| lon       | number | Yes*     | Longitude coordinate                       |
| units     | string | No       | "metric" (default) or "imperial"           |

*Either `city` OR both `lat` and `lon` are required.

**Example Request:**
```bash
curl "http://localhost:3000/api/weather?city=London&units=metric"
```

**Example Response:**
```json
{
  "coord": { "lon": -0.1257, "lat": 51.5085 },
  "weather": [
    {
      "id": 803,
      "main": "Clouds",
      "description": "broken clouds",
      "icon": "04d"
    }
  ],
  "main": {
    "temp": 15.2,
    "feels_like": 13.8,
    "temp_min": 13.5,
    "temp_max": 17.1,
    "pressure": 1013,
    "humidity": 72
  },
  "visibility": 10000,
  "wind": { "speed": 4.12, "deg": 240, "gust": 7.2 },
  "clouds": { "all": 75 },
  "dt": 1699123200,
  "sys": { "country": "GB", "sunrise": 1699102800, "sunset": 1699138800 },
  "timezone": 0,
  "name": "London"
}
```

**Error Responses:**
- `400` - Missing parameters or invalid input
- `404` - City not found
- `401` - Invalid API key
- `429` - Rate limit exceeded
- `500` - Server error

---

### Get 5-Day Forecast

**GET** `/api/forecast`

Fetches 5-day weather forecast data (3-hour intervals).

**Query Parameters:**

| Parameter | Type   | Required | Description                                |
|-----------|--------|----------|--------------------------------------------|
| city      | string | Yes*     | City name                                  |
| lat       | number | Yes*     | Latitude coordinate                        |
| lon       | number | Yes*     | Longitude coordinate                       |
| units     | string | No       | "metric" (default) or "imperial"           |

**Example Request:**
```bash
curl "http://localhost:3000/api/forecast?city=London&units=metric"
```

---

### Search Cities (Geocoding)

**GET** `/api/geocode`

Search for cities by name (autocomplete/suggestions).

**Query Parameters:**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| q         | string | Yes      | Search query (min 2 chars)|

**Example Request:**
```bash
curl "http://localhost:3000/api/geocode?q=Lon"
```

**Example Response:**
```json
[
  {
    "name": "London",
    "lat": 51.5085,
    "lon": -0.1257,
    "country": "GB",
    "state": "England"
  }
]
```

---

## Search History Endpoints

### Get Search History

**GET** `/api/search-history`

Returns the 50 most recent search entries.

**Example Request:**
```bash
curl "http://localhost:3000/api/search-history"
```

### Clear Search History

**DELETE** `/api/search-history`

Clears all or a specific search history entry.

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| id        | string | No       | Specific entry ID to delete. If omitted, clears all. |

---

## Favorites Endpoints

### Get Favorites

**GET** `/api/favorites`

Returns all favorite cities.

### Add Favorite

**POST** `/api/favorites`

**Request Body:**
```json
{
  "city": "London",
  "country": "GB",
  "latitude": 51.5085,
  "longitude": -0.1257
}
```

### Remove Favorite

**DELETE** `/api/favorites?id={id}`

Removes a favorite city by ID.

---

## Analytics Endpoint

### Get Analytics

**GET** `/api/analytics`

Returns aggregated search analytics data.

**Response:**
```json
{
  "totalSearches": 42,
  "mostSearchedCities": [
    { "city": "London", "count": 12 },
    { "city": "New York", "count": 8 }
  ],
  "searchesPerDay": [
    { "date": "2024-01-15", "count": 5 },
    { "date": "2024-01-16", "count": 8 }
  ],
  "recentSearches": [
    {
      "id": "clx...",
      "city": "London",
      "country": "GB",
      "createdAt": "2024-01-16T10:30:00.000Z"
    }
  ]
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
| Code               | HTTP Status | Description                          |
|--------------------|-------------|--------------------------------------|
| MISSING_PARAMS     | 400         | Required parameters missing          |
| INVALID_INPUT      | 400         | Invalid input provided               |
| CITY_NOT_FOUND     | 404         | City not found                       |
| INVALID_API_KEY    | 401         | Invalid OpenWeatherMap API key       |
| RATE_LIMIT         | 429         | API rate limit exceeded              |
| MISSING_API_KEY    | 500         | OpenWeatherMap API key not configured|
| DB_ERROR           | 500         | Database operation failed            |
| DUPLICATE          | 409         | Duplicate entry (favorites)          |
| INTERNAL_ERROR     | 500         | Internal server error                |
