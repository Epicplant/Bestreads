/**
 * Christopher Roy
 * 05/26/2020
 * Section AK: Austin Jenchi
 * Node.js code that is used top primarily handle data stored in bestreads.db. The data can
 * be returned through function calls as a book's information, reviews, and description while
 * also having the option to return a large amount of basic information for each book stored
 * in the bestreads.db batabase by calling /bestreads/books. The endpoints for the API
 * are "/bestreads/description/:book_id" (Returns book description as Text, takes book_id),
 * "/bestreads/info/:book_id" (Returns book title and author as JSON, takes book_id),
 * "/bestreads/reviews/:book_id"(Returns reader reviews as JSON, takes book_id), and
 * "/bestreads/books" (Returns all books titles and book_id's as JSON, takes nothing).
 * For all of the above endpoints, a type 500 is thrown if something goes wrong during
 * server processing (displaying the message "Something went wrong on the server, try again later.")
 * while also throwing a 400 error if an inputter paramter proves too not exist in the database
 * bestreads.db (the 400 message states No results found for INPUT BOOK_ID HERE).
 */
"use strict";
const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const FIVE_ERROR_MSG = "Something went wrong on the server, try again later.";
const FOUR_ERROR_MSG = "No results found for ";
const PORT_NUM = 8000;

app.use(express.static("public"));

/**
 * This function checks if a given book_id exists in bestreads.db or not and returns true
 * if so and false if not.
 * @param {Text} bookId - A specific books designated id in bestreads.db.
 * @return {Boolean} - Either a true or false statement pertaining to whether a name exists in
 * bestreads.db or not.
 */
async function doesExist(bookId) {
  let db = await getDBConnection();
  let menu = await db.all("SELECT book_id FROM books WHERE book_id = ?", bookId);
  await db.close();
  if (menu.length === 0) {
    return false;
  }
  return true;
}

/**
 * This function looks through the database bestreads.db and returns an assoicated book's
 * description if found. Otherwise, an error is returned based on whether it was an internal
 * or external error.
 * @param {Text} bookId - A specific books designated id in bestreads.db.
 * @return {Text} =A specific books description returned in text format
 */
app.get("/bestreads/description/:book_id", async function(req, res) {
  let bookId = req.params.book_id;
  if (bookId && await doesExist(bookId)) {
    try {
      let db = await getDBConnection();
      let menu = await db.all("SELECT description FROM books WHERE book_id = ?", bookId);
      await db.close();
      res.type("text").send(menu[0].description);
    } catch (err) {
      res.type("text");
      res.status(SERVER_ERROR).send(FIVE_ERROR_MSG);
    }
  } else {
    res.type("text");
    res.status(INVALID_PARAM_ERROR).send(FOUR_ERROR_MSG + bookId);
  }
});

/**
 * This function checks the database bestreads.db for a book_id matching the one inputted
 * as a parameter. If found, that book_id's info is returned in JSON format,
 * otherwise a respective externalor internal error is returned.
 * @param {Text} bookId - A specific books designated id in bestreads.db
 * @return {JSON} - A specific books info returning it's author and title.
 */
app.get("/bestreads/info/:book_id", async function(req, res) {
  let bookId = req.params.book_id;
  if (bookId && await doesExist(bookId)) {
    try {
      let db = await getDBConnection();
      let menu = await db.all("SELECT title, author FROM books WHERE book_id = ?", bookId);
      await db.close();
      res.json(menu[0]);
    } catch (err) {
      res.type("text");
      res.status(SERVER_ERROR).send(FIVE_ERROR_MSG);
    }
  } else {
    res.type("text");
    res.status(INVALID_PARAM_ERROR).send(FOUR_ERROR_MSG + bookId);
  }
});

/**
 * This function checks too see if an inputted book_id exist or not in the database bestreads.db.
 * If found, that books reviews are returned in JSON format; otherwise, a respective internal
 * or external error is returned respectively.
 * @param {Text} bookId - A specific books designated id in bestreads.db
 * @return {JSON} - A specific books reviews, containing the person's name, rating and their text
 * returned in JSON format.
 */
app.get("/bestreads/reviews/:book_id", async function(req, res) {
  let bookId = req.params.book_id;
  if (bookId && await doesExist(bookId)) {
    try {
      let db = await getDBConnection();
      let menu = await db.all("SELECT name, rating, text FROM reviews WHERE book_id = ?", bookId);
      await db.close();
      res.json(menu);
    } catch (err) {
      res.type("text");
      res.status(SERVER_ERROR).send(FIVE_ERROR_MSG);
    }
  } else {
    res.type("text");
    res.status(INVALID_PARAM_ERROR).send(FOUR_ERROR_MSG + bookId);
  }
});

/**
 * This function returns all books currently stored in bestreads.db in JSON format. If something
 * goes wrong during the process, a internal server error is returned.
 * @return {JSON} -Returns every book in the database bestreads.db in the form of each books
 * title and book_id. This is returned in JSON format.
 */
app.get("/bestreads/books", async function(req, res) {
  try {
    let db = await getDBConnection();
    let menu = await db.all("SELECT title, book_id FROM books ORDER BY book_id");
    await db.close();
    res.json({"books": menu});
  } catch (err) {
    res.type("text");
    res.status(SERVER_ERROR).send(FIVE_ERROR_MSG);
  }
});

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "bestreads.db",
    driver: sqlite3.Database
  });
  return db;
}

const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);