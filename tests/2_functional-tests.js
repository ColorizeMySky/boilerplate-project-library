/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'comments', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], 'id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            "title": "Metaphysics"
          })
          .end(function(err, res){
            assert.equal(res.status, 201);            
            assert.equal(res.body.title, 'Metaphysics', 'Book should have a title, and title shoul be "Metaphysics"');
            assert.property(res.body, '_id', 'Book should contain id');
            assert.property(res.body, 'comments', 'Book should contain comment-count');
            done();
          })
      });

        test('Test POST /api/books with no title given', function(done) {

          chai.request(server)
            .post('/api/books')
            .send({})
            .end(function(err, res){
              assert.equal(res.status, 400);  
              done();
            });
        });

      });


      suite('GET /api/books => array of books', function(){

        test('Test GET /api/books',  function(done){
          chai.request(server)
            .get('/api/books')
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.isArray(res.body, 'response should be an array');
              assert.property(res.body[0], 'comments', 'Books in array should contain commentcount');
              assert.property(res.body[0], 'title', 'Books in array should contain title');
              assert.property(res.body[0], 'id', 'Books in array should contain _id');
              done();
            });
        });
      });


      suite('GET /api/books/[id] => book object with [id]', function(){

        test('Test GET /api/books/[id] with id not in db',  function(done){
          
          chai.request(server)
            .get('/api/books/100500')
            .end(function(err, res){
              assert.equal(res.status, 404);
              done();
            });
        });

        test('Test GET /api/books/[id] with valid id in db',  function(done){
           chai.request(server)
            .get('/api/books/5c3ef23ffea5611d714158b4')
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'Response should be an object');
              assert.property(res.body, 'comments', 'Books in array should contain commentcount');
              assert.equal(res.body.title, 'The Master and Margarita', 'Title should be "The Master and Margarita"');
              assert.property(res.body, '_id', 'Book should contain _id');
              done();
            });
        });

      });


      suite('POST /api/books/[id] => add comment/expect book object with id', function(){

        test('Test POST /api/books/[id] with comment', function(done){
          chai.request(server)
            .post('/api/books/5c3ef289fea5611d714158b7')
            .send({
              "comment": "Worth to be read"
            })
            .end(function(err, res){
              assert.equal(res.status, 200);              
              assert.isObject(res.body, 'Response should be an object');
              assert.isArray(res.body.comments, 'Comments should be an array');
              assert.property(res.body, 'comments', 'Book should contain commentcount');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.property(res.body, '_id', 'Book should contain id');
              done();
            });
        });

      });

    });

  });
