var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.920541, lng: -105.086650},
        zoom: 12
      });
    };

var locations = [
    {
        name: "Broomfield Commons Dog Park",
        latlng: {lat: 39.938591, lng: -105.052724},
    },
    {
        name: "Louisville Community Dog Park",
        latlng: {lat: 39.970812, lng: -105.130995},
    }
]

var Location = function(data){
    this.locName = ko.observable(data.name);
    this.locLatLng = ko.observable(data.latlng);
}

var ViewModel = function(){
    var self = this;

    this.locationList = ko.observableArray([]);

    locations.forEach(function(locItem){
        self.locationList.push( new Location(locItem));
    });

    this.selectLocation = function(location) {
        //Place holder
        console.log("Selected");
    }

}


ko.applyBindings(ViewModel());