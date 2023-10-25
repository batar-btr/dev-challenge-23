import { fetchCityData, getEndpoint } from './utils.js';

export default new class DataService {
  constructor() {
    this.events = null;
    this.names = null;
  }

  async fetchData() {
    if (!this.events && !this.names) {
      try {
        const resNames = await fetch('../data/names.json');
        this.names = await resNames.json();
        const resEvents = await fetch('../data/events.json');
        this.events = await resEvents.json();
      } catch (err) {
        console.error(err);
      }
    }
    return this;
  }

  async getCrimeType() {
    const crimeTypes = this.names[0].affected_type;
    delete crimeTypes['19'];
    return crimeTypes
  }

  async getAllRegions() {
    return Object.keys(this.events).sort();
  }

  async getCrimeCounts() {
    const crimeTypes = await this.getCrimeType();

    const result = Object.entries(this.events).map(([key, value]) => {
      const crimes = Object.keys(crimeTypes).map((id) => {
        return [id, value.filter(item => item = item.affected_type === +id)];
      });
      return [key, Object.fromEntries(crimes)];
    });

    return Object.fromEntries(result);

  }

  async getCrimesCountsByRegion(region) {
    if (region === 'All States') {
      const result = await this.getCrimeCounts();

      return Object.values(result).reduce((acc, cur) => {
        Object.entries(cur).forEach(([id, arr]) => {
          if (acc[id]) {
            acc[id] += arr.length;
          } else {
            acc[id] = arr.length;
          }
        });
        return acc;
      }, {});
    } else {
      const counts = await this.getCrimeCounts();
      return Object.fromEntries(Object.entries(counts[region]).map(([key, value]) => ([key, value.length])));
    }
  }


  async getCrimesByRegion(region) {
    const crimes = this.events[region];
    const types = await this.getCrimeType();
    const typesId = Object.keys(types);
    const result = crimes.filter(({ affected_type }) => typesId.some(id => +id === affected_type));
    return result;
  }

  async getRegionData(region) {
    const crimes = await this.getCrimesByRegion(region);

    const transformedCrimes = crimes.filter(({ lat, lon }) => lat && lon).map((item) => {
      return {
        ...item,
        lat: item.lat.toFixed(1),
        lon: item.lon.toFixed(1)
      };
    });
    return transformedCrimes;
    // const urls = [...new Set(transformedCrimes.map(({lat, lon})=> getEndpoint(lat, lon)))];

    // console.log(urls.length);

    // let result = await Promise.all(urls.map(url => fetchCityData(url)));
    
    // console.log(result);
    // console.log(result.map(({ city }) => city));
  }
};