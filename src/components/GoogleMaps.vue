<template>
  <v-container id='container'>
    <v-container id='map-polygon-sections'>
      <v-card id='map'>
      </v-card>
    </v-container>
    <v-container
      id='button-section'
      v-if='polygons.length > 0'>
      <v-btn
        @click='cleanMap' color='primary' class='mx-2'>Limpiar</v-btn>
      <v-btn @click='savePolygons' color='primary' class='mx-2'>Guardar</v-btn>
      <v-btn @click='showPolygonsInformation' color='primary' class='mx-2'>Ver Información</v-btn>
    </v-container>
    <PopupsPolygonInformation :view-polygons-information='viewPolygonsInformation' :establishment='establishment' :polygons='polygons' />
    <PopupsMessage
      :saved-message='this.savedMessage' :is-saved='this.isSaved'/>
  </v-container>

</template>

<script>
import { Loader } from 'google-maps';
import PopupsPolygonInformation from '@/components/PopupsPolygonInformation.vue';
import { pushBulkCoordinates, getCoodinatesByEstablishment } from '@/api/ApiServices';
import PopupsMessage from '@/components/PopupsMessage.vue';

class Establishment {
  constructor(codigo_vu, nombre_est, latitud, longitud, este, norte, huso) {
    this.codigo_vu = codigo_vu;
    this.nombre_est = nombre_est;
    this.latitud = latitud;
    this.longitud = longitud;
    this.este = este;
    this.norte = norte;
    this.huso = huso;
  }
}

const options = { libraries: ['drawing', 'places'] };
const loader = new Loader('AIzaSyBD7Rmh9dkpF8wpYcaVA7obVdYyPm8ODPw', options);
export default {
  name: 'GoogleMaps',
  components: { PopupsMessage, PopupsPolygonInformation },
  props: {
    establishment: {
      type: Establishment,
      required: true
    }
  },
  watch: {
    establishment: {
      handler: function() {
        this.calculateCoordinates();
        this.cleanMap();
        this.getCoordinatesToEstablisment();
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
    isSaved: false,
    savedMessage: 'Guardado Correctamente',
    containPolygons: false,
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
    savePolygonToList(polygon) {
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
    getLatLongByUtm(este, norte, huso) {
      const utm = require('utm');
      const { latitude, longitude } = utm.toLatLon(este, norte, huso, 'S');
      return { latitude, longitude };
    },
    setLatLongByUtm() {
      const { latitude, longitude } = this.getLatLongByUtm(this.establishment.este, this.establishment.norte, this.establishment.huso);
      this.establishment.latitud = latitude;
      this.establishment.longitud = longitude;
    },
    setUtmByCoordinates() {
      const { easting, northing } = this.getUtmByCoordinates(this.establishment.latitud, this.establishment.longitud);
      this.establishment.este = easting;
      this.establishment.norte = northing;
    },
    cleanMap() {
      this.polygons = [];
      this.getLoadedMap();
      this.drawingManager.setMap(this.map);
    },
    showPolygonsInformation() {
      this.viewPolygonsInformation = !this.viewPolygonsInformation;
    },
    isUtm() {
      return this.establishment.este !== null && this.establishment.norte !== null;
    },
    calculateCoordinates() {
      if (this.establishment.latitud !== null && this.establishment.este !== null) return;
      if (this.isUtm()) this.setLatLongByUtm()
      else this.setUtmByCoordinates()
    },
    async savePolygons() {
      const information = {
        codigo_vu: this.establishment.codigo_vu,
        polygons: this.polygons
      }
      await pushBulkCoordinates(information);
      this.isSaved = true;
      this.cleanMap();
      await this.getCoordinatesToEstablisment();
      setTimeout(() => {
        this.isSaved = false;
      }, 3000);

    },
    async getCoordinatesToEstablisment() {
      const coordinates = await getCoodinatesByEstablishment(this.establishment.codigo_vu);
      if (coordinates.length === 0) return;
      this.containPolygons = true;
      this.getLoadedMap();
      this.drawingManager.setMap(this.map);
      const polygons = [];
      coordinates.forEach((coordinate, index) => {
        if (index === 0) {
          polygons.push({
            id: coordinate.id_poligono,
            coordinates: [coordinate]
          });
        } else {
          const lastPolygon = polygons[polygons.length - 1];
          if (lastPolygon.id === coordinate.id_poligono) {
            lastPolygon.coordinates.push(coordinate);
          } else {
            polygons.push({
              id: coordinate.id_poligono,
              coordinates: [coordinate]
            });
          }
        }
      });
      polygons.forEach(polygon => {
        const polygonCoordinates = polygon.coordinates.map(coordinate => {
          return new this.google.maps.LatLng(coordinate.latitud, coordinate.longitud);
        });
        const polygonToDraw = new this.google.maps.Polygon({
          paths: polygonCoordinates,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35
        });
        polygonToDraw.setMap(this.map);
      });
    }
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
