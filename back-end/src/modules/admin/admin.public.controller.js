const adminPublicService = require('./admin.public.service')
const asyncHandler = require('../../utils/asyncHandler')
const { ok } = require('../../utils/response')

const listBlacklistIds = asyncHandler(async (req, res) => {
  const ids = await adminPublicService.listBlacklistIds()
  ok(res, { ids })
})

module.exports = { listBlacklistIds }