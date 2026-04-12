import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const weatherApi = {
  getHealth: () => api.get('/health'),
  
  getCompare: (date, province) => api.get('/predictions/compare', { 
    params: { date: date, province_code: province } 
  }),
  
  getPredictions: (page = 1, limit = 15, province = null) => 
    api.get('/predictions', { params: { page, limit, province_code: province } }),

  // API MỚI: Lấy dữ liệu theo Tỉnh và Tháng (mặc định năm 2021)
  getByProvinceAndMonth: (province, month, year = 2021) => 
    api.get('/predictions/by-province-month', { params: { province_code: province, month: month, year: year } }),
};