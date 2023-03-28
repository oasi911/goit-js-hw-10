import './css/styles.css';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';
import fetchCountries from './fetchCountries.js';

const input = document.querySelector('input#search-box');
const list = document.querySelector('ul.country-list');
const info = document.querySelector('div.country-info');
const DEBOUNCE_DELAY = 300;
input.addEventListener('input', debounce(runSearching, DEBOUNCE_DELAY));
list.addEventListener('click', e => {
  const item = e.target.closest('.item');
  if (item) {
    const countryName = item.querySelector('p').textContent;
    fetchCountries(countryName)
      .then(result => {
        showCountryInfo(result[0]);
      })
      .catch(error => {
        Notiflix.Notify.failure('Oops, something went wrong');
      });
  }
});

function showCountryInfo(country) {
  list.innerHTML = '';
  const {
    flags: { svg: flag },
    name: { common: countryName },
    capital,
    population,
    languages,
  } = country;

  const countryInfo = `<img class="info-flag" src="${flag}" />
            <h1>${countryName}</h1>
              <p><b>Capital:</b> ${capital}</p>
              <p><b>Population:</b> ${population}</p>
              <p><b>Languages:</b> ${Object.values(languages).join(', ')}</p>`;
  info.innerHTML = countryInfo;
}

function runSearching(e) {
  const inputValue = e.target.value.trim();
  if (inputValue !== '') {
    fetchCountries(inputValue)
      .then(result => {
        if (result.length > 1 && result.length <= 10) {
          info.innerHTML = '';
          const countriesList = result.reduce(
            (acc, { flags: { svg: flag }, name: { common: countryName } }) =>
              acc +
              `<li class="item"><img class="list-flag" src="${flag}"><p>${countryName}</p></li>`,
            ''
          );
          list.innerHTML = countriesList;
        } else if (result.length > 10) {
          Notiflix.Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
          list.innerHTML = '';
        }
        if (result.length === 1) {
          showCountryInfo(result[0]);
        }
      })
      .catch(error => {
        if (error.message === '404') {
          Notiflix.Notify.failure('Oops, there is no country with that name');
        }
      });
  } else {
    list.innerHTML = '';
    info.innerHTML = '';
  }
}
