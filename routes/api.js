/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const mongoose = require('mongoose');
const bodyParser  = require('body-parser');
const url = require('url'); 

const Books = require('../models/book.js');

module.exports = function (app) {

  app.route('/api/books')
    //I can get /api/books to retrieve an aray of all books containing title, _id, & commentcount.
    .get(function (req, res, next){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Books.find({})
        .then((books) => {        
            res.statusCode = 200;
            books = books.map((book) => {
              return {"id": book._id, "title": book.title, "comments": book.comments.length};
            })
            res.json(books);
        }, (err) => next(err))
        .catch((err) => next(err)); 
    })
  
    //I can post a title to /api/books to add a book and returned will be the object with the title and a unique _id.
    .post(function (req, res, next){
      var title = req.body.title;
    
      Books.find({"title": title})
        .then((books) => {
          if(books.length != 0) {
            res.statusCode = 400;
            res.end('Book "' + title + '" already exist');
          }
          else {
            //response will contain new book object including atleast _id and title
            Books.create({"title": title})
              .then((book) => {
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);
              }, (err) => {
                  err = new Error('Could not add ' + title);
                  err.status = 400;
                  return next(err);
              });
          }
        }).catch((err) => next(err));  

    }) 

    .put(function(req, res) {
      res.statusCode = 403;
      res.end('PUT operation not supported');    
    })

    //I can send a delete request to /api/books to delete all books in the database. Returned will be 'complete delete successful' if successful.
    .delete(function(req, res, next){
      //if successful response will be 'complete delete successful'
      Books.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end("Complete delete successful", resp);
        }, (err) => next(err))
        .catch((err) => next(err)); 
    });



  app.route('/api/books/:id')
    //I can get /api/books/{_id} to retrieve a single object of a book containing title, _id, & an array of comments (empty array if no comments present).
    //If I try to request a book that doesn't exist I will get a 'no book exists' message.
    .get(function (req, res, next){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
       Books.findById(bookid)
        .then((book) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(book);
        }, (err) => next(err))
        .catch((err) => next(err));

    })

    //I can post a comment to /api/books/{_id} to add a comment to a book and returned will be the books object similar to get /api/books/{_id}.
    .post(function(req, res, next){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    
      Books.findById(bookid)
        .then((book) => {
          if (book != null) {
            book.comments.push(comment);
            book.save()
              .then((dish) => {
                Books.findById(bookid)
                  .then((book) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(book); 
                  })                             
              }, (err) => next(err));
          }
          else {
            res.statusCode = 400;
            return ('No book exists');
          }
        }, (err) => next(err))
        .catch((err) => next(err));
    })

    .put(function(req, res) {
      res.statusCode = 403;
      res.end('PUT operation not supported');    
    })

    //I can delete /api/books/{_id} to delete a book from the collection. Returned will be 'delete successful' if successful.
    .delete(function(req, res, next){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    
      Books.findOne({ _id: bookid })
        .then(book => {
          if (!book) {
            res.statusCode = 404;
            res.end("No book exist");
          }
          else{
            book.remove();
            res.end("Deleted successful");
          }
        })
        .catch(err => {
          if (err.message.indexOf('Cast to ObjectId failed') !== -1) {
            res.statusCode = 404;
            res.end("No book exist");
          }
          res.statusCode = 400;
          res.end("Error while fetching the data on the database");
        })
      })

}