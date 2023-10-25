const addElem = (tagname, className) => {
  const element = document.createElement(tagname);
  if (className) {
    element.classList.add(className);
  }
  return element;
};

const mapCrimeNames = name => {

  let result = '';

  switch (name) {
    case 'Human losses':
      result = 'Human losses';
      break;
    case 'Death of an individual':
      result = 'Death';
      break;
    case 'Those wounded or whose health was otherwise damaged':
      result = 'Wounded';
      break;
    case 'Disappearance of an individual':
      result = 'Disappearance';
      break;
    case 'Rape':
      result = 'Rape';
      break;
    case 'Violation of other rights':
      result = 'Rights Violation';
      break;
  }

  return result;
};


const getEndpoint = (lat, lon) => `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&lang=en&apiKey=989b5d866a1a454b87571e6003e6add0`;

const fetchCityData = async (url) => {

  const cachedData = localStorage.getItem(url);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  try {
    console.log('Api call!!!')
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Fetching error with url: ${url}`);
    }

    const data = await response.json();

    localStorage.setItem(url, JSON.stringify({name: data.features[0].properties.city}));

    return data;
  } catch {
    throw new Error('FETCHING FAILED')
  }


};



export { addElem, mapCrimeNames, fetchCityData, getEndpoint };