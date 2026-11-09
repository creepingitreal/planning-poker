import { generateUniqueColour } from '../../../shared/colourAllocation.mjs'

export const allocateParticipantColours = (names, assignedColours = {}) => {
  const colours = {}
  const takenColours = new Set(
    Object.values(assignedColours)
      .filter(Boolean)
      .map((colour) => colour.toLowerCase()),
  )
  const retainedColours = new Set()

  names.forEach((name) => {
    const assignedColour = assignedColours[name]?.toLowerCase()
    if (assignedColour && !retainedColours.has(assignedColour)) {
      colours[name] = assignedColour
      retainedColours.add(assignedColour)
      return
    }

    const colour = generateUniqueColour(takenColours)

    colours[name] = colour
    takenColours.add(colour)
  })

  return colours
}
