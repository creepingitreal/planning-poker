import { brandColours } from './brandColours.mjs'

export const prohibitedColours = brandColours

export const getContrastingTextColour = (colour) => {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colour ?? '')) return '#000000'

  const hex =
    colour.length === 4
      ? colour
          .slice(1)
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : colour.slice(1)
  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  const blackContrast = (luminance + 0.05) / 0.05
  const whiteContrast = 1.05 / (luminance + 0.05)
  return blackContrast >= whiteContrast ? '#000000' : '#ffffff'
}

export const generateUniqueColour = (takenColours) => {
  const normalizedColours = new Set(
    Array.from(takenColours, (colour) => colour.toLowerCase()),
  )

  let colour
  do {
    colour = `#${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, '0')}`
  } while (normalizedColours.has(colour) || prohibitedColours.includes(colour))

  return colour
}

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
    if (
      assignedColour &&
      !retainedColours.has(assignedColour) &&
      !prohibitedColours.includes(assignedColour)
    ) {
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
