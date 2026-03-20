import server from '../dist/server/server.js'

export default async function handler(req, res) {
  const host = req.headers.host || 'localhost'
  const url = new URL(req.url, `https://${host}`)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v))
    } else if (value) {
      headers.set(key, value)
    }
  }

  let body = null
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise((resolve, reject) => {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => resolve(Buffer.concat(chunks)))
      req.on('error', reject)
    })
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: body?.length ? body : null,
  })

  const response = await server.fetch(request)

  res.statusCode = response.status
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value)
  }

  if (response.body) {
    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
  }

  res.end()
}
