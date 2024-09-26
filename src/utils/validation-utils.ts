/**
 *
 * @param time Should be in the format HH:mm or HH:mm:ss
 * @returns Date
 *
 * @example convertTime('10:00') // 1970-01-01T10:00:00.000Z
 *
 * @description Converts a string time to a Date object
 */
export function convertTime(time: string) {
  return new Date(`1970-01-01T${time}`)
}

/**
 *
 * @param time Should be in the format HH:mm
 * @returns boolean
 *
 * @example validateTime('10:00') // true
 * @example validateTime('25:00') // false
 *
 * @description Validates if the time is in the format HH:mm
 */
export function validateTime(time: string) {
  return time.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
}
