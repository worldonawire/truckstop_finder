import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import {usStateCoords, stateInitials} from "../src/utils/stateCoords";
import _ from "lodash";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    locations: [],
    zoomOnStateToggle: false,
    zoomOnStopToggle: false,
    clientLocation: "",
    availableTruckstops: [], 
    center: { lat: 39.5, lng: -98.35 },
    zoom: 5,
    filterPage: false,
    detailsPage: false,
    chosenTruckStop: {},
    filterPageDetails: false,
    tempLocations: [],
    formInfo: {
      "Cash Accepted": null
    },
    selectedPhoto: null,
    allPhotos: [
      require('@/assets/images/photo1.jpg'), 
      require('@/assets/images/photo2.jpg'), 
      require('@/assets/images/photo3.jpg'), 
      require('@/assets/images/photo4.jpg'), 
      require('@/assets/images/photo5.jpg'), 
      require('@/assets/images/photo6.jpg'), 
      require('@/assets/images/photo7.jpg'), 
      require('@/assets/images/photo8.jpg'), 
      require('@/assets/images/photo9.jpg'), 
      require('@/assets/images/photo10.jpg'), 
      require('@/assets/images/photo11.png'), 
      require('@/assets/images/photo12.jpg'), 
      require('@/assets/images/photo13.gif'), 
      require('@/assets/images/photo14.jpg'), 
      require('@/assets/images/photo15.jpg'), 
      require('@/assets/images/photo16.jpg'), 
      require('@/assets/images/photo17.png'), 
      require('@/assets/images/photo18.jpg'), 
      require('@/assets/images/photo19.jpg') 
      
    ],

    defaultLocation: {
      amenities: ["24-Hour Road Service", "Open 24-Hours", "Copy & Fax Service", "Wireless Internet", "ATM",  "Overnight Parking", "Parking Spaces", "Private Showers", "Light Mechanical" ],
      restaurants: ["FlyingK Subs Burritos", "Subway", "McDonald's", "Arby's", "Chester's", "Godfather's Pizza", "Del Taco", "Taco Bell", "Wendy's"],
      payments: ["FlyingK Express", "All Major Credit Cards", "Cash Accepted", "EBT/SNAP", "Multiservice", "T-Chek"]
    },
    chosenIcon: "",
    displayIconName: false,
  },

  mutations: {
    setLocation(state, payload) {
      state.clientLocation = stateInitials[payload];
    },

    setLocations(state, locations) {
      state.locations = locations;
    },
         
    zoomOnState(state) {
      state.center = usStateCoords[state.clientLocation];
      state.zoom = 7;
      state.zoomOnStateToggle = true;
    },
    zoomOnStop(state) {
      state.center = {
        lat: state.chosenTruckstop.position.lat,
        lng: state.chosenTruckstop.position.lng
      };
      state.zoom = 14;
      state.zoomOnStopToggle = true;
    },
    filterDetails(state) {
      if (state.filterPage) {
        state.filterPage = false;
      } else {
        state.filterPage = true;
      }
    },
    detailsPageCall(state, payload) {
      state.chosenTruckstop = payload
      state.detailsPage = true;
    },
    populateFilterPage(state) { 
      state.filterPageDetailsToggle = true;   
    },
    truckStopsBack(state){
      state.locations = [];
      state.zoomOnStateToggle = false;
      state.zoomOnStopToggle = false;
      state.clientLocation = "";
      state.availableTruckstops = [];
      state.center = { lat: 39.5, lng: -98.35 };
      state.zoom = 5;
      state.filterPage = false;
      state.detailsPage = false;
    },
    truckStopsInfoBack(state){
      state.zoomOnStateToggle = true;
      state.zoomOnStopToggle = false;
      state.center= {
        lat: state.chosenTruckstop.position.lat,
        lng: state.chosenTruckstop.position.lng
      };
      state.zoom = 7;
      state.filterPage = false;
      state.detailsPage = false;
      state.chosenTruckstop = {};
    },
    submitData(state, value ) {
      state.formInfo["Cash Accepted"] = value;
    },
   
    selectPhoto(state, allPhotos) {
      let randomIndex = Math.floor(Math.random() * state.allPhotos.length);
      state.selectedPhoto = state.allPhotos[randomIndex];
      console.log(state.selectedPhoto);
    },

    clearAllFilters(state) {
      state.locations = state.tempLocations;
    },

    filterStops(state, payload) {      
      state.tempLocations = state.locations;
      let filteredLocations = [];
      let temp1 = [];
      let flag = true
      
      for (let el of state.locations) {

        flag = true

        for (let i = 0; i < payload.amenities.length; i++) {
          if (el.amenities.includes(payload.amenities[i])) {
          } else {
            flag = false
          }
        } 
        if (flag) {
          temp1.push(el)
        }
      }

      for (let i=0; i<temp1.length;i++) {
        flag = true

        for (let i=0; i < payload.payments.length; i++) {
          console.log("temp1 is")
          console.log(temp1)
          if (temp1[i].payments.includes(payload.payments[i])) {
          } else {
            flag = false
          }
        }
        if (!flag) {
          temp1.splice(temp1[i])
        }
      }

      
      for (let i=0; i < temp1.length; i++) {
        flag = true

        for (let i=0;i < payload.restaurants.length; i++) {
          if (temp1[i].restaurants.includes(payload.restaurants[i])) {
          } else {
            flag = false
          }
        }
        if (!flag) {
          temp1.splice(temp1[i])
        }
      }

      if (temp1.length) {
        filteredLocations = [...filteredLocations, ...temp1,];
      } 
      state.locations = filteredLocations;
      console.log("the final filterlocations is", filteredLocations)
    },

    displayIconDetail(state, iconName) {
      state.chosenIcon = iconName;
      state.displayIconName = !state.displayIconName;
    }
    
  },

  actions: {
    async loadMarkers({ commit }) {
      try {
        const { data: locations } = await axios.get(`/api/?state=${this.state.clientLocation}`); // ES6 destructuring & aliasing
        const markers = locations.map((location) => ({
          position: {
            lat: location.latitude,
            lng: location.longitude
          },
          name: location.name,
          address: location.address,
          state: location.state,
          city: location.city,
          amenities: location.amenities,
          payments: location.payments,
          restaurants: location.restaurants,
          type: location.type,
          defaultAnimation: 2,
        }));
        commit("setLocations", markers);
        } catch (err) {
        console.error(err);
      }
    },
  },
 
});
