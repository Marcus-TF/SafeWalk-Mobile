import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE_URL = `http://${BASE_HOST}:8080/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

const normalizeErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data === 'string') return data;
  if (error?.code === 'ECONNABORTED') return 'Tempo de resposta excedido. Tente novamente.';
  if (error?.message === 'Network Error') {
    return `Erro de conexão. Verifique se o backend está rodando em ${API_BASE_URL}`;
  }
  return fallback;
};

export const authAPI = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao fazer login.'));
    }
  },

  async signup(data) {
    try {
      const response = await api.post('/auth/signup', data);
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao criar conta.'));
    }
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getToken() {
    return AsyncStorage.getItem('token');
  },

  async getCurrentUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async saveUser(user) {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },
};

export const occurrenceAPI = {
  async getAll() {
    try {
      const response = await api.get('/occurrences');
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao carregar ocorrências.'));
    }
  },

  async getHotspots() {
    try {
      const response = await api.get('/occurrences/hotspots');
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao carregar zonas de calor.'));
    }
  },

  async getMy() {
    try {
      const response = await api.get('/occurrences/my');
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao carregar suas ocorrências.'));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/occurrences/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao carregar ocorrência.'));
    }
  },

  async create(data) {
    try {
      const response = await api.post('/occurrences', data);
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao registrar ocorrência.'));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/occurrences/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao atualizar ocorrência.'));
    }
  },

  async delete(id) {
    try {
      await api.delete(`/occurrences/${id}`);
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao excluir ocorrência.'));
    }
  },
};

export const userAPI = {
  async findById() {
    try {
      const response = await api.get('/users/findById');
      await authAPI.saveUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao carregar usuário.'));
    }
  },

  async update(data) {
    try {
      await api.put('/users/update', data);
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        notifyHigh: data.notifyHigh,
        notifyMedium: data.notifyMedium,
        notifyLow: data.notifyLow,
      };
      await authAPI.saveUser(user);
      return user;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao atualizar conta.'));
    }
  },

  async delete() {
    try {
      await api.delete('/users');
      await authAPI.logout();
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao excluir conta.'));
    }
  },
};

export const passwordAPI = {
  async forgot(email) {
    try {
      await api.post('/password/forgot', null, { params: { email } });
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao enviar instruções de recuperação.'));
    }
  },

  async reset(token, password) {
    try {
      await api.post('/password/reset', null, { params: { token, password } });
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, 'Erro ao redefinir senha.'));
    }
  },
};

export const occurrenceTypes = [
  'Assalto',
  'Furto',
  'Roubo de Veículo',
  'Vandalismo',
  'Pessoa Suspeita',
  'Iluminação Precária',
  'Área Deserta',
  'Outro',
];

export const riskLevels = ['Baixo', 'Médio', 'Alto'];

export const apiConfig = {
  API_BASE_URL,
};

export default api;
