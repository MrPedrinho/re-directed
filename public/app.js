const form = document.querySelector("#inputForm");
const API_URL = "https://re-directed.netlify.app/"
const redirectStorage = window.localStorage;

function addPreviousRedirect(re) {
    document.querySelector(".previousLinks").classList.remove("hidden");
    var parent = document.querySelector(".redirects");
    var newRe = document.createElement("div");
    newRe.classList.add("redirect");
    newRe.innerHTML = `
        <p class="original">${re.original}</p>
        <p class="shortened">${API_URL}/go/${re.code}</p>
        <p class="copy">Copy redirect <i class="far fa-copy"></i></p>
    `
    newRe.querySelector(".copy").addEventListener("click", event => {
        navigator.clipboard.writeText(`${API_URL}/go/${re.code}`).then(()=> {
            newRe.querySelector(".copy").innerHTML = "Copied redirect"
            setTimeout(() => {
                newRe.querySelector(".copy").innerHTML = `Copy redirect <i class="far fa-copy"></i>`
            }, 1500);
        })
    })
    parent.appendChild(newRe);
}

document.querySelector("#custom-code").addEventListener("keydown", event => {
    var avail = document.querySelector("#availability");
    avail.innerHTML = "Check availability"
    avail.style.color = "#ffffff";
})

document.querySelector("#availability").addEventListener("click", event => {
    var avail = document.querySelector("#availability");
    var sending = {code: document.querySelector("#custom-code").value};
    if (sending.code.trim().length) {
        fetch(API_URL+"/check", {
            method: "POST",
            body: JSON.stringify(sending),
            headers: {
                "content-type":"application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (!data.used) {
                    avail.innerHTML = "Available"
                    avail.style.color = "#45ed32";
                } else {
                    avail.innerHTML = "Taken"
                    avail.style.color = "#ed3232";
                }
            }
        );
    }
})

var cd = false
form.addEventListener("submit", (event) => {
    if (!cd) {
        var submitBut = document.querySelector("#submit");
        var cd = true;
        submitBut.innerHTML = "Please wait"
        event.preventDefault();
        const fData = new FormData(form);
        var url = fData.get("inputUrl");
        var code = fData.get("custom") || "";
        var userToken = redirectStorage.getItem("userToken");

        var sending = {
            sendingURL: url,
            customCode: code,
            token: userToken
        }

        fetch(API_URL+"/shorten", {
            method: "POST",
            body: JSON.stringify(sending),
            headers: {
                "content-type":"application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    submitBut.innerHTML = data.error;
                } else {
                    document.querySelector("#final-link").innerHTML = API_URL + "/go/" + data.code;
                    document.querySelector(".link-ready").classList.remove("hidden");
                    addPreviousRedirect(data);
                }
            }
        );
        setTimeout(() => {
            cd = false;
            submitBut.innerHTML = "Make it tiny"
        }, 2500);   
    }
})

document.querySelector("#copy").addEventListener("click", event => {
    navigator.clipboard.writeText(document.querySelector("#final-link").innerHTML).then(()=> {
        document.querySelector("#copy").innerHTML = "Copied redirect"
        setTimeout(() => {
            document.querySelector("#copy").innerHTML = `Copy redirect <i class="far fa-copy"></i>`
        }, 1500);
    })
})

window.onload = (event) => {
    var userToken = redirectStorage.getItem("userToken");
    if (userToken && userToken !== undefined) {
        fetch(API_URL+"/redirects", {
            method: "POST",
            body: JSON.stringify({token: userToken}),
            headers: {
                "content-type":"application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    data.forEach(re => {
                        addPreviousRedirect(re[0])
                    })
                }
            }
        );
    } else {
        fetch(API_URL+"/newtoken", {
            method: "GET",
        })
            .then(res => res.json())
            .then(data => {
                redirectStorage.setItem("userToken", data.token)
            }
        );
    }
}
