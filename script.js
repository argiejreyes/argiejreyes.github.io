var map;
var infowindow;
var cebu = {lat: 10.315699, lng: 123.885437};
      
function createMap() {
	var options = map = new google.maps.Map(document.getElementById('map'), {
		center: cebu,
		zoom: 13
    });
		
	infowindow = new google.maps.InfoWindow({ map: map });
		
	var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
		location : cebu,
		radius : 5500,
		type : [ 'restaurant' ]
	}, callback);
}
	  
function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
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
		infowindow.setContent(place.name);
		infowindow.open(map, this);
    });
}