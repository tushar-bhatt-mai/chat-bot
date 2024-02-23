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
  width = window?.WebChat?.width || "400",
  height = window?.WebChat?.height || "800",
  username = window?.WebChat?.username,
  modelname = window?.WebChat?.modelname,
  chatbotname = window?.WebChat?.chatbotname,
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
  if (container) {
    container.style.backgroundColor = "#6D1874";
    container.innerHTML = value;
  }
}

// Function to initialize the chat interface
function initialMessage() {
  loggedInUserData(chatBotResult);
  setChatNavbarStyle();
  setDisplayChatWith();
  setDisplayName();
  setUserInputStyle();
  setInitialValue();
  setWidthAndPositionOfChatBot(width);
  if (chatBotResult?.suggested_messages) {
    displaySuggestedMessages(
      chatBotResult?.suggested_messages,
      chatBotResult?.font_size || []
    );
    setChatbotStyle();
  }
}

function setWidthAndPositionOfChatBot(width) {
  let chatbotContainer = document.getElementById("chatbot-container-script");
  if (chatbotContainer) {
    width = Math.min(Math.max(width, 250), width);
    chatbotContainer.style.minWidth = width+'px';
    chatbotContainer.style.maxWidth = width+'px';
    chatbotContainer.style.position = 'fixed';
    chatbotContainer.style.bottom = '17%';
    chatbotContainer.style.right = '40px';
  }
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
  if (initialValue) {
    initialValue.innerHTML = `<span id="typing-effect" class='bot-message'></span><div class="arrow-left"></div>`;

    initialValue.style.fontSize = `${chatBotResult?.font_size}px` || "12px";
    if (chatBotResult?.initial_message) {
      const typingElement = document.getElementById("typing-effect");
      setTimeout(function () {
        typeMessage(chatBotResult.initial_message, typingElement);
      }, 0);
    }
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
  suggestionButton.style.fontFamily =
    chatBotResult?.font_style || "Arial, sans-serif";
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

  if (message.length <= 4) {
    clearUserInput();
    hideSuggestionsMsg();
    displayMessage(
      "I don't know the answer as it's out of the context!",
      "bot",
      false,
      false
    );
  } else {
    clearUserInput();
    hideSuggestionsMsg();
    loading = true;
    fetchMessage(baseUrlPrediction, generateMetaData(message));
  }
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

function createTextSpan(message, sender, flag) {
  const textSpan = document.createElement("span");
  textSpan.classList.add(sender === "user" ? "user-message" : "bot-message");
  textSpan.style.fontSize = `${chatBotResult?.font_size}px`;
  if(sender === "user") {
    textSpan.textContent = message;
  }else{
    textSpan.id = "typing-effect";
    setTimeout(function() {
      typeMessage(message, textSpan);
    }, 0);
  }
  return textSpan;
}

// Helper function to Typing effect

function typeMessage(message, element) {
  const typingSpeed = 30;
  let index = 0;

  function typeWriter() {
    if (index < message.length) {
      element.textContent += message.charAt(index);
      index++;
      scrollToBottom();
      setTimeout(typeWriter, typingSpeed);
    }
  }

  typeWriter();
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

// Helper function to create a loader element
function showLoadingIndicator() {
  const textSpan = document.createElement("span");
  textSpan.classList.add("loader-span-div");
  const loaderDiv = document.createElement("div");
  loaderDiv.className = "loader";

  const arrowLeftDiv = document.createElement("div");
  arrowLeftDiv.classList.add("arrow-left");
  textSpan.appendChild(arrowLeftDiv);

  for (let i = 0; i < 3; i++) {
    const spanElement = document.createElement("span");
    loaderDiv.appendChild(spanElement);
  }

  textSpan.appendChild(loaderDiv);
  chatBox.appendChild(textSpan);
  scrollToBottom();
}

// Function to remove loading indicator
function removeLoadingIndicator() {
  const loader = document.querySelector('.loader-span-div');
  if (loader) {
    loader.remove();
  }
}

// Function to handle errors
function handleRequestError(error) {
  console.error("Error occurred:", error);
  displayMessage("An error occurred. Please try again later.", "bot", false, true);
  removeLoadingIndicator();
}

// Function to fetch message from the chatbot API
function fetchMessage(url, requestOptions) {
  loading = true;
  showLoadingIndicator();
  fetch(url, requestOptions)
    .then((response) =>response.text())
    .then(handleMessageResult)
    .catch(handleError)
    .finally(() => {
      removeLoadingIndicator();
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

