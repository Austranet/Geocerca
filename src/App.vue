<template>
  <v-app>
    <v-container>
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
          <GoogleMaps
            v-if="Object.keys(establishment).length"
            :establishment="establishment"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import GoogleMaps from './components/GoogleMaps';
import { getEstablishments, getEstablishmentsByVuCode } from '@/api/ApiServices';

export default {
  name: 'App',

  components: {
    GoogleMaps,
  },

  data:() => ({
    message: process.env.VUE_APP_EXAMPLE,
    codigo_vu: '',
    establishments: [],
    establishment: {

    },
  }),
  methods: {
    async getEstablishment() {
      const response = await getEstablishments();
      this.establishments = response.data;
    },
    async getEstablishmentByCode() {
      const response = await getEstablishmentsByVuCode('5452292');
      this.establishment = response.data;
    },
    getLocalEstablishmentByVuCode(codigo_vu) {
      this.establishment = this.establishments.find((establishment) => establishment.codigo_vu === codigo_vu);
    },
  },
  created() {
    this.getEstablishment();
    this.getEstablishmentByCode();
  },
};
</script>

<style scoped>
.fill-width {
  height: 100vh;
}
</style>