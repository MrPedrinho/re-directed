const inputURL = document.querySelector("#paste-link");
const submitButton = document.querySelector("#submit");
const copyButton = document.querySelector("#copy");
const finalURL = document.querySelector("#final-link");
const form = document.querySelector("#inputForm");

var hasURL = false;

const API_URL = "http://localhost:5000"

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fData = new FormData(form);
    var url = fData.get("inputUrl");

    console.log(url);

    var sending = {
        sendingURL: url
    }

    fetch(API_URL+"/shorten", {
        method: "POST",
        body: JSON.stringify(sending),
        headers: {
            "content-type":"application/json"
        }
    });
})