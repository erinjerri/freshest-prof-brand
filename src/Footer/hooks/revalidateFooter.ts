import type { GlobalAfterChangeHook } from 'payload'

// ✅ Safe fallback: no revalidation, no crash
export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info('revalidateFooter hook called — no-op fallback')
  return doc
}
