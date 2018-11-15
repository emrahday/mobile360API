# INIT
readme styling guide https://help.github.com/articles/basic-writing-and-formatting-syntax/


# Express Server
if you want to run express server
```
npm app.js
```
it will start listening port and will print out to console
```
> Listening to port 3000
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

# Dependencies

## express 4.16.3

## mongodb 3.0.10

## body-parser 1.18.2

## lodash 4.17.10

## geolib 2.0.24
Library to provide basic geospatial operations like distance calculation, conversion of decimal coordinates to sexagesimal and vice versa, etc.
> compare with your solution

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
