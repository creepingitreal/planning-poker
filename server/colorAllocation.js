const participantColors = [
  "#f4a6a6",
  "#f5b97d",
  "#f4d35e",
  "#a8d98b",
  "#77c8a5",
  "#72c9c6",
  "#79b7d8",
  "#8fa7d8",
  "#b69bd8",
  "#df9dcc",
];

export const nextParticipantColor = (rooms, roomId) => {
  const takenColors = new Set(
    Object.values(rooms[roomId] ?? {}).map((participant) => participant.color),
  );
  const available = participantColors.filter(
    (color) => !takenColors.has(color),
  );

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  let color;
  do {
    const hue = Math.floor(Math.random() * 360);
    color = `hsl(${hue}, 80%, 88%)`;
  } while (takenColors.has(color));

  return color;
};
