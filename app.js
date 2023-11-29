const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const baseUrl = "https://dev-maibot-predictionapi.p2eppl.com/";
let chatBotResult = {};

const loggedInUserData = (data)=>{
  const roundedValue = data?.display_name.split(" ").map((word) => word[0]).join("")
  const roundedData = document.getElementById("roundedName");
  roundedData.innerHTML = `${roundedValue}`
}

function initialMessage() {
  loggedInUserData(chatBotResult)
  const chatContainer = document.getElementById("chat-container");
  chatContainer.style.backgroundColor = chatBotResult?.background_colour
  const displayName = document.getElementById("display-name");
  displayName.innerHTML = `${chatBotResult?.display_name ? chatBotResult?.display_name : ``}`
  const initialValue = document.getElementById("initialValue");
  initialValue.innerHTML = `<span class='bot-message'>${
    chatBotResult?.initial_message
      ? chatBotResult?.initial_message
      : `Initial Message`
  }</span>`;
  initialValue.style.backgroundColor = chatBotResult?.background_colour || "";
  initialValue.style.fontSize = chatBotResult?.font_size || "12px";
  initialValue.style.fontFamily = chatBotResult?.font_style || "Arial, sans-serif";
  displaySuggestedMessages(chatBotResult?.suggested_messages || []);
}

function displaySuggestedMessages(suggestedMessages) {
  const suggestedMessagesContainer = document.getElementById("suggested-messages");
  suggestedMessagesContainer.innerHTML = "";

  suggestedMessages.forEach((message) => {
    const suggestionButton = document.createElement("button");
    suggestionButton.textContent = message;
    suggestionButton.classList.add("suggestion-button");
    suggestionButton.onclick = function () {
      fillInputAndSendMessage(message);
    };
    suggestedMessagesContainer.appendChild(suggestionButton);
  });
}

function fillInputAndSendMessage(message) {
  const userInput = document.getElementById("user-input");
  userInput.value = message;
  sendMessage();
  // By default we hide the suggestion second time
  const suggestedMessagesContainer = document.getElementById("suggested-messages");
  suggestedMessagesContainer.style.display = "none";
}

function parseQueryString(url) {
  const queryString = url.split("?")[1];
  const queryParams = new URLSearchParams(queryString);
  return Object.fromEntries(queryParams.entries());
}

const params = parseQueryString(window.location.href);

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  displayMessage(message, "user");
  userInput.value = "";
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${params.token}`);
  const formdata = new FormData();
  formdata.append("username", params.username);
  formdata.append("modelname", params.modelname);
  formdata.append("question", message);
  formdata.append("source_language_code", "en");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  fetch(baseUrl, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      var parsedResult ={};
      if(typeof result !== "string"){
        parsedResult = JSON.parse(result || "{}");
      }
      if (parsedResult.StatusCode === "401") {
        displayMessage("Something went Wrong", "bot");
      } else {
        const str = JSON.stringify(result);
        displayMessage(JSON.parse(result)?.message, "bot");
      }
    })
    .catch((error) => console.error("error", error));
}

function getChatbotDetails() {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${params.token}`);
  const formdata = new FormData();
  formdata.append("username", params.username);
  formdata.append("chatbot_name", params.chatbotname);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  fetch("https://dev-maibot-chatbot-detailapi.p2eppl.com/get_chatbot_customization", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const parsedResult = JSON.parse(result);  
      if (parsedResult.statusCode === 200) {
        chatBotResult = parsedResult.message;
        initialMessage();
      }
    })
    .catch((error) => console.error("error", error));
}

function displayMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(sender === "user" ? "user-messageDev" : "bot-messageDev");
  const textSpan = document.createElement("span");
  textSpan.classList.add(sender === "user" ? "user-message" : "bot-message");
  textSpan.textContent = message;
  messageElement.appendChild(textSpan);
  chatBox.appendChild(messageElement);
}


getChatbotDetails();
