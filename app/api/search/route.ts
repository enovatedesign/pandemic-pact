import {Client} from '@elastic/elasticsearch'
import fs from 'fs'

export async function POST(request: Request) {
    if (typeof process.env.ELASTIC_PASSWORD === 'undefined') {
        return Response.json({
            error: 'Service Unavailable',
        }, {
            status: 503,
            statusText: 'Service Unavailable',
        })
    }

    const client = new Client({
        node: 'https://localhost:9200',
        auth: {
            username: 'elastic',
            password: process.env.ELASTIC_PASSWORD,
        },
        tls: {
            ca: fs.readFileSync('./elasticsearch_http_ca.crt'),
            rejectUnauthorized: false,
        },
    })

    const body = await request.json()

    const result = await client.search({
        index: 'grants',
        _source: [
            'GrantID',
            'GrantTitleEng',
            'Abstract',
        ],
        size: 20,
        body
    })

    return Response.json(result)
}
