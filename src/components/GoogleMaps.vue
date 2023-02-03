<template>
  <v-container id='container'>
    <v-container id='map-polygon-sections'>
      <v-card id='map'>
      </v-card>
    </v-container>
    <v-container id='button-section'>
      <v-btn @click='cleanMap' color='primary' class='mx-2'>Limpiar</v-btn>
      <v-btn @click='savePolygons' color='primary' class='mx-2'>Guardar</v-btn>
      <v-btn @click='showPolygonsInformation' color='primary' class='mx-2'>Ver Información</v-btn>
    </v-container>
  <PopupsPolygonInformation :view-polygons-information='viewPolygonsInformation' :establishment='establishment' :polygons='polygons' />
  </v-container>

</template>

<script>
import { Loader } from 'google-maps';
// import PolygonInformation from '@/components/PolygonInformation.vue';
import PopupsPolygonInformation from '@/components/PopupsPolygonInformation.vue';

class Establishment {
  constructor(codigo_vu, nombre_est, latitud, longitud, este, norte) {
    this.codigo_vu = codigo_vu;
    this.nombre_est = nombre_est;
    this.latitud = latitud;
    this.longitud = longitud;
    this.este = este;
    this.norte = norte;
  }
}

const options = { libraries: ['drawing', 'places'] };
const loader = new Loader('AIzaSyBD7Rmh9dkpF8wpYcaVA7obVdYyPm8ODPw', options);
export default {
  name: 'GoogleMaps',
  components: { PopupsPolygonInformation },
  props: {
    establishment: {
      type: Establishment,
      required: true
    }
  },
  watch: {
    establishment: {
      handler: function() {
        this.cleanMap();
      },
      deep: true
    },
    polygons: {
      handler: function() {
        this.viewPolygonsInformation = false;
      },
      deep: true
    }
  },
  mounted: async function() {
    if (this.establishment.codigo_vu === '') {
      this.$router.push('/');
    } else {
      this.google = await loader.load();
      this.initMap();
      this.completePolygon();
    }
  },

  data: () => ({
    polygons: [],
    map: null,
    drawingManager: null,
    google: null,
    viewPolygonsInformation: false,
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
      this.configDrawingManager();
      this.drawingManager.setMap(this.map);
    },
    completePolygon() {
      this.google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
        const polygonId = this.savePolygonToList(polygon);
        this.google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
          this.updatePolygonCoords(polygonId, polygon);
        });
      });
    },
    getCoordinates(polygonCoords) {
      return polygonCoords.map((coord, index) => {
        const { easting, northing } = this.getUtmByCoordinates(coord.lat(), coord.lng() );
        return {
          id: index + 1,
          latitude: coord.lat(),
          longitude: coord.lng(),
          easting: easting,
          northing: northing,
        };
      });
    },
    savePolygonToList(polygon) { //cambiar
      const polygonCoords = polygon.getPath().getArray();
      const polygonId = this.polygons.length + 1;
      const polygonCoordinates = this.getCoordinates(polygonCoords);
      this.polygons.push({ id: polygonId, coordinates: polygonCoordinates });
      return polygonId;
    },
    updatePolygonCoords(polygonId, polygon) {
      const polygonToUpdate = this.polygons.find(polygon => polygon.id === polygonId);
      const polygonCoords = polygon.getPath().getArray();
      polygonToUpdate.coordinates = this.getCoordinates(polygonCoords);
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
    },
    showPolygonsInformation() {
      this.viewPolygonsInformation = !this.viewPolygonsInformation;
    },
  },
};
</script>

<style scoped>
#container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}

#button-section {
  display: flex;
  flex-direction: column;
  /*align-content: space-around;*/
  align-items: stretch;
  width: 20%;
  height: 100%;
}

#button-section > button {
  width: 100%;
  height: 50px;
  /*//separator*/
  margin-bottom: 10px;
  font-size: 10px;
}

#map-polygon-sections {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}
</style>
