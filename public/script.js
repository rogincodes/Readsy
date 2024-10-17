let bookCount = 0;
let searchQuery = "";
let sorted = "";
let theGenre = "";

const input = document.getElementById('search-input');
const bookshelf = document.getElementById('bookshelf');

const fetchResults = async (query) => {
  if (query.length === 0) {
    hideSearchText();
  }

  try {
    searchQuery = query;
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    const results = data.books;
    bookCount = results.length;
    sorted = data.sort;
    theGenre = data.genre;
    generateSearchText();
    if (query === "") {
      hideSearchText();
    } else {
      showSearchText();
    }

    // Populate the bookshelf with results
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
  } catch (error) {
    console.error('Error fetching search results:', error);
    bookshelf.innerHTML = '<p>Error fetching results</p>'; // Handle error
  }
};

// Event listener for input changes
input.addEventListener('input', () => {
    fetchResults(input.value);
});

// Sort
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
    generateSearchText();

    // Populate the book list with the sorted results
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
  } catch (error) {
    console.error('Error fetching search results:', error);
    bookshelf.innerHTML = '<p>Error fetching results</p>'; // Handle error
  }
});

// Sort by genre
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
    generateSearchText();
    showSearchText();

    // Populate the book list with the sorted results
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
  } catch (error) {
    console.error('Error fetching search results:', error);
    bookshelf.innerHTML = '<p>Error fetching results</p>'; // Handle error
  }
});

// Build search text
function generateSearchText() {
  const searchText = document.getElementById('search-text');
  // check if singular or plural
  let noun = "";
  if (bookCount === 1) {
    noun = "result";
  } else {
    noun = "results";
  };

  if (theGenre === "") {
    searchText.innerHTML = `<strong>${bookCount}</strong> ${noun} for books matching <strong>${searchQuery}</strong> sorted by ${sorted}`;
  } else {
      if (searchQuery.length === 0) {
        searchText.innerHTML = `<strong>${bookCount}</strong> ${noun} for books with ${theGenre} genre sorted by ${sorted}`;
      } else {
        searchText.innerHTML = `<strong>${bookCount}</strong> ${noun} for books matching <strong>${searchQuery}</strong> with ${theGenre} genre sorted by ${sorted}`;
      }
    
  };
}

function showSearchText() {
  const searchDiv = document.getElementById('search-pane');
  searchDiv.style.display = 'flex'; // Set display to flex
}

function hideSearchText() {
  const searchDiv = document.getElementById('search-pane');
  searchDiv.style.display = 'none'; // Set display to flex
}