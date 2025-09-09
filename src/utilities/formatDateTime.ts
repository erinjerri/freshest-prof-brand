export const formatDateTime = (timestamp?: string | number | Date | null): string => {
  let date: Date | null = null
  if (timestamp instanceof Date) {
    date = timestamp
  } else if (timestamp !== undefined && timestamp !== null && timestamp !== '') {
    const parsed = new Date(timestamp)
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed
    }
  }

  if (!date) return ''

  const month = date.getMonth()
  const day = date.getDate()
  const year = date.getFullYear()

  const MM = month + 1 < 10 ? `0${month + 1}` : month + 1
  const DD = day < 10 ? `0${day}` : day
  const YYYY = year

  return `${MM}/${DD}/${YYYY}`
}
