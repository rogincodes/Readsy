import express, { query } from "express";
import axios, { all } from "axios";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;
env.config();

app.use(session({
  secret: process.env.SESSION_SECRET, // Add a secret key here
  resave: false, // Optional, depending on your requirements
  saveUninitialized: true, // Optional, depending on your requirements
  cookie: { secure: false } // Adjust this based on your environment (use true in production with HTTPS)
}));

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session()); 


// Connect to database
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Variables
let featured = [];
let random = [];
let latest = [];
let invalidISBN = "";
let specifiedBook = [];
let allBooks = [];
let sortOption = "date";
let allGenres = [];
let selectedGenre = "";
let booksByAuthor = [];
let userQuery = "";
let userAlreadyExist = "";
let userNotFound = "";
let incorrectPsswrd = "";
let userID = 0;

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect if not authenticated
};

async function getFeatured() {
  try {
    const result = await db.query("SELECT * FROM books WHERE user_id = $1 AND rating = 10 LIMIT 10;", [ userID ]);
    featured = result.rows;
  } catch (err) {
    console.err(err);
  } 
};

async function randomBook() {
  if (allBooks != 0) {  
    const num = Math.floor(Math.random() * allBooks.length);
    random = allBooks[num];
  } else {};
};

async function getLatest() {
  try {
    const result = await db.query("SELECT * FROM books WHERE user_id = $1 ORDER BY date_read DESC LIMIT 5;", [ userID ]);
    latest = result.rows;
  } catch (err) {
    console.err(err);
  } 
};

async function getAllBooks() {
  try {
    const result = await db.query("SELECT * FROM books WHERE user_id = $1 ORDER BY date_read DESC;", [ userID ]);
    allBooks = result.rows;
  } catch (err) {
    console.error(err);
  } 
};

async function sortBooks() {
  if (sortOption === "date") {
    allBooks.sort((a, b) => new Date(b.date_read) - new Date(a.date_read))
  } else if (sortOption === "title") {
    allBooks.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0; // equal titles
    });
  } else if (sortOption === "rating") {
    allBooks.sort((a, b) => b.rating - a.rating);
  }
};

async function getGenres() {
  try {
    const result = await db.query("SELECT DISTINCT genre from books WHERE user_id = $1 ORDER BY genre ASC;", [ userID ]);
    allGenres = result.rows;
  } catch (err) {
    console.error(err);
  }
};

async function getBooksByGenre() {
  const genre = selectedGenre ? selectedGenre.toLowerCase() : '';
  const results = allBooks.filter(book => book.genre.toLowerCase().includes(genre));
  allBooks = results;
};

async function getBooksByAuthor() {
  const author = specifiedBook.author;
  try {
    const result = await db.query("SELECT * from books WHERE user_id = $1 AND author = $2 ORDER BY date_read DESC", [ userID, author ]);
    booksByAuthor = result.rows;
  } catch (err) {
    console.error(err);
  }
}

// GET to sign-up page
app.get("/signup", (req, res) => {
  res.render("signup.ejs", {
    alreadyExist: userAlreadyExist
  });
});

// GET to login page
app.get("/login", (req, res) => {
  res.render("login.ejs", {
    notFound: userNotFound,
    wrongPsswrd: incorrectPsswrd
  });
});

// GET to home page
app.get("/", isAuthenticated, async (req, res) => {
  await getAllBooks();
  await randomBook();
  await getFeatured();
  await getLatest();
  res.render("index.ejs",
    { 
      lucky: random,
      featuredBooks: featured,
      latestBooks: latest,
      isbnError: invalidISBN,
    });
});

// GET to about page
app.get("/about.ejs", isAuthenticated, async (req, res) => {
  res.render("about.ejs");
});

// GET to contact page
app.get("/contact.ejs", isAuthenticated, async (req, res) => {
  res.render("contact.ejs");
});

// GET log out
app.get("/logout", (req, res) => {
  // reset values
  userAlreadyExist = "";
  userNotFound = "";
  incorrectPsswrd = "";
  random = [];

  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  })
})

// GET to new book page
app.get("/new.ejs", isAuthenticated, async (req, res) => {
  res.render("new.ejs",
    { 
      isbnError: invalidISBN,
    }
  );
});

// POST new book journal
app.post("/add", async (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title.trim();
  const author = req.body.author.trim();
  const genre = req.body.genre.trim();
  const date = req.body.dateRead;
  const rating = req.body.rating;
  const review = req.body.review;
  const notes = req.body.notes;
  try {
    // GET book cover from API
    const result = await axios.get(`https://bookcover.longitood.com/bookcover/${isbn}`);
    const img_URL = result.data.url;
    // INSERT data
    try {
      await db.query("INSERT INTO books (isbn, title, author, genre, img_URL, date_read, rating, review, notes, user_id)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);", [ isbn, title, author, genre, img_URL, date, rating, review, notes, userID ]);
      invalidISBN = "";
      res.redirect("/books.ejs");
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    console.error(err);
    invalidISBN = "Invalid input: Please use ISBN-13.";
    res.redirect("/new.ejs");
  }
});

// GET to specific book journal by id
app.get("/journal/:id", isAuthenticated, async (req, res) => {
  const rawId = req.params.id.trim();
  const id = parseInt(rawId, 10); 
  if (isNaN(id)) {
    return res.status(400).send('Invalid ID');
  }

  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [ id ]);
    specifiedBook = result.rows[0];
    await getBooksByAuthor();
    res.render("journal.ejs",
      {
        book: specifiedBook,
        authorBooks: booksByAuthor,
      }
    );
  } catch (err) {
    console.log(err);
  } 
});

// GET to edit page
app.get("/edit.ejs", isAuthenticated, async (req, res) => {
  const dateTimeString = specifiedBook.date_read;
  let dateOnly;
  if (typeof dateTimeString === 'string') {
    dateOnly = dateTimeString.split('T')[0];
  } else if (dateTimeString instanceof Date) {
    dateOnly = dateTimeString.toISOString().split('T')[0];
  } else {
    console.error('Invalid date format');
  }
  specifiedBook.date_read = dateOnly;
  res.render("edit.ejs", 
    {
      book: specifiedBook,
      isbnError: invalidISBN,
    }
  );
});

// UPDATE book journal
app.post("/modify", async (req, res) => {
  const isbn = req.body.isbn;
  const title = req.body.title.trim();
  const author = req.body.author.trim();
  const genre = req.body.genre.trim();
  const date = req.body.dateRead;
  const rating = req.body.rating;
  const review = req.body.review;
  const notes = req.body.notes;
  const id = specifiedBook.id
  try {
    // GET book cover from API
    const result = await axios.get(`https://bookcover.longitood.com/bookcover/${isbn}`);
    const img_URL = result.data.url;
    // UPDATE data
    try {
      await db.query("UPDATE books set isbn = $1, title = $2, author = $3, genre = $4, img_URL = $5, date_Read = $6, rating = $7, review = $8, notes = $9 WHERE id = $10;", [ isbn, title, author, genre, img_URL, date, rating, review, notes, id ]);
      invalidISBN = "";
      res.redirect(`/journal/${id}`);
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    console.error(err);
    invalidISBN = "Invalid input: Please use ISBN-13.";
    res.redirect("/edit.ejs");
  }
});

// DELETE a book journal
app.post("/delete/:id", async (req, res) => {
  const id = specifiedBook.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// GET to books page
app.get("/books.ejs", isAuthenticated, async (req, res) => {
  await getAllBooks();
  await getGenres();
  selectedGenre = "";
  sortOption = "date";
  res.render("books.ejs", 
    {
      typed: userQuery,
      books: allBooks,
      genres: allGenres
    }
  );
});

// POST sort books
app.post("/sort", async (req, res) => {
  sortOption = req.body.sort;
  await sortBooks();
  res.json({
    books: allBooks,
    sort: sortOption,
    genre: selectedGenre
  });
});

// POST sort by genre
app.post("/genre", async (req, res) => {
  selectedGenre = req.body.genre;
  await getAllBooks();
  await getBooksByGenre();
  const results = allBooks;
  res.json({
    books: allBooks,
    sort: sortOption,
    genre: selectedGenre
  });
});

// GET search book
app.get('/search', async (req, res) => {
  await getAllBooks();
  await getBooksByGenre();
  await sortBooks();
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  const results = allBooks.filter(book => book.title.toLowerCase().includes(query));
  allBooks = results;
  res.json({
    books: allBooks,
    sort: sortOption,
    genre: selectedGenre
  });
});

// POST login authentication
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);

// POST register account
app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [ email ]);
      if (checkResult.rows.length > 0 ) {
        // user already exists
        userAlreadyExist = "Email already in used, try logging in."
        res.redirect("/signup");
      } else {
        // password hashing
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password: ", err);
          } else {
            // insert user to the database
            const result = await db.query(
              "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *;",
              [ email, hash]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              userID = user.id;
              res.redirect("/");
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1;", [ username ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            // Error with password check
            console.error("Error comparing password: ", err);
            return cb(err);
          } else {
            if (valid) {
              // Passed password check
              userID = user.id;
              return cb(null, user);
            } else {
              // Did not pass password check
              incorrectPsswrd = "The password you’ve entered is incorrect.";
              return cb(null, false);
            }
          }
        });
      } else {
        userNotFound = "The email you entered isn’t a registered account.";
        return cb(null, false);
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});