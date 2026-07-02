const axios = require('axios');
const logger = require('../config/logger');

class ApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const BASE_URL = process.env.BASE_URL || '';
if (!BASE_URL) {
  logger.warn('BASE_URL is not defined in the environment variables. API calls may fail.');
}

const hasContextPath = BASE_URL.includes('/evaluation-service');

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = process.env.ACCESS_TOKEN;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      logger.warn('ACCESS_TOKEN is missing in environment variables. Request may be unauthorized.');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function handleAxiosError(error, endpointName) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    logger.error(`External API Error: Failed to fetch ${endpointName}. Status: ${status}`, { status, data });

    if (status === 401) {
      return new ApiError('Unauthorized: Invalid ACCESS_TOKEN provided to external service.', 401, data);
    }
    if (status === 403) {
      return new ApiError('Forbidden: Access to the external service was denied.', 403, data);
    }
    return new ApiError(`External service error on ${endpointName}: ${error.message}`, status, data);
  } else if (error.request) {
    logger.error(`External API Timeout/Network Failure: No response received from ${endpointName}.`, {
      code: error.code,
      message: error.message
    });

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiError('Gateway Timeout: The external API request timed out.', 504, { code: error.code });
    }
    return new ApiError('Bad Gateway: Failed to establish connection with external API.', 502, { code: error.code });
  } else {
    logger.error(`API Client Configuration Error fetching ${endpointName}: ${error.message}`);
    return new ApiError(`Internal Client Error: ${error.message}`, 500);
  }
}

async function fetchDepots() {
  try {
    logger.info('API Call: Fetching depots...');
    const url = hasContextPath ? '/depots' : '/evaluation-service/depots';
    const response = await apiClient.get(url);
    
    if (!response.data || !Array.isArray(response.data.depots)) {
      throw new ApiError('Bad Gateway: External service returned invalid depots structure.', 502, response.data);
    }
    
    return response.data.depots;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleAxiosError(error, 'depots');
  }
}

async function fetchVehicles() {
  try {
    logger.info('API Call: Fetching vehicles...');
    const url = hasContextPath ? '/vehicles' : '/evaluation-service/vehicles';
    const response = await apiClient.get(url);
    
    if (!response.data || !Array.isArray(response.data.vehicles)) {
      throw new ApiError('Bad Gateway: External service returned invalid vehicles structure.', 502, response.data);
    }
    
    return response.data.vehicles;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleAxiosError(error, 'vehicles');
  }
}

async function fetchNotifications() {
  try {
    logger.info('API Call: Fetching notifications...');
    const url = hasContextPath ? '/notifications' : '/evaluation-service/notifications';
    const response = await apiClient.get(url);
    
    if (!response.data || !Array.isArray(response.data.notifications)) {
      throw new ApiError('Bad Gateway: External service returned invalid notifications structure.', 502, response.data);
    }
    
    return response.data.notifications;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleAxiosError(error, 'notifications');
  }
}

module.exports = {
  fetchDepots,
  fetchVehicles,
  fetchNotifications,
  ApiError
};
