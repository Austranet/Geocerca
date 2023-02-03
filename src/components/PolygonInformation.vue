<template>
  <v-card id='polygons'
          class=' overflow-y-auto'
          height='500px'
          width='1000px'
  >
    <v-card-text>
      <div class='text--primary'>
        <h3>Establecimiento: {{this.establishment.nombre_est}}</h3>
        <h3>Código {{this.establishment.codigo_vu}}</h3>
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
</template>

<script>
export default {
  name: 'PolygonInformation',
  props: {
    polygons: {
      type: Array,
      required: true,
    },
    establishment: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    polygons: [],
    establishment: {},
  })
}
</script>

<style scoped>
#polygons {
  width: 100%;
  height: 100%;

  background-color: rgb(255, 255, 255);
}
</style>