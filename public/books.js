let bookCount = 0;
let searchQuery = "";
let sorted = "";
let theGenre = "";

// SEARCH
const input = document.getElementById('search-input');
const bookshelf = document.getElementById('bookshelf');
const fetchResults = async (query) => {
  if (query.length === 0) {
    if (theGenre === "") {
      hideSearchFilter();
    } else {
      showSearchFilter();
    }
  } else {
    showSearchFilter();
  }

  try {
    searchQuery = query;
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    const results = data.books;
    bookCount = results.length;
    sorted = data.sort;
    theGenre = data.genre;
    await generateFilterText();
    if (query === "") {
      if (theGenre === "") {
        await hideSearchFilter();
      } else {
        await showSearchFilter();
      }
    } else {
      await showSearchFilter();
    }
    await updateBookshelf(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    bookshelf.innerHTML = '<p>Error fetching results</p>'; // Handle error
  }
};
// Event listener for input changes
input.addEventListener('input', async () => {
    await fetchResults(input.value);
});

// SORT BY DATE, TITLE OR RATING
const sortSelect = document.getElementById('sort-select');
sortSelect.addEventListener('change', async () => {
  try {
    const sortValue = sortSelect.value;
    // Send a POST request to the server
    const response = await fetch('/sort', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ sort: sortValue }),
    });

    // Get the sorted books from the response
    const data = await response.json();
    const results = data.books;
    bookCount = results.length;
    sorted = data.sort;
    theGenre = data.genre;
    await generateFilterText();
    await updateBookshelf(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    bookshelf.innerHTML = '<p>Error fetching results</p>'; // Handle error
  }
});

// SORT BY GENRE
const genreSelect = document.getElementById('genre-select');
genreSelect.addEventListener('change', async () => {
  try {
    const genreValue = genreSelect.value;
    // Send a POST request to the server
    const response = await fetch('/genre', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ genre: genreValue }),
    });

    // Get the sorted books from the response
    const data = await response.json();
    const results = data.books;
    bookCount = results.length;
    sorted = data.sort;
    theGenre = data.genre;
    await generateFilterText();
    await showSearchFilter();
    await updateBookshelf(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    bookshelf.innerHTML = '<p>Error fetching results</p>'; // Handle error
  }
});

// Populate the BOOKSHELF with results
async function updateBookshelf(results) {
  bookshelf.innerHTML = results.map(book => `
    <div class="card">
      <a href="/journal/${book.id}">
        <img src="${book.img_url}" alt="" class="book-cover">
        <div class="book-details">
          <h1 class="limited-text">${book.title}</h1>
          <h3 class="book-author">${book.author}</h3>
          <h4 class="recommendation">Recommendation: ${book.rating}/10</h4>
        </div>
      </a>  
    </div>
  `).join('');
};

// Build the search text
async function generateFilterText() {
  const searchText = document.getElementById('search-text');
  // check if singular or plural
  let noun = "";
  if (bookCount === 1) {
    noun = "result";
  } else {
    noun = "results";
  };

  if (theGenre === "") {
    searchText.innerHTML = `<strong>${bookCount}</strong> ${noun} for books matching <strong>${searchQuery}</strong> sorted by <strong>${sorted}</strong>`;
  } else {
      if (searchQuery.length === 0) {
        searchText.innerHTML = `<strong>${bookCount}</strong> ${noun} for books with ${theGenre} genre sorted by <strong>${sorted}</strong>`;
      } else {
        searchText.innerHTML = `<strong>${bookCount}</strong> ${noun} for books matching <strong>${searchQuery}</strong> with ${theGenre} genre sorted by <strong>${sorted}</strong>`;
      }
  };
};

// Show filters
async function showSearchFilter() {
  const searchDiv = document.getElementById('search-pane');
  searchDiv.style.display = 'flex'; // Set display to flex
}

// Hide filters
async function hideSearchFilter() {
  const searchDiv = document.getElementById('search-pane');
  searchDiv.style.display = 'none'; // Set display to flex
}