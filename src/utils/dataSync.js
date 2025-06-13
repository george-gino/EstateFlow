import { propertyService, transformSupabaseData } from '../services/databaseService';

/**
 * Data synchronization utilities for EstateFlow
 */

// Cache key for localStorage
const PROPERTIES_CACHE_KEY = 'estateflow_properties_cache';
const CACHE_TIMESTAMP_KEY = 'estateflow_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const dataSync = {
  // Get properties with caching fallback
  async getPropertiesWithCache() {
    try {
      // Try to get fresh data from Supabase
      const properties = await propertyService.getAll();
      const transformedProperties = transformSupabaseData(properties);
      
      // Cache the data
      this.cacheProperties(transformedProperties);
      
      return transformedProperties;
    } catch (error) {
      console.warn('Failed to fetch from Supabase, using cache:', error);
      
      // Fallback to cached data
      return this.getCachedProperties();
    }
  },

  // Cache properties in localStorage
  cacheProperties(properties) {
    try {
      localStorage.setItem(PROPERTIES_CACHE_KEY, JSON.stringify(properties));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache properties:', error);
    }
  },

  // Get cached properties
  getCachedProperties() {
    try {
      const cached = localStorage.getItem(PROPERTIES_CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (!cached || !timestamp) {
        return [];
      }

      // Check if cache is still valid
      const cacheAge = Date.now() - parseInt(timestamp);
      if (cacheAge > CACHE_DURATION) {
        console.log('Cache expired, returning empty array');
        return [];
      }

      return JSON.parse(cached);
    } catch (error) {
      console.warn('Failed to get cached properties:', error);
      return [];
    }
  },

  // Clear cache
  clearCache() {
    try {
      localStorage.removeItem(PROPERTIES_CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  // Check if we have internet connectivity
  async checkConnectivity() {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}; 