import { Modal, Box, Typography, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function JitsiCallModal({ open, onClose, roomName, callType }) {
  if (!open || !roomName) return null;

  const domain = 'meet.jit.si';
  const callUrl = `https://${domain}/${roomName}`;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '85%', md: '75%' },
          maxWidth: 900,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 2,
          outline: 'none',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {callType === 'VOICE' ? '🎙️ TechAid Voice Call Session' : '📹 TechAid Video Call Session'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ width: '100%', height: 500, borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
          <iframe
            src={callUrl}
            title="TechAid Live Call"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
          />
        </Box>
      </Box>
    </Modal>
  );
}
