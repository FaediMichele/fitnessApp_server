# README #

This README is used to write the correct command to pass to the server

### What is this repository for? ###

Is used to save and manage the user for the app for the mobile project.

### How do I get set up? ###

Install node [here](https://nodejs.org/en/download/).
go in the server dir and write: npm i
then: node index.js
and the server is online in the port 8080.

### Contribution guidelines ###

* server http [here](https://nodejs.org/api/http.html)
* for the test - fetch [here](https://www.npmjs.com/package/node-fetch)

### Who do I talk to? ###

* Michele Faedi - michele.faedi@studio.unibo.it or verde990@gmail.com


### App access data

login:

{to: "login", data: {email: "mailUtente", hashPassword: "password"}}

add User:
{to: "user", method: "addUser", data: {
    user: {
        firstname: "nome",
        surname: "surname",
        email: "email",
        hashPassword: "password"
    },
    levels: {
        cat: "sport\mental\social",
        PE: 0,
        level: 1
    }
}}

add inscription:
{to: "user", idSession: "sessionIdReceivedAtLogin", method: "addInscription", data:{
    idSchool: 1
}}

delete inscription:
{to: "user", idSession: "sessionIdReceivedAtLogin", method: "deleteInscription", data:{
    idSchool: 1
}}


update user:
{to: "user", idSession: "sessionIdReceivedAtLogin", method: "updateUser", data:{
    fields you want to update
}}


update user level:
{to: "user", idSession: "sessionIdReceivedAtLogin", method: "updateUserLevel", data:{
    fields you want to update
}}