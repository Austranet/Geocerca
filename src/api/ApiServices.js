import axios from 'axios';
const baseUrl = 'https://mma-api.azurewebsites.net/api/';
export const getEstablishmentsByVuCode = async (codigo_vu) => {
  return await axios.get(`${baseUrl}establecimientos/${codigo_vu}`);
}

export const getEstablishments = async () => {
  return await axios.get(`${baseUrl}establecimientos`);
}