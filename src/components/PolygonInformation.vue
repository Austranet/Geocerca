<template>
  <v-card id='polygons'
          class=' overflow-y-auto'
          height='500px'
          width='1000px'
  >
    <v-card-text>
      <div class='text--primary'>
        <div class='polygon-description'>
          <PanelDefault title='Establecimiento' :content='this.establishment.nombre_est' />
          <PanelDefault title='Código' :content='this.establishment.codigo_vu' />
          <PanelDefault title='Coordenadas (Lat, Long)' :content='this.establishment.latitud + ", " + this.establishment.longitud' />
          <PanelDefault title='Coordenadas (Este, Norte)' :content='this.establishment.este + ", " + this.establishment.norte' />
          <PanelDefault title='Huso' :content='this.establishment.huso' />
        </div>
        <TableOfPolygons :polygons='this.polygons'
            :codigo_vu='this.establishment.codigo_vu'
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import TableOfPolygons from '@/components/TableOfPolygons.vue';
import PanelDefault from '@/components/PanelDefault.vue';

export default {
  name: 'PolygonInformation',
  components: { PanelDefault, TableOfPolygons },
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

.polygon-description {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}
</style>