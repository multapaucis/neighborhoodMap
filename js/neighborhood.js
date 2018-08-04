//Google Map & Markers Set Up
var map;
var markers = [];
var infowindow = null;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.920541, lng: -105.086650},
        zoom: 11
      });
    infowindow = new google.maps.InfoWindow();
    createMarkers();
};

function createMarkers() {

    for (var i = 0; i < locations.length; i++) {
    //Create a marker for the location
        var marker = new google.maps.Marker({
            position: locations[i].latlng,
            title: locations[i].name,
            animation: google.maps.Animation.DROP,
            id:i
          });
        marker.addListener('click', function() {
            populateInfoWindow(this);
        })
        //adds marker to the list
        markers.push(marker);
        //Assigns the Marker to the current Map
        marker.setMap(map);
    }
};

function populateInfoWindow(marker) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        prepInfowindow(marker);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    };
  };

function prepInfowindow(marker) {
    //Retrieve Location information from Marker
    var lat = marker.position.lat();
    var lng = marker.position.lng();
    var infoTemplate = '<div class="info"><strong>' + marker.title +'</strong>';

    //Retrieve Location Key
    var locKey = null;
     $.ajax({
        type: 'GET',
        url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?",
        dataType: 'json',
        data: {
            "apikey": "4jAd6Gz60fmd8Q1vCn238AswWOjdZtzt",
            "q": lat + "," + lng
        },
        async: true
    }).done( function(results){
        locKey = results['Key'];
        getWeather(locKey, infoTemplate);
    }).fail( function(){
        infoTemplate += '<br>' + 'Unable to Retrieve Weather Data</div>';
        infowindow.setContent(infoTemplate);
        return infoTemplate;
    });
};

function getWeather(locKey, infoTemplate) {
    //Retrieve Location Weather information
    var weatherText = null;
    var weatherTemp = null;
    var weatherURL = "http://dataservice.accuweather.com/currentconditions/v1/" + locKey;
    $.ajax({
        type: 'GET',
        url: weatherURL,
        dataType: 'json',
        data: {
            "apikey": "4jAd6Gz60fmd8Q1vCn238AswWOjdZtzt"
        },
        async: true
    }).done( function(results){
            weatherText = results[0]['WeatherText'];
            weatherTemp = results[0]['Temperature']['Imperial']['Value'];
            var safety = safeTemp(weatherTemp);
            infoTemplate += '<br>'+ weatherText+ " at " +weatherTemp+ ' degrees<br>' +safety+ '</div>';
            infowindow.setContent(infoTemplate);
            return infoTemplate;
    }).fail( function(){
        infoTemplate += '<br>' + 'Unable to Retrieve Weather Data</div>';
        infowindow.setContent(infoTemplate);
        return infoTemplate;
    });

};

function safeTemp(currentTemp) {
    safetyRating = null;
    if (currentTemp < 32) {
        safetyRating = "Too Cold";
    } else if (currentTemp < 40) {
        safetyRating = "Careful It's Getting Cold";
    } else if (currentTemp < 75) {
        safetyRating = "Perfect Temp for Play";
    } else if (currentTemp < 85) {
        safetyRating = "Careful It's Getting Hot";
    } else {
        safetyRating = "Too Hot";
    };
    return safetyRating;
};


//Knockout Functionality

var locations = [
    {
        name: "Broomfield Commons Dog Park",
        latlng: {lat: 39.938591, lng: -105.052724},
        city: "Broomfield"
    },
    {
        name: "Louisville Community Dog Park",
        latlng: {lat: 39.970812, lng: -105.130995},
        city: "Louisville"
    },
    {
        name: "Big Dry Creek Dog Park",
        latlng: {lat: 39.927925, lng: -105.008040},
        city: "Broomfield"
    }
]

var Location = function(data){
    this.locName = ko.observable(data.name);
    this.locLatLng = ko.observable(data.latlng);
    this.city = ko.observable(data.city);
    this.showing = ko.observable(true);
    this.marker = null;
}


var ViewModel = function(){
    var self = this;

    //Create Observable Array of Locations
    self.locationList = ko.observableArray([]);
    //Start page with list of parks showing
    self.listShowing = ko.observable(true);
    //Create Observable array of Cities for the Filter
    self.availableCities = ko.observableArray(['Show All Parks']);
    self.chosenCity = ko.observable('Show All Parks');
    //Add all locations to the Observable Array as KO Objects
    locations.forEach(function(locItem){
        var newLoc = new Location(locItem)
        markers.forEach(function(mark){
            console.log(mark);
            if (mark.title == newLoc.locName()){
                console.log(mark);
                newLoc.marker(mark);
            };
        })
        self.locationList.push(newLoc);

        //Add cities of locations to available cities list if not already included
        if (self.availableCities.indexOf(newLoc.city()) == -1) {
            self.availableCities.push(newLoc.city());
        };
    });

    self.selectLocation = function(location) {
        //Find Marker that matches location
        markers.forEach(function(mark){
            if (mark.title == location.locName()) {
                //If it matches show Info Window
                populateInfoWindow(mark);
            };
        })
        updateMarkers();
    };
    self.hideList = function() {
        self.listShowing(false);
    };
    self.showList = function() {
        self.listShowing(true);
    };
    self.showPark = function(city, showing) {
        var toShow = null;
        if (chosenCity() == 'Show All Parks') {
            toShow = true;
            showing(true);
        } else if (city() == chosenCity()){
            toShow = true;
            showing(true);
        } else {
            toShow = false;
            showing(false);
        }
        return toShow;
    };
    self.updateMarkers = function() {
        console.log(locationList());
    };

}


ko.applyBindings(ViewModel());