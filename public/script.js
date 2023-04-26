// import { Peer } from "peerjs";
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer();
const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream); /vidimo video na stranici/

    myPeer.on("call", (call) => {
      /receive calls/
      call.answer(stream);

      const video = document.createElement("video");
      video.className = call.peer;
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  const relatedVideo = document.getElementsByClassName(userId.toString());
  relatedVideo[0].remove();
  peers[userId].close();
});

myPeer.on("open", (id) => {
  myVideo.className = myPeer._id;
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  /*make calls */
  const call = myPeer.call(userId, stream);

  const video = document.createElement("video");

  video.className = userId.toString();

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userId);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
  video.className = userId;
}

function addVideoStream(video, stream, userId) {
  video.srcObject = stream; //allow us to play the video
  if (userId) {
    video.className = userId.toString();
  }
  video.addEventListener("loadedmetadata", () => {
    video.play();
  }); //ucitani video pusta na stranici

  videoGrid.append(video); //stavlja video na nas grid
}