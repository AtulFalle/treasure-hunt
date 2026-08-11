import axios from 'axios';

describe('POST /api/games', () => {
  it('should create a solo game session when py-geo is up', async () => {
    const res = await axios.post(`/api/games`, { mapId: 'catalina-poc' });

    expect(res.status).toBe(201);
    expect(res.data.sessionId).toBeDefined();
    expect(res.data.clueText).toBeDefined();
  });
});
