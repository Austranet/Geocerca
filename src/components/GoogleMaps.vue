<template>
  <v-container id='container'>
    <v-container id='map-polygon-sections'>
      <v-card id='map'></v-card>
      <v-card id='polygons'>
        <v-card-text>
          <p class='text-h4 text--primary'>Polígonos</p>
          <div class='text--primary'>
            <h3>Polígonos de SEDE</h3>
            <ul>
              <li v-for='polygon in polygons' :key='polygon.id'>
                <strong>Polígono {{ polygon.id }}</strong>
                <ul>
                  <li v-for='coordinate in polygon.coordinates' :key='coordinate.id'>
                    <strong>Coordenada {{ coordinate.id }}</strong>
                    <ul>
                      <li><strong>Latitud:</strong> <span>{{ coordinate.latitude }}</span></li>
                      <li><strong>Longitud:</strong> <span>{{ coordinate.longitude }}</span></li>
                      <li><strong>Este:</strong> <span>{{ coordinate.easting }}</span></li>
                      <li><strong>Norte:</strong> <span>{{ coordinate.northing }}</span></li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
    <v-container id='button-section'>
      <v-btn @click='cleanMap' color='primary' class='mx-2'>Limpiar</v-btn>
      <v-btn @click='savePolygons' color='primary' class='mx-2'>Guardar</v-btn>
    </v-container>
  </v-container>

</template>

<script>
import { Loader } from 'google-maps';

const options = { libraries: ['drawing', 'places'] };
const loader = new Loader('AIzaSyBD7Rmh9dkpF8wpYcaVA7obVdYyPm8ODPw', options);
export default {
  name: 'GoogleMaps',

  mounted: async function() {
    this.google = await loader.load();
    this.initMap();
    this.completePolygon();
  },

  data: () => ({
    polygons: [],
    map: null,
    drawingManager: null,
    google: null,
    establishment: {
      codigo_vu: '',
      nombre_est: '',
      latitud: -33.4432,
      longitud: -70.6574,
      este: null,
      norte: null,
    },
  }),

  methods: {

    configDrawingManager() {
      this.drawingManager = new this.google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: this.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            this.google.maps.drawing.OverlayType.POLYGON,
          ],
        },

        polygonOptions: {
          clickable: true,
          draggable: true,
          editable: true,
          fillColor: '#ADFF2F',
          fillOpacity: 0.5,
        },
      });
    },
    getLoadedMap() {
      const { latitud, longitud } = this.establishment;
      this.map = new this.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: latitud, lng: longitud },
      });
    },
    initMap() {
      this.getLoadedMap();
      this.search();
      this.configDrawingManager();
      this.drawingManager.setMap(this.map);
    },
    addAutocomplete() {
      return new this.google.maps.places.Autocomplete(
        document.getElementById('search'),
      );
    },
    completePolygon() {
      this.google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
        this.getPolygonCoords(polygon);
      });
    },
    getPolygonCoords(polygon) {
      const polygonCoords = polygon.getPath().getArray();
      const polygonId = this.polygons.length + 1;
      const polygonCoordinates = polygonCoords.map((coord, index) => {
        const { easting, northing } = this.getUtmByCoordinates(coord.lat(), coord.lng() );
        return {
          id: index + 1,
          latitude: coord.lat(),
          longitude: coord.lng(),
          easting: easting,
          northing: northing,
        };
      });
      this.polygons.push({ id: polygonId, coordinates: polygonCoordinates });
    },
    search() {
      const map = this.map;
      const google = this.google;
      const autocomplete = this.addAutocomplete();
      autocomplete.bindTo('bounds', map);

      let infowindow = new google.maps.InfoWindow();
      let marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
      });


      autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          window.alert('Autocomplete\'s returned place contains no geometry');
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
        marker.setIcon({
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(35, 35),
        });
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] &&
              place.address_components[0].short_name) ||
            '',
            (place.address_components[1] &&
              place.address_components[1].short_name) ||
            '',
            (place.address_components[2] &&
              place.address_components[2].short_name) ||
            '',
          ].join(' ');
        }

        infowindow.setContent(
          '<div><strong>' + place.name + '</strong><br>' + address,
        );
        infowindow.open(map, marker);

        // Location details
        for (let i = 0; i < place.address_components.length; i++) {
          if (place.address_components[i].types[0] == 'postal_code') {
            document.getElementById('postal_code').innerHTML =
              place.address_components[i].long_name;
          }
          if (place.address_components[i].types[0] == 'country') {
            document.getElementById('country').innerHTML =
              place.address_components[i].long_name;
          }
        }
        document.getElementById('location').innerHTML = place.formatted_address;
        document.getElementById('lat').innerHTML =
          place.geometry.location.lat();
        document.getElementById('lon').innerHTML =
          place.geometry.location.lng();
      });
    },
    getUtmByCoordinates(lat, lng) {
      const utm = require('utm');
      const { easting, northing } = utm.fromLatLon(lat, lng);
      return { easting, northing };
    },
    cleanMap() {
      this.polygons = [];
      this.getLoadedMap();
      this.drawingManager.setMap(this.map);
    },
    savePolygons() {
      console.log('saving');
    }
  },
};
</script>

<style scoped>
/*//pon la descripcion de polygonos derecha y el map izquierda*/
#container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /*//quita espacio entre los elementos*/

  align-items: center;
  width: 100%;
  height: 100%;
}

#map {
  width: 50%;
  height: 100%;
}

#polygons {
  width: 50%;
  height: 100%;
}

#button-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
}

#map-polygon-sections {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
