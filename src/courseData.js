const courseCatalog = {
  "ai-agents": {
    id: "ai-agents",
    title: "AI Agent Expert Masterclass",
    shortDescription: "Build production-ready AI agents that reason, use tools, and complete complex tasks autonomously.",
    price: "$197",
    priceCents: 19700,
    highlights: [
      "Build autonomous AI agents from scratch",
      "Master tool use and API integration",
      "Deploy production-ready agent systems",
    ],
    modules: [
      {
        id: 'module-1',
        title: 'Foundations of AI Agents',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'What Are AI Agents?',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Understanding AI Agents</h2>
<p>AI agents are autonomous systems that can perceive their environment, make decisions, and take actions to achieve specific goals. Unlike simple chatbots that respond to prompts, agents can:</p>
<ul>
  <li>Break complex tasks into smaller steps</li>
  <li>Use external tools (APIs, databases, web search)</li>
  <li>Maintain context across multiple interactions</li>
  <li>Self-correct when they encounter errors</li>
</ul>

<h3>Key Components of an Agent</h3>
<p>Every AI agent consists of these core building blocks:</p>

<pre><code>// Conceptual agent architecture
const agent = {
  llm: "The reasoning engine (GPT-4, Claude, etc.)",
  tools: ["web_search", "code_execution", "file_read"],
  memory: "Conversation history + retrieved context",
  planner: "Breaks goals into actionable steps",
  executor: "Runs tools and processes results"
};</code></pre>

<p>In this course, you'll build agents that combine all of these components into production-ready systems.</p>
            `,
          },
          {
            id: 'lesson-1-2',
            title: 'Setting Up Your Development Environment',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Environment Setup</h2>
<p>Before building AI agents, you need the right tools installed. Here's what we'll use throughout the course:</p>

<h3>Required Software</h3>
<ul>
  <li><strong>Node.js 18+</strong> — Our primary runtime</li>
  <li><strong>Python 3.10+</strong> — For certain AI libraries</li>
  <li><strong>Git</strong> — Version control</li>
  <li><strong>VS Code</strong> — Recommended editor</li>
</ul>

<h3>API Keys You'll Need</h3>
<p>Sign up for accounts and obtain API keys from:</p>
<ul>
  <li>OpenAI (GPT-4 access)</li>
  <li>Anthropic (Claude access)</li>
</ul>

<h3>Project Initialization</h3>
<pre><code>mkdir ai-agent-project
cd ai-agent-project
npm init -y
npm install openai @anthropic-ai/sdk dotenv</code></pre>

<p>Create a <code>.env</code> file for your API keys:</p>
<pre><code>OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...</code></pre>

<p>Never commit your <code>.env</code> file to version control. Add it to <code>.gitignore</code> immediately.</p>
            `,
          },
          {
            id: 'lesson-1-3',
            title: 'Your First AI Agent',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Building a Simple Agent</h2>
<p>Let's build a basic agent that can answer questions and use a tool. This introduces the core loop every agent follows:</p>
<ol>
  <li>Receive a task</li>
  <li>Decide which tool to use (or respond directly)</li>
  <li>Execute the tool</li>
  <li>Process the result</li>
  <li>Repeat or return the final answer</li>
</ol>

<pre><code>import OpenAI from 'openai';

const openai = new OpenAI();

const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" }
        },
        required: ["city"]
      }
    }
  }
];

async function runAgent(userMessage) {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: userMessage }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    tools,
  });

  // Check if the model wants to call a tool
  const choice = response.choices[0];
  if (choice.finish_reason === "tool_calls") {
    // Execute tool and continue the loop
    console.log("Agent is using a tool...");
  }

  return choice.message.content;
}</code></pre>

<p>In the next lesson, we'll expand this into a multi-tool agent with memory.</p>
            `,
          },
        ],
      },
      {
        id: 'module-2',
        title: 'Tool Use & API Integration',
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Designing Tool Schemas',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Tool Design Principles</h2>
<p>The quality of your agent depends heavily on how well you design your tools. A well-designed tool schema helps the LLM understand when and how to use each tool.</p>

<h3>Best Practices</h3>
<ul>
  <li><strong>Clear names:</strong> Use descriptive, action-oriented names like <code>search_documents</code> instead of <code>search</code></li>
  <li><strong>Detailed descriptions:</strong> Explain when the tool should be used and what it returns</li>
  <li><strong>Minimal parameters:</strong> Only require what's necessary; use sensible defaults</li>
  <li><strong>Typed parameters:</strong> Use proper JSON Schema types with constraints</li>
</ul>

<h3>Example: A Well-Designed Tool</h3>
<pre><code>{
  "name": "search_knowledge_base",
  "description": "Search the company knowledge base for relevant articles. Use this when the user asks about company policies, procedures, or product information.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query in natural language"
      },
      "max_results": {
        "type": "integer",
        "description": "Maximum number of results to return",
        "default": 5
      },
      "category": {
        "type": "string",
        "enum": ["policy", "product", "technical", "general"],
        "description": "Filter results by category"
      }
    },
    "required": ["query"]
  }
}</code></pre>
            `,
          },
          {
            id: 'lesson-2-2',
            title: 'Connecting External APIs',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>API Integration Patterns</h2>
<p>Real-world agents need to interact with external services. This lesson covers patterns for reliable API integration.</p>

<h3>The Tool Executor Pattern</h3>
<pre><code>class ToolExecutor {
  constructor() {
    this.tools = new Map();
  }

  register(name, handler) {
    this.tools.set(name, handler);
  }

  async execute(name, args) {
    const handler = this.tools.get(name);
    if (!handler) throw new Error(\`Unknown tool: \${name}\`);

    try {
      const result = await handler(args);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Usage
const executor = new ToolExecutor();

executor.register('search_web', async ({ query }) => {
  const response = await fetch(
    \`https://api.search.com?q=\${encodeURIComponent(query)}\`
  );
  return response.json();
});

executor.register('send_email', async ({ to, subject, body }) => {
  // Email API integration
  return { sent: true, to };
});</code></pre>

<p>This pattern keeps your tool implementations clean and testable, separate from your agent logic.</p>
            `,
          },
        ],
      },
      {
        id: 'module-3',
        title: 'Production Deployment',
        lessons: [
          {
            id: 'lesson-3-1',
            title: 'Error Handling & Retry Logic',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Building Resilient Agents</h2>
<p>Production agents must handle failures gracefully. API calls fail, rate limits hit, and unexpected inputs arrive. Here's how to handle them.</p>

<h3>Retry with Exponential Backoff</h3>
<pre><code>async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = Math.pow(2, attempt) * 1000;
      console.log(\`Attempt \${attempt + 1} failed, retrying in \${delay}ms\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Usage in your agent
const response = await withRetry(() =>
  openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    tools,
  })
);</code></pre>

<h3>Graceful Degradation</h3>
<p>When a tool fails, your agent should:</p>
<ol>
  <li>Report the error to the user clearly</li>
  <li>Attempt alternative approaches if available</li>
  <li>Never silently swallow errors</li>
  <li>Log failures for debugging</li>
</ol>
            `,
          },
          {
            id: 'lesson-3-2',
            title: 'Monitoring & Observability',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Monitoring Your Agents</h2>
<p>You can't improve what you can't measure. Instrument your agents to track performance, costs, and quality.</p>

<h3>Key Metrics to Track</h3>
<ul>
  <li><strong>Latency:</strong> Time from request to final response</li>
  <li><strong>Token usage:</strong> Input and output tokens per request</li>
  <li><strong>Tool call frequency:</strong> Which tools are used most</li>
  <li><strong>Error rate:</strong> Failures by type and tool</li>
  <li><strong>Cost per request:</strong> Total API costs</li>
</ul>

<h3>Simple Logging Middleware</h3>
<pre><code>function createAgentLogger() {
  const logs = [];

  return {
    logStep(step) {
      logs.push({
        ...step,
        timestamp: Date.now(),
      });
    },

    getSummary() {
      return {
        totalSteps: logs.length,
        toolCalls: logs.filter(l => l.type === 'tool_call').length,
        totalTokens: logs.reduce((sum, l) => sum + (l.tokens || 0), 0),
        duration: logs.length > 1
          ? logs[logs.length - 1].timestamp - logs[0].timestamp
          : 0,
      };
    },

    getLogs() { return [...logs]; }
  };
}</code></pre>
            `,
          },
          {
            id: 'lesson-3-3',
            title: 'Deploying to Production',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Deployment Strategies</h2>
<p>Taking your agent from development to production involves several considerations.</p>

<h3>Environment Configuration</h3>
<pre><code>// config.js
const config = {
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  rateLimitRPM: parseInt(process.env.RATE_LIMIT_RPM || '60'),
};

export default config;</code></pre>

<h3>Deployment Checklist</h3>
<ul>
  <li>All API keys stored in environment variables (never in code)</li>
  <li>Rate limiting configured for both incoming requests and outgoing API calls</li>
  <li>Error monitoring set up (e.g., Sentry, Datadog)</li>
  <li>Logging structured and centralized</li>
  <li>Health check endpoint available</li>
  <li>Graceful shutdown handling</li>
  <li>Cost alerts configured on AI API dashboards</li>
</ul>

<p>Congratulations! You now have the knowledge to build, deploy, and maintain production AI agents. Keep building and experimenting!</p>
            `,
          },
        ],
      },
    ],
  },

  "prompt-engineering": {
    id: "prompt-engineering",
    title: "Prompt Engineering Masterclass",
    shortDescription: "Learn to write effective prompts that get consistent, high-quality results from any AI model.",
    price: "$97",
    priceCents: 9700,
    highlights: [
      "Master chain-of-thought and few-shot techniques",
      "Build reusable prompt templates",
      "Systematic prompt iteration and testing",
    ],
    modules: [
      {
        id: 'pe-module-1',
        title: 'Prompt Fundamentals',
        lessons: [
          {
            id: 'pe-lesson-1-1',
            title: 'Anatomy of a Great Prompt',
            type: 'text',
            videoUrl: '',
            content: `
<h2>What Makes a Prompt Effective?</h2>
<p>A well-crafted prompt has four key elements that guide the AI toward the output you want:</p>
<ul>
  <li><strong>Role:</strong> Who the AI should act as (e.g., "You are a senior copywriter")</li>
  <li><strong>Context:</strong> Background information the AI needs to know</li>
  <li><strong>Task:</strong> A clear, specific instruction of what to do</li>
  <li><strong>Format:</strong> How the output should be structured</li>
</ul>

<h3>Basic vs. Engineered Prompt</h3>
<pre><code>// Basic (vague)
"Write about dogs."

// Engineered (specific)
"You are a veterinary science writer. Write a 200-word
paragraph explaining why dogs need regular dental care.
Use simple language suitable for pet owners. Include
one surprising statistic."</code></pre>

<p>The engineered prompt constrains the output in useful ways: length, audience, tone, and content requirements are all specified.</p>

<h3>The Clarity Principle</h3>
<p>If a human would ask a clarifying question after reading your prompt, the AI will have to guess. Remove ambiguity by being explicit about every dimension of the expected output.</p>
            `,
          },
          {
            id: 'pe-lesson-1-2',
            title: 'System Prompts & Role Setting',
            type: 'text',
            videoUrl: '',
            content: `
<h2>System Prompts</h2>
<p>System prompts set the persistent context for an entire conversation. They define the AI's identity, capabilities, constraints, and default behavior.</p>

<h3>Effective System Prompt Structure</h3>
<pre><code>const systemPrompt = \`You are a senior financial analyst
at a Fortune 500 company.

## Your expertise
- Quarterly earnings analysis
- Market trend forecasting
- Risk assessment

## Rules
- Always cite data sources
- Present numbers in tables when comparing 3+ items
- Flag any assumptions you make
- Never provide specific investment advice

## Tone
Professional but accessible. Avoid jargon
unless the user demonstrates expertise.\`;</code></pre>

<h3>Common Mistakes</h3>
<ul>
  <li><strong>Too vague:</strong> "Be helpful" — doesn't constrain behavior</li>
  <li><strong>Contradictory rules:</strong> "Be concise" + "Explain thoroughly"</li>
  <li><strong>No boundary setting:</strong> Failing to specify what the AI should <em>not</em> do</li>
</ul>

<p>A strong system prompt is the foundation of every reliable AI application. Invest time in getting it right before optimizing individual user prompts.</p>
            `,
          },
          {
            id: 'pe-lesson-1-3',
            title: 'Temperature & Model Parameters',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Controlling Output with Parameters</h2>
<p>Beyond the prompt text itself, model parameters significantly affect output quality and consistency.</p>

<h3>Temperature</h3>
<p>Temperature controls randomness in the output:</p>
<ul>
  <li><strong>0.0:</strong> Deterministic — best for factual tasks, code generation, data extraction</li>
  <li><strong>0.3–0.7:</strong> Balanced — good for most tasks, professional writing</li>
  <li><strong>0.8–1.0:</strong> Creative — brainstorming, fiction, diverse suggestions</li>
</ul>

<pre><code>// Factual extraction — low temperature
const response = await openai.chat.completions.create({
  model: "gpt-4",
  temperature: 0,
  messages: [{ role: "user",
    content: "Extract the date, amount, and vendor from this receipt..." }]
});

// Creative brainstorming — high temperature
const ideas = await openai.chat.completions.create({
  model: "gpt-4",
  temperature: 0.9,
  messages: [{ role: "user",
    content: "Generate 10 unique product name ideas for..." }]
});</code></pre>

<h3>Max Tokens</h3>
<p>Set <code>max_tokens</code> to control response length. Shorter limits force conciseness; longer limits allow detailed responses. Always set this explicitly to avoid unexpectedly long (and expensive) outputs.</p>
            `,
          },
        ],
      },
      {
        id: 'pe-module-2',
        title: 'Advanced Techniques',
        lessons: [
          {
            id: 'pe-lesson-2-1',
            title: 'Chain-of-Thought Prompting',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Thinking Step by Step</h2>
<p>Chain-of-thought (CoT) prompting dramatically improves reasoning by asking the AI to show its work. This technique is especially powerful for math, logic, and multi-step analysis.</p>

<h3>Zero-Shot CoT</h3>
<p>Simply add "Think step by step" or "Let's work through this" to your prompt:</p>
<pre><code>"A store has 45 apples. They sell 60% on Monday and
half of the remainder on Tuesday. How many are left?
Think step by step."

// AI response:
// Step 1: Monday sales = 45 × 0.6 = 27 apples sold
// Step 2: Remaining after Monday = 45 - 27 = 18
// Step 3: Tuesday sales = 18 / 2 = 9 apples sold
// Step 4: Remaining = 18 - 9 = 9 apples</code></pre>

<h3>Structured CoT</h3>
<p>For complex tasks, define the reasoning steps explicitly:</p>
<pre><code>"Analyze this business proposal. Follow these steps:
1. Identify the core value proposition
2. List the top 3 risks
3. Estimate the market size
4. Assess competitive advantage
5. Give a final recommendation with confidence level"</code></pre>

<p>Structured CoT gives you predictable, auditable outputs that are easy to validate.</p>
            `,
          },
          {
            id: 'pe-lesson-2-2',
            title: 'Few-Shot Prompting',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Teaching by Example</h2>
<p>Few-shot prompting provides examples of the desired input-output pattern. The AI learns the pattern and applies it to new inputs.</p>

<h3>Basic Few-Shot Pattern</h3>
<pre><code>const prompt = \`Classify the sentiment of each review.

Review: "The food was amazing and the service was fast!"
Sentiment: Positive

Review: "Waited 45 minutes and the order was wrong."
Sentiment: Negative

Review: "It was okay, nothing special but not bad."
Sentiment: Neutral

Review: "Absolutely loved the dessert but the main course was bland."
Sentiment:\`

// AI completes: "Mixed"</code></pre>

<h3>Best Practices</h3>
<ul>
  <li><strong>Use 2–5 examples</strong> — enough to establish the pattern, not so many that you waste tokens</li>
  <li><strong>Cover edge cases</strong> — include at least one tricky example</li>
  <li><strong>Keep format consistent</strong> — identical structure across all examples</li>
  <li><strong>Order matters</strong> — put the most representative examples first</li>
</ul>

<p>Few-shot is one of the most reliable techniques. When in doubt, add examples rather than adding more instructions.</p>
            `,
          },
        ],
      },
      {
        id: 'pe-module-3',
        title: 'Templates & Iteration',
        lessons: [
          {
            id: 'pe-lesson-3-1',
            title: 'Building Reusable Prompt Templates',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Prompt Templates</h2>
<p>Production AI applications don't use hardcoded prompts — they use templates with variables that get filled in at runtime.</p>

<h3>Template Pattern</h3>
<pre><code>function buildAnalysisPrompt({ document, audience, focusAreas }) {
  return \`You are a document analyst specializing in
\${focusAreas.join(", ")}.

Analyze the following document for an audience of
\${audience}.

## Document
\${document}

## Required Output
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points)
3. Recommendations (numbered list)
4. Risk Factors (if any)

Format your response in markdown.\`;
}

// Usage
const prompt = buildAnalysisPrompt({
  document: contractText,
  audience: "non-technical executives",
  focusAreas: ["legal risk", "financial terms"],
});</code></pre>

<h3>Template Library Benefits</h3>
<ul>
  <li>Consistent output quality across your application</li>
  <li>Easy to test and iterate on prompts independently</li>
  <li>Version control for prompt changes</li>
  <li>Reusable across different parts of your app</li>
</ul>
            `,
          },
          {
            id: 'pe-lesson-3-2',
            title: 'Systematic Prompt Iteration',
            type: 'text',
            videoUrl: '',
            content: `
<h2>The Iteration Loop</h2>
<p>Great prompts aren't written — they're refined. Use a systematic process to improve your prompts over time.</p>

<h3>The 4-Step Iteration Process</h3>
<ol>
  <li><strong>Baseline:</strong> Write your initial prompt and run it on 10+ test inputs</li>
  <li><strong>Evaluate:</strong> Score each output on accuracy, format, and completeness</li>
  <li><strong>Diagnose:</strong> Identify the most common failure pattern</li>
  <li><strong>Fix:</strong> Make one targeted change to address that pattern</li>
</ol>

<h3>Evaluation Rubric Example</h3>
<pre><code>// Score each output 1-5 on these dimensions:
const rubric = {
  accuracy: "Are the facts correct?",
  relevance: "Does it answer what was asked?",
  format: "Does it follow the requested structure?",
  completeness: "Are all required sections present?",
  tone: "Is the language appropriate for the audience?",
};

// Track scores across iterations
// Iteration 1: avg 3.2
// Iteration 2: avg 3.8 (added examples)
// Iteration 3: avg 4.3 (refined constraints)</code></pre>

<p>Keep a log of what you changed and why. Prompt engineering is empirical — data beats intuition.</p>
            `,
          },
        ],
      },
    ],
  },

  "steering-ai": {
    id: "steering-ai",
    title: "Steering AI Behavior",
    shortDescription: "Master techniques to control, constrain, and direct AI outputs for reliable real-world applications.",
    price: "$147",
    priceCents: 14700,
    highlights: [
      "Custom instructions for consistent behavior",
      "Devil's advocate and source citation techniques",
      "Combine steering methods for production use",
    ],
    modules: [
      {
        id: 'sa-module-1',
        title: 'Custom Instructions & Constraints',
        lessons: [
          {
            id: 'sa-lesson-1-1',
            title: 'Writing Custom Instructions',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Custom Instructions</h2>
<p>Custom instructions are persistent rules that shape every response the AI generates. They're the most powerful tool for getting consistent, predictable behavior.</p>

<h3>Instruction Categories</h3>
<ul>
  <li><strong>Identity:</strong> Who the AI is and what it knows</li>
  <li><strong>Behavior:</strong> How it should respond (tone, length, format)</li>
  <li><strong>Boundaries:</strong> What it should never do</li>
  <li><strong>Preferences:</strong> Default choices when the user doesn't specify</li>
</ul>

<h3>Example: Customer Support Bot</h3>
<pre><code>const customInstructions = \`
## Identity
You are a support agent for Acme Software.
You have access to our knowledge base and FAQs.

## Behavior
- Always greet the customer by name if provided
- Keep responses under 150 words unless asked to elaborate
- Use numbered steps for any how-to instructions
- End every response with "Is there anything else I can help with?"

## Boundaries
- Never discuss competitor products
- Never share internal pricing or roadmap
- If unsure, say "Let me connect you with a specialist"
- Never make up features that don't exist

## Preferences
- Default language: English
- Default tone: Friendly but professional
- When multiple solutions exist, suggest the simplest first
\`;</code></pre>

<p>Notice how each section serves a specific purpose. This structure makes instructions easy to maintain and debug.</p>
            `,
          },
          {
            id: 'sa-lesson-1-2',
            title: 'Output Format Control',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Controlling Output Format</h2>
<p>One of the most practical steering techniques is controlling exactly how the AI formats its responses.</p>

<h3>JSON Mode</h3>
<pre><code>const response = await openai.chat.completions.create({
  model: "gpt-4",
  response_format: { type: "json_object" },
  messages: [{
    role: "user",
    content: \`Extract contact info from this text and return JSON:
    {
      "name": string,
      "email": string | null,
      "phone": string | null,
      "company": string | null
    }

    Text: "Hi, I'm Sarah Chen from Acme Corp.
    Reach me at sarah@acme.com or 555-0123."\`
  }]
});</code></pre>

<h3>Structured Output Templates</h3>
<p>Define exact output shapes to get machine-parseable results:</p>
<pre><code>"Respond using EXACTLY this format, no extra text:

CATEGORY: [one of: bug, feature, question]
PRIORITY: [one of: low, medium, high, critical]
SUMMARY: [one sentence]
NEXT_STEPS: [numbered list, max 3 items]"</code></pre>

<p>Format control is essential for any AI feature that feeds into downstream code. Unstructured output causes parsing failures.</p>
            `,
          },
          {
            id: 'sa-lesson-1-3',
            title: 'Prompt Insight Feedback Loops',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Feedback Loops for Self-Improvement</h2>
<p>A prompt insight feedback loop asks the AI to evaluate its own output and suggest improvements. This technique catches errors before they reach the user.</p>

<h3>The Reflection Pattern</h3>
<pre><code>// Step 1: Generate initial response
const draft = await generate("Write a product description for...");

// Step 2: Ask the AI to critique its own work
const critique = await generate(\`
Review this product description for:
1. Factual accuracy
2. Persuasiveness
3. Grammar and clarity
4. Missing information

Description:
\${draft}

List specific issues and suggestions.\`);

// Step 3: Revise based on critique
const final = await generate(\`
Revise this product description based on the feedback:

Original: \${draft}
Feedback: \${critique}

Write an improved version.\`);</code></pre>

<h3>When to Use Feedback Loops</h3>
<ul>
  <li>High-stakes content (legal, medical, financial)</li>
  <li>Long-form writing where quality matters</li>
  <li>Outputs that will be published without human review</li>
</ul>

<p>Feedback loops increase token usage but significantly improve output quality. Use them where the cost is justified.</p>
            `,
          },
        ],
      },
      {
        id: 'sa-module-2',
        title: 'Critical Thinking Techniques',
        lessons: [
          {
            id: 'sa-lesson-2-1',
            title: "Devil's Advocate Prompting",
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Challenging AI Assumptions</h2>
<p>Devil's advocate prompting forces the AI to argue against its own conclusions. This surfaces weaknesses, biases, and blind spots in AI-generated analysis.</p>

<h3>The Technique</h3>
<pre><code>// Step 1: Get the initial analysis
const analysis = await generate(
  "Analyze whether Company X should expand into the European market."
);

// Step 2: Force the opposing view
const counterArgument = await generate(\`
You previously argued:
\${analysis}

Now argue the OPPOSITE position as strongly as possible.
Find every weakness, risk, and counter-example.
Be specific and cite realistic scenarios.\`);

// Step 3: Synthesize both views
const balanced = await generate(\`
Given these two perspectives:

FOR: \${analysis}
AGAINST: \${counterArgument}

Write a balanced recommendation that acknowledges
both sides. Assign a confidence level (low/medium/high)
to your final recommendation.\`);</code></pre>

<h3>Why This Works</h3>
<p>AI models have a tendency toward agreement and positive framing. Devil's advocate prompting counteracts this bias by explicitly requesting critical analysis.</p>
            `,
          },
          {
            id: 'sa-lesson-2-2',
            title: 'Source Citation Enforcement',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Making AI Cite Its Sources</h2>
<p>One of the biggest risks with AI is fabricated information presented as fact. Source citation enforcement reduces this risk by requiring the AI to ground every claim.</p>

<h3>Citation Prompt Pattern</h3>
<pre><code>const prompt = \`Answer the following question using ONLY
the provided sources. For every factual claim, include
a citation in [brackets] referencing the source number.

If the sources don't contain enough information to
answer fully, explicitly state what's missing rather
than guessing.

## Sources
[1] \${source1}
[2] \${source2}
[3] \${source3}

## Question
\${userQuestion}

## Rules
- Every factual statement must have a [citation]
- Use "According to [N]..." for direct references
- If sources conflict, note the disagreement
- End with a confidence score: HIGH (all claims sourced),
  MEDIUM (some inferred), LOW (significant gaps)\`;</code></pre>

<h3>Verification Checklist</h3>
<ul>
  <li>Does every claim have a citation?</li>
  <li>Do the citations actually match the source content?</li>
  <li>Are any claims made without sources?</li>
  <li>Does the confidence score seem accurate?</li>
</ul>

<p>Citation enforcement is essential for research tools, content creation, and any application where factual accuracy matters.</p>
            `,
          },
        ],
      },
      {
        id: 'sa-module-3',
        title: 'Combining Steering Techniques',
        lessons: [
          {
            id: 'sa-lesson-3-1',
            title: 'Building a Steering Stack',
            type: 'mixed',
            videoUrl: '',
            content: `
<h2>Layering Techniques for Production</h2>
<p>Real-world AI applications rarely use a single steering technique. Instead, they combine multiple methods into a "steering stack" that ensures consistent, high-quality output.</p>

<h3>The Steering Stack</h3>
<pre><code>async function steerededQuery({ userInput, context }) {
  // Layer 1: System prompt (identity + rules)
  const systemPrompt = buildSystemPrompt();

  // Layer 2: Context injection (RAG / source docs)
  const relevantDocs = await retrieveDocuments(userInput);

  // Layer 3: Few-shot examples
  const examples = selectExamples(userInput);

  // Layer 4: Structured output format
  const formatInstructions = getOutputFormat();

  // Layer 5: Chain-of-thought
  const cotInstruction = "Think step by step before answering.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...examples,
    { role: "user", content: \`
      Context: \${relevantDocs}
      Question: \${userInput}
      \${formatInstructions}
      \${cotInstruction}
    \` }
  ];

  // Layer 6: Post-processing validation
  const response = await generate(messages);
  return validateAndClean(response);
}</code></pre>

<p>Each layer addresses a different aspect of output quality. Together, they create a robust system that handles edge cases gracefully.</p>
            `,
          },
          {
            id: 'sa-lesson-3-2',
            title: 'Real-World Steering Patterns',
            type: 'text',
            videoUrl: '',
            content: `
<h2>Production Steering Patterns</h2>
<p>Let's look at how top AI applications combine steering techniques to solve real problems.</p>

<h3>Pattern: Content Moderation Pipeline</h3>
<pre><code>async function moderateContent(userContent) {
  // Stage 1: Classification
  const classification = await generate(\`
    Classify this content:
    Categories: safe, needs_review, block
    Respond with JSON: { "category": "...", "reason": "..." }
    Content: \${userContent}
  \`);

  if (classification.category === "block") {
    return { allowed: false, reason: classification.reason };
  }

  // Stage 2: Transformation (if needed)
  if (classification.category === "needs_review") {
    const cleaned = await generate(\`
      Rewrite this content to remove any problematic
      elements while preserving the core message:
      \${userContent}
    \`);
    return { allowed: true, content: cleaned, modified: true };
  }

  return { allowed: true, content: userContent, modified: false };
}</code></pre>

<h3>Pattern: Multi-Persona Debate</h3>
<p>Use multiple "personas" to analyze a topic from different angles:</p>
<ul>
  <li><strong>The Optimist:</strong> Best-case scenarios and opportunities</li>
  <li><strong>The Skeptic:</strong> Risks, costs, and failure modes</li>
  <li><strong>The Pragmatist:</strong> Realistic next steps and trade-offs</li>
</ul>

<p>Run all three perspectives, then synthesize into a final recommendation. This produces far more nuanced analysis than a single prompt.</p>

<p>Congratulations on completing the Steering AI Behavior course! You now have a toolkit of techniques to make AI outputs reliable, consistent, and production-ready.</p>
            `,
          },
        ],
      },
    ],
  },
};

export function getCourseList() {
  return Object.values(courseCatalog).map(({ id, title, shortDescription, price, priceCents, highlights }) => ({
    id, title, shortDescription, price, priceCents, highlights,
  }));
}

export function getCourseById(id) {
  return courseCatalog[id] || null;
}

export default courseCatalog;
