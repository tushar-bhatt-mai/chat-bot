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
var tempResponseHolder = "";
var userMsg = "";

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
  leadEnabled = true,
} = params || {};

function removeStr(str) {
  return str.replace(/^\s+/, "");
}

// API endpoints

const trainingApi = `https://${removeStr(
  environment
)}-maibot-trainingapi.p2eppl.com/`;

const baseUrlPrediction = `https://${removeStr(
  environment
)}-maibot-predictionapi.p2eppl.com/prediction_with_API_KEY`;

const baseUrlCostomization = `${trainingApi}get_chatbot_customization`;

const storeChatHistory = `${trainingApi}store_guest_user_chat_history`;

const storeUnmatchedChatHistory = `${trainingApi}store_guest_user_unmatch_query`;

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
  inputFieldHandler();
  fetchUserDetail();
});

// Helper function to invoked whenever onChange is called inputField

document.getElementById("user-input").addEventListener("input", function () {
  inputFieldHandler();
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
    chatbotContainer.style.minWidth = "30%";
    chatbotContainer.style.maxWidth = "30%";
    chatbotContainer.style.position = "fixed";
    chatbotContainer.style.bottom = "10%";
    chatbotContainer.style.top = "5%";
    chatbotContainer.style.right = "40px";
    chatbotContainer.style.minHeight = "50%";
    chatbotContainer.style.maxHeight = "60% !important";
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
  if (chatNavbar) {
    const backgroundColor = chatBotResult?.background_colour || "bgColor";
    chatNavbar.style.backgroundColor = backgroundColor;
  }
}

// Helper function to set "Chat With" display
function setDisplayChatWith() {
  const displayChatWith = document.getElementById("display-chat");
  if (displayChatWith) {
    displayChatWith.innerHTML = chatBotResult?.display_name ? "Chat With" : "";
    displayChatWith.style.fontSize = `${chatBotResult?.font_size}px` || "12px";
  }
}

// Helper function to set display name
function setDisplayName() {
  const displayName = document.getElementById("display-name");
  if (displayName) {
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
  if (suggestedMessagesContainer) {
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

// Helper function to validate input field

function inputFieldHandler() {
  const submitBtn = document.getElementById("submitBtn");
  const userDetailForm = document.getElementById("userDetailForm");
  
  const message = getUserInputMessage();

  if (message.trim().length <= 2) {
    submitBtn.disabled = true;
    submitBtn.classList.add("disabled-button");
  }

  if (userDetailForm || message.trim().length >= 2) {
    submitBtn.disabled = false;
    submitBtn.classList.remove("disabled-button");
  }
}

// Function to send user message to the chatbot
function sendMessage(event) {
  if (event) {
    event?.preventDefault();
  }
  const userDetailForm = document.getElementById("userDetailForm");
  if (userDetailForm) {
    submitForm(event);
  }
  const message = getUserInputMessage();
  if (message.length < 2) return;

  displayUserMessage(message);
  hideSuggestionsMsg();
  clearUserInput();
  loading = true;
  fetchMessage(baseUrlPrediction, generateMetaData(message), message);
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

// Variable to get chatbot error

const errorMessageLeadGen = {
  name: "Min. 2 and max. 25 characters allowed",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number with 10 digit",
};

// Helper function to validate name

function validateName(name) {
  return /^[a-zA-Z ]{2,25}$/.test(name);
}

// Helper function to validate email

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Helper function to validate phone

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

// Helper function to validate all input fields

function validateInput(input) {
  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");

  switch (input.id) {
    case "name":
      if (!validateName(input.value)) {
        nameError.textContent = errorMessageLeadGen.name;
        name.style.border = "1px solid red";
        name.style.outline = "red";
        scrollToBottom();
      } else {
        nameError.textContent = "";
        name.style.border = "";
        name.style.outline = "";
      }
      break;
    case "email":
      if (!validateEmail(input.value)) {
        emailError.textContent = errorMessageLeadGen.email;
        email.style.border = "1px solid red";
        email.style.outline = "red";
        scrollToBottom();
      } else {
        emailError.textContent = "";
        email.style.border = "";
        email.style.outline = "";
      }
      break;
    case "phone":
      if (!validatePhone(input.value)) {
        phoneError.textContent = errorMessageLeadGen.phone;
        phone.style.border = "1px solid red";
        phone.style.outline = "red";
        scrollToBottom();
      } else {
        phoneError.textContent = "";
        phone.style.border = "";
        phone.style.outline = "";
      }
      break;
    default:
      break;
  }
}

function showForm() {
  const msg =
    "Thanks for choosing us! Help us stay connected by sharing your basic details";

  const formHTML = `
  <form id="userDetailForm" class="userDetailForm" onsubmit="submitForm(event)">
  <div>
      <label class="userDetailForm-label" for="name">Enter your name*</label>
      <br />
      <input id="name" name="name" class="form-input" placeholder="Please enter the name" required><br>
      <span id="nameError" class="error-message"></span>
      </div>
     
      <div>
      <label class="userDetailForm-label" for="email">Enter your email address*</label><br>
      <input type="email" id="email" name="email" class="form-input" placeholder="Please enter the email" required><br>
      <span id="emailError" class="error-message"></span>
      </div>
     
      <div>
      <label class="userDetailForm-label" for="phone">Enter your mobile number*</label><br>
      <input type="tel" id="phone" name="phone" class="form-input" placeholder="+91" required><br>
      <span id="phoneError" class="error-message"></span>
      </div>
      <br />
  </form>`;

  displayMessage(msg, "bot", false, false, true);

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = formHTML;
  tempDiv.classList.add("fadeIn");

  chatBox.appendChild(tempDiv);

  const inputs = document.querySelectorAll(".form-input");
  if (inputs) {
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        validateInput(this);
      });

      input.addEventListener("blur", function () {
        validateInput(this);
      });
    });
  }
  const submitBtn = document.getElementById("submitBtn");

  if(submitBtn){
    submitBtn.disabled = false;
    submitBtn.classList.remove("disabled-button");
  }

  
}

// Function to validateForm of user lead

async function submitForm(event) {
  event?.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");

  if (!validateName(name)) {
    nameError.textContent = errorMessageLeadGen.name;
    return;
  }

  if (!validateEmail(email)) {
    emailError.textContent = errorMessageLeadGen.email;
    return;
  }

  if (!validatePhone(phone)) {
    phoneError.textContent = errorMessageLeadGen.phone;
    return;
  }

  await saveData(name, email, phone);
}

// Function to save data for user

async function saveData(name, email, phone) {
  const userData = {
    name,
    email,
    phone,
  };
  localStorage.setItem("userData", JSON.stringify(userData));
  leadCapture(userData);
}

// Function to generate  build form data for user

function buildFormDataChatHistory(question, answer, flag, data) {

  const enabledLead = chatBotResult?.is_lead_capture
  const formData = new FormData();
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  formData.append("name", !enabledLead ? "Pavitra Kumar" : user?.name || data?.name);
  formData.append("emailid", !enabledLead ? "support@maibot.net" : user?.email || data?.email);
  formData.append("contact_number",!enabledLead ? "9999999999" : user?.phone || data?.phone);
  formData.append("chatbotid", removeQuota(chatBotId));
  formData.append("isthread", `${flag ? "True" : "False"}`);
  formData.append("chatbotObj", JSON.stringify({ question, answer }));
  return formData;
}

// Function to remove disabled flags

async function leadCapture(data) {
  userInput.disabled = false;
  userInput.style.cursor = "auto";
  removeUserSubmitedFormIndicator();
  displayMessage(
    "Thanks for sharing! We will use this info to assist you better",
    "bot",
    false,
    false,
    false
  );

  dealyMsgPrint(tempResponseHolder);
  const tempData = JSON.parse(tempResponseHolder);
  const formData = buildFormDataChatHistory(
    userMsg,
    removeApostrophes(tempData?.message),
    isChatBoxEmpty(),
    data
  );
  await helperFn(storeChatHistory, formData);
  tempResponseHolder = "";
}

function dealyMsgPrint(msg) {
  setTimeout(() => {
    handleMessageResult(msg);
  }, 2000);
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
function displayMessage(message, sender, flag, failureStatus, removeElement) {
  const messageElement = createMessageElement(
    sender,
    removeElement ? removeElement : null
  );
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
function createMessageElement(sender, flag) {
  const messageElement = document.createElement("div");
  if (flag) {
    messageElement.classList.add("bot-messageDev-remove");
  }
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
  if (sender === "user") {
    textSpan.textContent = message;
  } else {
    textSpan.id = "typing-effect";
    setTimeout(function () {
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
  const loader = document.querySelector(".loader-span-div");
  if (loader) {
    loader.remove();
  }
}

// Function to remove loading indicator
function removeUserSubmitedFormIndicator() {
  const userDetailForm = document.querySelector(".userDetailForm");
  const initailMessage = document.querySelector(".bot-messageDev-remove");
  if (userDetailForm) {
    userDetailForm.remove();
    initailMessage.remove();
  }
}

// Function to handle errors
function handleRequestError(error) {
  console.error("Error occurred:", error);
  displayMessage(
    "An error occurred. Please try again later.",
    "bot",
    false,
    true
  );
  removeLoadingIndicator();
}

async function recordUserChatHistory(apiUrl, formData) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error", error);
  }
}

async function helperFn(apiEndPoint, formData) {
  const extractedValues = {};
  for (const [key, value] of formData.entries()) {
    extractedValues[key] = value;
  }

  let apiResponse = "";
  const obj = JSON.parse(extractedValues.chatbotObj);

  if (
    obj.answer ===
    "Please enter some valid question (number of characters >= 5)"
  ) {
    formData.delete("chatbotObj");
    formData.append(
      "chatbotObj",
      JSON.stringify({
        question: obj.question,
        answer:
          "Apologies, an error occurred. Please wait patiently or reach out to support for assistance if issue re-occurs",
      })
    );
  }

  await recordUserChatHistory(apiEndPoint, formData)
    .then((data) => {
      apiResponse = data;
    })
    .catch((error) => {
      console.error("Error occurred:", error);
    })
    .finally(() => {
      if (
        obj?.answer.trim() ==
        removeApostrophes(
          "Thanks for your question! We`re looking into it and will get back to you soon. Feel free to ask anything else in the meantime!"
        )
      ) {
        const userDetails = JSON.parse(localStorage.getItem("userData"));
        const enabledLead = chatBotResult?.is_lead_capture
        const formDataObj = objectToFormData({
          emailid: !enabledLead ? "support@maibot.net" :  userDetails.email,
          question: obj?.question,
          created_at: apiResponse.created_at,
        });
        recordUserUnmatchedChatHistory(storeUnmatchedChatHistory, formDataObj);
      }
    });
}

function removeApostrophes(str) {
  return str.replace(/'/g, "");
}

function isChatBoxEmpty() {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    const childDivs = chatBox.querySelectorAll(
      ".user-messageDev, .bot-messageDev"
    );
    if (childDivs.length === 2) {
      return true;
    }
  }
  return false;
}

function objectToFormData(data) {
  const formData = new FormData();

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      formData.append(key, data[key]);
    }
  }

  return formData;
}

async function recordUserUnmatchedChatHistory(apiUrl, formData) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error", error);
  }
}

// Functions to fetch user current location information 

// TODO: remove token and keep it .env

 async function fetchUserDetail(){

const requestOptions = {
  method: "GET",
  redirect: "follow"
};

fetch("https://ipinfo.io/?token=2f77ad2cd2499f", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
 }

// Function to fetch message from the chatbot API

function fetchMessage(url, requestOptions, message) {
  loading = true;
  showLoadingIndicator();
  fetch(url, requestOptions)
    .then((response) => response.text())
    .then((data) => {
      const userData = localStorage.getItem("userData");
      tempResponseHolder = data;
      if (!userData && leadEnabled === true && chatBotResult?.is_lead_capture) {
        showForm();
        userInput.disabled = true;
        userInput.style.cursor = "not-allowed";
      } else {
        handleMessageResult(data);
          const msg = JSON.parse(data);
          const formData = buildFormDataChatHistory(
            message,
            removeApostrophes(msg?.message),
            isChatBoxEmpty()
          );
          helperFn(storeChatHistory, formData);
      }
      userMsg = message;
    })
    .catch(handleError)
    .finally(() => {
      removeLoadingIndicator();
      loading = false;
    });
}

// Function to fetch chatbot details from the API
function fetchChatbotDetails(requestOptions) {
  if (chatbotname) {
    fetch(baseUrlCostomization, requestOptions)
      .then((response) => response.text())
      .then(handleChatbotDetailsResult)
      .catch((error) => console.error("error", error));
  }
}


// Fetch chatbot details on page load
getChatbotDetails();
