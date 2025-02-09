// Main script file for handling user interactions
document.addEventListener("DOMContentLoaded", () => {
    // Detect the current page and call appropriate functions
    if (document.querySelector("#register-form")) handleRegister();
    if (document.querySelector("#login-form")) handleLogin();
    if (document.querySelector("#book-list")) fetchBooks();
    if (document.querySelector("#book-details")) handleBookDetails();
    if (document.querySelector("#reading-list")) fetchReadingList();

    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) logoutButton.addEventListener("click", logout);

    const reviewForm = document.getElementById("review-form");
    if (reviewForm) {
        const bookId = new URLSearchParams(window.location.search).get("id"); // Extract bookId from URL
        reviewForm.addEventListener("submit", (e) => handleReviewSubmit(e, bookId));
    }
});

// Utility function to check if the user is logged in
function ensureLoggedIn() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please log in to continue.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Function to handle user registration
function handleRegister() {
    const registerForm = document.getElementById("register-form");
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("register-username").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;

        try {
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.msg || "Registration successful!");
                window.location.href = "login.html";
            } else {
                alert(data.msg || "Registration failed.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during registration.");
        }
    });
}

// Function to handle user login
function handleLogin() {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("userId", data.userId);
                alert(data.msg || "Login successful!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.msg || "Login failed.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during login.");
        }
    });
}

// Function to fetch books from the API
function fetchBooks(search = "romance") {
    fetch(`/api/books?search=${search}`)
        .then((res) => res.json())
        .then((books) => {
            const bookList = document.getElementById("book-list");
            bookList.innerHTML = "";

            if (!books.length) {
                bookList.innerHTML = "<p>No books found for this search term.</p>";
                return;
            }

            books.forEach((book) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <img src="${book.coverImage}" alt="${book.title}" />
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Genre: ${book.genre}</p>
                    <p>Rating: ${book.averageRating} (${book.ratingsCount} reviews)</p>
                    <a href="book.html?id=${book.id}">View Details</a>
                `;
                bookList.appendChild(li);
            });
        })
        .catch((err) => console.error("Error fetching books:", err));
}

// Function to fetch book details and reviews
function handleBookDetails() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    if (bookId) {
        fetch(`/api/books/${bookId}`)
            .then((res) => res.json())
            .then((book) => {
                const bookDetails = document.getElementById("book-details");
                bookDetails.innerHTML = `
                    <img src="${book.coverImage}" alt="${book.title}" />
                    <h1>${book.title}</h1>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Genre:</strong> ${book.genre}</p>
                    <p><strong>Published Date:</strong> ${book.publishedDate}</p>
                    <p><strong>Page Count:</strong> ${book.pageCount}</p>
                    <p><strong>Language:</strong> ${book.language}</p>
                    <p><strong>Average Rating:</strong> ${book.averageRating} (${book.ratingsCount} reviews)</p>
                    <p>${book.summary}</p>
                    <button id="add-to-list-btn">Add to My List</button>
                `;

                document.getElementById("add-to-list-btn").addEventListener("click", () => {
                    addToReadingList(book);
                });

                // Fetch and display reviews
                fetchBookReviews(bookId);
            })
            .catch((err) => console.error("Error fetching book details:", err));
    }
}

// Function to fetch and display reviews for a book
async function fetchBookReviews(bookId) {
    try {
        const response = await fetch(`/api/reviews/${bookId}`);
        const reviews = await response.json();

        const reviewList = document.getElementById("review-list");
        if (!reviewList) return;

        reviewList.innerHTML = "";

        if (!reviews.length) {
            reviewList.innerHTML = "<p>No reviews yet. Be the first to review this book!</p>";
            return;
        }

        reviews.forEach((review) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <p><strong>User:</strong> ${review.userId.username || "Anonymous"}</p>
                <p><strong>Rating:</strong> ${review.rating}</p>
                <p>${review.comment}</p>
                <hr>
            `;
            reviewList.appendChild(li);
        });
    } catch (err) {
        console.error("Error fetching reviews:", err);
    }
}

// Function to handle review submission
async function handleReviewSubmit(e, bookId) {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const comment = document.getElementById("review-text").value.trim();
    const rating = document.getElementById("rating").value;

    if (!bookId || !userId || !comment || !rating) {
        alert("All fields are required.");
        return;
    }

    const reviewData = {
        userId,
        comment,
        rating,
    };

    try {
        const response = await fetch(`/api/reviews/${bookId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData),
        });

        if (response.ok) {
            alert("Review added successfully!");
            fetchBookReviews(bookId); // Refresh reviews
            document.getElementById("review-text").value = ""; // Clear input
            document.getElementById("rating").value = ""; // Clear input
        } else {
            const data = await response.json();
            alert(data.message || "Failed to add review.");
        }
    } catch (err) {
        console.error("Error adding review:", err);
        alert("An error occurred. Please try again.");
    }
}

// Function to add a book to the reading list
function addToReadingList(book) {
    if (!ensureLoggedIn()) return;

    const bookData = {
        userId: localStorage.getItem("userId"),
        book: {
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverImage: book.coverImage,
        },
    };

    fetch("/api/reading-list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
    })
        .then((res) => res.json())
        .then((data) => {
            alert(data.msg || "Book added to your reading list.");
        })
        .catch((err) => console.error("Error adding book to reading list:", err));
}

// Function to fetch and display the reading list
function fetchReadingList() {
    if (!ensureLoggedIn()) return;

    fetch(`/api/reading-list/${localStorage.getItem("userId")}`)
        .then((res) => res.json())
        .then((books) => {
            const readingList = document.getElementById("reading-list-items");
            readingList.innerHTML = "";

            if (!Array.isArray(books)) {
                alert("Failed to load your reading list.");
                return;
            }

            books.forEach((book) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <img src="${book.coverImage}" alt="${book.title}" />
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                `;
                readingList.appendChild(li);
            });
        })
        .catch((err) => console.error("Error fetching reading list:", err));
}

// Function to search books
function searchBooks() {
    const query = document.getElementById("search-bar").value;
    if (query.trim() === "") {
        alert("Please enter a search term.");
        return;
    }
    fetchBooks(query);
}

// Function to logout the user
function logout() {
    localStorage.removeItem("userId");
    alert("You have been logged out.");
    window.location.href = "login.html";
}