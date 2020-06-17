const fetch = require("node-fetch");
const readline = require("readline");
const fs = require("fs");
const json = require("big-json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var test = async () => {
    var body = JSON.stringify({
        to: "login",
        data: { email: "ciaobello", hashPassword: "148de9c5a7a44d19e56cd9ae1a554bf67847afb0c58f6e12fa29ac7ddfca9940" },
    });
    var loginData;
    await fetch("http://localhost:8080", { method: "POST", body: body })
        .then((data) => data.json())
        .then((json) => (loginData = json));

    console.log(loginData);

    /*body = JSON.stringify({
        to: "logout",
        idSession: loginData.SessionId,
        data: {
            User: [
                {
                    idUser: 123,
                    firstname: "lezzo",
                    surname: "maniacale",
                    email: "ciaobello",
                    hashPassword: "148de9c5a7a44d19e56cd9ae1a554bf67847afb0c58f6e12fa29ac7ddfca9940",
                },
                {
                    idUser: 321,
                    firstname: "cristian",
                    surname: "casadei",
                    email: "cristian.casadei6@studio.unibo.it",
                    hashPassword: "hashPaswd1",
                },
                {
                    idUser: 322,
                    firstname: "naed",
                    surname: "faedi",
                    email: "a",
                    hashPassword: "hashPaswd",
                },
            ],
            Level: [
                { idUser: 123, cat: "sport", PE: 1, level: 2 },
                { idUser: 322, cat: "sport", PE: 12300, level: 100 },
            ],
            MyCommitment: [
                {
                    idCommitment: -1,
                    creationDate: "2020-06-16T13:54:06Z",
                    name: "Dimagrire",
                    desc: "Dimagrire 10kg prima dell'estate",
                    idUser: 123,
                },
                {
                    idCommitment: 73,
                    creationDate: "2020-05-02T20:25:43Z",
                    name: "studiare mobile",
                    desc: "Fare il progetto in android",
                    idUser: 123,
                },
                {
                    idCommitment: -2,
                    creationDate: "2020-05-24T14:40:57Z",
                    name: "dimagrire",
                    desc: "dimagrire per l'estate",
                    idUser: 123,
                },
            ],
            Inscription: [
                { idUser: 123, idSchool: 1 },
                { idUser: 123, idSchool: 2 },
            ],
            MyStep: [
                {
                    idMyStep: 42,
                    idCommitment: 73,
                    name: "fare database sql",
                    unitMeasure: "minuti",
                    max: 300,
                    repetitionDay: 1,
                    type: "incremental",
                },
                {
                    idMyStep: 43,
                    idCommitment: -2,
                    name: "mangiare mele",
                    unitMeasure: "mele",
                    max: 5,
                    repetitionDay: 1,
                    type: "progression",
                },
                {
                    idMyStep: 44,
                    idCommitment: -2,
                    name: "correre 5 km",
                    unitMeasure: "km",
                    max: 5000,
                    repetitionDay: 7,
                    type: "progression",
                },
            ],
            CourseBought: [
                {
                    idCourse: 420,
                    idUser: 123,
                    level: 1,
                    purchaseDate: "2020-05-01T18:25:43Z",
                },
                {
                    idCourse: 422,
                    idUser: 123,
                    level: 20,
                    purchaseDate: "2020-05-24T12:26:08Z",
                },
            ],
            School: [
                {
                    idSchool: 1,
                    name: "palestra giubilopoli",
                    email: "giubilopolyJym@gmail.com",
                    address: "via duefoglie 3",
                    idTrainer: 321,
                },
                {
                    idSchool: 2,
                    name: "palestra nuova",
                    email: "lezzo@bestia.it",
                    address: "ciao",
                    idTrainer: 123,
                },
            ],
            MyStepDone: [
                { idMyStep: 42, dateStart: "2020-05-03T20:25:43Z", result: 300 },
                { idMyStep: 43, dateStart: "2020-05-24T14:40:57Z", result: 0 },
                { idMyStep: 44, dateStart: "2020-05-24T14:40:57Z", result: 0 },
                { idMyStep: 42, dateStart: "2020-06-16T13:54:06Z", result: 0 },
                { idMyStep: 44, dateStart: "2020-06-16T13:54:06Z", result: 0 },
            ],
            Exercise: [
                {
                    idExercise: 90,
                    level: 1,
                    PE: 120,
                    duration: 10,
                    name: "streching",
                    desc: "Esercizio pensato per chi non Ã¨ sciolto e vuole diventare piÃ¹ agile",
                    idCourse: 420,
                },
                {
                    idExercise: 91,
                    level: 2,
                    PE: 120,
                    duration: 10,
                    name: "riscaldamento",
                    desc: "Esercizio pensato per chi non Ã¨ sciolto e vuole diventare piÃ¹ agile",
                    idCourse: 420,
                },
            ],
            Step: [
                {
                    idExercise: 90,
                    num: 1,
                    name: "riscaldamento",
                    desc: "corsa di 1 km",
                    incVal: 100,
                    unitMeasure: "metri",
                    max: 1000,
                },
            ],
            ExerciseInProgress: [
                {
                    idUser: 123,
                    idExercise: 91,
                    progression: 100,
                    numStep: 10,
                    lastEdit: "2020-05-24T14:18:25Z",
                },
            ],
            Friendship: [
                { idFriendship: 1, idUser1: 123, idUser2: 321 },
                { idFriendship: 2, idUser1: 123, idUser2: 322 },
            ],
            History: [{ idUser: 123, date: "2020-05-01T18:25:43Z", idExercise: 90 }],
            Message: [
                {
                    idFriendship: 1,
                    date: 1588443943000,
                    idSender: 123,
                    idReceiver: 321,
                    message: "Ciao questo Ã¨ un messaggio",
                },
                {
                    idFriendship: 2,
                    date: 1590330343323,
                    idSender: 123,
                    idReceiver: 322,
                    message: "ciao",
                },
            ],
            Course: [
                {
                    idCourse: 420,
                    cat: "sport",
                    name: "Corso per principianti",
                    desc: "Corso per le persone che intendono iniziare ad allenarsi pur non avendo esperienza",
                    minimumLevel: 1,
                },
                {
                    idCourse: 421,
                    cat: "sport",
                    name: "Corso bello",
                    desc: "Corso molto bello",
                    minimumLevel: 2,
                },
                {
                    idCourse: 422,
                    cat: "asd",
                    name: "asd bello",
                    desc: "Corso asd bello",
                    minimumLevel: 3,
                },
            ],
            Review: [
                {
                    idSchool: 1,
                    idUser: 123,
                    val: 2,
                    comment: "la palestra Ã¨ piccola",
                },
            ],
        },
    });
    fetch("http://localhost:8080", { method: "POST", body: body })
        .then((data) => data.json())
        .then((json) => console.log("2\n", json));*/
};
test();
