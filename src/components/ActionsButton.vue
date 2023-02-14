<template>
  <v-container
    id='button-section'
    v-if='polygons.length > 0'>
    <v-btn
      @click='cleanMap' color='primary' class='mx-2'>Limpiar</v-btn>
    <v-btn @click='savePolygons' color='primary' class='mx-2'>Guardar</v-btn>
    <v-btn @click='showPolygonsInformation' color='primary' class='mx-2'>Ver Información</v-btn>
  </v-container>
</template>

<script>
export default {
  name: 'ActionsButton',
  props: {
    //function cleanMap
    cleanMap: {
      type: Function,
      required: true
    },
    savePolygons: {
      type: Function,
      required: true
    },
    showPolygonsInformation: {
      type: Function,
      required: true
    },
    polygons: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
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
</style>