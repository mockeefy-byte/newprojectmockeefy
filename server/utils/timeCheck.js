export const isSessionActive = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now < end;
};

export const hasSessionEnded = (endTime) => {
    const now = new Date();
    return now >= new Date(endTime);
};
