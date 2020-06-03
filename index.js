const genHTML = require("./generatorHtml.js");
const inquirer = require("inquirer");
const axios = require("axios");
const PDFDoctument = require('html-pdf');
const fs = require('fs');
var options = { format: 'Letter' };

const questions = [
    {
        type: "input",
        name: "username",
        message: "Please enter your Github username:"
    },
    {
        type: "list",
        message: "What is your favourite color? ",
        name: "color",
        choices: [
            "green",
            "blue",
            "purple",
            "red"
        ]
    }
];

function writeToFile(fileName, data) {
    fs.writeFile("profile.html", genHTML.generatorHtml(data), function (err) {
        if (err) throw err;
        console.log("Html created!");
        let html = fs.readFileSync('./profile.html', 'utf8');
        PDFDoctument.create(html, options).toFile(fileName, function (err) {
            if (err) return console.log(err);
            console.log(`PDF document generated as ${fileName}`);
        });
    })
}

function init() {
    inquirer.prompt(questions).then(function (userInfo) {
        // Assign stars
        let queryURL = `https://api.github.com/users/${userInfo.username}/starred?per_page=10000`;
        axios.get(queryURL).then(response => {
            let starred = { starred: Object.keys(response.data).length };
            Object.assign(userInfo, starred);

            // Assign remaining info
            let queryURL = `https://api.github.com/users/${userInfo.username}`;
            axios.get(queryURL).then(response => {
                Object.assign(userInfo, response.data);
                writeToFile(`${userInfo.username}Profile.pdf`, userInfo);
            })
        }, e => {
            console.log(`The file could not be generated. Reason: user not found.`);
        })
    });
}

init();