import { getSessionHistory, appendSessionTurn, clearSession } from '../src/session.js';

describe('Model Router Session Persistence & Context Tests', () => {
  const testSessionId = 'test-session-suite-123';

  beforeEach(() => {
    clearSession(testSessionId);
  });

  afterEach(() => {
    clearSession(testSessionId);
  });

  it('should start with an empty session history', () => {
    const history = getSessionHistory(testSessionId);
    expect(history).toEqual([]);
  });

  it('should append conversation turns and retrieve history correctly', () => {
    appendSessionTurn(testSessionId, 'Hello, what is 2+2?', '2+2 is 4.');
    const history = getSessionHistory(testSessionId);
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ role: 'user', content: 'Hello, what is 2+2?' });
    expect(history[1]).toEqual({ role: 'assistant', content: '2+2 is 4.' });
  });

  it('should trim history beyond maxMessages limit while retaining recent turns', () => {
    for (let i = 1; i <= 15; i++) {
      appendSessionTurn(testSessionId, `Question ${i}`, `Answer ${i}`, 10);
    }

    const history = getSessionHistory(testSessionId);
    expect(history.length).toBeLessThanOrEqual(10);
    expect(history[history.length - 1].content).toBe('Answer 15');
  });

  it('should clear session history when clearSession is called', () => {
    appendSessionTurn(testSessionId, 'Test prompt', 'Test reply');
    expect(getSessionHistory(testSessionId)).toHaveLength(2);

    const cleared = clearSession(testSessionId);
    expect(cleared).toBe(true);
    expect(getSessionHistory(testSessionId)).toEqual([]);
  });
});
