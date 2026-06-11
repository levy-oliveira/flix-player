const ok = (res, data = {}, message = 'Sucesso', status = 200) => {
  return res.status(status).json({ success: true, message, data })
}

const created = (res, data = {}, message = 'Criado com sucesso') => {
  return ok(res, data, message, 201)
}

const fail = (res, message = 'Erro', status = 400) => {
  return res.status(status).json({ success: false, message })
}

module.exports = { ok, created, fail }
