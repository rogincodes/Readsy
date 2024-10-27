# Readsy 📚✨

Welcome to **Readsy**, your personalized reading companion! This website helps you keep track of books you've read and allows you to document your thoughts, reviews, and notes in one organized place.

🔗 **[Visit Readsy](https://readsy.onrender.com)**

> **Note**: The website is hosted on a free plan, so it may take up to 50 seconds to load the first time as the server may be in a sleep state.

## 🚀 Features

- **Books Collection**: Organize and maintain a collection of the books you've read.
- **Personal Notes**: Record detailed notes taken from each book.
- **Reviews**: Rate and review books to reflect on your reading experience.
- **User-Friendly Navigation**: Easily browse through your collection with intuitive navigation.

## 🎨 Tech Stack

- **Frontend**: HTML, CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Deployment**: Hosted on Render

## 📋 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/readsy.git

2. Navigate to the project directory:
   ```bash
   cd readsy

3. Install the dependencies:
   ```bash
   npm install

4. Create a Database:
   ```bash
   createdb your_database_name

5. Import the SQL File:
   ```bash
   psql -d your_database_name -f path/to/database.sql
> Replace your_database_name with the name of your database and path/to/database.sql with the actual path to your SQL file in your project.
   
6. Create a `.env` file with the following environment variables:
   ```env
   SESSION_SECRET=<your-session-secret>
   PG_USER=<your-database-username>
   PG_HOST=<your-database-host>
   PG_DATABASE=<your-database-name>
   PG_HOST=<your-database-password>
   PG_PORT=<your-database-port>

7. Run the server:
   ```bash
   node index.js

6. Open your browser and navigate to `http://localhost:3000.`

## 📝 Usage

1. **Add a Book:** Fill in the details such as isbn, title, author, and genre.
2. **Add Notes:** Include key insights, quotes, or personal interpretations in the notes section.
3. **Review a Book:** Share your thoughts on the book, rate it, and reflect on your reading journey.

## 🛠️ Contributing

If you'd like to contribute to Readsy, please fork the repository and submit a pull request. I appreciate all the support!

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgments

- **Node.js & Express.js** for a powerful and flexible backend
- **CSS** for creating a clean and responsive front end
- **PostgreSQL** for efficient and secure data storage
- **Render** for providing reliable hosting services
- **book-cover-api**: Used for retrieving book covers 🔗 **[Git](https://github.com/w3slley/bookcover-api)**
