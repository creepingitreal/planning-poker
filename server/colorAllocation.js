import { generateUniqueColour } from '../shared/colourAllocation.mjs'

export const nextParticipantColor = (rooms, roomId) => {
  const takenColors = new Set(
    Object.values(rooms[roomId] ?? {})
      .map((participant) => participant.color?.toLowerCase())
      .filter(Boolean),
  )

  return generateUniqueColour(takenColors)
}
