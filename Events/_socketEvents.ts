import { isEmpty, isString, isUndefined, } from 'lodash';

import { EReceiveEvents, ESendEvents, } from '../constants';

import { storeVisitorInfo, } from '../services/visitorService';
import {
    registerNewVisitor,
    setUserInactive,
    validateConnectionId,
} from '../services/connectManagerService';
import {
    assignSupport,
    assignUserToQueue,
    isUserInQueue,
    unassignSupport,
    unassignUserFromQueue,
} from '../services/support/supportManagerService';
import {
    deleteRoom,
    initializeRoom,
    isRoomExist,
} from '../services/support/chatRoomService';
import { emitEventToSocket, } from './_SocketEmitters';

import { notifySupportsOfNewUser, } from '../Helpers';

import { updateMessage, } from '../util';

interface IMessageResponseJoinToChat {
    message: string;
}

const WELCOME_USER_TEXT = 'Welcome to Support Chat!';
const WELCOME_ADMIN_TEXT = 'Welcome to Support Chat Admin!';

const _socketEvents = (io) => {
    io.on('connection', async (socket) => {
        const connectId = socket.id;
        const token = socket?.handshake?.auth?.token;

        console.log(`User ${connectId} connected`);
        // Upon connection - to all others (Skip sender)
        // socket.broadcast.emit('message', `User ${connectId.substring(0, 5)}} connected`);

        await registerNewVisitor(connectId, token);

        socket.on(EReceiveEvents.USER_JOINED, async (data) => {
            if (!isEmpty(data)) {
                const count = await storeVisitorInfo(data);
                if (count.isNewUser) {
                    socket.broadcast.emit(ESendEvents.USER_JOINED, count);
                }
                socket.emit(ESendEvents.USER_JOINED, count);
            }
        });

        socket.on(EReceiveEvents.SUPPORT_CHAT_USER_JOIN, async (data: { connectId: string, }) => {
            try {
                if (isUndefined(data) || !isString(data.connectId)) {
                    const message = 'Incorrect Data';
                    socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                    return;
                }

                const messageResponseJoinToChat: IMessageResponseJoinToChat = {
                    message: WELCOME_USER_TEXT,
                };

                const result = await validateConnectionId(data);
                if (!result) {
                    const message = 'User Not fount';
                    socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                    return;
                }

                if (result.User.role === 'support') {
                    await assignSupport(result.connectId);
                    messageResponseJoinToChat.message = WELCOME_ADMIN_TEXT;
                } else {
                    await assignUserToQueue({
                        connectId: result.connectId, name: 'Test Ivan',
                    });
                }

                // To all the "supports" who have joined
                await notifySupportsOfNewUser(connectId);

                // To user who joined 
                socket.emit(ESendEvents.SUPPORT_CHAT_USER_JOIN_ACKNOWLEDGMENT, messageResponseJoinToChat);
            } catch (err) {
                const message = 'Global problem';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                console.log('SocketRoute Event ∞ SUPPORT_CHAT_USER_JOIN', err);
            }
        });

        socket.on(EReceiveEvents.SUPPORT_ACCEPT_USER, async (data: { supportId: string, acceptUserId: string }) => {
            try {
                const resultFromSupportCheck = await validateConnectionId({ connectId: data.supportId, });
                if (resultFromSupportCheck?.User?.role !== 'support') {
                    const message = 'Trigger an event when a user is not authorized to accept a support chat request';
                    socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                    return;
                }

                const resultFromUserCheck = await isUserInQueue({ connectId: data.acceptUserId, });
                if (!resultFromUserCheck) {
                    const message = 'User doesn\'t exist';
                    socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                    return;
                }

                const roomInfo = await initializeRoom(resultFromSupportCheck, resultFromUserCheck);
                socket.join(roomInfo.roomName);

                await unassignUserFromQueue(resultFromUserCheck.connectId);

                // Automatically send a message to the user that includes the support agent's name
                const modifySupportData = resultFromSupportCheck.User.email.split('@')[0];
                const userPayload = {
                    roomName: roomInfo.roomName,
                    message: `Support with name ${modifySupportData} is accepted your request`,
                };
                const supportPayload = {
                    roomName: roomInfo.roomName, message: 'support',
                };
                emitEventToSocket(resultFromUserCheck.connectId, ESendEvents.NOTIFY_FOR_CREATE_ROOM, userPayload);
                emitEventToSocket(resultFromSupportCheck.connectId, ESendEvents.NOTIFY_FOR_CREATE_ROOM, supportPayload);

                // To all the "supports" who have joined
                await notifySupportsOfNewUser(connectId);
            } catch (err) {
                const message = 'Global Error';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                console.log('SocketRoute Event ∞ SUPPORT_ACCEPT_USER', err);
            }
        });

        socket.on(EReceiveEvents.USER_ACCEPT_JOIN_TO_ROOM, async (data: { roomName: string }) => {
            if (isUndefined(data) || !isString(data.roomName)) {
                const message = 'Incorrect data';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                return;
            }
            try {
                const resultFromRoom = await isRoomExist({ roomName: data.roomName, });
                if (!resultFromRoom?.roomName) {
                    const message = 'room doesn\'t not exist';
                    socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                    return;
                }

                socket.join(resultFromRoom.roomName);

            } catch (err) {
                const message = 'Global Error';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                console.log('SocketRoute Event ∞ USER_ACCEPT_JOIN_TO_ROOM', err);
            }
        });

        socket.on(EReceiveEvents.SUPPORT_CHAT_USER_LEAVE, async (data: { roomName: string, connectId: string }) => {
            if (isUndefined(data) || (!isString(data.roomName) && !isString(data.connectId))) {
                const message = 'Incorrect data';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                return;
            }
            try {

                const resultFromRoom = await isRoomExist({ roomName: data.roomName, });
                if (resultFromRoom) {
                    // Mark conversation is completed
                    emitEventToSocket(resultFromRoom.roomName, ESendEvents.COMPLETE_ISSUE,
                        { message: 'Complete', }
                    );

                    await deleteRoom({ roomName: resultFromRoom.roomName, });

                    socket.leave(resultFromRoom.roomName);
                    return;
                }

                const isUserExist = await isUserInQueue(data);
                if (!isUserExist) {
                    const message = 'User doesn\'t exit';
                    socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                    return;
                }

                await unassignUserFromQueue(data.connectId);

                await notifySupportsOfNewUser(connectId);
            } catch (err) {
                const message = 'Global Error';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                console.log('SocketRoute Event ∞ SUPPORT_CHAT_USER_LEAVE', err);
            }
        });

        socket.on(EReceiveEvents.SUPPORT_MESSAGE, async (data: { roomName: string, message: string }) => {
            if (isUndefined(data) || !isString(data.roomName)) {
                const message = 'Incorrect data';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                return;
            }

            const resultFromRoom = await isRoomExist({ roomName: data.roomName, });
            if (!resultFromRoom?.roomName) {
                const message = 'Doesn\'t exist room';
                socket.emit(ESendEvents.ERROR, updateMessage({ message, }).user);
                return;
            }
            const messagePayload = {
                roomName: resultFromRoom.roomName,
                message: data.message,
                from: connectId,
            };
            emitEventToSocket(resultFromRoom.roomName, ESendEvents.SUPPORT_MESSAGE, messagePayload);
        });

        // When user disconnects - to all others 
        socket.on('disconnect', async () => {
            console.log(`User ${connectId} disconnected`);

            await setUserInactive(connectId);
            const result = await unassignUserFromQueue(connectId);
            if (result) {
                await notifySupportsOfNewUser(connectId);
            }

            await unassignSupport(connectId);

            // At disconnect on user send event to everyone else 
            // socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)}} disconnected`);
        });

        // socket.on('disconnecting', (reason) => {
        //     for (const room of socket.rooms) {
        //         if (room !== socket.id) {
        //             socket.to(room).emit('user has left', socket.id);
        //         }
        //     }
        // });
    });
};

export default _socketEvents;

// console.log('Rooms:', io.sockets.adapter.rooms);
// console.log('Room details:', io.sockets.adapter.rooms.get(roomInfo.roomName));