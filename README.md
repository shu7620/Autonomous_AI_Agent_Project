# Autonomous AI Agent Project

A fully functional AI autonomous agent system that combines an intelligent agent backend with a conversational web interface. The system leverages Google's Gemini 2.5 Flash model to understand user prompts and execute JavaScript code for computations and data retrieval.

## Project Overview

This project consists of three main components:

1. **Agent Server** - The AI agent powered by LangChain and Google Generative AI
2. **Executor Service** - A sandboxed JavaScript code execution environment
3. **Web Client** - A modern React-based chat interface

The system enables users to interact with an AI agent through natural language, which can then execute JavaScript code, retrieve information, and perform computations autonomously.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                          │
│            (React Chat Interface - Port 5173)               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Agent Server                              │
│         (Express + LangChain - Port 3001)                   │
│    ┌──────────────────────────────────────────────────┐    │
│    │  Gemini 2.5 Flash Model                          │    │
│    │  Tools: JavaScript Executor, Weather (Demo)      │    │
│    │  Checkpoint: MemorySaver (Thread Management)     │    │
│    └──────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Executor Service                           │
│              (Express - Port 3000)                          │
│         Executes JavaScript Code & Captures Output         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
Autonomous_AI_Agent_Project/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── App.tsx                  # Main chat component
│   │   ├── App.css                  # Component styles
│   │   ├── index.css                # Global styles
│   │   └── main.tsx                 # React entry point
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.ts               # Vite configuration
│
├── server/
│   ├── agent/                       # AI Agent Service
│   │   ├── agent.js                 # Agent configuration and tools
│   │   ├── index.js                 # Agent API server
│   │   ├── package.json             # Agent dependencies
│   │   └── agent_env/               # Python virtual environment
│   │
│   └── executor/                    # Code Execution Service
│       ├── index.js                 # Executor API server
│       └── package.json             # Executor dependencies
│
├── README.md                        # Project documentation
└── steps.txt                        # Setup instructions
```

## Technology Stack

### Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.9.3
- **Styling**: CSS (dark theme)

### Backend - Agent Service

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.2.1
- **AI/ML Libraries**:
  - LangChain 1.1.5
  - LangGraph 1.0.4 (for agent orchestration)
  - Google Generative AI 2.0.4 (Gemini 2.5 Flash model)
- **Utilities**:
  - Zod 4.1.13 (schema validation)
  - Dotenv 17.2.3 (environment configuration)
- **Development**: Nodemon 3.1.11

### Backend - Executor Service

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.2.1
- **Middleware**: CORS 2.8.5
- **Development**: Nodemon 3.1.11

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Python 3.8+ (for virtual environment)

### Step-by-Step Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Autonomous_AI_Agent_Project
   ```

2. **Set up the Agent Service**

   ```bash
   cd server/agent
   npm install
   # Create .env file with your Google API key
   echo "EXECUTOR_URL=http://localhost:3000" > .env
   echo "GOOGLE_API_KEY=your_google_api_key" >> .env
   ```

3. **Set up the Executor Service**

   ```bash
   cd ../executor
   npm install
   ```

4. **Set up the Client**
   ```bash
   cd ../../client
   npm install
   # Optionally create .env.local to override API URL
   echo "VITE_API_URL=http://localhost:3001" > .env.local
   ```

## Running the Application

Run all services in separate terminals:

### Terminal 1 - Executor Service (Port 3000)

```bash
cd server/executor
npm run dev
# Output: Executor API listening on port 3000
```

### Terminal 2 - Agent Service (Port 3001)

```bash
cd server/agent
npm run dev
# Output: Agent API listening on port 3001
```

### Terminal 3 - Client (Port 5173)

```bash
cd client
npm run dev
# Output: VITE v7.2.4 ready in XXX ms → ➜ Local: http://localhost:5173/
```

Access the application at `http://localhost:5173`

## API Endpoints

### Agent Service (Port 3001)

#### **POST /generate**

Processes a user prompt and generates an AI response.

**Request Body:**

```json
{
  "prompt": "What is the result of 5 multiplied by 3?",
  "thread_id": 1
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | The user's input message to be processed by the AI agent |
| `thread_id` | number/string | Unique identifier for conversation thread (enables conversation history and context persistence) |

**Response:**

```json
{
  "content": "The result of 5 multiplied by 3 is 15",
  "type": "text"
}
```

**Status Codes:**

- `200 OK` - Successfully processed the prompt and generated a response
- `400 Bad Request` - Missing required parameters (prompt or thread_id)
- `500 Internal Server Error` - Server error during processing or external API failure

**Response Format:**
The response contains the last message from the agent in the conversation thread. The content can be either plain text or structured data depending on the agent's response.

**Example cURL:**

```bash
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is 5 * 3?", "thread_id": 1}'
```

**Example JavaScript (Fetch):**

```javascript
const response = await fetch("http://localhost:3001/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Tell me a joke",
    thread_id: 1,
  }),
});
const data = await response.json();
console.log(data); // Agent's response
```

**Flow Explanation:**

1. Client sends prompt and thread_id to `/generate`
2. Agent receives the prompt as a message
3. Agent analyzes if it needs to use any tools (JavaScript execution, etc.)
4. If tool usage is needed, agent calls the Executor Service
5. Agent processes tool results and generates final response
6. Final response is sent back to client

---

### Executor Service (Port 3000)

#### **POST /**

Executes JavaScript code in a sandboxed Node.js environment and captures all console output.

**Request Body:**

```json
{
  "code": "console.log('Hello World'); console.log(5 + 3);"
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | JavaScript code to execute in Node.js eval environment |

**Response:**

```json
{
  "stdout": "Hello World\n8\n",
  "stderr": ""
}
```

**Response Fields:**

- `stdout` (string) - All console.log outputs concatenated with newlines
- `stderr` (string) - All console.error outputs and error/exception messages

**Status Codes:**

- `200 OK` - Code executed successfully (even if errors occurred)
- `400 Bad Request` - Missing code parameter
- `500 Internal Server Error` - Server error during execution

**Execution Behavior:**

- Code is executed using Node.js `eval()` function
- Both stdout and stderr are captured and returned
- If code throws an error, the error message is captured in stderr
- The execution environment is isolated per request

**Example cURL:**

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"code": "console.log(5 + 3);"}'
```

**Example JavaScript:**

```javascript
const response = await fetch("http://localhost:3000", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: 'console.log("Result:", 2 * 3);',
  }),
});
const { stdout, stderr } = await response.json();
console.log("Output:", stdout);
console.log("Errors:", stderr);
```

**Common Use Cases:**

- Mathematical computations: `console.log(Math.sqrt(16));`
- Data transformation: `const arr = [1,2,3]; console.log(arr.map(x => x * 2));`
- String operations: `console.log("Hello".toUpperCase());`
- HTTP requests: `const fetch = require('node-fetch'); // fetch data`
- Array/Object manipulation: `JSON.stringify({key: 'value'})`

**Limitations & Security Notes:**

- ⚠️ No file system access restrictions in current implementation
- ⚠️ No timeout enforcement (long-running code can hang)
- ⚠️ No memory limits
- ⚠️ Global eval() is used without VM isolation
- Production deployments should implement proper sandboxing

---

## Agent Capabilities

The AI agent is configured with the following tools:

### 1. **run_javascript_code_tool** (Active)

Executes arbitrary JavaScript code through the Executor Service.

- **Name**: `run_javascript_code_tool`
- **Description**: Run general purpose JavaScript code for computations, API calls, or data retrieval
- **Status**: ✅ Active and available
- **Use Cases**:
  - Mathematical operations
  - Data processing and transformation
  - HTTP requests via node-fetch
  - String and array operations
- **Parameters**:
  - `code` (string): JavaScript code to execute
- **Returns**: Object with `stdout` and `stderr` fields

**Example Agent Usage:**

```
User: "Calculate the factorial of 5"
Agent uses: run_javascript_code_tool with code = "function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); } console.log(factorial(5));"
Result: stdout = "120"
```

### 2. **Weather Tool** (Active but Demo)

Simulated weather retrieval tool.

- **Name**: `Weather`
- **Description**: Get weather information for a given location
- **Status**: ✅ Active
- **Use Cases**: Weather queries
- **Parameters**:
  - `query` (string): Location name
- **Returns**: Fixed demo response ("The Weather of [location] is Sunny")

**Note**: This is a demo tool that always returns "Sunny" as a placeholder.

### 3. **Multiply Tool** (Disabled)

Mathematical tool for number multiplication.

- **Name**: `Multiply`
- **Description**: Multiply two numbers together
- **Status**: ❌ Disabled (defined but not in active tools list)
- **Parameters**:
  - `a` (number): First number
  - `b` (number): Second number
- **Returns**: Multiplication result

**To Enable**: Edit `server/agent/agent.js` and add `multiplytool` to the tools array:

```javascript
export const agent = createAgent({
  model: model,
  tools: [weathertool, multiplytool, jsExecutor], // Add multiplytool here
  checkpoint,
});
```

## Environment Variables

### Agent Service (.env)

**Location**: `server/agent/.env`

```env
# Google API Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Executor Service Configuration
EXECUTOR_URL=http://localhost:3000
```

**How to get GOOGLE_API_KEY**:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into the .env file

### Client (.env.local - Optional)

**Location**: `client/.env.local`

```env
# Override the default agent API URL
VITE_API_URL=http://localhost:3001
```

**Default**: If not set, defaults to `http://localhost:3001`

## Features

✅ **Real-time Chat Interface**

- Clean, modern dark-themed UI
- Automatic scrolling to latest messages
- Real-time loading indicators during processing
- Comprehensive error handling with user-friendly messages
- Responsive design for various screen sizes

✅ **Thread Management**

- Conversation history tracked via thread_id
- Ability to start new conversations
- Persistent context within threads using LangGraph checkpoints
- Each thread maintains separate conversation state

✅ **Code Execution**

- Sandboxed JavaScript execution via dedicated service
- Comprehensive output and error capture
- Supports complex computations and API calls
- Isolated execution per request

✅ **AI-Powered Agent**

- Powered by Google Gemini 2.5 Flash model
- Multi-tool capability and intelligent tool selection
- Conversation memory via LangGraph
- Automatic tool invocation based on user needs

## Usage Examples

### Example 1: Mathematical Calculation

```
User: What is 25 multiplied by 4?
AI Agent: Analyzing your request... [uses run_javascript_code_tool]
Result: The result of multiplication is 100
```

### Example 2: Code Execution

```
User: Execute this JavaScript code: const arr = [1,2,3]; console.log(arr.reduce((a,b) => a+b, 0));
AI Agent: [Executes code]
Result: 6
```

### Example 3: Data Transformation

```
User: Sort this array in descending order: [3, 1, 4, 1, 5, 9, 2, 6]
AI Agent: [Executes JS code]
Result: [9, 6, 5, 4, 3, 2, 1, 1]
```

### Example 4: String Operations

```
User: Reverse the string "Hello World"
AI Agent: [Executes code]
Result: "dlroW olleH"
```

## Security Considerations

⚠️ **CRITICAL FOR PRODUCTION**: This project uses unrestricted code execution via `eval()`. The following security measures should be implemented before production deployment:

### Current Vulnerabilities:

1. **Unrestricted Code Execution** - `eval()` can access full Node.js environment
2. **No Authentication** - Any request can access the API
3. **CORS Wildcard** - Allows requests from any origin
4. **No Rate Limiting** - No protection against abuse
5. **No Timeouts** - Long-running code can hang the service
6. **No Resource Limits** - Unbounded memory and CPU usage

### Recommended Security Measures:

1. **Input Validation**

   ```javascript
   // Validate and sanitize all user inputs
   const prompt = sanitize(req.body.prompt);
   ```

2. **Rate Limiting**

   ```bash
   npm install express-rate-limit
   // Apply to all endpoints
   ```

3. **CORS Configuration**

   ```javascript
   // Instead of: cors({ origin: "*" })
   cors({ origin: ["http://localhost:5173", "https://yourdomain.com"] });
   ```

4. **Sandboxing Code Execution**

   ```bash
   npm install vm2  // or isolated-vm
   // Use VM instead of eval()
   ```

5. **Authentication & Authorization**

   ```bash
   npm install jsonwebtoken
   // Add JWT-based auth middleware
   ```

6. **Resource Limits**

   - Timeout: `setTimeout()` with code interruption
   - Memory limits: Use VM options
   - CPU limits: External rate limiters

7. **Logging & Monitoring**

   ```javascript
   // Log all API calls for audit trail
   logger.info(`API call: ${endpoint} from ${ip}`);
   ```

8. **HTTPS Only**
   - Deploy with TLS certificates
   - Redirect HTTP to HTTPS

## Development

### Running with Hot Reload

All services use Nodemon for automatic restart on file changes:

```bash
npm run dev
```

The following files are watched:

- `.js` files in agent and executor
- `.tsx`, `.ts`, `.css` files in client

### Building for Production

Client build:

```bash
cd client
npm run build
# Output: dist/ folder with optimized production build
```

### Linting

Frontend linting:

```bash
cd client
npm run lint
# Checks for ESLint violations
```

### Environment Setup

Ensure all required environment variables are set:

```bash
# Agent service
echo "GOOGLE_API_KEY=..." > server/agent/.env
echo "EXECUTOR_URL=http://localhost:3000" >> server/agent/.env

# Client (optional)
echo "VITE_API_URL=http://localhost:3001" > client/.env.local
```

## Troubleshooting

### Port Already in Use

If a port is already in use, you can modify the port in:

- `server/agent/index.js` - Change `const port = 3001`
- `server/executor/index.js` - Change `const port = 3000`
- Update corresponding URLs in client configuration and `.env` files

### CORS Errors

Ensure the agent service CORS is configured correctly:

```javascript
// In server/agent/index.js
app.use(cors({ origin: "http://localhost:5173" })); // Specific origin
```

Update client to use the correct API URL:

```javascript
// In client/.env.local
VITE_API_URL=http://localhost:3001
```

### Google API Key Issues

1. Verify your `GOOGLE_API_KEY` is valid
2. Ensure API has permissions for Gemini models
3. Check quota limits in Google Cloud Console
4. Verify `.env` file is in `server/agent/` directory
5. Restart agent service after updating `.env`

### Executor Service Not Responding

1. Verify Executor Service is running on port 3000
2. Check `EXECUTOR_URL` in `server/agent/.env`
3. Test executor endpoint: `curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"code": "console.log(1)"}'`
4. Check for port conflicts

### Agent Service Not Connecting to Executor

1. Ensure Executor Service is running first
2. Verify network connectivity between services
3. Check firewall rules
4. Confirm `EXECUTOR_URL` is accessible from agent service

### Chat Not Responding

1. Check browser console for errors
2. Verify all three services are running
3. Check network tab in DevTools
4. Ensure `GOOGLE_API_KEY` is valid
5. Check server logs for errors

## Future Enhancements

- [ ] Add database integration for persistent conversation history
- [ ] Implement user authentication (JWT-based)
- [ ] Add more specialized tools (web scraping, file operations, database queries)
- [ ] Implement conversation search/filtering
- [ ] Add voice input/output capabilities (Web Speech API)
- [ ] Deploy to cloud platforms (Vercel, Railway, Render)
- [ ] Add rate limiting and usage tracking
- [ ] Implement proper code execution sandboxing (VM2)
- [ ] Add conversation export (PDF, JSON, etc.)
- [ ] Implement multi-user support with user profiles
- [ ] Add dark/light theme toggle
- [ ] Integrate with more LLM providers
- [ ] Add image generation capabilities
- [ ] Implement function calling for predefined APIs

## Performance Optimization

### Current Approach:

- Uses Gemini 2.5 Flash for fast inference
- Streaming responses for immediate feedback
- Efficient message history management

### Potential Improvements:

- Cache frequently used computations
- Implement message compression
- Use WebSockets for real-time updates
- Add pagination for long conversations
- Implement lazy loading of older messages

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Contact & Support

For issues or questions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and reproduction steps
4. Mention your OS and Node.js version
