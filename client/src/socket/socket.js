import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const savedUser = localStorage.getItem('techaid_user');
    const user = savedUser ? JSON.parse(savedUser) : { id: 'usr-1', role: 'CUSTOMER' };
    const token = localStorage.getItem('token') || 'dev-token';

    socket = io('http://localhost:1257', {
      auth: { token, userId: user.id, role: user.role },
      autoConnect: true,
    });
  }
  return socket;
}
