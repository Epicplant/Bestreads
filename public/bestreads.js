/**
 * Christopher Roy
 * 05/26/2020
 * Section AK: Austin Jenchi
 * Javascript code which has the purpose of adding behavior too bestreads.html by calling
 * app.js and displaying various books' information on the webpage. The data for reach book
 * displayed is tored in bestreads.db.
 */
"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * This function ensures that this pages code does not atttempt to retrieve elements
   * from the HTML DOM prior too it being initilized.
   */
  function init() {
    initilizePage();
    id("home").addEventListener("click", returnHome);
  }

  /**
   * This function is called when the home button is pressed and changes from
   * the single book view to a view of all books.
   */
  function returnHome() {
    id("single-book").classList.add("hidden");
    id("all-books").classList.remove("hidden");
    id("book-reviews").innerHTML = "";
    id("book-title").innerHTML = "";
    id("book-author").innerHTML = "";
    id("book-rating").innerHTML = "";
  }

  /**
   * This function is called as soon as the HTML DOM loads and goes about retrieving a list
   * of books from app.js and bestreads.db in order to construct a view of said books in the
   * all-books section.
   */
  function initilizePage() {
    fetch("/bestreads/books")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(setMenu)
      .catch(handleError);
  }

  /**
   * This function goes about creating a "card" for each book found in bestreads.db and proceeds
   * to give each book an appropriate title and cover. When a card is clicked, a more detailed
   * analysis of that specific book is displayed.
   * @param {JSON} bookList -A list of all books currently in the database bestreads.db
   */
  function setMenu(bookList) {
    for (let i = 0; i < bookList.books.length; i++) {
      let card = gen("div");
      let bookTitle = gen("p");
      bookTitle.textContent = bookList.books[i].title;
      let bookCover = gen("img");
      bookCover.src = "covers/" + bookList.books[i].book_id + ".jpg";
      bookCover.alt = "The book desginated as " + bookList.books[i].book_id;
      card.appendChild(bookCover);
      card.appendChild(bookTitle);
      card.classList.add("selectable");
      card.addEventListener("click", function() {
        showData(bookList.books[i].book_id);
        id("book-cover").src = "covers/" + bookList.books[i].book_id + ".jpg";
        id("book-cover").alt = "The book designated as " + bookList.books[i].book_id;
      });
      id("all-books").appendChild(card);
    }
    id("single-book").classList.add("hidden");
  }

  /**
   * This function sets about showing a single books more specific data by displaying
   * it's info, description, and reviews respectively in that order.
   * @param {Text} bookId -The name of a specific book in the form of an id (no spaces, etc.)
   * @param {String} bookCover -An image path to a books approprite cover in public/covers/
   */
  async function showData(bookId) {
    id("all-books").classList.add("hidden");
    id("single-book").classList.remove("hidden");
    await getInfo(bookId);
    await getDescription(bookId);
    await getReviews(bookId);
  }

  /**
   * This function makes a call to apps.js and bestreads.db as a result in order too get
   * a specific books title and author. This data is then displayed.
   * @param {Text} bookId -The name of a specific book in the form of an id (no spaces, etc.)
   */
  function getInfo(bookId) {
    fetch("/bestreads/info/" + bookId)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(function(bookInfo) {
        id("book-title").textContent = bookInfo.title;
        id("book-author").textContent = bookInfo.author;
      })
      .catch(handleError);
  }

  /**
   * This function calls app.js and bestreads.db by proxy in order too get a specific books
   * relevant reviews. These reviews are then displayed on the page after they have been retrieved.
   * @param {Text} bookId -The name of a specific book in the form of an id (no spaces, etc.)
   */
  function getReviews(bookId) {
    fetch("/bestreads/reviews/" + bookId)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(parseReviews)
      .catch(handleError);
  }

  /**
   * This function's purpose is too parse reviews by taking JSON containing a books reviews
   * and then displaying its reviewers name, its rating, and the reviews text. Furthermore,
   * the fumction calculates an average book rating based on number of reviews.
   * @param {JSON} reviews - A list of a books reviews including it's name, rating, and text
   */
  function parseReviews(reviews) {
    let totalScore = 0;
    let reviewNum = 0;
    for (let i = 0; i < reviews.length; i++) {
      let name = gen("h3");
      name.textContent = reviews[i].name;
      let rating = gen("h4");
      let trueRating = reviews[i].rating;
      totalScore = totalScore + trueRating;
      reviewNum++;
      rating.textContent = "Rating: " + trueRating.toFixed(1);
      let text = gen("p");
      text.textContent = reviews[i].text;
      id("book-reviews").appendChild(name);
      id("book-reviews").appendChild(rating);
      id("book-reviews").appendChild(text);
    }
    let bookRating = totalScore / reviewNum;
    id("book-rating").textContent = bookRating.toFixed(1);
    totalScore = 0;
    reviewNum = 0;
  }

  /**
   * This function makes a call too app.js and bestreads.db by proxy in order too
   * get a specific books description. This description is then displayed on the page.
   * @param {Text} bookId - A specific book's description retrived from bestreads.db.
   */
  function getDescription(bookId) {
    fetch("/bestreads/description/" + bookId)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(function(bookDescription) {
        id("book-description").textContent = bookDescription;
      })
      .catch(handleError);
  }

  /**
   * This function is called whenever an error is caught when retrieving data from the
   * Node.js server app.js. It disables the home button and displays an error message.
   */
  function handleError() {
    id("book-data").classList.add("hidden");
    id("err-text").classList.remove("hidden");
    id("home").disabled = true;
  }

  /**
   * This function accepts an id name and gets said elemeny from the html page index.html.
   * @param {String} idName - A name of an elements id in index.html.
   * @return {Element} - Returns an element with a specific ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * This function accepts the name of an element type and then creates it.
   * @param {String} elName - The name of an element that is to be created.
   * @return {Element} gen - Returns a newly created element.
   */
  function gen(elName) {
    return document.createElement(elName);
  }

  /**
   * This function checks a promises status and depending on whether there is a resolved or
   * rejected state it will accordingly return the response or throw an error.
   * @param {Promise} response - A promise from a fetch which, in thise case, contains
   * data from the last.fm API.
   * @return {Promise} response - Returns the inputted parameter if there was no error
   * @throw {Error} error - A thrown error in string format
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    }
    throw Error("Error in request: " + response.statusText);
  }

})();