# INIT
readme styling guide https://help.github.com/articles/basic-writing-and-formatting-syntax/

# Config
all configurations are kept in config.js
there you can change envirionment `environment: 'dev'` or `environment: 'prod'`


# Express Server
if you want to run express server
```
node app.js
```
it will start listening port and will print out to console
```
> Listening to port 3010
```

# Database
in order to install mongodb to your local machine for development purpose look at this link https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

after your installation start mongodb
```
mongod
```
somewhere in terminal it will output 
```
> [initandlisten] waiting for connections on port 27017
```
that means successfully started. 

if database started and in order to run mongodb command, write
```
mongo
```


`show dbs` Print a list of all databases
`use <db>` Switch database
`show collections` Print all collections

for more mongo [shell command](https://docs.mongodb.com/manual/reference/mongo-shell/) 

we are not closing mongodb connection, because there is internal connection pooling. we need to ensure that it is working correctly, may be optimization required. 

# Test
in order to run mocha test 
```
npm run test
```

if you want to run test watcher under nodemon
``` 
npm run watch
```
it will automatically run the express server, and will start watching. 
if you want to use this do not start express manually.

if you want to watch and run the test for item.utils.js
```
npm run watch-item-utils
```

# Dependencies

## express 4.16.3

## mongodb 3.0.10

## body-parser 1.18.2

## lodash 4.17.10

## geolib 2.0.24
Library to provide basic geospatial operations like distance calculation, conversion of decimal coordinates to sexagesimal and vice versa, etc.
> compare with your solution

## mongo-mock 3.3.2
this is used for mocking of mongodb. mocking required unit test because we do not want to cover real mongodb in test. 
For example, there is a problem in real mongodb not guarantee point-in-time read operation, so after you insert new data (especially bulk data) with unit test, and just after insertion you may not query the data you have inserted. That is breaking unit test.  For more information https://blog.meteor.com/mongodb-queries-dont-always-return-all-matching-documents-654b6594a827

## crypto-js ^3.1.9-1 (NOT USED)
keep in mind. may be needed

## jsonwebtoken 8.2.2 (NOT USED)
keep in mind. may be needed

## request 2.85.0 (NOT USED)
keep in mind. may be needed
alternative axios or standart node http

## socket.io 2.1.0 (NOT USED)
keep in mind. may be needed

## validator 10.3.0  (NOT USED)
keep in mind. may be needed
