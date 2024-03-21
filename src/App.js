import { useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}


function App() {
  const [location, setLocation] = useState('Lisbon');
  const [weather, setWeather] = useState({});


  async function getWeather(location) {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
      );
      const geoData = await geoRes.json();
      console.log(geoData);
  
      if (!geoData.results) throw new Error("Location not found");
  
      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      console.log(`${name} ${convertToFlag(country_code)}`);
  
      //Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData.daily)
      console.log(weather);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
    <h1>Heedrhiss Weather</h1>
    <input type="text" value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Enter a location"/>
    <button onClick={()=>getWeather(location)}>Get Weather</button>
    {weather.time && <Weather weather={weather} location={location}/>}
    </div>
  );
}

function Weather({weather, location}){
  const {
    temperature_2m_min: min,
    temperature_2m_max: max,
    time: date,
    weathercode: codes,
  } = weather;
  
  console.log(weather)
  return(
    <div> <h2>{location}</h2>
    <ul className="weather">
    {date.map((date, i)=> 
    <Day min={min[i]} max={max[i]} code={codes[i]} date={date} key={date} today={i=== 0}/>
    )}
    </ul>
    </div>
  )
}

function Day({min, max, code, date, today}){
 return <li className="day">
  <p>{getWeatherIcon(code)}</p>
  <p>{today ? "Today" : formatDay(date)}</p>
  <p>{Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;</p>
  </li>
}
export default App;
