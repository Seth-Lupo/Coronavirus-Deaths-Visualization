

var COUNTRY_CODE_LIST
var COUNTRY_DEATHS_LIST
var COUNTRY_DATA_LIST = []
var RAW_DATA

var tidy = (s) => {
	if (s == "Burma") return "Myanmar"
	if (s == "Cabo Verde") return "Cape Verde"
	if (s == "Congo (Brazzaville)") return "Congo"
	if (s == "Eswatini") return "Swaziland"
	if (s == "Korea, North") return "North Korea"
	if (s == "Saint Vincent and the Grenadines") return "Saint Vincent and The Grenadines"
	if (s == "Syria") return "Syrian Arab Republic"
	if (s == "Laos") return "Lao People's Democratic Republic"
	return s
}

var rename = (s) => {
	if (s == "Korea, North") return "North Korea"
	if (s == "US") return "United States"
	return s
}

var EXCLUDE = ["Diamond Princess", "MS Zaandam", "Summer Olympics 2020", "West Bank and Gaza", "Winter Olympics 2022"]

var requestCountries = function () {
	
	return new Promise(resolve => {

		$.ajax({

			url: "https://pomber.github.io/covid19/countries.json", 
			method: "GET",
			dataType: "json",
			headers: {},
			success: ((data) => {
				COUNTRY_CODE_LIST = data
				resolve()
			}),
			error: (() => {
				$("#loadingText")
				.text("API not working... please try again later.")
				resolve()
			}),

		})

	})
}

var requestDeaths = function () {
	
	return new Promise(resolve => {

		$.ajax({

			url: "https://pomber.github.io/covid19/timeseries.json", 
			method: "GET",
			dataType: "json",
			headers: {},
			success: ((data) => {
				COUNTRY_DEATHS_LIST = data
				resolve()
			}),
			error: (() => {
				$("#loadingText")
				.text("API not working... please try again later.")
				resolve()
			}),

		})

	})
}

var fetchData = function () {

	return new Promise((fulfill, reject) => {

		requestCountries().then(() => {
			requestDeaths().then(() => {
				
			
				
				for (let countryName of Object.keys(COUNTRY_DEATHS_LIST)) {
			
					if (!EXCLUDE.includes(countryName)) {	

						let deaths = COUNTRY_DEATHS_LIST[countryName].pop()["deaths"]
						
						COUNTRY_DATA_LIST.push({
							name: rename(countryName),
							image: "flags/" + COUNTRY_CODE_LIST[tidy(countryName)]["code"] + ".png",
							deaths: deaths
						})
						COUNTRY_DATA_LIST.sort((a, b) => Number(b.deaths) - Number(a.deaths));
					}
				}

				
				fulfill()

			})
		})
		
	})

}

