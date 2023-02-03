<template>
  <table class='table table-striped table-bordered table-hover'>
    <thead>
    <tr>
      <th>CODIGO VU</th>
      <th>ID POLIGONO</th>
      <th>ID COORDENADA</th>
      <th>LATITUD</th>
      <th>LONGITUD</th>
      <th>ESTE</th>
      <th>NORTE</th>
    </tr>
    </thead>
    <tbody v-for='(polygon, index) in polygons' :key='index'>
    <tr v-for='(coordinate, index) in polygon.coordinates' :key='index'>
      <td>{{codigo_vu}}</td>
      <td>{{polygon.id}}</td>
      <td>{{coordinate.id}}</td>
      <td>{{coordinate.latitude}}</td>
      <td>{{coordinate.longitude}}</td>
      <td>{{coordinate.easting}}</td>
      <td>{{coordinate.northing}}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'TableOfPolygons',
  props: {
    polygons: {
      type: Array,
      required: true,
    },
    codigo_vu: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
/*//haz la tabla parecida a excel*/
.table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
  background-color: transparent;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
}
</style>