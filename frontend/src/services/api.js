import axios from 'axios';

const API_BASE_URL = 'https://scamshield-dlum.onrender.com/api/v1';

export const scanUrl = async (url) => {
  const response = await axios.post(`${API_BASE_URL}/scan/url`, { url });
  return response.data;
};

export const scanMessage = async (message_text) => {
  const response = await axios.post(`${API_BASE_URL}/scan/message`, { message_text });
  return response.data;
};

export const getRecentScans = async () => {
  const response = await axios.get(`${API_BASE_URL}/scans/recent`);
  return response.data;
};

export const getScanDetails = async (scan_id) => {
  const response = await axios.get(`${API_BASE_URL}/scans/${scan_id}`);
  return response.data;
};