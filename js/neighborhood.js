//Model Data Set up
var map;
var infowindow = null;
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
    },
    {
        name: "Autrey Park",
        latlng: {lat: 39.935988, lng: -105.141188},
        city: "Superior"
    },
    {
        name: "Westminster Hills Dog Park",
        latlng: {lat: 39.887956, lng: -105.129233},
        city: "Westminster"
    },
    {
        name: "Jaycee Park",
        latlng: {lat: 39.889620, lng: -104.962615},
        city: "Northglenn"
    },
    {
        name: "The Great Bark Dog Park",
        latlng: {lat: 40.004287, lng: -105.075409},
        city: "Lafayette"
    }
]
//Creation of KO Object Template
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

    //initiate Google Map and Markers
    self.initMap = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 39.920541, lng: -105.086650},
            zoom: 11
        });
        infowindow = new google.maps.InfoWindow();
        //Call for creation of Markers
        self.createMarkers();
    }

    self.createMarkers = function() {
        //Add all locations to the Observable Array as KO Objects
        locations.forEach(function(locItem){
            var newLoc = new Location(locItem)
            //Add cities of locations to available cities list if not already included
            if (self.availableCities.indexOf(newLoc.city()) == -1) {
                self.availableCities.push(newLoc.city());
            };
            //Create a new marker for each location
            var marker = new google.maps.Marker({
                position: locItem.latlng,
                title: locItem.name,
                animation: google.maps.Animation.DROP,
                opacity: 0.7
            });
            //Opens InfoWindow when Marker is Clicked
            marker.addListener('click', function() {
                populateInfoWindow(this);
            })
            //Highlights marker on Mouseover
            marker.addListener('mouseover', function() {
                this.setOpacity(1);
            })
            marker.addListener('mouseout', function() {
                this.setOpacity(0.7);
            })
            //Assigns the Marker to the current Map
            marker.setMap(map);
            //adds marker to the location
            newLoc.marker = marker;
            // Ads the location to the Observable Array
            self.locationList.push(newLoc);
        })
    };

    self.populateInfoWindow = function(marker) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            self.prepInfowindow(marker);
            // Open the infowindow on the marker.
            infowindow.open(map, marker);
        };
    };
    self.prepInfowindow = function(marker) {
        //Retrieve Location information from Marker
        var lat = marker.position.lat();
        var lng = marker.position.lng();
        //Create a template for the info window HTML
        var infoTemplate = '<div class="info"><strong>' + marker.title +'</strong>';
        var weatherInfo = '<br>' + 'Unable to Retrieve Weather Data</div>';
        //Retrieve Location Key for the Accuweather API
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
            self.getWeather(locKey, infoTemplate);
        }).fail( function(){
            infowindow.setContent(infoTemplate + weatherInfo);
            return infoTemplate;
        });
    };
    self.getWeather = function(locKey, infoTemplate) {
        //Retrieve Location Weather information
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
                var weatherText = results[0]['WeatherText'];
                var weatherTemp = results[0]['Temperature']['Imperial']['Value'];
                var safety = self.safeTemp(weatherTemp);
                weatherInfo = '<br>'+ weatherText+ " at " +weatherTemp+ ' degrees<br>' +safety+ '</div>';
                infowindow.setContent(infoTemplate + weatherInfo);
                return infoTemplate;
        }).fail( function(){
            infowindow.setContent(infoTemplate + weatherInfo);
            return infoTemplate;
        });

    };
    self.safeTemp = function(currentTemp) {
        //Takes in Temperature and returns a text response
        safetyRating = null;
        if (currentTemp < 32) {
            safetyRating = "Too Cold for Dogs";
        } else if (currentTemp < 40) {
            safetyRating = "Careful It's Pretty Cold Out";
        } else if (currentTemp < 75) {
            safetyRating = "Perfect Temp for Play";
        } else if (currentTemp < 85) {
            safetyRating = "Careful It's Pretty Hot Out";
        } else {
            safetyRating = "Too Hot for Dogs";
        };
        return safetyRating;
    };
    self.selectLocation = function(location) {
        //Opens the infowindow when a location is selcted from the sidebar
        populateInfoWindow(location.marker);
    };
    self.hideList = function() {
        self.listShowing(false);
    };
    self.showList = function() {
        self.listShowing(true);
    };
    self.chosenCity.subscribe(function(){
        updateMarkers();
    });
    self.highlightMarker = function(location) {
        location.marker.setOpacity(1);
        //location.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    self.unhighlightMarker = function(location) {
        location.marker.setOpacity(0.7);
        //location.marker.setAnimation(null);
    }
    self.updateMarkers = function() {
        self.hideMarkers();
        locationList().forEach(function(loc){
            updateShowing(loc);
            if(loc['showing']() == true) {
                loc.marker.setMap(map);
                loc.marker.setAnimation(google.maps.Animation.DROP);
            }
        });
    };
    self.hideMarkers = function() {
        infowindow.close();
        locationList().forEach(function(loc){
            loc.marker.setMap(null);
        });
    };
    self.updateShowing= function(location) {
        if (chosenCity() == 'Show All Parks' || location.city() == chosenCity()) {
            location.showing(true);
        } else {
            location.showing(false);
        }
    };

}


ko.applyBindings(ViewModel());