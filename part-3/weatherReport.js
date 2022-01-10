const manualTimerKey = 'manualTimeRemaining';
const autoTimerKey = 'autoTimeRemaining';
const dataTimestampKey = 'dataTimestamp';
const dataKey ='weatherData';
const timeAuto = 600000;
const timeManual = 300000;


//add cities to the dropdown menu
function createDropdown(data) {
    const selectCity = document.getElementById("cities")
    data.cities.forEach((c, i) => {
        let option = document.createElement("option");
        option.value = c.geoloc.city;
        option.innerHTML = c.geoloc.city;
        //default to PA
        if (c.geoloc.city == "Palo Alto") option.selected = true;
        selectCity.appendChild(option);
    })

    //display data should change with a new selection
    selectCity.onchange = (e) => handleSelection(e, data);
}

//change display data based on dropdown selection
function handleSelection(e, data) {
    //if there isn't any data passed, that means we need to grab it from session storage
    if (!data) {
        data = JSON.parse(window.sessionStorage.getItem(dataKey));
        let timestamp = window.sessionStorage.getItem(dataTimestampKey);
        document.getElementById("data-timestamp").innerHTML = `Data is current as of ${timestamp}`;        
    }

    let thisCity;
    //initial load, default to PA
    if (!e) {
        thisCity = "Palo Alto";
    //user selects new city
    } else if (e.type == "change") {
        thisCity = e.target.value;
    //reload before 5 minutes
    } else {
        thisCity = "Palo Alto";
        createDropdown(data);
    }

    //look for index of the selected city's data
    const isCity = (item) => item.geoloc.city == thisCity;
    let cityIndex = data.cities.findIndex(isCity);

    //current conditions
    const currentContainer = document.getElementById("current");       
    const currentConditionsHtml = `
        <h2>Current Conditions in ${thisCity}</h2>
        <img class=\"icon\" src=\"https://www.accuweather.com/images/weathericons/${data.cities[cityIndex].current[0].iconcode}.svg\"></img>
        <div><span class=\"category\"/>temp:</span><span class=\"weather-details\"> &#176;${data.cities[cityIndex].current[0].temp}</span></div>
        <div><span class=\"category\"/>condition:</span><span class=\"weather-details\"> ${data.cities[cityIndex].current[0].condition}</span></div>
    `;
    currentContainer.innerHTML = currentConditionsHtml;

    //forecast
    const forecastContainer = document.getElementById("forecast");
    let forecastHtml = `
        <h2>Forecast for ${thisCity}</h2>
    `;
    data.cities[cityIndex].weekly.map((day, index) => {
        let thisHtml = `<div><span class=\"category\"/>${day.weekday}:</span><span class=\"weather-details\"> ${day.daycondition}</span></div>`;
        forecastHtml += thisHtml;
    })
    forecastContainer.innerHTML = forecastHtml;
};

//handle data
function weatherJsonpCallback(data){

    //cache data
    window.sessionStorage.setItem(dataKey, JSON.stringify(data));

    //populate dropdown menu and give it functionality
    createDropdown(data);

    //populate page with Palo Alto data
    handleSelection(null, data);
	
};

//equips the data loader with the data source info
function addDataLoader(){
	const dataLoadScript = document.getElementById("data-loader");
	dataLoadScript.type = "text/javascript";
	dataLoadScript.src = "https://restofworld.org/wp-content/projects/code/exercise/data/weather.js?weatherJsonpCallback=weatherJsonpCallback";

    //show the reader when the data was last updated
    let timestamp = new Date;
    document.getElementById("data-timestamp").innerHTML = `Data is current as of ${timestamp}`;
    window.sessionStorage.setItem(dataTimestampKey, timestamp);
};

//counts down from time in miliseconds
function timeReload(timeRemaining) {

    function countdown(timeRemaining) {
        //probably don't need anything more precise on this timer than by the second
        timeRemaining -= 1000;
        if (timeRemaining >= 0) {
            window.sessionStorage.setItem(manualTimerKey, timeRemaining);
        } else {
            window.sessionStorage.removeItem(manualTimerKey);
            clearInterval(timer);           
        }
        return timeRemaining
    }

    //store the remaining time in case page gets refreshed
    window.sessionStorage.setItem(manualTimerKey, timeRemaining);
    let t = timeRemaining;

    //every second, store an updated countdown on the 5 minutes
    let timer = setInterval( function() {
        t = countdown(t, manualTimerKey);
    }, 1000);
}

//determines whether we should use cached data because it's been less than 5 minutes or pull again
window.addEventListener('load', function() {
    let timeRemainingManualReload = window.sessionStorage.getItem(manualTimerKey) || timeManual;
    timeReload(timeRemainingManualReload);
})

//auto refresh if user has been on the page longer than 10 minutes
window.addEventListener('load', function() {
    let timer = setInterval(function () {
        if (document.getElementById("data-loader")) document.getElementById("data-loader").src = "";
        addDataLoader();
    }, timeAuto);
});


let initialLoad = performance.navigation.type == performance.navigation.TYPE_NAVIGATE;
let fullReload = performance.navigation.type == performance.navigation.TYPE_RELOAD && !window.sessionStorage.getItem(manualTimerKey);

//initial load or it's been 5 minutes since last refresh
if (initialLoad || fullReload) {
    document.body.onload = addDataLoader;

//reload before 5 minutes
} else {
    document.body.onload = handleSelection;
};


//determine if it's nighttime for the user so we can go into dark mode
let now = new Date();
let hour = now.getHours();
document.body.class = (hour < 8 || hour > 20) ? "darkmode" : "";











