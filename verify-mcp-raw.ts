import http from 'http';

console.log("Starting Raw SSE Verification...");

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/sse',
    method: 'GET',
    headers: {
        'Accept': 'text/event-stream',
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');

    res.on('data', (chunk) => {
        console.log(`BODY chunk: ${chunk}`);
        // If we receive an 'endpoint' event, we know it works.
        if (chunk.includes('event: endpoint')) {
            console.log("✅ SUCCESS: Received 'endpoint' event from MCP Server!");
            process.exit(0);
        }
    });

    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.end();

// Timeout after 10 seconds
setTimeout(() => {
    console.error("❌ TIMEOUT: Did not receive expected event.");
    process.exit(1);
}, 10000);
