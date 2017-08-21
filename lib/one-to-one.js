const createRoom = function createRoom(data1, data2) {
  const user1 = data1.toString().slice(-3);
  const user2 = data2.toString().slice(-3);

  return user1 + user2;
}

const initiate = function initiate(receiver, userId) {
	let room = createRoom(receiver, userId);
	return {
		room: room
	}
}

export {initiate}