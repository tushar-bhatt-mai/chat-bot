const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function initialMessage(){
  initialValue.innerHTML = "<h3>Initial Message</h3>"
}initialMessage()


function sendMessage() {
  console.log(userInput.value)
  const message = userInput.value;
  if (message === "") return;

  displayMessage(message, "user");

  userInput.value = "";

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlBfeEc4Z3ctTjFCejZEcmE2ZzZlRyJ9.eyJpc3MiOiJodHRwczovL215aXByLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NTI1NGQzYTIwYWUwYmM2OGQ2NDhmODciLCJhdWQiOlsiaHR0cHM6Ly9teWlwci51cy5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vbXlpcHIudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcwMDU3MDM5OCwiZXhwIjoxNzAwNTcxNTk4LCJhenAiOiJ3WWhuRmZvWVc5OTRVUXExSnZVSWJ1WGtzNm94ZDBZTCIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDpjdXJyZW50X3VzZXIgdXBkYXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSBkZWxldGU6Y3VycmVudF91c2VyX21ldGFkYXRhIGNyZWF0ZTpjdXJyZW50X3VzZXJfbWV0YWRhdGEgY3JlYXRlOmN1cnJlbnRfdXNlcl9kZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmN1cnJlbnRfdXNlcl9kZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmN1cnJlbnRfdXNlcl9pZGVudGl0aWVzIG9mZmxpbmVfYWNjZXNzIiwiZ3R5IjoicGFzc3dvcmQifQ.Pt5ACHlHzanLPYJ-SRU0tQV_qaU6XoB-lameWyj51EMc_tZ4cFpupnS7GfO-P4zxDTphnhyy1KRY1tE46JCSzqY9NpuMsdHUa3fKDtmsB38K_n3rWQa9X_TeKKSX_TlNQg-GlRhInRUnxhW8V8g9JjEyelaNTS6gZM2j8ohfNUPIo6hhBNKAfMHRcO_I7i_8vdCRYb0rgdeeR5tiRCclHPeaqCct9_x7Oij_jRBpkgXtWFH8PW_WdPPVnBqnzsSarWI8480Fd2f-1vyGACTTsTR6Dzmp6j0e7UaC581UM-IOc0T-pob6jOgIfz--U9NWDCkZDMGrkVVcpQiGw-GEVA"
  );

  var formdata = new FormData();
  formdata.append("username", "Misho");
  formdata.append("modelname", "HR");
  formdata.append("question", message);
  formdata.append("source_language_code", "en");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  fetch("https://dev-maibot-predictionapi.p2eppl.com/", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      displayMessage(result, "bot");
    })
    .catch((error) => console.log("error", error));
}

function displayMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    sender === "user" ? "user-message" : "bot-message"
  );
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
}
