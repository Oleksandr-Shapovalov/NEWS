// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();
const newsService = (function () {
  const apiKey = "31135756d77b4e3da54f9d1c12a2b3a4";
  const apiUrl = "https://newsapi.org/v2";
  return {
    topHeadLines(country = "ua", category = "general", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();
// elements
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const categorySelect = form.elements["category"];
const searchInput = form.elements["search"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

// lOAD news func
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;
  if (!searchText) {
    newsService.topHeadLines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

//on get response server
function onGetResponse(err, res) {
  removeLoader();
  if (err) {
    showAlert(err, "error-msg");
    return;
  }
  if (!res.articles.length) {
    //show empty message
  }
  renderNews(res.articles);
}

// render news
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";
  news.forEach((newsItem) => {
    const el = newsItemTemplate(newsItem);
    fragment += el;
  });
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}
// clear container
function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// news item template func
function newsItemTemplate({ urlToImage, title, url, description } = {}) {
  if (!urlToImage) {
    urlToImage =
      "https://static5.depositphotos.com/1034327/459/i/600/depositphotos_4590772-stock-photo-word-news-old-plumb-letters.jpg";
  }
  return `
<div class="col s12">
  <div class="card small">
    <div class="card-image">
      <img src="${urlToImage}" alt="" />
      <span class="card-title" style="font-size: medium;">${title || ""}</span>
    </div>
    <div class="card-content">
      <p>${description || ""}</p>
    </div>
    <div class="card-action">
      <a href="${url}">Read more</a>
    </div>
  </div>
</div>
  `;
}

function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

// show loader
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="progress">
      <div class="indeterminate"></div>
    </div>`
  );
}

// remove loader
function removeLoader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
