import axios from 'axios';
// const baseUrl = 'https://mma-api.azurewebsites.net/api/';
const baseUrl = 'http://localhost:3000/';
export const getEstablishmentsByVuCode = async (codigo_vu) => {
  return await axios.get(`${baseUrl}establecimientos/${codigo_vu}`);
}

export const getEstablishments = async () => {
  return await axios.get(`${baseUrl}establecimientos`);
}

export const pushBulkCoordinates = async (data) => {
  return await axios.post(`${baseUrl}coordenadasBulk`, data);
}

export const getCoodinatesByEstablishment = async (codigo_vu) => {
  const response = await axios.get(`${baseUrl}coordenadas/${codigo_vu}`);
  return response.data;
}

export const pushBulkWayPoints = async (data) => {
  return await axios.post(`${baseUrl}puntosReferencia`, data);
}

export const getWayPointsByVuCode = async (codigo_vu) => {
  const response = await axios.get(`${baseUrl}puntosReferencia/${codigo_vu}`);
  return response.data;
}
