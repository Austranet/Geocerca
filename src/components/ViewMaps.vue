<template>
  <v-container id='container'>
    <v-container id='map-polygon-sections'>
      <v-card id='map'>
      </v-card>
    </v-container>
  </v-container>
</template>

<script>
import { Loader } from 'google-maps';

const options = { libraries: ['drawing', 'places'] };
const loader = new Loader('AIzaSyBD7Rmh9dkpF8wpYcaVA7obVdYyPm8ODPw', options);
export default {
  name: 'ViewMaps',
  props: {
    establishment: {
      type: Object,
      required: true,
    },
    coordinates: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    polygons: [],
  }),
watch: {
    coordinates: {
      handler: function() {
        this.getCoordinatesToEstablisment();
      },
      deep: true
    }
  },
  mounted: async function() {
    this.google = await loader.load();
    this.initMap();
    // this.completePolygon();
  },
  methods: {
    getCoordinatesToEstablisment() {
      this.polygons = [];
      this.coordinates.forEach((coordinate, index) => {
        if (index === 0) {
          this.polygons.push({
            id: coordinate.id_poligono,
            coordinates: [coordinate]
          });
        } else {
          const lastPolygon = this.polygons[this.polygons.length - 1];
          if (lastPolygon.id === coordinate.id_poligono) {
            lastPolygon.coordinates.push(coordinate);
          } else {
            this.polygons.push({
              id: coordinate.id_poligono,
              coordinates: [coordinate]
            });
          }
        }
      });
    },
    initMap() {
      const { latitud, longitud } = this.establishment;
      this.map = new this.google.maps.Map(document.getElementById('map'), {
        center: { lat: latitud, lng: longitud},
        zoom: 15,
      });
      this.initMapWithPolygons();

    },
    initMapWithPolygons() {
      this.polygons.forEach(polygon => {
        const coordinates = polygon.coordinates.map(coordinate => {
          return {
            lat: coordinate.latitud,
            lng: coordinate.longitud
          };
        });
        const polygonMap = new this.google.maps.Polygon({
          paths: coordinates,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
        });
        polygonMap.setMap(this.map);
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