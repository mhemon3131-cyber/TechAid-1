import { useEffect, useRef, useState } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getSocket } from '../socket/socket';
import axios from 'axios';

export default function ChatBox({ conversationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/conversations/${conversationId}/messages`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    const socket = getSocket();
    socket.emit('join_conversation', { conversationId });

    const handleReceive = (message) => {
      if (String(message.conversationId) === String(conversationId)) {
        setMessages((prev) => {
          // Deduplicate if already present by id
          if (prev.some((m) => m.id === message.id)) return prev;
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

    const newMsg = {
      id: `local_${Date.now()}`,
      conversationId,
      senderId: currentUserId || 'usr-1',
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId || 'usr-1', name: 'You', role: 'CUSTOMER' },
    };

    setMessages((prev) => [...prev, newMsg]);

    const socket = getSocket();
    socket.emit('send_message', {
      conversationId,
      content: draft.trim(),
      senderId: currentUserId || 'usr-1',
    });

    setDraft('');
  };

  return (
    <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: 420, p: 2, borderRadius: 3 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 1, pr: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {messages.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 4 }}>
                No messages yet. Start the conversation below.
              </Typography>
            )}
            {messages.map((m) => {
              const mine = String(m.senderId) === String(currentUserId || 'usr-1');
              return (
                <Box key={m.id || Math.random()} sx={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, px: 0.5, fontSize: 11 }}>
                    {mine ? 'You' : (m.sender?.name || 'Technician')}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      px: 2,
                      maxWidth: '75%',
                      bgcolor: mine ? 'primary.main' : 'grey.200',
                      color: mine ? 'primary.contrastText' : 'text.primary',
                      borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontWeight: 500,
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.4 }}>
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

      <Box sx={{ display: 'flex', gap: 1 }}>
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
    </Paper>
  );
}
