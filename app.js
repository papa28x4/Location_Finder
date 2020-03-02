		const locationInput = document.querySelector('#location');
		const form =  document.querySelector('#location-form');
		const mapHolder = document.querySelector('#map');
		const options = document.querySelector('#options')
		let formatted = document.querySelector('#formatted-address');
		let comps = document.querySelector('#address-components');
		let geometry = document.querySelector('#geometry');
		let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		let storeLat, storeLng;

		form.addEventListener('submit', geocode);
		options.addEventListener('change', (e)=>{
			
			if(e.target.value === "mine"){
				locationInput.disabled = true;
				locationInput.placeholder = "";
				initMap(storeLng, storeLat);
			}else{
				locationInput.disabled = false;
				locationInput.placeholder="Enter a location"
			}
		})

		
		
		function initMap(lng, lat, info) {

		  let location = {lat, lng};
		  
		  var map = new google.maps.Map(mapHolder, {zoom: 8, center: location});
		 
		  var marker = new google.maps.Marker({position: location, map: map});

		  infoWindow = new google.maps.InfoWindow({content: `<h2>${info}</h2>`});
		  marker.addListener('click', function(){
		  	infoWindow.open(map, marker)
		  })

	        
		    if(options.value === 'mine'){
	          if (navigator.geolocation) {
		          
		          navigator.geolocation.getCurrentPosition(function(position) {
		            var pos = {
		              lat: position.coords.latitude,
		              lng: position.coords.longitude
		            };
		            
		            revGeocode(pos)
		            infoWindow.setPosition(pos);
		            infoWindow.setContent('Your location found. Zoom in');
		            infoWindow.open(map);
		            map.setCenter(pos);
		          }, function() {
		            handleLocationError(true, infoWindow, map.getCenter());
	          		});
		          locationInput.value = "";
		       } else {
		          
		          handleLocationError(false, infoWindow, map.getCenter());
		       }
	        
		    }
		}

		function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	        infoWindow.setPosition(pos);
	        infoWindow.setContent(browserHasGeolocation ?
	                              'Error: The Geolocation service failed.' :
	                              'Error: Your browser doesn\'t support geolocation.');
	        infoWindow.open(map);
       }
   
		function activatePlacesSearch(){
			const locationInput = document.querySelector('#location');
			let auto = new google.maps.places.Autocomplete(locationInput);
			
		}

		function revGeocode(pos){
			let apiKey = `AIzaSyCjo7pjQZM3FVCjBpw1-5Yeddhl32ys6_o`;
			let endpoint = `https://maps.googleapis.com/maps/api/geocode/json`;
			let latlng = `${pos.lat},${pos.lng}`;
			// let latlng = `6.5788616,3.2653896`
			let url = `${endpoint}?latlng=${latlng}&key=${apiKey}`;
			fetch(url)
			.then(response => response.json())
			.then(json => {
				console.log(json);
				console.log(json.plus_code.compound_code)
				console.log(json.results[0].formatted_address)
				if (isMobile) {
		  			formatted.innerHTML = `<ul class="list-group">
									<li class="list-group-item">${json.results[0].formatted_address}</li>
									</ul>`;
				} else {
					formatted.innerHTML = `<ul class="list-group">
									<li class="list-group-item">${json.plus_code.compound_code}</li>
									</ul>`;
				}
				
				
				let latlonHTML = `
				<ul class="list-group">
					<li class="list-group-item"><b>Longitude:</b>${pos.lng}&#176 &nbsp<b>Latitude:</b> ${pos.lat}&#176</li>
				</ul>`;
				storeLat = pos.lat;
				storeLng = pos.lng;
				geometry.innerHTML = latlonHTML;
				comps.innerHTML = '';
				
			})
	
		}

		function geocode(){
			event.preventDefault();
			let apiKey = `AIzaSyCjo7pjQZM3FVCjBpw1-5Yeddhl32ys6_o`;
			let endpoint = `https://maps.googleapis.com/maps/api/geocode/json`;
			
			let location = locationInput.value;
			if(location.trim() === ''){
				if(options.value === 'mine'){
					initMap(storeLng, storeLat);
				}else{
					alert('Please enter a location');
				}
				
				return;
			}
			let data = {address: location,
						key: apiKey}

			let url = `${endpoint}?address=${location}&key=${apiKey}`
			

			fetch(url)
			.then(response => response.json())
			.then(json => {
				let formattedAddress = json.results[0].formatted_address;
				let formattedAddOutput = `
				<ul class="list-group">
					<li class="list-group-item">${formattedAddress}</li>
				</ul>`;

				formatted.innerHTML = formattedAddOutput;

				let addressComponents = json.results[0].address_components;
				addressComponentsOutput = `<ul class="list-group">`;
				addressComponents.forEach(comp => {
					addressComponentsOutput += `<li id="mylist" class="list-group-item"><b>${comp.types[0]}</b>: ${comp.long_name}</li>`
				})
				addressComponentsOutput += `</ul>`;

				comps.innerHTML = addressComponentsOutput;
				

				let latlon = json.results[0].geometry.location;
				let latlonHTML = `
				<ul class="list-group">
					<li class="list-group-item"><b>Longitude:</b> ${latlon.lng}&#176 &nbsp<b>Latitude:</b> ${latlon.lat}&#176</li>
				</ul>`;
				initMap(latlon.lng, latlon.lat, formattedAddress);
				storeLat = latlon.lat;
				storeLng = latlon.lng;
				geometry.innerHTML = latlonHTML;


			})
			.catch(err => console.log(err));
		}

		