//Google Map Functionality
var map;
var markers = [];
var largeInfowindow = null;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.920541, lng: -105.086650},
        zoom: 11
      });
    largeInfowindow = new google.maps.InfoWindow();
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
            populateInfoWindow(this, largeInfowindow);
        })
        markers.push(marker);
        marker.setMap(map);
    }
};

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var weatherData = getWeather(marker.position);
        var weather = weatherData[0];
        var temp = weatherData[1];
        var safety = safeTemp(temp);
        //console.log(weather);
        infowindow.setContent('<div class="info">' + marker.title +'<br>'+ weather+
        " " +temp+ ' degrees<br>' +safety+ '</div>');
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    };
  };

function getWeather(position) {
    //Retrieve Location information from Marker
    var lat = position.lat();
    var lng = position.lng();
    //Retrieve Location Key
    var locKey = null;
     $.ajax({
        type: 'GET',
        url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?",
        dataType: 'json',
        success: function(results) {
            locKey = results['Key'];
        },
        data: {
            "apikey": "4jAd6Gz60fmd8Q1vCn238AswWOjdZtzt",
            "q": lat + "," + lng
        },
        async: false
    });
    //Retrieve Location Weather information
    var weatherText = null;
    var weatherTemp = null;
    var weatherURL = "http://dataservice.accuweather.com/currentconditions/v1/" + locKey
     $.ajax({
        type: 'GET',
        url: weatherURL,
        dataType: 'json',
        success: function(results) {
            console.log(results[0]);
            weatherText = results[0]['WeatherText'];
            weatherTemp = results[0]['Temperature']['Imperial']['Value'];
        },
        data: {
            "apikey": "4jAd6Gz60fmd8Q1vCn238AswWOjdZtzt",
            "q": lat + "," + lng
        },
        async: false
    });
    return [weatherText, weatherTemp];

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
}


/*var infoWindowData = function(data) {
    this.title = ko.observable(data.title);
    this.weather = ko.observable(data.weather);
    this.temp = ko.observable(data.temp + ' degrees');
    this.recommend = ko.computed(function(){
        var currentTemp = this.temp();
        var safetyRating = null;
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
    }, this);
}
*/
var ViewModel = function(){
    var self = this;

    self.locationList = ko.observableArray([]);
    self.availableCities = ko.observableArray(['Show All Parks']);
    self.listShowing = ko.observable(true);
    self.chosenCity = ko.observable('Show All Parks');

    locations.forEach(function(locItem){
        //Add location to list as KO Object
        self.locationList.push( new Location(locItem));
        //Add cities of locations to available cities list
        if (self.availableCities.indexOf(locItem.city) == -1) {
            self.availableCities.push(locItem.city);
        };
    });


    /*self.currentInfo = null;
    self.createMarkers = function() {
        var largeInfowindow = new google.maps.InfoWindow();
        for (var i = 0; i < self.locationList.length; i++) {
        //Create a marker for the location
            if (locationList[i].showing) {
                var marker = new google.maps.Marker({
                    position: locationList[i].latlng,
                    title: locationList[i].name,
                    animation: google.maps.Animation.DROP,
                    id:i
                  });
                marker.addListener('click', function() {
                    ViewModel.setInfoWindow(this, largeInfowindow);
                })
                markers.push(markers);
                marker.setMap(map);
            };
        };
    };*/
    //self.createMarkers();
    self.selectLocation = function(location) {
        //Find Marker that matches location
        markers.forEach(function(mark){
            if (mark.title == location.locName()) {
                populateInfoWindow(mark, largeInfowindow);
            };
        })
    };
    self.hideList = function() {
        self.listShowing(false);
    };
    self.showList = function() {
        self.listShowing(true);
    };
    self.showPark = function(city) {
        if (chosenCity() == 'Show All Parks') {
            return true;
        } else if (city() == chosenCity()){
            return true;
        } else {
            return false;
        }
    };
    /*self.getWeather = function(position) {
        //Retrieve Location information from Marker
        var lat = position.lat();
        var lng = position.lng();
        //Retrieve Location Key
        var locKey = null;
         $.ajax({
            type: 'GET',
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?",
            dataType: 'json',
            success: function(results) {
                locKey = results['Key'];
            },
            data: {
                "apikey": "4jAd6Gz60fmd8Q1vCn238AswWOjdZtzt",
                "q": lat + "," + lng
            },
            async: false
        });
        //Retrieve Location Weather information
        var weatherText = null;
        var weatherTemp = null;
        var weatherURL = "http://dataservice.accuweather.com/currentconditions/v1/" + locKey
         $.ajax({
            type: 'GET',
            url: weatherURL,
            dataType: 'json',
            success: function(results) {
                console.log(results[0]);
                weatherText = results[0]['WeatherText'];
                weatherTemp = results[0]['Temperature']['Imperial']['Value'];
            },
            data: {
                "apikey": "4jAd6Gz60fmd8Q1vCn238AswWOjdZtzt",
                "q": lat + "," + lng
            },
            async: false
        });
        return [weatherText, weatherTemp];
    }
    self.setCurrentInfo =function(marker) {
            var weatherData = self.getWeather(marker.position);
            var weatherSum = weatherData[0];
            var curTemp = weatherData[1];
            var safety = safeTemp(temp);
            self.currentInfo( new infoWindowData(
                {
                    title: marker.title,
                    weather: weatherSum,
                    temp: curTemp
            }));

    };


    self.setInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            self.setCurrentInfo(marker);
            //contensole.log(weather);
            infowindow.setContent('<div data-bind:"with: self.currentInfo()">' +
                '<div data-bind="text: title></div>' +
                '<div data-bind="text: weather></div>' +
                '<div data-bind="text: temp</div>' +
                '<div data-bind="text: recommend></div>' +
                '</div>');
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        };
    }*/

}


ko.applyBindings(ViewModel());