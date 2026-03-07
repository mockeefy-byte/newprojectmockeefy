// In-memory state as requested to keep things simple for the mock
// Stores socket mappings and ready states

// Structure:
// meetings.get(meetingId) = {
//   expertId: string,
//   candidateId: string,
//   expertReady: boolean,
//   candidateReady: boolean,
//   expertSocket: string | null,
//   candidateSocket: string | null
// }

export const meetings = new Map();
