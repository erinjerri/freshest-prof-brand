import type { GlobalAfterChangeHook } from 'payload'

// ✅ Safe fallback: no revalidation, no crash
export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info('revalidateHeader hook called — no-op fallback')
  return doc
}
