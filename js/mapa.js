var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var geocoder;
var myWayPoints = []; //array responsável para armazenar os pontos de paradas
var markers = []; //array responsável para armazenar os marcadores

function initialize() {	
	directionsDisplay = new google.maps.DirectionsRenderer();
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(-3.71839, -38.54343);
	
    var options = {
        zoom: 5,
		center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapa"), options);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById("trajeto-texto"));
	
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {

			pontoPadrao = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.setCenter(pontoPadrao);
			map.setZoom(8);
			
			geocoder.geocode({
				"location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            },
            function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					$("#txtEnderecoPartida").val(results[0].formatted_address);
				}
            });
		});
	}

	//adiciona o evento do click no mapa para definir os pontos de paradas
	map.addListener('click', function(evt){
		if(myWayPoints.length < 8){
			geocoder.geocode({'location': evt.latLng}, function(results, status){
				if(status === "OK"){
					markers.push(new google.maps.Marker({
						position: evt.latLng,
						map: map
					}))

					//adiciona o local do click como um ponto de parada
					myWayPoints.push({
						location: results[0].formatted_address,
						stopover: true
					});	

					
					var content = `<b>parada:</b> ${results[0].formatted_address}<br>`
					$("#containerWayPoints").append(content);
					$("#lblTotalParadas").html(`Total de paradas: <b>${myWayPoints.length}</b>`);
				}
			})					
		}else{
			alert('Número máximo de parada excedido!');
		}		
	})
}

initialize();

$("form").submit(function(event) {
	event.preventDefault();

	//implentado todos os possíveis retornos da API
	directionsService.route({
		origin: $("#txtEnderecoPartida").val(),
		destination: $("#txtEnderecoChegada").val(), //incluir alguma regra para formatar melhor o campo exemplo: São Paulo, SP
		waypoints: myWayPoints, //adiciona os pontos de parada na chamada
		optimizeWaypoints: true, //otimizando a rota
		travelMode: 'DRIVING'
	  }, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {

			//limpa os marcadores adicionadaos
			$.each(markers, function(key, value){
				value.setMap(null)
			})
			markers = [];

			directionsDisplay.setDirections(result);
		}else if (status = google.maps.DirectionsStatus.NOT_FOUND) {
            alert("NOT_FOUND");
        }
        else if (status = google.maps.DirectionsStatus.ZERO_RESULTS) {
            alert("ZERO_RESULTS");
        }
        else if (status = google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED) {
            alert("MAX_WAYPOINTS_EXCEEDED");
        }
        else if (status = google.maps.DirectionsStatus.INVALID_REQUEST) {
            alert("INVALID_REQUEST");
        }
        else if (status = google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
            alert("OVER_QUERY_LIMIT");
        }
        else if (status = google.maps.DirectionsStatus.REQUEST_DENIED) {
            alert("REQUEST_DENIED");
        }
        else {
            alert("UNKNOWN_ERROR");
        }
	});
});