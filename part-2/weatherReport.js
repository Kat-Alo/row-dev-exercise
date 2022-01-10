//change display data based on dropdown selection
function handleSelection(e, data) {
    //default to Palo Alto
    let thisCity = e ? e.target.value : "Palo Alto"

    /*Not an ideal method for validating data — not super resilient to changes to the field names changing, for instance
    but at least doesn't assume the index will always be consistent*/
    const isCity = (item) => item.geoloc.city == thisCity;
    let cityIndex = data.cities.findIndex(isCity);

    /*Not great for a lot of cases to set the HTML of a div rather than call element creations,
    but I think it's more succint and readable for this case? — could be persuaded otherwise*/

    //current conditions
    const currentContainer = document.getElementById("current");            
    const currentConditionsHtml = `
        <h2>Current Conditions in ${thisCity}</h2>
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
        let thisHtml = `<div><span class=\"category\"/>${day.day}:</span><span class=\"weather-details\"> ${day.daycondition}</span></div>`;
        forecastHtml += thisHtml;
    })
    forecastContainer.innerHTML = forecastHtml;
};

//add city selections to dropdown
function weatherJsonpCallback(data){
    //add cities to the dropdown menu
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

    //but should default to Palo Alto
    handleSelection(null, data);

	
};

//equips the data loader with the data source info
function addDataLoader(){
	const dataLoadScript = document.getElementById("data-loader");
	dataLoadScript.type = "text/javascript";
	dataLoadScript.src = "https://restofworld.org/wp-content/projects/code/exercise/data/weather.js?weatherJsonpCallback=weatherJsonpCallback";
};

// On load, ask the data-loader script to grab us some data        
document.body.onload = addDataLoader;

//determine if it's nighttime for the user so we can go into dark mode
let now = new Date();
let hour = now.getHours();
document.body.class = (hour < 8 || hour > 20) ? "darkmode" : "";





