// import './styles.css';

// DOM elements
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const chatContainer = document.getElementById("chat-container");

// Global variables
let chatBotResult = {};
const params = parseQueryString(window.location.href) || {
  params: "",
};

var loading = false;

const {
  // token: accessToken = window.WebChat.token,
  width = "500",
  height = "800",
  username = window?.WebChat?.username,
  modelname = window?.WebChat?.modelname,
  chatbotname = window?.WebChat?.chatbotname,
  // refreshToken = window.WebChat.refreshToken,
  environment = window?.WebChat?.environment || "dev",
  apiKey = window?.WebChat?.apiKey || "",
  chatBotId = window?.WebChat?.chatBotId,
  sourceLanguageCode = "en",
} = params || {};

function removeStr(str) {
  return str.replace(/^\s+/, "");
}

// API endpoints

const baseUrlPrediction = `https://${removeStr(
  environment
)}-maibot-predictionapi.p2eppl.com/prediction_with_API_KEY`;

const baseUrlCostomization = `https://${removeStr(
  environment
)}-maibot-trainingapi.p2eppl.com/get_chatbot_customization`;

//const baseUrlCostomization = `https://${removeStr(
//  environment
//)}-maibot-chatbot-detailapi.p2eppl.com/get_chatbot_customization`;


// Function to display logged-in user data
const loggedInUserData = (data) => {
  const roundedValue = getRoundedValue(data);
  const roundedData = document.getElementById("roundedName");

  if (data && data?.profile_picture_url !== "NA") {
    displayProfilePicture(roundedData, data?.profile_picture_url);
  } else if (data?.display_name) {
    displayRoundedName(roundedData, roundedValue);
  } else {
    roundedData.style.backgroundColor = "transparent";
  }
};
// Helper function to invoked whenever onSubmit is called

document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("submitBtn");
  if (button)
    button.addEventListener("click", function (event) {
      event.preventDefault();
      sendMessage();
    });
  toggeleBotHandler();
});


function changeBgColor(color) {
  const widgetElement = document.getElementById("mySvgElement");
  if (widgetElement) {
    widgetElement.style.fill = color || "black";
  }
}

// Helper function to get rounded value from display name

function getRoundedValue(data) {
  return data?.display_name
    .split(" ")
    .map((word) => word[0])
    .join("");
}

// Helper function to display profile picture
function displayProfilePicture(container, imageUrl) {
  const imgElement = createImageElement(imageUrl);
  container.appendChild(imgElement);
}

// Helper function to create image element
function createImageElement(imageUrl) {
  const imgElement = document.createElement("img");
  imgElement.src = imageUrl;
  imgElement.classList.add("imgStyle");
  return imgElement;
}

// Helper function to display rounded name
function displayRoundedName(container, value) {
  if(container){
    container.style.backgroundColor = "#6D1874";
    container.innerHTML = value;
  }
}

// Function to initialize the chat interface
function initialMessage() {
  loggedInUserData(chatBotResult);
  setChatBotWidgetColor();
  setChatNavbarStyle();
  setDisplayChatWith();
  setDisplayName();
  setUserInputStyle();
  setInitialValue();
  if (chatBotResult?.suggested_messages) {
    displaySuggestedMessages(
      chatBotResult?.suggested_messages,
      chatBotResult?.font_size || []
    );
    setChatbotStyle();
  }

  // appendCssInBody();
}

// Function to set disply height  or width
// function appendCssInBody() {
//   const styleElement = document.createElement('style');
//   const cssRules = `
//   #myIframe {
//       min-height: ${height +'px'|| '900px'} ;
//       width: ${width +'px' || '500px'};
//       border: none;
//     }
//   `;
//   styleElement.textContent = cssRules;
//   console.log("Append css", styleElement)
//   document.body.appendChild(styleElement);
//   console.log("document boyd",   document  )
// }

// Helper function to set widgetColor property
function setChatBotWidgetColor() {
  const backgroundColor = chatBotResult?.widget_colour || "#c66262";
  const newColor = hexToRgb(backgroundColor);
  const imageElement = document.getElementById("widget-icon-img");
  if (imageElement) {
    // changeImageColor(imageElement, newColor);
  }
}

/**
 * Change the color of a transparent PNG image.
 *
 * @param {HTMLImageElement} imageElement - The image element to be modified.
 * @param {Object} newColor - The new color to apply in RGB format.
 *                            Example: { red: 255, green: 0, blue: 0 }
 */

function changeImageColor(imageElement, newColor) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  try {
    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i] = newColor.red;
        data[i + 1] = newColor.green;
        data[i + 2] = newColor.blue;
      }
    }
    context.putImageData(imageData, 0, 0);
    imageElement.src = canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error changing image color:", error);
  }
}

// Helper function to Convert a hex color code to RGB format
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { red: r, green: g, blue: b };
}

// Function to toggle chatbot visibility
function toggleChatbot() {
  const chatbotStyle = document.getElementById("chatbot-style");
  const formElementCls = document.getElementById("formElementCls");
  chatbotStyle.classList.toggle("hidden");
  formElementCls.classList.toggle("hidden");
  formElementCls.classList.toggle("clicked");
  chatbotStyle.classList.toggle("clicked");
}

// Function to invoke toggleBot
function toggeleBotHandler() {
  const widgetIcon = document.getElementById("widget-icon");
  if (widgetIcon) {
    widgetIcon.addEventListener("click", toggleChatbot);
  }
}

// Helper function to set NavbarSyle color
function setChatNavbarStyle() {
  const chatNavbar = document.getElementById("chat-Navbar");
  if(chatNavbar){
    const backgroundColor = chatBotResult?.background_colour || "bgColor";
    chatNavbar.style.backgroundColor = backgroundColor;
  }
}

// Helper function to set "Chat With" display
function setDisplayChatWith() {
  const displayChatWith = document.getElementById("display-chat");
  if(displayChatWith){
  displayChatWith.innerHTML = chatBotResult?.display_name ? "Chat With" : "";
  displayChatWith.style.fontSize = `${chatBotResult?.font_size}px` || "12px";
  }
}

// Helper function to set display name
function setDisplayName() {
  const displayName = document.getElementById("display-name");
  if(displayName){
    displayName.innerHTML = chatBotResult?.display_name || "";
    displayName.style.fontSize = `${chatBotResult?.font_size}px` || "12px";
  }
}

// Helper function to set user input style
function setUserInputStyle() {
  if (userInput) {
    userInput.style.fontSize = `${chatBotResult?.font_size}px` || "12px";
  }
}

// Helper function to set initial value
function setInitialValue() {
  const initialValue = document.getElementById("initialValue");
  if(initialValue){
    initialValue.innerHTML = `
    <span class='bot-message'>
      ${chatBotResult?.initial_message || "Hi! What can I help you with?"}
    </span>
    <div class="arrow-left"></div>
  `;

  initialValue.style.fontSize = `${chatBotResult?.font_size}px` || "12px";
  }
}

// Helper function to set chatbot style
function setChatbotStyle() {
  const chatbotStyle = document.getElementById("chatbot-style");
  if (chatbotStyle) {
    chatbotStyle.style.fontFamily =
      chatBotResult?.font_style || "Arial, sans-serif";
  }
}

// Function to display suggested messages
function displaySuggestedMessages(suggestedMessages, fontSize) {
  const suggestedMessagesContainer = getSuggestedMessagesContainer();
  if(suggestedMessagesContainer){
  clearSuggestedMessages(suggestedMessagesContainer);
  }

  suggestedMessages.forEach((message) => {
    const suggestionButton = createSuggestionButton(message, fontSize);
    addClickEventToSuggestionButton(suggestionButton, message);
    appendSuggestionButton(suggestedMessagesContainer, suggestionButton);
  });
}

// Helper function to get suggested messages container
function getSuggestedMessagesContainer() {
  return document.getElementById("suggested-messages");
}

// Helper function to clear suggested messages
function clearSuggestedMessages(container) {
  container.innerHTML = "";
}

// Helper function to create suggestion button
function createSuggestionButton(message, fontSize) {
  const suggestionButton = document.createElement("span");
  suggestionButton.textContent = message;
  suggestionButton.classList.add("suggestion-button");
  suggestionButton.style.fontSize = `${fontSize}px` || "12px";
  return suggestionButton;
}

// Helper function to add click event to suggestion button
function addClickEventToSuggestionButton(button, message) {
  button.onclick = function () {
    fillInputAndSendMessage(message);
  };
}

// Helper function to append suggestion button
function appendSuggestionButton(container, button) {
  container.appendChild(button);
}

// Helper function to hide suggested messages
function hideSuggestionsMsg() {
  document.getElementById("suggested-messages").style.display = "none";
}

// Helper function to fill input and send message
function fillInputAndSendMessage(message) {
  const userInput = document.getElementById("user-input");
  userInput.value = message;
  sendMessage();
  hideSuggestionsMsg();
}

// Helper function to parse query string from URL
function parseQueryString(url) {
  const queryString = url.split("?")[1];
  const queryParams = new URLSearchParams(queryString);
  return Object.fromEntries(queryParams.entries());
}

// Helper function to get user input message
function getUserInputMessage() {
  return userInput ? userInput.value.trim() : "";
}

// Helper function to display user message
function displayUserMessage(message) {
  displayMessage(message, "user", false);
}

// Helper function to clear user input
function clearUserInput() {
  userInput.value = "";
}

// Helper function to create headers for API requests
function createHeaders() {
  const headers = new Headers();
  // headers.append("Authorization", `Bearer ${accessToken}`);
  return headers;
}

function removeQuota(quotaStr) {
  return quotaStr?.replace(/'/g, "");
}

// Helper function to create form data for sending messages
function createFormDataForSendMsg(message) {
  const formdata = new FormData();
  formdata.append("question", message);
  formdata.append("username", username);
  formdata.append("api_key", removeQuota(apiKey || "test_dev"));
  formdata.append("chatbot_id", removeQuota(chatBotId));
  formdata.append("source_language_code", removeQuota(sourceLanguageCode));
  return formdata;
}

function generateMetaData(message) {
  const formData = createFormDataForSendMsg(message);
  const myHeaders = createHeaders();
  const requestOptions = createRequestOptions(myHeaders, formData);
  return requestOptions;
}

// Function to send user message to the chatbot
function sendMessage(event) {
  if (event) {
    event.preventDefault();
  }
  const message = getUserInputMessage();
  if (!message) return;
  displayUserMessage(message);
  clearUserInput();
  hideSuggestionsMsg();
  loading = true;
  fetchMessage(baseUrlPrediction, generateMetaData(message));
}

// Helper function to handle the result of the chatbot API
function handleMessageResult(result) {
  const parsedResult = JSON.parse(result || "{}");
  if (parsedResult.statusCode === 200) {
    displayBotMessage(JSON.parse(result)?.message);
  } else {
    displayMessage("Failure", "bot", true, true);
  }
}

// Helper function to display bot message in the chat
function displayBotMessage(message) {
  displayMessage(message, "bot", true);
}

// Helper function to handle errors
function handleError(error) {
  console.error("error", error);
}

// Helper function to create form data for API requests
function createFormData(params) {
  const formdata = new FormData();
  formdata.append("username", username);
  formdata.append("chatbot_name", chatbotname);
  formdata.append("api_key", removeQuota(apiKey));
  return formdata;
}

// Helper function to create options for API requests
function createRequestOptions(headers, body) {
  return {
    method: "POST",
    headers: headers,
    body: body,
    redirect: "follow",
  };
}

// Function to get chatbot details on page load
function getChatbotDetails() {
  const myHeaders = createHeaders();
  const formdata = createFormData(params);
  fetchChatbotDetails(createRequestOptions(myHeaders, formdata));
}

// Helper function to handle the result of fetching chatbot details
function handleChatbotDetailsResult(result) {
  const parsedResult = JSON.parse(result);
  if (parsedResult.statusCode === 200) {
    chatBotResult = parsedResult?.message;
    changeBgColor(parsedResult?.message?.widget_colour);
    initialMessage();
  }
}

// Helper function to generate error message
function createErrorMessage() {
  const divElement = document.createElement("div");
  const span1Element = document.createElement("span");
  span1Element.classList.add("bot-message-error");
  span1Element.textContent =
    "Apologies, an error occurred. Please wait patiently or reach out to support for assistance if issue re-occurs ";
  const aElement = document.createElement("a");
  aElement.textContent = "support.";
  aElement.href = "mailto:maibot@mai.io";
  span1Element.appendChild(aElement);
  divElement.appendChild(span1Element);

  return divElement;
}

// Function to display a message in the chat
function displayMessage(message, sender, flag, failureStatus) {
  const messageElement = createMessageElement(sender);
  const textSpan = createTextSpan(message, sender, flag);
  loading = false;
  if (failureStatus) {
    const errorMessageDiv = createErrorMessage();
    messageElement.appendChild(errorMessageDiv);
  } else {
    messageElement.appendChild(textSpan);
  }
  chatBox.appendChild(messageElement);
  scrollToBottom();
}

// Helper function to create a message element
function createMessageElement(sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    sender === "user" ? "user-messageDev" : "bot-messageDev"
  );
  const arrowDiv = document.createElement("div");
  if (sender === "user") {
    arrowDiv.classList.add("arrow-right");
    messageElement.appendChild(arrowDiv);
  } else {
    arrowDiv.classList.add("arrow-left");
    messageElement.appendChild(arrowDiv);
  }

  return messageElement;
}

// Helper function to create a text span element
function createTextSpan(message, sender, flag) {
  const textSpan = document.createElement("span");
  textSpan.classList.add(sender === "user" ? "user-message" : "bot-message");
  textSpan.style.fontSize = `${chatBotResult?.font_size}px`;

  if (loading && flag && sender === "bot") {
    createLoader(textSpan, message);
  } else {
    textSpan.textContent = message;
  }

  return textSpan;
}

// Helper function to create a loader element
function createLoader(parentElement, message) {
  const loaderDiv = document.createElement("div");
  loaderDiv.className = "loader";

  for (let i = 0; i < 3; i++) {
    const spanElement = document.createElement("span");
    loaderDiv.appendChild(spanElement);
  }
  parentElement.appendChild(loaderDiv);
  setTimeout(() => {
    loaderDiv.style.display = "none";
    parentElement.textContent = message;
  }, 1000);
}

// Helper function to scroll to the bottom of the chat window
function scrollToBottom() {
  if (chatContainer) {
    chatContainer.scrollTop = chatBox.scrollHeight;
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
  }
}

// Function to fetch message from the chatbot API
function fetchMessage(url, requestOptions) {
  loading = true;
  fetch(url, requestOptions)
    .then((response) => response.text())
    .then(handleMessageResult)
    .catch(handleError)
    .finally(() => {
      loading = false;
    });
}

// Function to fetch chatbot details from the API
function fetchChatbotDetails(requestOptions) {
  if(chatbotname){
    fetch(baseUrlCostomization, requestOptions)
    .then((response) => response.text())
    .then(handleChatbotDetailsResult)
    .catch((error) => console.error("error", error));
  }
 
}

// Fetch chatbot details on page load
getChatbotDetails();
