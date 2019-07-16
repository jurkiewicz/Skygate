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
          span = createNode('span'),
          button = createNode('button');
        li.addEventListener("click", function create(e) {
          description(li);
          li.removeEventListener("click", create);
        });
        span.innerHTML = `${city.city.replace(/\uFFFD/g,"?")}`;
        append(li, button);
        append(li, span);
        append(ul, li);
      })
    })
    .catch(error => {
      console.log('Request failed', error);
    });
}

function hide(el) {
  el.style.color = "black";
  el.getElementsByClassName("description")[0].style.display = "none";
  el.removeEventListener("click", close);

  el.addEventListener("click", function open(e) {
    show(el);
  });
}

function show(el) {
  el.style.color = "navy";
  el.getElementsByClassName("description")[0].style.display = "block";
}

function description(el) {

  el.style.color = "navy";

  var city = el.getElementsByTagName("span")[0].innerHTML;

  var wikiUrl = "https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&redirects=1&titles=" + city;

  fetch(wikiUrl).then(function(resp) {
    return resp.json()
  }).then(function(data) {
    var index = Object.keys(data.query.pages);
    var text = data.query.pages[index].extract;
    var dsr = "";
    if (text != null) {
      var sentence = text.split(".");
      for (var i = 0; i < sentence.length; i++) {
        dsr = dsr.concat(sentence[i] + ". ");
        if (dsr.length > 500) {
          break;
        }
      }

    } else {
      dsr = "We can't find any informations about this city now."
    }
    var div = createNode("div");
    div.className = "description";
    div.innerHTML = dsr;
    append(el, div);
  });

  el.addEventListener("click", function close(e) {
    hide(el);
  });
}

function createNode(element) {
  return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}

window.onbeforeunload = function() {
  localStorage.setItem("country", myCountry.innerHTML);
}

window.onload = function() {
  var country = localStorage.getItem("country");
  if (country !== null) {
    search(country);
  }
}

autocomplete(document.getElementById("myInput"), countries);

submit(document.getElementById("mySubmit"), document.getElementById("myInput"));
