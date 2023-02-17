<template>
  <v-container id='container'>
    <v-container id='map-polygon-sections'>
      <v-card id='mapView'>
      </v-card>
    </v-container>

    <v-container id='save-section'
     v-if='this.markers.length > 0 && !isEdit'
    >
      <v-btn
        color='primary'
        class='white--text'
        @click="saveWayPoints"

      >
        Guardar
      </v-btn>
    </v-container>
  </v-container>
</template>

<script>
import { Loader } from 'google-maps';
import { getWayPointsByVuCode, pushBulkWayPoints } from '@/api/ApiServices';

const options = { libraries: ['drawing', 'places'] };
const loader = new Loader('AIzaSyBD7Rmh9dkpF8wpYcaVA7obVdYyPm8ODPw', options);
export default {
  name: 'ViewMaps',
  props: {
    establishment: {
      type: Object,
      required: false
    },
    coordinates: {
      type: Array,
      required: true
    }
  },
  watch: {
    coordinates: {
      handler: async function() {
        this.getLoadedMap();
        this.polygon.setMap(this.map);
        await this.getWayPoints()
        this.drawPolygon();
        this.drawMarkers();
      },
      deep: true
    },
  },
  data: () => ({
    map: null,
    google: null,
    polygon: null,
    polygonCoordinates: [],
    polygonOptions: {
      clickable: true,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#ADFF2F',
      fillOpacity: 0.35,
    },
    markers: [],
    isEdit: false,
  }),
  methods: {
    /**
     * @description Inicializa el mapa y el poligono
     */
    initMap() {
      this.getLoadedMap()
      this.polygon = new this.google.maps.Polygon(this.polygonOptions);
      this.polygon.setMap(this.map);
    },
    /**
     * @description Obtiene el mapa cargado
     * @returns {void}
     */
    getLoadedMap() {
      const { latitud, longitud } = this.establishment;
      this.map = new this.google.maps.Map(document.getElementById('mapView'), {
        zoom: 15,
        center: { lat: latitud, lng: longitud },
      });
    },
    /**
     * @description Dibuja los poligonos de un establecimiento en el mapa
     * @returns {void}
     */
    drawPolygon() {
      const polygons = [];
      this.coordinates.forEach((coordinate, index) => {
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
        const aux = polygon.coordinates.map(coordinate => {
          return { lat: coordinate.latitud, lng: coordinate.longitud };
        });
        this.polygonCoordinates.push(aux);
      });
      this.polygon.setPaths(this.polygonCoordinates);
    },
    /**
     * @description Dibuja los puntos de referencia de un establecimiento
     * @returns {void}
     */
    drawMarkers() {
      if (this.markers.length === 0) return;
      this.markers.forEach(marker => {
        const markerPosition = new this.google.maps.LatLng(marker.latitud, marker.longitud);
        const markerInstance = new this.google.maps.Marker({
          position: markerPosition,
          map: this.map,
        });
        this.configMarker('https://maps.google.com/mapfiles/ms/icons/red.png', markerInstance)
      });
    },
    /**
     * @description Detecta el evento click dentro de un poligono y crea un marcador
     * @returns {void}
     */
    defaultEvents() {
      this.google.maps.event.addListener(this.polygon, 'click', (event) => {
        const marker = new this.google.maps.Marker({
          position: event.latLng,
          map: this.map,
        });
        this.configMarker('https://maps.google.com/mapfiles/ms/icons/red.png', marker)
        const id = this.addMarker(event);
        const infoWindow = new this.google.maps.InfoWindow({
          content: `<div>
            <p>Id: ${id}</p>
            <p>Latitud: ${event.latLng.lat()}</p>
            <p>Longitud: ${event.latLng.lng()}</p>
          </div>`,
        });
        infoWindow.open(this.map, marker);
        this.google.maps.event.addListener(infoWindow, 'closeclick', () => {
          this.deleteMarker(infoWindow, id, marker);
        });

      });
    },
    /**
     * @description Guarda los puntos de referencia de un establecimiento en la lista de markers
     * @param event
     * @returns {number} id
     */
    addMarker(event) {
      const id = this.markers.length + 1;
      const marker =  {
        id: id,
        codigo_vu: this.establishment.codigo_vu,
        latitud: event.latLng.lat(),
        longitud: event.latLng.lng(),
        este: 0,
        norte: 0,
      }
      this.markers.push(marker);
      return id;
    },
    /**
     * @description Cambia el icono de un marcador
     * @param icon {string}
     * @param marker {object}
     * @returns {void}
     */
    configMarker(icon, marker) {
      marker.setIcon(icon);
    },
    /**
     * @description Elimina un marcador de la lista de markers y del mapa
     * @param infoWindow {object}
     * @param id {number}
     * @param marker {object}
     * @returns {void}
     */
    deleteMarker(infoWindow, id, marker) {
      this.markers = this.markers.filter(marker => marker.id !== id);
      marker.setMap(null);
      infoWindow.close();
    },
    /**
     * @description Guarda los puntos de referencia de un establecimiento en la base de datos y limpia la lista de markers
     * @returns {Promise<void>}
     */
    async saveWayPoints() {
      await pushBulkWayPoints(this.markers);
      this.markers = [];
    },
    /**
     * @description Obtiene los puntos de referencia de un establecimiento de la base de datos
     * @returns {Promise<void>}
     */
    async getWayPoints() {
      this.markers = await getWayPointsByVuCode(this.establishment.codigo_vu);
      this.isEdit = this.markers.length !== 0;
    },
  },
  async mounted() {
    this.google = await loader.load();
    await this.getWayPoints()
    this.initMap();
    this.drawPolygon()
    this.drawMarkers();
    this.defaultEvents();
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

#mapView {
  width: 100%;
  height: 100%;
}
#map-polygon-sections {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

#save-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 20%;
  height: 100%;
}

#save-section > button {
  width: 100%;
  height: 50px;
  /*//separator*/
  margin-bottom: 10px;
  font-size: 10px;
}
</style>