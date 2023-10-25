const startLat = 43.930;
const startLon = 19.786;
const finishLat = 52.796;
const finishLon = 44.396;
const mapLatDistance = finishLat - startLat;
const mapLonDistance = finishLon - startLon;

const latToPercent = (lat) => {
  return 100 - ((lat - startLat) / mapLatDistance) * 100;
};

const lonToPercent = (lon) => {
  return ((lon - startLon) / mapLonDistance) * 100;
};

export default function coordsTransform(lat, lon) {
  return [lonToPercent(lon), latToPercent(lat)];
}