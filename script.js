var map;
var infowindow;
var drawingManager;
var previousOverlay;
var markers;
var placesService;
var currentLocation;
var directionsService;
var directionsDisplay;
var cebu = {lat: 10.3342947, lng: 123.8859381};

function createMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: cebu,
        zoom: 13,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DEFAULT,
            position: google.maps.ControlPosition.TOP_LEFT
        },
    });

    infowindow = new google.maps.InfoWindow({ 
        map: map,
        maxWidth: 300
    });
    
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
              google.maps.drawing.OverlayType.CIRCLE,
              google.maps.drawing.OverlayType.RECTANGLE
          ]
        },
    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'overlaycomplete', drawingOverlayComplete);
    
    var request = {
        location : cebu,
        radius : 5000,
        type : [ 'restaurant' ]
    };
    placesService = new google.maps.places.PlacesService(map);
    placesService.nearbySearch(request, nearbySearchCallback);

    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
}

function nearbySearchCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        markers = [];
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    marker = new google.maps.Marker({
        map : map,
        position : place.geometry.location,
        //label: {
        //	color: '#282828',
        //	fontWeight: 'bold',
        //	text: place.name,
        //},
        icon: 'https://www.google.com/maps/vt/icon/name=assets/icons/poi/tactile/pinlet_shadow-2-medium.png,assets/icons/poi/tactile/pinlet_outline_v2-2-medium.png,assets/icons/poi/tactile/pinlet-2-medium.png,assets/icons/poi/quantum/pinlet/restaurant_pinlet-2-medium.png&highlight=ff000000,ffffff,ea4335,ffffff&color=ff000000?scale=1'
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(generateInfoWindowContent(place));
        infowindow.open(map, this);

        var directionsLink = document.getElementById('directions-link');
        if(directionsLink) {
            directionsLink.onclick = function(event){ 
                event.preventDefault();
                displayUserCurrentLocation(place);
            }
        }
    });

    markers.push(marker);
}

function generateInfoWindowContent(place) {
    var content = "<div class=\"resto-name\">" + place.name + "</div>";
    content += "<p>" + place.vicinity + "</p>";
    content += "<p>Total customer visits: </p>";
    content += "<a id=\"directions-link\" class=\"directions-lbl\" href=\"#\">Get Directions</a>"; 
    return content;
}

function drawingOverlayComplete(drawing){
    // switch back to non-drawing mode after drawing a shape
    drawingManager.setDrawingMode(null);

    // remove previous overlay and markers
    removeOverlayAndMarkers();

    previousOverlay = drawing.overlay;

    // find restaurants inside boundary
    var overlayBounds = drawing.overlay.getBounds();
    var request = {
        bounds: overlayBounds,
        type : [ 'restaurant' ]
    };
    placesService.nearbySearch(request, nearbySearchCallback);
}

function removeOverlayAndMarkers() {
    // remove previous overlay
    if (previousOverlay != null) {
        previousOverlay.setMap(null);
    }

    // remove markers within overlay
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];

    // remove any direction information
    directionsDisplay.setMap(null);
}

function getDirectionsFromCurrentLocation(place, currentPosition) {

    // origin
    originLocation = {
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude
    };
    marker = new google.maps.Marker({
        map : map,
        position : originLocation
    });
    markers.push(marker);

    // destination
    var destinationLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
    };

    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );

    directionsService.route({
        // origin: document.getElementById('start').value,
        origin: originLocation,
        // destination: marker.getPosition(),
        destination: destinationLocation,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

    var sasasa = place;
}

function displayUserCurrentLocation(place) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            getDirectionsFromCurrentLocation(place, position);
        }, geolocationError, {enableHighAccuracy: true});
    } else { 
        window.alert("Error: The Geolocation service failed. \nYour browser doesn\'t support geolocation.");
     }
}

function geolocationError(err) {
    window.alert(err.message);
} 