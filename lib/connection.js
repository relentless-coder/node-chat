import {
	initiate
} from './one-to-one';

let userId;

const connection = function connection(io) {
	io.on('connection', (socket) => {
		userId = socket.handshake.query.userId;
	})

}

const checkIfHasRooms = function checkIfHasRooms(rooms) {
	rooms.forEach((el) => {
		if ((el.partner).toString() === (userId).toString() || (el.initiator).toString() === (userId).toString()) {
			
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
}