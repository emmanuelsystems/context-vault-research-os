# Using Your Live Context Vault

Your system is fully deployed!
- **MCP Server**: `https://<your-project>.vercel.app/sse`
- **Dashboard**: `https://<your-project>.vercel.app/`

## How to Connect (Cursor / Claude)

To start using the Research OS to create runs, you need to connect an MCP Client.

### Option A: Cursor (Agent Mode)
1.  Go to **Cursor Settings** -> **MCP**.
2.  Add a new **SSE** server.
3.  **URL**: `https://<your-project>.vercel.app/sse`
4.  Once connected, you can ask Cursor:
    > "Initialize a research run for adopting Rust in our backend."

### Option B: Claude Desktop
1.  Open your `claude_desktop_config.json`.
2.  Add the server config:
    ```json
    "mcpServers": {
      "research-os": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/sdk", "client", "https://<your-project>.vercel.app/sse"]
      }
    }
    ```
    *(Note: Claude Desktop currently supports stdio better, so for remote SSE, you might need a local bridge, but Cursor supports SSE natively).*

## Verifying the Loop
1.  **Initialize**: Ask the Agent to `init_run`.
2.  **Check Dashboard**: Refresh your Vercel URL. You should see the new run appear immediately.
3.  **Bank**: Ask the Agent to `bank_run`.
4.  **Verify**: The status on the dashboard should change to `Banked`.
