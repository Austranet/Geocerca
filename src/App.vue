<template>
  <v-app>
    <v-container>
      <v-progress-circular
        v-if="!Object.keys(establishments).length"
        indeterminate
        color="primary"
        id='charging-indicator'
      />
      <v-row>
        <v-col
          class='mt-5 overflow-y-auto fill-width'
          cols="12" md="4">
          <v-list
            class='fill-w'
            dense
            nav
          >
            <v-list-item-group
              color="primary">
              <v-list-item
                v-for="item in this.establishments"
                :key="item.codigo_vu"
                link
                @click="getLocalEstablishmentByVuCode(item.codigo_vu)"
              >
                <v-list-item-content>
                  <v-list-item-title
                    class='text--primary
                    text-h7'
                  >{{ item.nombre_est }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
        <v-col md="8">
          <ViewMaps
            v-if="Object.keys(coordinates).length && Object.keys(establishment).length"
            :establishment="establishment"
            :coordinates="coordinates"
          />
<!--          <GoogleMaps-->
<!--            v-if="Object.keys(establishment).length"-->
<!--            :establishment="establishment"-->
<!--          />-->
          <v-card
            v-else-if="Object.keys(establishments).length"
            class='fill-height'
            color='grey lighten-4'
          >
            <v-card-text>
              <v-card-title class='text-h5'>
                Seleccione un establecimiento
              </v-card-title>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
// import GoogleMaps from './components/GoogleMaps';
import { getCoodinatesByEstablishment, getEstablishments } from '@/api/ApiServices';
import ViewMaps from '@/components/ViewMaps.vue';

export default {
  name: 'App',

  components: {
    ViewMaps,
    // GoogleMaps,
  },

  data:() => ({
    codigo_vu: '',
    establishments: [],
    establishment: {
    },
    coordinates: [],
  }),
  methods: {
    async getEstablishment() {
      const response = await getEstablishments();
      this.establishments = response.data;
    },
    async getLocalEstablishmentByVuCode(codigo_vu) {
      this.establishment = this.establishments.find((establishment) => establishment.codigo_vu === codigo_vu);
      this.coordinates = await getCoodinatesByEstablishment(this.establishment.codigo_vu);
      },
  },
  created() {
    this.getEstablishment();
  },
};
</script>

<style scoped>
.fill-width {
  height: 100vh;
}
#charging-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>