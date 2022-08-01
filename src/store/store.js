import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

var translation = {
  "New Tests": "new_tests",
  "New Tests per Thousand": "new_tests_per_thousand",
  "New Cases": "new_cases",
  "New Cases per Million": "new_cases_per_million",
  "New Cases smoothed per Million": "new_cases_smoothed_per_million",
  "Total Cases": "total_cases",
  "Total Cases per Million": "total_cases_per_million",
  "New Deaths": "new_deaths",
  "New Deaths per Million": "new_deaths_per_million",
  "New Deaths smoothed per Million": "new_deaths_smoothed_per_million",
  "Total Deaths": "total_deaths",
  "New Vaccinations": "new_vaccinations",
  "New Vaccinations smoothed per Million": "new_vaccinations_per_million",
  "People Vaccinated": "people_vaccinated",
  "People Vaccinated per Hundred": "people_vaccinated_per_hundred",
  "Total Boosters": "total_boosters",
  "Total Boosters per Hundred": "total_boosters_per_hundred",
  "ICU Patients": "icu_patients",
  "ICU Patients per Million": "icu_patients_per_million",
  "Weekly Hospital Admissions": "weekly_hosp_admissions",
  "Weekly Hospital Admissions per Million": "weekly_hosp_admissions_per_million",
  "Stringency Index": "stringency_index",
  "Aged 65 and older": "aged_65_older",
  "Aged 70 and older": "aged_70_older",
  "Cardiovascular Death Rate": "cardiovasc_death_rate",
  "Diabetes Prevalence": "diabetes_prevalence",
  "Female Smokers": "female_smokers",
  "Male smokers":"male_smokers",
  "Hospital Beds per Thousand":"hospital_beds_per_thousand",
  "GDP per Capita":"gdp_per_capita",
  "Life Expectancy": "life_expectancy",
  "Median Age": "median_age",
  "Extreme Poverty": "extreme_poverty",
  "Human Development Index":"human_development_index",
  "Population Density":"population_density",
}

const store = new Vuex.Store({
  state: {
    selectedIntDate: 2, //needed for loading data more efficiently
    selectedDate: "2020-01-01",
    selectedMetric: "New Cases",
    selectedMetricX: "New Cases",
    selectedMetricY: "Life Expectancy",
    covidData: [],
    covidDataAtDate: [],
    covidDataAllDates: [],
    covidDataAtDateXY: [],
    selectedColors: ["#FFBCD1","#CE7BB0","#A267AC","#6867AC"],
    selectedCountries: [],
    drawnCountries: [],
    covidDataMaxAtMetric: [],
    BoxState: false,
    BoxStateX: false,
    BoxStateY: false,
  },
  mutations: {
    changeSelectedMetric (state, metric) {
      state.selectedMetric = metric;
    },
    changeSelectedMetricX (state, metric) {
      state.selectedMetricX = metric;
    },
    changeSelectedMetricY (state, metric) {
      state.selectedMetricY = metric;
    },
    changeSelectedDate (state, date) {
      state.selectedDate = date;
    },  
    changeSelectedIntDate (state, date) {
      state.selectedIntDate = date;
    }, 
    changeSelectedCountries (state, countries) {
      state.selectedCountries = countries;
    },
    changeDrawnCountries (state, countries) {
      state.drawnCountries = countries;
    },
    changeBoxState (state, val) {
      state.BoxState = val;
    },
    changeBoxStateX (state, val) {
      state.BoxStateX = val;
    },
    changeBoxStateY (state, val) {
      state.BoxStateY = val;
    },
  },
  getters: {
    selectedMetricX: (state) => state.selectedMetricX,
    selectedMetricY: (state) => state.selectedMetricY,
    BoxState: (state) => state.BoxState,
    BoxStateX: (state) => state.BoxStateX,
    BoxStateY: (state) => state.BoxStateY,
    selectedCountries: (state) => state.selectedCountries,
    drawnCountries: (state) => state.drawnCountries,
    selectedColors: (state) => state.selectedColors,
    selectedDate: (state) => state.selectedDate,
    selectedIntDate: (state) => state.selectedIntDate,
    selectedMetric: (state) => state.selectedMetric,

    covidDataAtDate (state) {
      let result = [];
      Object.keys(state.covidData).forEach(key => {
        var y = state.covidData[key].data.length
        var z = 748 //total number of days up to the 2022-01-16
        var x = state.selectedIntDate
        var idx = x - (z-y)
        if (idx > 0 && state.covidData[key].data[idx][translation[state.selectedMetric]] >= 0) {
            result.push({
              country: state.covidData[key].location,
              value: state.covidData[key].data[idx][translation[state.selectedMetric]]
            })   
        }
        else if (idx > 0 && state.covidData[key].data[idx][translation[state.selectedMetric]] < 0) {
          result.push({
            country: state.covidData[key].location,
            value: 0
          }) 
        }
        else{
          result.push({
            country: state.covidData[key].location,
            value: NaN
          }) 
        }
      });
      return result;
    },
    covidDataAllDates (state) {
      let result = [];
      for (let i = 0; i < state.selectedCountries.length; i++) { //the more countries are selected the slower this goes!
        let country_result = [];
        for (let j = 0; j < state.covidData[state.selectedCountries[i]].data.length; j++) {
          country_result.push(state.covidData[state.selectedCountries[i]].data[j][translation[state.selectedMetric]])
        }
        result.push(country_result)
      }
      return result;
    },
    covidDataMaxAtMetric (state) {

      var maxvals = []
      var topfive = []
      if (state.BoxState == true) {
        Object.keys(state.covidData).forEach(key => {
          var max = null;
          var c;
          var date;
          for (let i = 0; i < state.covidData[key].data.length; i++) {
            if (state.covidData[key].data[i][translation[state.selectedMetric]] > max) {
              max = state.covidData[key].data[i][translation[state.selectedMetric]]
              c = state.covidData[key].location
              date = state.covidData[key].data[i].date
            }
          }
          maxvals.push({value: max, country: c, date: date})
        })
        topfive = maxvals.sort((a,b) => b.value-a.value).slice(0,5);
      }
      return topfive
    },
    covidDataAtDateXY (state) {
      let result = [];
      var conts = ["Europe","Africa","Asia","Oceania","North America","South America"]
      var colors = ["#ffadad","#ffd6a5","#caffbf","#9bf6ff","#bdb2ff","#ffc6ff"]
      var hi = 1444216102
      var fac = hi / 100000 // 100000 is where log10 will result in 5, so i map china pop to rad = 5
      Object.keys(state.covidData).forEach(key => {
        var y = state.covidData[key].data.length
        var z = 748 //total number of days up to the 2022-01-17
        var x = state.selectedIntDate
        var j
        var idx = x - (z-y) 
        for (let i = 0; i < colors.length; i++) {
          if (conts[i] == state.covidData[key].continent) {
            j = i
            break
          }
        }

        if (idx > 0 && state.covidData[key].data[idx][translation[state.selectedMetricX]] < 0) { //deal with negative numbers
          result.push({
              country: state.covidData[key].location,
              xmetric: NaN,
              ymetric: state.covidData[key][translation[state.selectedMetricY]],
              xname: translation[state.selectedMetricX],
              yname: translation[state.selectedMetricY],
              contc: colors[j],
              popr: 0,
              iso_a3: key
            })   
        }
        else if (idx > 0 && state.covidData[key].data[idx][translation[state.selectedMetricX]] > 0) {
            if (state.covidData[key][translation[state.selectedMetricY]] <= 0 || state.covidData[key][translation[state.selectedMetricY]] == undefined) { //deal with undefined and non pos values in y metric
                result.push({
                country: state.covidData[key].location,
                xmetric: state.covidData[key].data[idx][translation[state.selectedMetricX]],
                ymetric: NaN,
                xname: translation[state.selectedMetricX],
                yname: translation[state.selectedMetricY],
                contc: colors[j],
                popr: 0,
                iso_a3: key
                })
            }
            else {
                result.push({
                country: state.covidData[key].location,
                xmetric: state.covidData[key].data[idx][translation[state.selectedMetricX]],
                ymetric: state.covidData[key][translation[state.selectedMetricY]],
                xname: translation[state.selectedMetricX],
                yname: translation[state.selectedMetricY],
                contc: colors[j],
                popr: Math.log10(state.covidData[key].population / fac),
                iso_a3: key
                }) 
            }  
        }
        else if (idx > 0 && state.covidData[key].data[idx][translation[state.selectedMetricX]] == 0) { //deal with log 0 problem and undefined
            result.push({
              country: state.covidData[key].location,
              xmetric: NaN,
              ymetric: state.covidData[key][translation[state.selectedMetricY]],
              xname: translation[state.selectedMetricX],
              yname: translation[state.selectedMetricY],
              contc: colors[j],
              popr: 0,
              iso_a3: key
            }) 
        }
      });
      return result;
    },

  },
  actions: {
    loadData({state}) {
      d3.json('./owid-covid-data-corrected.json').then((data) => { 
        state.covidData = data;
      })
    },
  }
})

export default store;
