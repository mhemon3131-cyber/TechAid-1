import { useEffect, useRef, useState } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getSocket } from '../socket/socket';
import axios from 'axios';

export default function ChatBox({ conversationId, currentUser, partnerName, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const activeUserId = currentUser?.id || 'usr-1';
  const activeUserName = currentUser?.name || 'User';

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    axios
      .get(`http://localhost:1257/api/conversations/${conversationId}/messages`)
      .then((res) => setMessages(res.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    const socket = getSocket();
    socket.emit('join_conversation', { conversationId });

    const handleReceive = (message) => {
      if (String(message.conversationId) === String(conversationId)) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              (m.id && message.id && String(m.id) === String(message.id)) ||
              (m.content === message.content &&
                String(m.senderId) === String(message.senderId) &&
                Math.abs(new Date(m.createdAt || Date.now()) - new Date(message.createdAt || Date.now())) < 3000)
          );
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!draft.trim()) return;

    const content = draft.trim();
    setDraft('');

    const socket = getSocket();
    socket.emit('send_message', {
      conversationId,
      content,
      senderId: activeUserId,
      senderName: activeUserName,
    });

    if (onMessageSent) {
      onMessageSent(conversationId);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Scrollable Messages Container */}
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 1.5, pr: 1, minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Stack spacing={1.8}>
            {messages.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 4 }}>
                No messages yet. Start the conversation below.
              </Typography>
            )}
            {messages.map((m, idx) => {
              const mine = String(m.senderId) === String(activeUserId);
              const headerName = mine
                ? 'You'
                : (m.sender?.name || partnerName || 'Partner');

              return (
                <Box key={m.id || `msg_${idx}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  <Typography variant="caption" sx={{ mb: 0.4, px: 0.8, fontSize: 11, fontWeight: 700, color: mine ? '#38BDF8' : '#94A3B8' }}>
                    {headerName}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      px: 2,
                      maxWidth: '75%',
                      bgcolor: mine ? '#00A8FF' : '#1E293B',
                      color: mine ? '#0D1527' : '#F8FAFC',
                      borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontWeight: 600,
                      border: mine ? 'none' : '1px solid #334155',
                      boxShadow: mine ? '0 2px 8px rgba(0,168,255,0.25)' : '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.4, fontSize: '0.88rem' }}>
                      {m.content}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={bottomRef} />
          </Stack>
        )}
      </Box>

      {/* Input Bar Fixed inside ChatBox container */}
      <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid #334155' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <IconButton color="primary" onClick={sendMessage} disabled={!draft.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
