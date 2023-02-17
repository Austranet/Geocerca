<template>
  <v-container id='container'>
    <v-container id='map-polygon-sections'>
      <v-card id='map'>
      </v-card>
    </v-container>
    <ActionsButton :polygons='this.polygons' :show-polygons-information='showPolygonsInformation'
                   :save-polygons='savePolygons'
                   :clean-map='cleanMap'/>
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
import ActionsButton from '@/components/ActionsButton.vue';

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
  components: { ActionsButton, PopupsMessage, PopupsPolygonInformation },
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
    console.log('mounted');
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
    /**
     * @description Configura el dibujador de poligonos en base a opciones
     * @returns {void}
     */
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
    /**
     * @description Obtiene el mapa cargado
     * @returns {void}
     */
    getLoadedMap() {
      const { latitud, longitud } = this.establishment;
      this.map = new this.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: latitud, lng: longitud },
      });
    },
    /**
     * @description Inicializa el mapa
     * @returns {void}
     */
    initMap() {
      this.getLoadedMap();
      this.configDrawingManager();
      this.drawingManager.setMap(this.map);
    },
    /**
     * @description Detecta cuando se completa el poligono y lo guarda en la lista
     * @returns {void}
     */
    completePolygon() {
      this.google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
        const polygonId = this.savePolygonToList(polygon);
        this.google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
          this.updatePolygonCoords(polygonId, polygon);
        });
      });
    },
    /**
     * @description Obtiene las coordenadas en UTM y las guarda en el poligono
     * @param {Array} polygonCoords
     * @returns {Array}
     */
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
    /**
     * @description Guarda el poligono en la lista
     * @param {Object} polygon
     * @returns {Number}
     */
    savePolygonToList(polygon) {
      const polygonCoords = polygon.getPath().getArray();
      const polygonId = this.polygons.length + 1;
      const polygonCoordinates = this.getCoordinates(polygonCoords);
      this.polygons.push({ id: polygonId, coordinates: polygonCoordinates });
      return polygonId;
    },
    /**
     * @description Actualiza las coordenadas del poligono
     * @param {Number} polygonId
     * @param {Object} polygon
     * @returns {void}
     */
    updatePolygonCoords(polygonId, polygon) {
      const polygonToUpdate = this.polygons.find(polygon => polygon.id === polygonId);
      const polygonCoords = polygon.getPath().getArray();
      polygonToUpdate.coordinates = this.getCoordinates(polygonCoords);
    },
    /**
     * @description Obtiene las coordenadas en UTM en base a las coordenadas en latitud y longitud
     * @param {Number} lat
     * @param {Number} lng
     * @returns {Object} { easting, northing }
     */
    getUtmByCoordinates(lat, lng) {
      const utm = require('utm');
      const { easting, northing } = utm.fromLatLon(lat, lng);
      return { easting, northing };
    },
    /**
     * @description Obtiene las coordenadas en latitud y longitud en base a las coordenadas en UTM
     * @param {Number} este
     * @param {Number} norte
     * @param {Number} huso
     * @returns {Object} { latitude, longitude }
     */
    getLatLongByUtm(este, norte, huso) {
      const utm = require('utm');
      const { latitude, longitude } = utm.toLatLon(este, norte, huso, 'S');
      return { latitude, longitude };
    },
    /**
     * @description Asigna las coordenadas en latitud y longitud en base a las coordenadas en UTM
     * @returns {void}
     */
    setLatLongByUtm() {
      const { latitude, longitude } = this.getLatLongByUtm(this.establishment.este, this.establishment.norte, this.establishment.huso);
      this.establishment.latitud = latitude;
      this.establishment.longitud = longitude;
    },
    /**
     * @description Asigna las coordenadas en UTM en base a las coordenadas en latitud y longitud
     * @returns {void}
     */
    setUtmByCoordinates() {
      const { easting, northing } = this.getUtmByCoordinates(this.establishment.latitud, this.establishment.longitud);
      this.establishment.este = easting;
      this.establishment.norte = northing;
    },
    /**
     * @description Limpia el mapa y los poligonos
     * @returns {void}
     */
    cleanMap() {
      this.polygons = [];
      this.getLoadedMap();
      this.drawingManager.setMap(this.map);
    },
    /**
     * @description Cambia el estado de la vista de informacion de los poligonos
     * @returns {void}
     */
    showPolygonsInformation() {
      this.viewPolygonsInformation = !this.viewPolygonsInformation;
    },
    /**
     * @description Verifica si el establecimiento tiene coordenadas en UTM
     * @returns {Boolean}
     */
    isUtm() {
      return this.establishment.este !== null && this.establishment.norte !== null;
    },
    /**
     * @description Calcula las coordenadas en UTM o latitud y longitud segun corresponda
     * @returns {void}
     */
    calculateCoordinates() {
      if (this.establishment.latitud !== null && this.establishment.este !== null) return;
      if (this.isUtm()) this.setLatLongByUtm()
      else this.setUtmByCoordinates()
    },
    /**
     * @description Guarda los poligonos en la base de datos
     * @returns {void}
     */
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
    /**
     * @description Obtiene las coordenadas del establecimiento en la base de datos y las dibuja en el mapa
     * @returns {void}
     */
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

#map-polygon-sections {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}
</style>
