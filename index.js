/**
 * Socket.io configuration
 */

'use strict';

import {initiate} from './lib/one-to-one';

/**
 *
 * @param {data1}
 * @param {data2}
 * @returns {string}
 */

export default function (socketio) {
  let rooms = []
  socketio.on('connection', function (socket) {
    let userId = socket.handshake.query.userId;

    User.findById(userId)
      .then((foundUsers) => {
        Chat.find({})
          .then((data) => {
            rooms = data;
            rooms.forEach((el) => {
              if ((el.partner).toString() === (userId).toString() || (el.initiator).toString() === (userId).toString()) {
                socket.join(el.room);
                if ((el.partner).toString() === (userId).toString()) {
                  if (foundUsers.chats.length > 0) {
                    let count = 0;
                    foundUsers.chats.forEach((ch) => {
                      if (ch.room === el.room) {
                        count += 1;
                      }

                    })
                    if (count === 0) {
                      foundUsers.chats.push({
                        room: el.room,
                        partner: el.initiator
                      })
                      foundUsers.save()
                    }
                  } else {
                    foundUsers.chats.push({
                      room: el.room,
                      partner: el.initiator
                    })
                    foundUsers.save()
                  }
                }

              }
            })

            socket.on('initiate', (receiver) => {
              let count = 0;
              let existRoom = '';
              rooms.forEach((room) => {
                if (((room.initiator).toString() === (userId).toString() && (room.partner).toString() === (receiver).toString()) || ((room.initiator).toString() === (receiver).toString() && (room.partner).toString() === (userId).toString())) {
                  count += 1;
                  existRoom = room.room;
                }
              })

              if (count === 0) {
                let room = createRoom(userId, receiver)


                let chat = new Chat({
                  room: room,
                  initiator: userId,
                  partner: receiver
                });
                chat.save()
                /*
                  Now, we'll add the chats to the respective users.
                */

                User.findById(userId)
                  .then((foundUser) => {
                    foundUser.chats.push({
                      room: room,
                      partner: receiver
                    })
                    foundUser.save((err, success) => {
                      User.findById(receiver)
                        .then((partnerUser) => {
                          partnerUser.chats.push({
                            room: room,
                            partner: userId
                          })
                          partnerUser.save((err, success) => {

                            socket.join(room);
                            socketio.in(room).emit('private room created', {
                              room: room
                            });
                          })

                        })
                    })
                  })
                  .catch((err) => {
                    throw new Error('Oops. I failed at adding chats to your user')
                  })

              } else {
                socketio.in(existRoom).emit('private room created', {
                  room: existRoom
                });
              }
            })

            socket.on('message', (message) => {
              console.log(message);
              Chat.findOne({
                room: message.room
              })
                .then((data) => {
                  let msg = {
                    'content': message.message,
                    'userId': message.sender,
                    'date': message.date
                  }
                  data.chat.push(msg)
                  data.save()
                    .then((success) => {
                      User.update({'chats.room': message.room}, {$set: {'chats.$.lastMessage': {message: message.message, date: message.date}}}, {multi: true})
                        .then((data)=>{
                          socket.to(message.room).emit('messageReceived', msg);
                        }).catch((err)=>{
                        throw new Error('Couldn\'t add the last message to the chat')
                      })

                    })
                })
            })
          })
      }).catch((err) => {
      throw new Error('Couldn\'t find the user')
    })

    comEmit.on('job', (data)=>{
      let jobRoom =  createRoom(data.postId, data.userId);
      socket.join(jobRoom);
      Job.findById(data.postId)
        .then((foundJob)=>{
          foundJob.room = jobRoom;
          foundJob.save()
          socketio.emit('job posted', data.postId);
        })
    })

    comEmit.on('comment', (data)=>{
      if(userId === data.userId){
        socket.join(data.room);
      }
      socket.to(data.room).emit('comment posted', data.comment)
    })
  });
}

let chat = {
  initiate: initiate
}