import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { fetchRemoteJson } from '../../app/helpers/remote-data'

// Grant and trial pages cache whatever they render until the next deploy, so
// only a genuinely missing object may resolve to null (and so a cached 404).

const realFetch = globalThis.fetch
const realDeploymentId = process.env.VERCEL_DEPLOYMENT_ID

const stubFetch = (status: number, body: unknown = {}) => {
    const calls: string[] = []
    globalThis.fetch = (async (input: string | URL | Request) => {
        calls.push(String(input))
        return new Response(JSON.stringify(body), { status })
    }) as typeof fetch
    return calls
}

afterEach(() => {
    globalThis.fetch = realFetch
    if (realDeploymentId === undefined) delete process.env.VERCEL_DEPLOYMENT_ID
    else process.env.VERCEL_DEPLOYMENT_ID = realDeploymentId
})

test('returns the parsed body on 200', async () => {
    stubFetch(200, { GrantID: 'G1' })
    assert.deepEqual(await fetchRemoteJson('https://cdn.test/g.json'), { GrantID: 'G1' })
})

test('returns null for a missing object (404 or S3 403)', async () => {
    stubFetch(404)
    assert.equal(await fetchRemoteJson('https://cdn.test/g.json'), null)
    stubFetch(403)
    assert.equal(await fetchRemoteJson('https://cdn.test/g.json'), null)
})

test('throws on a server error rather than reporting the object missing', async () => {
    stubFetch(503)
    await assert.rejects(fetchRemoteJson('https://cdn.test/g.json'), /503/)
})

test('keys the request by deployment when VERCEL_DEPLOYMENT_ID is set', async () => {
    process.env.VERCEL_DEPLOYMENT_ID = 'dpl_abc'
    const calls = stubFetch(200)
    await fetchRemoteJson('https://cdn.test/g.json')
    assert.deepEqual(calls, ['https://cdn.test/g.json?v=dpl_abc'])
})

test('leaves the URL alone without a deployment ID', async () => {
    delete process.env.VERCEL_DEPLOYMENT_ID
    const calls = stubFetch(200)
    await fetchRemoteJson('https://cdn.test/g.json')
    assert.deepEqual(calls, ['https://cdn.test/g.json'])
})
