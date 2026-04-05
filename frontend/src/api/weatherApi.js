import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const weatherApi = {
  getHealth: () => api.get('/health'),
  
  // ĐÃ SỬA: Đổi `province` thành `province_code` để FastAPI hiểu được
  getCompare: (date, province) => api.get('/predictions/compare', { 
    params: { date: date, province_code: province } 
  }),
  
  getPredictions: (page = 1, limit = 15, province = null) => 
    api.get('/predictions', { params: { page, limit, province_code: province } }),
};