const socket = io({ transportOptions: { maxHttpBufferSize: 1e8 } });
const fileDisplay = document.getElementById("files");
const fileData = document.getElementById("file-data");

// Function to create a room
function createRoom(roomName) {
  socket.emit("create-room", roomName);
}

// Function to join a room
function joinRoom(roomName) {
  socket.emit("join-room", roomName);
}

// Handle incoming room messages
socket.on("room-message", (message) => {
  console.log("Received message:", message);
  // Display the message in your UI
});

// Function to send a message within a room
function sendMessage(roomName, message) {
  // Create a new div for the client message
  const clientMessageDiv = document.createElement("div");
  clientMessageDiv.className = "client-message"; // Add a CSS class for styling
  clientMessageDiv.innerHTML = `You: ${message}`;
  document.getElementById("messages").appendChild(clientMessageDiv);

  // Emit the message to the server
  socket.emit("room-message", { room: roomName, message });
}

// Handle incoming room messages
socket.on("room-message", (message) => {
  // Create a new div for the server message
  const serverMessageDiv = document.createElement("div");
  serverMessageDiv.className = "server-message"; // Add a CSS class for styling
  serverMessageDiv.innerHTML = `Server: ${message}`;
  document.getElementById("messages").appendChild(serverMessageDiv);
});

document.getElementById("upload-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const roomss = document.getElementById("room-input").value;
      console.log(roomss);
      socket.emit("file-upload", {
        name: file.name,
        data: event.target.result,
        room: roomss,
      });
    };
    reader.readAsArrayBuffer(file);
  }
});

socket.on("file-received", (file) => {
  console.log("Received file:", file.data);
  fileDisplay.innerHTML = `<p>File received: ${file.name}</p>`;
  if (isImage(file.name)) {
    // Display the image
    fileData.innerHTML = `<img src="data:image/*;base64,${arrayBufferToBase64(
      file.data
    )}" />`;
  } else if (isVideo(file.name)) {
    // Display the video
    fileData.innerHTML = `<video controls width="400" height="300">
      <source src="data:video/mp4;base64,${arrayBufferToBase64(
        file.data
      )}" type="video/mp4" />
      Your browser does not support the video tag.
    </video>`;
  } else {
    // For other file types, provide a download link
    fileData.innerHTML = `<a href="#" onclick="downloadFile('${file}')">Download ${file.name}</a>`;
  }
});

function isVideo(filename) {
  return /\.(mp4|avi|mkv|webm|mov)$/i.test(filename);
}
function isImage(filename) {
  return /\.(jpe?g|png|gif|bmp|svg)$/i.test(filename);
}

function arrayBufferToBase64(buffer) {
  const binary = [];
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary.push(String.fromCharCode(bytes[i]));
  }
  return btoa(binary.join(""));
}

function downloadFile(fileData) {
  console.log(fileData);
  const blob = new Blob([fileData], { type: "application/octet-stream" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element for downloading
  const link = document.createElement("a");
  link.href = url;
  link.download = fileData.name;
  link.textContent = `Download ${fileData.name}`;

  // Trigger a click event on the link to start the download
  link.click();

  // Clean up by revoking the URL
  URL.revokeObjectURL(url);
}
