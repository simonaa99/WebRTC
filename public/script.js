//import {Peer} from 'peerjs'
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host:'/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream =>{
    addVideoStream(myVideo, stream)/*vidimo video na stranici*/

    myPeer.on('call', call=>{   /*receive calls*/
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId=>{
        connectToNewUser(userId, stream)
    })

    
})

socket.on('user-disconnected',userId =>{
    if(peers[userId])peers[userId].close()
})

myPeer.on('open', id =>{
    socket.emit('join-room',ROOM_ID, id)
})

function connectToNewUser(userId, stream){/*make calls */
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
    call.on('close', ()=>{
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream //allow us to play the video
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    }) //ucitani video pusta na stranici
    videoGrid.append(video)//stavlja video na nas grid
}
  
