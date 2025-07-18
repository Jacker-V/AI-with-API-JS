const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const weatherToggler = document.querySelector("#chatbot-toggler-weather");
// const closeWeather = document.querySelector("#close-weather");
const genToggler = document.querySelector("#chatbot-toggler-gen");
// const closegen = document.querySelector("#close-gen");


const API_KEY = "AIzaSyCRX4ytbJXNhdH3OSJ36NWMPgZSEWXEyS4"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const userData ={
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

//Tao ra message va gui di
const createMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
} 

// Tao phan hoi bang API
const generateBotResponse = async(incomingMessageDiv) =>{
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    // Them phan hoi user vaof chatHistory
    chatHistory.push({
        role: "user",
        parts:[{text: userData.message}, ...(userData.file.data ? [{inline_data: userData.file}] : [])]
        });

    const requestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            contents: chatHistory
        })
    }
    try{
        const response = await fetch(API_URL,requestOption);
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        console.log(data);
        messageElement.innerText =  apiResponseText;
        // Add response chatHistory
        chatHistory.push({
            role: "model",
            parts:[{text: apiResponseText}]
        });
    }catch(error){
        // Xu li loi sai voi API
        console.log(error);
        messageElement.innerText =  error.message;
        messageElement.style.color = "#ff0000";
    }finally{
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
    }

}
// Xu li message cua nguoi dung
const handleOutgoingMessage = (e) =>{
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    // Tao va hien thi message
    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src="data:${userData.file.mine_type};base64,${userData.file.data}" class="attachment" />`: ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top : chatBody.scrollHeight, behavior: "smooth"});
    // Tra ve dg suy nghi
    setTimeout(() =>{
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                </svg>
                <div class="message-text">
                   <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                   </div>
                </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message","thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top : chatBody.scrollHeight, behavior: "smooth"});
        generateBotResponse(incomingMessageDiv);
    },600);
}

//Gui tin nhan bang Enter
messageInput.addEventListener("keydown", (e) =>{
    const userMessage = e.target.value.trim();
    if(e.key == "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768){
        // console.log(userMessage)
        handleOutgoingMessage(e)
    }
})

// Tang do rong o Input
messageInput.addEventListener("input", () =>{
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
})

fileInput.addEventListener("change",() =>{
    const file = fileInput.files[0];
    if(!file) return;
    // console.log(file);
    const reader = new FileReader();
    reader.onload = (e) =>{
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];
        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        // console.log(userData);
        fileInput.value = "";
        
    }
    reader.readAsDataURL(file);
})

// cancel file 
fileCancelButton.addEventListener("click", () =>{
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
})

const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji)=>{
        const {selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        }else{
            document.body.classList.remove("show-emoji-picker")
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e)=> handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click",() => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click",() => document.body.classList.remove("show-chatbot"));
weatherToggler.addEventListener("click", () => document.body.classList.toggle("show-weather"));
// closeWeather.addEventListener("click", () => document.body.classList.remove("show-weather"));
genToggler.addEventListener("click", () => document.body.classList.toggle("show-gen"));
// closegen.addEventListener("click", () => document.body.classList.remove("show-gen"));



// Js for generateImages

const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY_Gen = "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";// Hugging face API key after sign up


const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch’s cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
];

    // Đặt chế độ nền dựa vào lựa chọn người dùng hoặc mặc định của trình duyệt
    (() => {
        const savedTheme = localStorage.getItem("theme");
        // Kiểm tra chế độ người dùng đang là sáng hay tối
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
        document.body.classList.toggle("dark-theme", isDarkTheme);
        themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
    })();

const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
    //Thay doi icon dua vao che do hien tai

}

const updateImageCard = (imgIndex, imgUrl) =>{
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-img">
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn download="${Date.now().png}">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
}

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return { width: calculatedWidth, height: calculatedHeight};


}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
    const{width, height} = getImageDimensions(aspectRatio);

    // Tao mang cac anh
    const imagePromises = Array.from({length: imageCount}, async(_, i) =>{
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY_Gen}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    paramaters: {width, height},
                    options: {wait_for_model: true, user_cache: false},
                }),  
            });
            if(!response.ok) throw new Error((await response.json())?.error);
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
            // console.log(result);
        }catch (error){
            console.log(error);
        }
    })

    await Promise.allSettled(imagePromises);
    
}

// Create placeholder cards with loading spinners
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <p class="status-text">
                                Generating...
                            </p>
                        </div>
                        
                    </div>`;
        
    }
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
}


// Xu li cac lua chon tren form
const handleFormSubmit = (e) => {
    e.preventDefault();

    // Lay gia tri tu cac lua chon
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    console.log(selectedModel, imageCount, aspectRatio, promptText);
    createImageCards(selectedModel, imageCount, aspectRatio, promptText);
    
}

// Dien thong tin mieu ta random 
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
})

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
