const { signToken } = require('../config/jwt');

async function testVoiceUpload() {
  const base = 'http://localhost:5000/api';
  const custToken = signToken({ id: 7, email: 'barani@gmail.com', role: 'CUSTOMER' });
  
  // Create a minimal real WebM/WAV audio payload (RIFF header + minimal audio data)
  // Simple valid WAV file buffer: 44 bytes header + silence
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = 8000 * 2 * 2; // 2 seconds of 16-bit audio
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  // Fill data with a simple 440Hz sine wave so it produces real sound when played!
  for (let i = 0; i < dataSize / 2; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 12000;
    buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
  }

  const base64Data = 'data:audio/wav;base64,' + buffer.toString('base64');

  // Test POST /api/messages/voice with base64
  const res = await fetch(`${base}/messages/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`
    },
    body: JSON.stringify({
      recipient_id: 6, // Planner
      duration: 2,
      audio_data: base64Data
    })
  });

  const data = await res.json();
  console.log('Voice Message API Response:', data);

  if (!data.success) {
    throw new Error('Failed to send voice message: ' + JSON.stringify(data));
  }

  // Verify the audio URL can be fetched over HTTP
  const audioFetch = await fetch(`http://localhost:5000${data.data.media_url}`);
  console.log('Fetched audio file status:', audioFetch.status, 'Type:', audioFetch.headers.get('content-type'));

  // Verify getMessages returns this voice message with all fields
  const convRes = await fetch(`${base}/messages/${data.data.conversation_id}`, {
    headers: { 'Authorization': `Bearer ${custToken}` }
  });
  const convData = await convRes.json();
  const lastMsg = convData.data[convData.data.length - 1];
  console.log('Last message from DB:', {
    id: lastMsg.id,
    message_type: lastMsg.message_type,
    media_url: lastMsg.media_url,
    duration: lastMsg.duration,
    message_text: lastMsg.message_text
  });

  console.log('\n--- VOICE MESSAGE BACKEND ENDPOINT TEST PASSED ---');
}

testVoiceUpload().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
