const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const baseUrl = "https://dev-maibot-predictionapi.p2eppl.com/";
let chatBotResult = {};
const params = parseQueryString(window.location.href);
let accessToken = params?.token;
let refreshToken = params?.refreshToken;
const loggedInUserData = (data) => {
  const roundedValue = data?.display_name.split(" ").map((word) => word[0]).join("");
  const roundedData = document.getElementById("roundedName");
  data?.display_name ? roundedData.style.backgroundColor = "#6d1874" : roundedData.style.backgroundColor = "transparen";
  roundedData.innerHTML = `${roundedValue}`;
}
function initialMessage() {
  loggedInUserData(chatBotResult)
  const chatNavbar = document.getElementById("chat-Navbar");
  chatBotResult?.background_colour ? chatNavbar.style.backgroundColor = chatBotResult?.background_colour :  chatNavbar.style.backgroundColor = `#000000 ${!important}`;
  const displayChatWith = document.getElementById("display-chat");
  chatBotResult?.display_name ? displayChatWith.innerHTML = "Chat With" : displayChatWith.innerHTML = ""
  const displayName = document.getElementById("display-name");
  displayName.innerHTML = `${chatBotResult?.display_name ? chatBotResult?.display_name : ``}`;
  const initialValue = document.getElementById("initialValue");
  initialValue.innerHTML = `<span class='bot-message'>${
    chatBotResult?.initial_message
      ? chatBotResult?.initial_message
      : `Initial Message`
  }</span>`;
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
  // By default, hide the suggestion second time
  const suggestedMessagesContainer = document.getElementById("suggested-messages");
  suggestedMessagesContainer.style.display = "none";
}
function parseQueryString(url) {
  const queryString = url.split("?")[1];
  const queryParams = new URLSearchParams(queryString);
  return Object.fromEntries(queryParams.entries());
}
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  displayMessage(message, "user");
  userInput.value = "";
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${accessToken}`);
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
      var parsedResult = JSON.parse(result || "{}")
      console.log("parse result", );
      if (parsedResult.StatusCode==401) {
        // Refresh the access token
        fetchRefreshtoken();
        displayMessage("Something went Wrong, Please try again", "bot");
        // Retry the message sending with the new token
        // sendMessage();
      } else {
        // Process the result as usual
        const str = JSON.stringify(result);
        displayMessage(JSON.parse(result)?.message, "bot");
      }
    })
    .catch((error) => console.error("error", error));
}
function getChatbotDetails() {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${accessToken}`);
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
const fetchRefreshtoken = async () => {
  try {
    const response = await fetch(`https://dev-auth2api.p2eppl.com/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "refresh_token": refreshToken,
      }),
    });
    const responseData = await response.json();
    if (responseData?.result) {
      accessToken = responseData?.result?.access_token;
      sendMessage();
    }
  } catch (error) {
    console.error(error);
  }
};