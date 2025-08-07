// DOM Elements
const form = document.getElementById('bookForm');
const createBtn = document.getElementById('createBtn');
const readBtn = document.getElementById('readBtn');
const updateBtn = document.getElementById('updateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const container = document.querySelector('.container');

// Helpers
function toggleForm(show) {
    form.style.display = show ? 'block' : 'none';
}

function clearExtraContent() {
    const extra = document.querySelector('#extraContent');
    if (extra) extra.remove();
}

function createTable(books) {
    const table = document.createElement('table');
    table.className = 'enhanced-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Publish Year</th>
                <th>Price (ETB)</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.publish_year ? new Date(book.publish_year).toLocaleDateString() : '-'}</td>
            <td>${book.price ? 'ETB ' + book.price.toLocaleString() : '-'}</td>
        `;
        tbody.appendChild(row);
    });

    return table;
}

// Submit (Create Book)
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const book = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        publish_year: document.getElementById('publish_year').value || null,
        price: document.getElementById('price').value || null
    };

    const res = await fetch('/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    });

    const data = await res.json();
    if (res.ok) {
        alert("✓ Book added successfully!");
        form.reset();
    } else {
        alert("✗ Error: " + (data.error || "Could not add book."));
    }
});

// View All Books
readBtn.addEventListener('click', async function () {
    toggleForm(false);
    clearExtraContent();

    const res = await fetch('/books');
    const data = await res.json();

    if (!data.success) {
        return alert("✗ Failed to load books");
    }

    const div = document.createElement('div');
    div.id = 'extraContent';
    div.className = 'action-container';

    if (data.books.length === 0) {
        div.innerHTML = '<p class="empty-message">No books found in the database</p>';
    } else {
        div.appendChild(createTable(data.books));
    }

    container.appendChild(div);
});

// Update Book

// Update Book - Corrected Version
updateBtn.addEventListener('click', async function () {
    toggleForm(false);
    clearExtraContent();

    try {
        const res = await fetch('/books');
        if (!res.ok) throw new Error("Failed to load books");
        const data = await res.json();

        const div = document.createElement('div');
        div.id = 'extraContent';
        div.className = 'action-container';

        if (!data.books || data.books.length === 0) {
            div.innerHTML = '<p class="empty-message">No books available to update</p>';
            container.appendChild(div);
            return;
        }

        div.innerHTML = `
            <h3>Select Book to Update</h3>
            <select id="bookSelector" class="enhanced-form">
                <option value="">-- Select a Book --</option>
                ${data.books.map(book =>
            `<option value="${book.id}">${book.id}. ${book.title} by ${book.author}</option>`
        ).join('')}
            </select>
            <form id="updateForm" class="enhanced-form" style="display:none;">
                <h3>Update Book Details</h3>
                <div class="form-group">
                    <label for="updateTitle">Title:</label>
                    <input type="text" id="updateTitle" required>
                </div>
                <div class="form-group">
                    <label for="updateAuthor">Author:</label>
                    <input type="text" id="updateAuthor" required>
                </div>
                <div class="form-group">
                    <label for="updateYear">Publish Year:</label>
                    <input type="date" id="updateYear">
                </div>
                <div class="form-group">
                    <label for="updatePrice">Price (ETB):</label>
                    <input type="number" id="updatePrice" min="0" step="0.01">
                </div>
                <button type="submit" class="btn btn-primary">Update Book</button>
            </form>
        `;

        container.appendChild(div);

        // Book selection handler
        document.getElementById('bookSelector').addEventListener('change', function () {
            const bookId = this.value;
            const updateForm = document.getElementById('updateForm');

            if (!bookId) {
                updateForm.style.display = 'none';
                return;
            }

            const selectedBook = data.books.find(book => book.id == bookId);
            if (selectedBook) {
                document.getElementById('updateTitle').value = selectedBook.title;
                document.getElementById('updateAuthor').value = selectedBook.author;
                document.getElementById('updateYear').value = selectedBook.publish_year?.split('T')[0] || '';
                document.getElementById('updatePrice').value = selectedBook.price || '';
                updateForm.style.display = 'block';
            }
        });

        // Form submission handler
        document.getElementById('updateForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const bookId = document.getElementById('bookSelector').value;

            if (!bookId) {
                alert("Please select a book to update");
                return;
            }

            const updatedBook = {
                title: document.getElementById('updateTitle').value,
                author: document.getElementById('updateAuthor').value,
                publish_year: document.getElementById('updateYear').value || null,
                price: parseFloat(document.getElementById('updatePrice').value) || null
            };

            try {
                const updateRes = await fetch(`/books/${bookId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedBook)
                });

                if (!updateRes.ok) {
                    const errorData = await updateRes.json();
                    throw new Error(errorData.error || "Update failed");
                }

                alert("✓ Book updated successfully!");
                updateBtn.click(); // Refresh the view
            } catch (err) {
                alert("✗ Error: " + err.message);
                console.error("Update error:", err);
            }
        });

    } catch (err) {
        alert("✗ Error: " + err.message);
        console.error("Error loading books:", err);
    }
});

// Delete Book - Corrected Version
deleteBtn.addEventListener('click', async function () {
    toggleForm(false);
    clearExtraContent();

    try {
        const res = await fetch('/books');
        if (!res.ok) throw new Error("Failed to load books");
        const data = await res.json();

        const div = document.createElement('div');
        div.id = 'extraContent';
        div.className = 'action-container';

        if (!data.books || data.books.length === 0) {
            div.innerHTML = '<p class="empty-message">No books available to delete</p>';
            container.appendChild(div);
            return;
        }

        div.innerHTML = `
            <h3>Select Book to Delete</h3>
            <select id="deleteSelector" class="enhanced-form">
                <option value="">-- Select a Book --</option>
                ${data.books.map(book =>
            `<option value="${book.id}">${book.id}. ${book.title} by ${book.author}</option>`
        ).join('')}
            </select>
            <div id="bookPreview" class="book-preview"></div>
            <button id="confirmDelete" class="btn btn-danger" disabled>Delete Book</button>
        `;

        container.appendChild(div);

        // Book selection handler
        document.getElementById('deleteSelector').addEventListener('change', function () {
            const bookId = this.value;
            const confirmBtn = document.getElementById('confirmDelete');
            const previewDiv = document.getElementById('bookPreview');

            confirmBtn.disabled = !bookId;

            if (!bookId) {
                previewDiv.innerHTML = '';
                return;
            }

            const selectedBook = data.books.find(book => book.id == bookId);
            if (selectedBook) {
                previewDiv.innerHTML = `
                    <h4>Book Details</h4>
                    <p><strong>Title:</strong> ${selectedBook.title}</p>
                    <p><strong>Author:</strong> ${selectedBook.author}</p>
                    <p><strong>Published:</strong> ${selectedBook.publish_year ? new Date(selectedBook.publish_year).toLocaleDateString() : 'Unknown'}</p>
                    <p><strong>Price:</strong> ${selectedBook.price ? 'ETB ' + selectedBook.price.toLocaleString() : 'Not set'}</p>
                `;
            }
        });

        // Delete confirmation handler
        document.getElementById('confirmDelete').addEventListener('click', async function () {
            const bookId = document.getElementById('deleteSelector').value;
            if (!bookId) return;

            if (!confirm("⚠️ Are you sure you want to permanently delete this book?")) {
                return;
            }

            try {
                const deleteRes = await fetch(`/books/${bookId}`, {
                    method: 'DELETE'
                });

                if (!deleteRes.ok) {
                    const errorData = await deleteRes.json();
                    throw new Error(errorData.error || "Delete failed");
                }

                alert("✓ Book deleted successfully!");
                deleteBtn.click(); // Refresh the view
            } catch (err) {
                alert("✗ Error: " + err.message);
                console.error("Delete error:", err);
            }
        });

    } catch (err) {
        alert("✗ Error: " + err.message);
        console.error("Error loading books:", err);
    }

    container.appendChild(div);
});

// Show Create Form (default)
createBtn.addEventListener('click', function () {
    toggleForm(true);
    clearExtraContent();
});