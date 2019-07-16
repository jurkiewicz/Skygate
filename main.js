var countries = ["Poland", "Germany", "Spain", "France"];

function autocomplete(inp, arr) {
  var currentFocus;

  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function(e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}

function submit(sub, inp) {
  sub.addEventListener("click", function(e) {
    search(inp.value);
  });
}

const ul = document.getElementById('cities');
const myCountry = document.getElementById('country');

function search(val) {

  myCountry.innerHTML = val;

  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  var codeUrl = "https://restcountries.eu/rest/v2/name/" + val + "?fields=alpha2Code";

  var result = fetch(codeUrl, {
      method: 'get',
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      var code = data[0].alpha2Code;

      return fetch("https://api.openaq.org/v1/cities/?limit=10&sort=desc&order_by=count&country=" + code);
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      let cities = data.results;
      return cities.forEach(city => {
        let li = createNode('li'),
          span = createNode('span');
        li.addEventListener("click", e => {
          description(li);
        });
        span.innerHTML = `${city.city}`;
        append(li, span);
        append(ul, li);
      })
    })
    .catch(error => {
      console.log('Request failed', error);
    });
}

function description(el) {
  // let div = createNode('div');
  // div.innerHTML = `${city.city}`;
  // append(el, div);
  el.style.color = "navy";

  var wikiUrl = "https://www.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" + el.firstChild.innerHTML;

  fetch(wikiUrl, {
      method: 'get',
      headers: {
            'Content-Type': 'application/json',
            'Origin': '*'
      },
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      var dscr = data;
      console.log(data);
    })
    .catch(error => {
      console.log('Request failed', error);
    });
}

function createNode(element) {
  return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}

autocomplete(document.getElementById("myInput"), countries);

submit(document.getElementById("mySubmit"), document.getElementById("myInput"));
