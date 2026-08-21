/**
 * Mock Multi-Region Redis Geo-Router
 * Simulates routing API requests to the nearest geographic Redis cache node
 * in an Active-Active multi-region cluster architecture.
 */

export class RedisGeoRouter {
  constructor() {
    // Mock configuration of global Redis instances
    this.regions = {
      'us-east': { endpoint: 'redis-useast.cara.local:6379', lat: 39.0438, lon: -77.4874 },
      'eu-west': { endpoint: 'redis-euwest.cara.local:6379', lat: 53.3498, lon: -6.2603 },
      'ap-south': { endpoint: 'redis-apsouth.cara.local:6379', lat: 19.0760, lon: 72.8777 }
    };
    this.defaultRegion = 'us-east';
  }

  /**
   * Calculates the Haversine distance between two coordinates in kilometers.
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Determines the nearest Redis cluster region based on client's IP geolocation.
   * @param {Object} clientGeo - { lat, lon }
   */
  getNearestRegion(clientGeo) {
    if (!clientGeo || !clientGeo.lat || !clientGeo.lon) {
      console.warn('[GeoRouter] Client geolocation missing, falling back to default region.');
      return this.regions[this.defaultRegion];
    }

    let nearestRegionName = this.defaultRegion;
    let shortestDistance = Infinity;

    for (const [regionName, regionData] of Object.entries(this.regions)) {
      const distance = this.calculateDistance(clientGeo.lat, clientGeo.lon, regionData.lat, regionData.lon);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestRegionName = regionName;
      }
    }

    console.log(`[GeoRouter] Client routed to ${nearestRegionName} (Distance: ${Math.round(shortestDistance)}km)`);
    return this.regions[nearestRegionName];
  }

  /**
   * Mocks a cache read operation directed at the nearest region.
   */
  async getCachedCatalog(clientGeo) {
    const targetRedis = this.getNearestRegion(clientGeo);
    console.log(`[GeoRouter] Connecting to ${targetRedis.endpoint} for catalog data...`);
    
    // Simulate ultra-low latency sub-millisecond network call since we are using nearest edge
    await new Promise(resolve => setTimeout(resolve, 5));
    
    return {
      source: targetRedis.endpoint,
      cachedAt: Date.now(),
      data: [{ id: 1, name: "Tropical Shirt" }, { id: 2, name: "Winter Coat" }] // mock data
    };
  }
}

// Usage Example in an Edge Function or Backend Middleware:
// const router = new RedisGeoRouter();
// 
// // Mock client IP geo-location injected via headers (e.g. from Cloudflare/AWS)
// const clientGeoData = { lat: 48.8566, lon: 2.3522 }; // Paris, France
// 
// async function handleRequest() {
//   const catalog = await router.getCachedCatalog(clientGeoData);
//   return catalog;
// }
