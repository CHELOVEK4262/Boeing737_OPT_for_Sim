let airports = [];
    let runways = [];

    async function loadAirports() {
      try {
        const res = await fetch('https://cdn.jsdelivr.net/npm/@nitro-land/airport-codes@1.0.4/airports.json');
        airports = await res.json();
      } catch (e) {
        console.error("Ошибка загрузки списка аэропортов", e);
      }
    }

    function loadRunways() {
      return new Promise((resolve, reject) => {
        Papa.parse('runways.csv', {
          download: true,
          header: true,
          complete: results => {
            runways = results.data;
            resolve();
          },
          error: err => {
            console.error("Ошибка загрузки runways.csv", err);
            reject(err);
          }
        });
      });
    }

    async function init() {
      await loadAirports();
      await loadRunways();

      const input = document.getElementById('airportInput');
      const suggestions = document.getElementById('suggestions');
      const runwaySelect = document.getElementById('runwaySelect');

      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!q || !airports.length) return;

        const matches = airports.filter(item =>
          item.name.toLowerCase().includes(q) ||
          (item.icao && item.icao.toLowerCase().includes(q)) ||
          (item.iata && item.iata.toLowerCase().includes(q))
        ).slice(0, 10);

        matches.forEach(a => {
          const div = document.createElement('div');
          div.className = 'autocomplete-suggestion';
          div.textContent = `${a.name} (${a.icao} / ${a.iata})`;
          div.addEventListener('click', () => {
            input.value = `${a.icao} / ${a.iata}`;
            suggestions.innerHTML = '';
            fillRunways(a.icao);
          });
          suggestions.appendChild(div);
        });
      });

      document.addEventListener('click', e => {
        if (!suggestions.contains(e.target) && e.target !== input) {
          suggestions.innerHTML = '';
        }
      });

      function fillRunways(airportIdent) {
        runwaySelect.innerHTML = '';
        if (!airportIdent) return;

        const filteredRunways = runways.filter(r => r.airport_ident === airportIdent);

        const runwaySet = new Set();
        filteredRunways.forEach(r => {
          if (r.le_ident) runwaySet.add(r.le_ident.trim());
          if (r.he_ident) runwaySet.add(r.he_ident.trim());
        });

        if (runwaySet.size === 0) {
          const option = document.createElement('option');
          option.textContent = 'Нет данных о ВПП';
          option.disabled = true;
          runwaySelect.appendChild(option);
          return;
        }

        runwaySet.forEach(rwy => {
          const option = document.createElement('option');
          option.value = rwy;
          option.textContent = rwy;
          runwaySelect.appendChild(option);
        });
      }
    }

    window.addEventListener('DOMContentLoaded', init);