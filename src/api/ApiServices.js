import axios from 'axios';
// const baseUrl = 'https://mma-api.azurewebsites.net/api/';
const baseUrl = 'http://localhost:3000/';
/**
 *
 * @description Obtiene los datos de un establecimiento por su codigo_vu
 * @param {string} codigo_vu
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getEstablishmentsByVuCode = async (codigo_vu) => {
  return await axios.get(`${baseUrl}establecimientos/${codigo_vu}`);
}

/**
 * @description Obtiene todos los establecimientos
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getEstablishments = async () => {
  return await axios.get(`${baseUrl}establecimientos`);
}

/**
 *
 * @description Inserta una lista de coordenadas en la base de datos
 * @param data
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const pushBulkCoordinates = async (data) => {
  return await axios.post(`${baseUrl}coordenadasBulk`, data);
}

/**
 * @description Obtiene las coordenadas de un establecimiento por su codigo_vu
 * @param {string} codigo_vu
 * @returns {Promise<any>}
 */
export const getCoodinatesByEstablishment = async (codigo_vu) => {
  const response = await axios.get(`${baseUrl}coordenadas/${codigo_vu}`);
  return response.data;
}

/**
 * @description Inserta una lista de puntos de referencia en la base de datos
 * @param data
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const pushBulkWayPoints = async (data) => {
  return await axios.post(`${baseUrl}puntosReferencia`, data);
}

/**
 * @description Obtiene los puntos de referencia de un establecimiento por su codigo_vu
 * @param {string} codigo_vu
 * @returns {Promise<any>}
 */
export const getWayPointsByVuCode = async (codigo_vu) => {
  const response = await axios.get(`${baseUrl}puntosReferencia/${codigo_vu}`);
  return response.data;
}
