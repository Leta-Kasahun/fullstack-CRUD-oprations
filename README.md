## 🖼️ Demo Screenshots

### ➕ Add a New Book
This screenshot shows the form for adding a new book, which sends a `POST` request to the server.

![Add New Book](addNew.png)

---

### 📖 View All Books
This shows the list of all added books fetched from the backend using a `GET` request.

![View Books](veiw.png)

---

# fullstack-CRUD-oprations
fullstack(MYSQL, express , JS, CSS ,HTML) oprations which includes all basic commen express methodes (get, put, post and delete).
Fullstack CRUD Operations
A full-stack application built with MySQL, Express.js, JavaScript, CSS, and HTML, demonstrating core CRUD (Create, Read, Update, Delete) operations using Express.js methods.<br>

🛠️ Core Express Methods Explained
Below is an overview of the core Express.js methods used in this project, along with example code for both the backend and frontend. <br>
1. GET - Retrieve Books
Fetches all books from the database.
// Backend (Express Route)
app.get('/books', async (req, res) => {
  const books = await Book.findAll();
  res.json(books);
});

// Frontend Usage
fetch('/books')
  .then(res => res.json())
  .then(books => renderBookList(books));<br>

2. POST - Add New Book
Creates a new book entry in the database.
// Backend
app.post('/books', async (req, res) => {
  const newBook = await Book.create(req.body);
  res.status(201).json(newBook);
});

// Frontend
fetch('/books', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt"
  })
});
<br>
3. PUT - Update Book Details
Updates an existing book's details based on its ID.
// Backend
app.put('/books/:id', async (req, res) => {
  const updated = await Book.update(req.body, {
    where: { id: req.params.id }
  });
  res.json(updated);
});
<br>
4. DELETE - Remove Book
Deletes a book from the database based on its ID.
// Backend
app.delete('/books/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM books WHERE id = ?', id, (error) => {
    if (error) throw error;
    res.status(204).send();
  });
});

<br>
🚀 Getting Started
To run this project locally:


Install dependencies:npm install


Set up MySQL:
Create a MySQL database.
Update the database configuration in the backend code.


Start the server:node server.js


Access the application:Open index.html in a browser or navigate to http://localhost:3000.

<br>
📋 Technologies Used
<br>
Backend: Express.js, MySQL
Frontend: HTML, CSS, JavaScript
Database: MySQL

<br>
📝 Notes

Ensure the MySQL server is running and properly configured.
The frontend communicates with the backend via RESTful API calls.
Error handling is implemented for robust operation.

