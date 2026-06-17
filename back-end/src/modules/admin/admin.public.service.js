const Blacklist = require('../../models/Blacklist')

// Retorna apenas os IDs bloqueados, sem metadados administrativos.
// Usado pelo proxy TMDB do frontend — não expõe addedBy, createdAt, etc.
const listBlacklistIds = async () => {
  const entries = await Blacklist.find().select('tmdbId').lean()
  return entries.map((e) => e.tmdbId)
}

module.exports = { listBlacklistIds }