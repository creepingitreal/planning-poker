export const generateUniqueColour = (takenColours) => {
  const normalizedColours = new Set(
    Array.from(takenColours, (colour) => colour.toLowerCase()),
  )

  let colour
  do {
    colour = `#${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, '0')}`
  } while (normalizedColours.has(colour))

  return colour
}