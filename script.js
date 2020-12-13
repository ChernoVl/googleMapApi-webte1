//======================================================
const feiLocation = {lat: 48.1518531, lng: 17.073345};
let myMap;
const locationsList = [
    {lat: 48.154157, lng: 17.075152},
    {lat: 48.154630, lng: 17.074401},
    {lat: 48.154606, lng: 17.075808},
    {lat: 48.154123, lng: 17.076844},
    {lat: 48.148312, lng: 17.071956},
    {lat: 48.147970, lng: 17.072429}
]

//======================================================
function initMap() {
    //инициализация карты на галвном маркере с зумом 16
    myMap = new google.maps.Map(document.getElementById('googleMap'), {
        zoom: 16,
        mapTypeControl: false,
        center: feiLocation, //uluru,
    });

    // обозначаем маркер
    const marker = new google.maps.Marker({
        position: feiLocation, //uluru,
        map: myMap,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            labelOrigin: new google.maps.Point(75, 32),
            size: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
        },
        label: {text: "FEI STU", color: "#C70E20", fontWeight: "bold"},
        title: "FEI STU",
    });

    //вікно інформації
    const info = new google.maps.InfoWindow({
       content: "<b>Latitude:</b> " + feiLocation.lat + " <b>Longitude:</b> " + feiLocation.lng,
    });
    //виводимо вікно інформації при натисканні на маркер
    marker.addListener("click", ()=>{
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        info.open(myMap, marker);
    });

    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    var markers = locationsList.map(function (location, i) {
        return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
        });
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(myMap, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });
    //

    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById('streetView'), {
            position: feiLocation,
            pov: {
                heading: 0,
                pitch: -15,
            }
        });
    myMap.setStreetView(panorama);

    new AutocompleteDirectionsHandler(myMap);

}

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);

    var originInput = document.getElementById('departure');

    var modeSelector = document.getElementById('mode-selector');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    originAutocomplete.setFields(['place_id']);

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-driving', 'DRIVING');
    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
    let radioButton = document.getElementById(id);
    let me = this;

    radioButton.addEventListener('click', () => {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    let me = this;
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', function () {
        let place = autocomplete.getPlace();

        if (place.place_id) {
            if (mode === 'ORIG') {
                me.originPlaceId = place.place_id;
                me.destinationPlaceId = "ChIJky-5POyLbEcRvSyAsBN7Zv8";
            }
            me.route();
        }
    });
};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    let me = this;

    this.directionsService.route(
        {
            origin: {'placeId': this.originPlaceId},
            destination: {'placeId': this.destinationPlaceId},
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
                me.directionsRenderer.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
};