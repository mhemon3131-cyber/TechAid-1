import { useEffect, useRef, useState } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getSocket } from '../socket/socket';
import axios from 'axios';

export function cleanName(nameVal, fallback = 'User') {
  if (!nameVal || typeof nameVal !== 'string') return fallback;
  const trimmed = nameVal.trim();
  if (trimmed.length > 20 && trimmed.includes('-') && /^[0-9a-fA-F-]+$/.test(trimmed)) {
    return fallback;
  }
  if (trimmed === 'Customer' || trimmed === 'Technician') {
    return fallback;
  }
  return trimmed;
}

export default function ChatBox({ conversationId, currentUser, partnerName, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const activeUserId = currentUser?.id || 'usr-1';
  const activeUserName = cleanName(currentUser?.name, currentUser?.role === 'TECHNICIAN' ? 'Fahim' : 'Customer');

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
      if (!message) return;

      // Always accept and display message if it belongs to this active conversation context
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
              const mine =
                String(m.senderId) === String(activeUserId) ||
                String(m.sender?.id) === String(activeUserId) ||
                (m.sender?.role && m.sender?.role === currentUser?.role && m.senderId === currentUser?.id);

              const rawHeaderName = mine
                ? 'You'
                : (m.sender?.name || partnerName || 'Partner');

              const headerName = mine ? 'You' : cleanName(rawHeaderName, partnerName || 'Partner');

              return (
                <Box key={m.id || `msg_${idx}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, px: 1, fontSize: 11, fontWeight: 700 }}>
                    {headerName}
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      px: 2,
                      maxWidth: '75%',
                      borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: mine ? '#00A8FF' : '#172036',
                      color: '#FFFFFF',
                      border: mine ? 'none' : '1px solid #2A364F',
                      wordBreak: 'break-word',
                      boxShadow: mine ? '0 4px 14px rgba(0, 168, 255, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
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

      {/* Message Input Box */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          px: 1.5,
          backgroundColor: '#172036',
          borderRadius: 3,
          border: '1px solid #2A364F',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#FFF',
              backgroundColor: 'transparent',
              '& fieldset': { border: 'none' }
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!draft.trim()}
          sx={{
            backgroundColor: '#00A8FF',
            color: '#FFF',
            '&:hover': { backgroundColor: '#0082C8' },
            '&.Mui-disabled': { backgroundColor: '#2A364F', color: '#64748B' }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
}
