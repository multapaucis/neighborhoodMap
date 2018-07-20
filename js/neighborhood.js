//Google Map Functionality
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.920541, lng: -105.086650},
        zoom: 12
      });

    for (var i = 0; i < locations.length; i++) {
    //Create a marker for the location
        var marker = new google.maps.Marker({
            position: locations[i].latlng,
            title: locations[i].name,
            animation: google.maps.Animation.DROP,
            id:i
          });
        marker.setMap(map);
    }
};




//Knockout Functionality

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
        //Add location to list as KO Object
        self.locationList.push( new Location(locItem));


    });

    this.selectLocation = function(location) {
        //Place holder
        console.log("Selected");
    }

}


ko.applyBindings(ViewModel());