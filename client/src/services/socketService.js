import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket;

export const initializeSocket = (userId) => {
  socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('register', userId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
}; 