export const participantColors = [
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

const fallbackColorFor = (name, index) => {
  let hash = index;

  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360;
  }

  return `hsl(${hash}, 80%, 78%)`;
};

export const allocateParticipantColors = (names, assignedColors = {}) => {
  const colors = {};
  const takenColors = new Set(Object.values(assignedColors).filter(Boolean));

  names.forEach((name, index) => {
    if (assignedColors[name]) {
      colors[name] = assignedColors[name];
      return;
    }

    const availableColor = participantColors.find(
      (color) => !takenColors.has(color),
    );
    const color = availableColor ?? fallbackColorFor(name, index);

    colors[name] = color;
    takenColors.add(color);
  });

  return colors;
};
