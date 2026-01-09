import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
    console.log("Starting MCP Server Verification...");

    // Note: The SDK's SSEClientTransport handles:
    // 1. Connecting to the GET endpoint
    // 2. Receiving the 'endpoint' event which tells it where to POST messages
    // 3. Using that POST URL for subsequent messages.

    const url = "http://localhost:3000/sse";
    console.log(`Connecting to ${url}...`);

    const transport = new SSEClientTransport(new URL(url));
    const client = new Client(
        {
            name: "Verification Client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    transport.onclose = () => {
        console.log("Transport closed.");
    };

    transport.onerror = (err) => {
        console.error("Transport error:", err);
    };

    try {
        await client.connect(transport);
        console.log("✅ Client connected!");

        const tools = await client.listTools();
        console.log("✅ Tools listed:", tools);

        process.exit(0);
    } catch (error) {
        console.error("❌ Connection failed:", error);
        process.exit(1);
    }
}

main();
