import DataService from '../../DataService.js';
import coordsTransform from './coords-transform.js';

const renderCircle = (x, y, r, className) => `<circle class="${className}" cx="${x}%" cy="${y}%" r="${r}px" />`;
const renderText = (x, y, text, className) => `<text class="${className}" x="${x}%" y="${y}%" text-anchor="middle" dominant-baseline="central">${text}</text>`

export default async function renderSVG(data) {

  if (!data) {
    return `
    <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
       viewBox="0 0 1656 900" style="enable-background:new 0 0 1656 900;"  preserveAspectRatio="xMidYMid slice" width=100% height=100%>
    <style type="text/css">
      .st0{fill:none;stroke:#000000;stroke-width:6;stroke-miterlimit:10;}
    </style>
    </svg>`;
  }

  let dots = '';

  const { selectedRegion, selectedCities, selectedCrimeTypes } = data;

  const events = await DataService.getCrimeCounts();



  const transformRegionData = (data) => {
    const filteredEvents = Object.entries(data)
      // .filter(([key, value]) => (value.length !== 0) && selectedCrimeTypes.some(numCode => numCode === key))
      .filter(([key, value]) => (value.length !== 0))
      .map(([key, value]) => ([key, value.filter(({lat, lon}) => lat && lon)]))
      .map(([key, value])=> {
        const trueLength = data[key].length
        const length = value.length;
        
        const averageLat = value.reduce((a, b) => a + b.lat, 0) / length;
        const averageLon = value.reduce((a, b) => a + b.lon, 0) / length;

        return {key, averageLat, averageLon, cnt: trueLength}
      }); // transform without empty arrs
    return filteredEvents.filter(({averageLat, averageLon}) => averageLat && averageLon);
  };

  const renderRegionDots = (data) => {
    return data
      .sort((a, b) => a.cnt - b.cnt)
      .map(({key, averageLat, averageLon, cnt}, idx)=> {
      const [x, y] = coordsTransform(averageLat, averageLon);

      const active = selectedCrimeTypes.some(type => type === key) ? 'active' : '';
      return `<g>
      ${renderCircle(x, y, 10 + (idx+1)*5, `type-${key}`)}
      ${renderText(x, y, cnt, `type-${key} ${active}` )}
      </g>
      `
    }).join('')
  }

  if (selectedRegion === 'All States') {
    const regions = await DataService.getAllRegions();
    regions.forEach(region => {
    const transformData = transformRegionData(events[region]);
    dots += renderRegionDots(transformData);
    })
  } else {
    const transformData = transformRegionData(events[selectedRegion]);
    dots = renderRegionDots(transformData);
  }

  return `
  <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 1656 900" style="enable-background:new 0 0 1656 900;"  preserveAspectRatio="xMidYMid slice" width=100% height=100%>
  <style type="text/css">
    .st0{fill:none;stroke:#000000;stroke-width:6;stroke-miterlimit:10;}
  </style>
  ${dots}
  </svg>`;
}
