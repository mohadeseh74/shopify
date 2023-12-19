class FilterHandler {
  // This map will save the result of previous requests. So we don't need to send the same request again.
  static #requestCacheMap = new Map();

  // List of elements that we need to access in this class
  static #elementList = {
    sidebarBackdrop: document.getElementById("sidebar-backdrop"),
    filterForm: document.getElementById("filter-form"),
    sortby: document.getElementById("sort-by"),
    productCounter: document.getElementById("product-counter"),
    generalLoader: document.getElementById("general-loader"),
    productList: document.getElementById("product-list"),
    filterSidebar: document.getElementById("filter-sidebar"),
    sidebarOpenButton: document.getElementById("sidebar-open-button"),
    sidebarColseButton: document.getElementById("sidebar-close-button"),
    activeProductFilter: document.getElementById("active-product-filter"),
    removeButton: document.getElementById("clear-all"),
  };

  static setListeners() {
    FilterHandler.#showRemoveAll();
    FilterHandler.#setSidebarListener();
    FilterHandler.#elementList.filterForm.addEventListener(
      "submit",
      FilterHandler.#onFilterSubmit
    );
    FilterHandler.#elementList.sortby.addEventListener(
      "change",
      FilterHandler.#onSortByChanged
    );
  }

  static onActiveFilterClick(event) {
    event.preventDefault();

    if (FilterHandler.#isSidebarOpen) {
      FilterHandler.#toggleFilterSidebar();
    }

    const searchParams =
    event.currentTarget.href.indexOf("?") == -1
      ? ""
      : event.currentTarget.href.slice(
          event.currentTarget.href.indexOf("?") + 1
        );

    FilterHandler.#updateUrl(searchParams);
    FilterHandler.#renderPage(searchParams);
  }

  static #onFilterSubmit(event) {
    event.preventDefault();

    if (FilterHandler.#isSidebarOpen) {
      FilterHandler.#toggleFilterSidebar();
    }

    const params = new URLSearchParams(window.location.search);
    const data = new FormData(event.target);

    // Remove prev filters
    for (const [key] of params.entries()) {
      if(key.includes("filter")) {
        params.delete(key);
      }
    }

    // Append new filters that contain value
    for (const [name, value] of data) {
      if(value) {
        params.append(name, value);
      }
    }

    FilterHandler.#updateUrl(params.toString());
    FilterHandler.#renderPage(params.toString());
  }

  static #changeLoaderScreenStatus(isLoading) {
    if (isLoading) {
      FilterHandler.#elementList.generalLoader.classList.add("sidebar-backdrop__open");
    } else {
      FilterHandler.#elementList.generalLoader.classList.remove("sidebar-backdrop__open");
    }
  }

  static #onSortByChanged(event) {
    var value = event.target.value;

    // Check for existing query parameters
    var params = new URLSearchParams(location.search);
    // Go to first page
    if (params.has("page")) {
      params.delete("page");
    }

    // Remove search phrase
    if (params.has("q")) {
      params.delete("q");
    }

    // Update sort_by parameter
    params.set("sort_by", value);

    FilterHandler.#updateUrl(params.toString());
    FilterHandler.#renderPage(params.toString());
  }

  static #setSidebarListener() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && FilterHandler.#isSidebarOpen) {
          FilterHandler.#toggleFilterSidebar();
        }
      }
    );

    FilterHandler.#elementList.sidebarOpenButton.addEventListener(
      "click",
      () => {
        if (!FilterHandler.#isSidebarOpen) {
          FilterHandler.#toggleFilterSidebar();
        }
      }
    );

    FilterHandler.#elementList.sidebarColseButton.addEventListener(
      "click",
      () => {
        if (FilterHandler.#isSidebarOpen) {
          FilterHandler.#toggleFilterSidebar();
        }
      }
    );

    FilterHandler.#elementList.sidebarBackdrop.addEventListener("click", () => {
      FilterHandler.#toggleFilterSidebar();
    });
  }

  static get #isSidebarOpen() {
    return FilterHandler.#elementList.filterSidebar.classList.contains(
      "sidebar__open"
    );
  }

  static #toggleFilterSidebar() {
    FilterHandler.#elementList.filterSidebar.classList.toggle("sidebar__open");
    FilterHandler.#elementList.sidebarBackdrop.classList.toggle("sidebar-backdrop__open");
  }

  static #updateUrl(searchParams) {
    // push new state to history stack. In this way we have an accessable URL and we can go back to it or share it.
    // to find out more you can check this: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  static #renderPage(searchParams) {
    const url = `${window.location.pathname}?${searchParams}`;

    if (FilterHandler.#requestCacheMap.has(url)) {
      // render the page from cache
      FilterHandler.#renderFormCache(url);
    } else {
      // render the page from server
      FilterHandler.#renderFormFetch(url);
    }
  }

  static #renderSections(html) {
    FilterHandler.#renderFilters(html);
    FilterHandler.#renderCounter(html);
    FilterHandler.#renderProductList(html);
    FilterHandler.#renderActiveProductFilter(html);
    FilterHandler.#showRemoveAll();
  }

  static #renderFormFetch(url) {
    // Fetch new page from server
    FilterHandler.#changeLoaderScreenStatus(true);
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        // save the result of this request in cache
        FilterHandler.#requestCacheMap.set(url, html);
        // these render functions act like pjax
        FilterHandler.#renderSections(html);
      })
      .catch((error) => {
        // Can be handled better
        alert("Something went wrong. Please try again later.");
      })
      .finally(() => {
        FilterHandler.#changeLoaderScreenStatus(false);
      });
  }

  static #renderFormCache(url) {
    FilterHandler.#changeLoaderScreenStatus(true);
    // load cached page
    const html = FilterHandler.#requestCacheMap.get(url);
    // these render functions act like pjax
    FilterHandler.#renderSections(html);
    FilterHandler.#changeLoaderScreenStatus(false);
  }

  static #renderFilters(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const filterForm = doc.getElementById("filter-form");
    FilterHandler.#elementList.filterForm.innerHTML = filterForm.innerHTML;
  }

  static #renderCounter(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const productCounter = doc.getElementById("product-counter");
    FilterHandler.#elementList.productCounter.innerHTML =
      productCounter.innerHTML;
  }

  static #renderProductList(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const productList = doc.getElementById("product-list");
    FilterHandler.#elementList.productList.innerHTML = productList.innerHTML;
  }

  static #renderActiveProductFilter(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const productFilter = doc.getElementById("active-product-filter");
    FilterHandler.#elementList.activeProductFilter.innerHTML =
    productFilter.innerHTML;
  }

  // Hanlde showing clear-all-button when badges exist
  static #showRemoveAll(){
    let childNodes = FilterHandler.#elementList.activeProductFilter.hasChildNodes();
    if(childNodes){
      FilterHandler.#elementList.removeButton.classList.remove("hidden")
    }else {
      FilterHandler.#elementList.removeButton.classList.add("hidden")
    }
  }
}

FilterHandler.setListeners();
const onActiveFilterClick = FilterHandler.onActiveFilterClick;


