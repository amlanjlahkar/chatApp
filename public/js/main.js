const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

/* Emits a new event 'joinRoom' upon loading this page
indicating that a new user has joined a room */
socket.emit("joinRoom", { username, room });

/* after the joinRoom event is captured by the server,
 * it emits a new event returning an object list
 * which is captured here */
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

/* listens for form submit events,
 * and emit a new event returning the
 * value obtained from form input.
 * The event is again emitted by the server after
 * capture, for parsing by the message event */
chatForm.addEventListener("submit", (event) => {
  // don't submit the event to a file
  event.preventDefault();

  const msg = event.target.elements.msg.value;
  socket.emit("chatMessage", msg);

  event.target.elements.msg.value = "";
  event.target.elements.msg.focus();
});

/* respond to message events */
socket.on("message", (msg) => {
  console.log(msg);
  outputMessage(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// DOM manipulation
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
  chatMessages.appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputRoomUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.name}</li>`).join("")}
  `;
}
