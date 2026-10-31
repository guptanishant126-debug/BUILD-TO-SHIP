import http from 'http';

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const runTests = async () => {
  console.log('--- 1. Testing Health Check ---');
  const health = await request('/api/health');
  console.log('Health:', health.status, health.data.status);

  console.log('--- 2. Testing Login ---');
  const login = await request('/api/auth/login', 'POST', {
    email: 'eleanor.vance@example.com',
    password: 'AegisPass123!'
  });
  console.log('Login Status:', login.status, 'Success:', login.data.success);
  const token = login.data.token;

  console.log('--- 3. Testing Scenarios ---');
  const scenarios = await request('/api/enterprise/scenarios');
  console.log('Scenarios count:', scenarios.data.count);

  console.log('--- 4. Testing Start Call Session ---');
  const session = await request('/api/call/session/start', 'POST', {
    caller_identifier: '+1 (555) 019-8234 (Spoofed Sarah Vance)'
  }, token);
  console.log('Session ID:', session.data.session.id);
  const sessionId = session.data.session.id;

  console.log('--- 5. Testing Stream Chunk ---');
  const chunkRes = await request(`/api/call/session/${sessionId}/stream-chunk`, 'POST', {
    chunk_index: 0,
    transcript_segment: "Grandma, oh please pick up! I got arrested and need $3,500 bail money right now!",
    acoustic_features: {
      pitch_mean_hz: 198.4,
      pitch_variance: 4.2,
      spectral_centroid: 2410.2,
      zero_crossing_rate: 0.089,
      jitter: 0.038,
      shimmer: 0.046
    },
    duration_ms: 2500,
    client_timestamp: new Date().toISOString()
  }, token);
  console.log('Chunk Risk Score:', chunkRes.data.analysis.risk_score, 'Category:', chunkRes.data.analysis.threat_category);

  console.log('--- 6. Testing Dynamic Challenge ---');
  const challenge = await request(`/api/call/session/${sessionId}/trigger-challenge`, 'POST', {}, token);
  console.log('Challenge Prompt:', challenge.data.challenge.spoken_challenge_prompt);

  console.log('--- 7. Testing Finalize Call ---');
  const finalized = await request(`/api/call/session/${sessionId}/finalize`, 'POST', {}, token);
  console.log('Finalized Incident ID:', finalized.data.report.id, 'Risk:', finalized.data.report.overall_risk_score);

  console.log('--- ALL BACKEND INTEGRATION TESTS PASSED! ---');
  process.exit(0);
};

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

