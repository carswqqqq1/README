# In-depth technical investigation into the Manus AI agent, focusing on its architecture, tool orchestration, and autonomous capabilities. · GitHub

**URL:** https://gist.github.com/renschni/4fbc70b31bad8dd57f3370239dccd58f

---

Skip to content
 
Search Gists
All gists
Back to GitHub
Sign in
Sign up

Instantly share code, notes, and snippets.

renschni/Manus_report.md
Last active 
Star
236
(236)
Fork
115
(115)
Code
Revisions
2
Stars
236
Forks
115
Embed
Clone this repository at &lt;script src=&quot;https://gist.github.com/renschni/4fbc70b31bad8dd57f3370239dccd58f.js&quot;&gt;&lt;/script&gt;
Download ZIP
In-depth technical investigation into the Manus AI agent, focusing on its architecture, tool orchestration, and autonomous capabilities.
Raw
Manus_report.md

I wrote an in-depth research prompt to conduct a GPT-Deep-Research on the Manus topic, seeking to replicate it with currently available open source tools. This is the result:

TLDR: Manus AI Agent Report

Manus is an autonomous AI agent built as a wrapper around foundation models (primarily Claude 3.5/3.7 and Alibaba's Qwen). It operates in a cloud-based virtual computing environment with full access to tools like web browsers, shell commands, and code execution. The system's key innovation is using executable Python code as its action mechanism ("CodeAct" approach), allowing it to perform complex operations autonomously. The architecture consists of an iterative agent loop (analyze → plan → execute → observe), with specialized modules for planning, knowledge retrieval, and memory management. Manus uses file-based memory to track progress and store information across operations. The system can be replicated using open-source components including CodeActAgent (a fine-tuned Mistral model), Docker for sandboxing, Playwright for web interaction, and LangChain for orchestration. While replication is technically feasible, achieving Manus's reliability and performance will require careful prompt engineering and extensive testing.

Manus Autonomous AI Agent: Technical Analysis
1. System Architecture Analysis

Foundation Model Backbone: Manus is built on top of powerful foundation language models rather than a proprietary model from scratch. The team’s chief scientist revealed that Manus initially leveraged Anthropic’s Claude (specifically Claude 3.5 “Sonnet v1”) as the core reasoning engine, supplemented by fine-tuned versions of Alibaba’s Qwen large model (Manus背后的基础大模型首次公布！基于美国Claude和阿里Qwen开发|美国|阿里|AI_新浪科技_新浪网). In other words, Manus’s “brain” is a combination of existing LLMs. They have been actively upgrading this backbone – for example, testing Claude 3.7 internally for future use (Manus背后的基础大模型首次公布！基于美国Claude和阿里Qwen开发|美国|阿里|AI_新浪科技_新浪网). Reports indicate Manus can even invoke multiple models dynamically for different sub-tasks (“multi-model dynamic invocation”), using each model’s strengths – e.g. using Claude 3 for complex logical reasoning, GPT-4 for coding tasks, and Google’s Gemini for broad knowledge queries (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). (It’s unclear if GPT-4/Gemini were actually in use or planned, but this was suggested in media (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？).) The key point is that Manus acts as an orchestrator over top-tier LLMs, rather than a single standalone model – a design that allows it to exploit the best available AI capabilities for each task.

Cloud Agent with Tool Sandbox: Unlike a typical chatbot confined to text, Manus runs within a virtual computing environment in the cloud. This environment is a full Ubuntu Linux workspace with internet access (Manus tools and prompts · GitHub), where Manus can use a suite of tools and software as if it were a human power-user. According to the system specifications, Manus has access to a shell (with sudo privileges), a web browser it can control, a file system, and interpreters for programming languages like Python and Node.js (Manus tools and prompts · GitHub) (Manus tools and prompts · GitHub). It can even launch web servers and expose them to the internet. All of this happens server-side – Manus continues working even if the user’s device is off, which distinguishes it from agents that run in a user’s browser (for example, OpenAI’s experimental “Operator”) (After DeepSeek, China takes a leap with Manus, world’s first autonomous AI agent — TFN) (After DeepSeek, China takes a leap with Manus, world’s first autonomous AI agent — TFN). The sandboxed tool environment means Manus isn’t limited to replying in natural language; it can act: e.g. browse websites, fill forms, write and execute code, or call APIs autonomously. This architecture turns Manus into something like a digital worker in the cloud, not just a conversational bot.

Agent Loop and Orchestration: Manus operates through an iterative agent loop that structures its autonomy (Manus tools and prompts · GitHub). At a high level, each cycle of the loop consists of: (1) Analyzing the current state and user request (from an event stream of recent interactions), (2) Planning/Selecting an action (deciding which tool or operation to use next), (3) Executing that action in the sandbox, and (4) Observing the result, which gets appended to the event stream (Manus tools and prompts · GitHub). This loop repeats until Manus determines the task is complete, at which point it will output the final result to the user and enter an idle state (Manus tools and prompts · GitHub). The design explicitly limits the agent to one tool action per iteration – it must await the result of each action before deciding the next step (Manus tools and prompts · GitHub). This control flow prevents the model from running away with a long sequence of unchecked operations and allows the system (and user) to monitor each step.

Planner Module (Task Decomposition): To manage complex tasks, Manus incorporates a Planner module that breaks high-level objectives into an ordered list of steps (Manus tools and prompts · GitHub). When the user gives a goal or project, the Planner generates a plan in a kind of pseudocode or enumerated list (with step numbers, descriptions, and status) which is injected into the Manus agent’s context as a special “Plan” event. For example, if asked to build a data visualization, the planner might produce a sequence: 1. Gather data, 2. Clean data, 3. Generate plot, 4. Save and send plot. Manus uses this as a roadmap, executing each step in order. The plan can be updated on the fly if the task changes (Manus tools and prompts · GitHub). The agent refers to the plan each iteration and knows it must complete all steps to finish the task (Manus tools and prompts · GitHub). This mechanism gives Manus a form of lookahead and structured decision-making rather than just reacting turn by turn. It’s similar in spirit to how AutoGPT or BabyAGI maintain a task list for an objective, ensuring the AI doesn’t forget the overarching goal while doing minute actions.

Knowledge and Data Modules: Manus doesn’t rely solely on the LLM’s built-in knowledge. It has a Knowledge module that provides relevant reference information or best-practice guidelines from a knowledge base when needed (Manus tools and prompts · GitHub). These appear as “Knowledge” events in the context, giving the agent helpful info specific to the domain or task (for instance, if the task is to write an essay, the knowledge module might supply a style guide or factual snippets to use). In parallel, Manus can use a Datasource module for factual data via APIs (Manus tools and prompts · GitHub). The agent is given a library of pre-approved data APIs (for weather, finance, etc., presumably) along with their documentation. When those are relevant, it will call them through Python code rather than scraping the web, since the system prioritizes authoritative data sources over general web info (Manus tools and prompts · GitHub). For example, Manus could call a Weather API to get up-to-date climate data (as shown in a provided code snippet) (Manus tools and prompts · GitHub). This approach integrates Retrieval-Augmented Generation: the agent actively fetches external knowledge and data instead of relying on its parametric memory. In fact, the developers confirmed Manus “supports retrieval augmented generation (RAG)”, meaning it combines external data retrieval with the model’s generation capabilities (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). All retrieved facts or data are injected into the event stream as read-only context, so that the LLM can incorporate them into its reasoning and output.

Multi-Agent Collaboration: A noteworthy aspect of Manus’s architecture is its multi-agent (multi-module) design. Rather than a single monolithic agent handling everything, Manus is structured so that specialized sub-agents or components can work in parallel on different aspects of a task (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). For example, one sub-agent (or thread) might focus on web browsing and information gathering, while another handles coding, and another manages data analysis – each within its own isolated sandbox environment (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？) (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). A high-level orchestrator (the main Manus brain) coordinates these, dividing the task and later integrating results. This design is inspired by distributed problem-solving: by “hiring” multiple specialist agents, Manus can tackle complex multi-faceted projects more efficiently. It also adds robustness – if one agent is busy or stuck, another can continue progress on a different subtask. Ultimately, this multi-agent architecture allows Manus to deliver tangible outputs that require many steps and skills. As an example, Manus can produce a complete result like a formatted Excel report or even deploy a website, not just text. This is because behind the scenes it might have one agent writing the code, another agent spinning up a server, and another verifying the web output, all as part of one user request (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). From the user’s perspective, Manus itself is handling the whole project seamlessly. (It’s worth noting that this complexity is hidden; users just see one AI assistant. The multi-agent coordination happens within Manus’s system architecture.)

2. Technical Components

Executable Code Actions (“CodeAct”): Manus’s tool-use mechanism is built on the insight that an AI agent can interact with its environment by writing and running code. In fact, Manus’s developers based their approach on a 2024 research paper that proposed using executable Python code as the universal action format for LLM agents (Manus tools and prompts · GitHub) (Manus tools and prompts · GitHub). Instead of the model outputting a fixed set of tokens like “SEARCH(query)” or some rigid JSON, Manus will often generate a short Python script to perform the desired action. This is the CodeAct paradigm – the model’s “acts” are code that gets executed. The advantage is flexibility: code can combine multiple tools or logic in one go, handle conditional flows, and make use of countless libraries. The CodeAct paper found that agents who can produce code for actions have significantly higher success rates on complex tool-using tasks than those limited to simple textual tool calls (Executable Code Actions Elicit Better LLM Agents | OpenReview) (Executable Code Actions Elicit Better LLM Agents | OpenReview). Manus puts this into practice. For example, if Manus needs to fetch weather info, it might produce Python code that calls the weather API client and prints the result, as opposed to relying on a single built-in “Weather” function (Manus tools and prompts · GitHub). The sandbox then runs this code and returns the output (or error) as an observation. By analyzing the observation, Manus can decide to adjust the code and try again – essentially debugging itself. This ability to iteratively write, execute, and refine code makes Manus extremely powerful: it can solve problems like a developer writing scripts. It also means tool “commands” in Manus are often just function calls within code. (Under the hood, the Manus system likely provides a library of Python functions or an API for common actions – e.g., search_web(), open_url(), etc. – which the model can call in its generated code. The model might produce something like results = search_web("site:xyz.com information on ABC") and the sandbox runtime will execute that.) The reliance on code execution explains why Manus can do things like database queries, data visualization, or running complex computations – tasks that go beyond canned tools and require programming. This is a key technical differentiator: Manus essentially treats Python as its action language (CodeAct), giving it a much wider action space than agents with fixed tool APIs (Executable Code Actions Elicit Better LLM Agents | OpenReview).

Tool Integration & Control Flow: Manus integrates dozens of specific tools, but it uses a standardized function-call interface to invoke them. The system prompt explicitly instructs the agent that every step must be a tool call (function call), not a direct natural language reply (Manus tools and prompts · GitHub). In practical terms, after the user gives a task, the next responses from Manus are not answers – they are JSON or structured outputs that indicate an action for the system to execute. For example, Manus might output something like: {"action": "SEARCH", "parameters": {"query": "best hotels in Tokyo"}}. The Manus orchestrator interprets that and performs the search, then feeds the results back. Only when the final answer is ready will Manus produce a normal message. This approach is similar to OpenAI’s function-calling format and is designed to prevent the model from “hallucinating” results instead of actually acting (Manus tools and prompts · GitHub). Manus’s available tools likely include: Web search (to find URLs or data), Browser navigation (open a URL, click a link, scroll, etc.), Shell commands (to install packages, run system utilities, etc.), File operations (read/write files, so it can store intermediate results or drafts), Code execution (run a snippet of code in Python or other languages), API calls (invoke those data source APIs via code as mentioned), and Messaging (to send a message or ask the user for input if absolutely needed). Each of these tools is constrained by rules. For instance, Manus is told not to click or execute something that has irreversible side effects without special user permission, and to prefer non-interactive modes (like adding -y to apt-get) so it doesn’t pause for confirmation (Manus tools and prompts · GitHub). The Manus prompt also specifies that when using the browser, it must scroll if content is truncated and it should ignore search engine summary snippets – it should click through to the actual page for authoritative info (Manus tools and prompts · GitHub). These rules are aimed at making tool use reliable and thorough. The control flow around tool use is strict: Manus can only execute one tool action at a time per loop cycle (Manus tools and prompts · GitHub), and after execution, it must check the result (an observation event) before proceeding. If an error occurs (say a shell command failed or code threw an exception), Manus has error-handling policies: it should diagnose the failure from the error message and retry if possible, or choose an alternative method, and only as a last resort report to the user that it cannot proceed (Manus tools and prompts · GitHub). This aligns with how a human would use tools – try, debug, retry. It’s worth noting that Manus’s tool interface is likely implemented via an API that the LLM “sees.” Many open-source agent frameworks do this by intercepting special tokens or JSON from the model. Manus’s case, given the CodeAct approach, probably intercepts code outputs – e.g., if the model prints a special token or calls a certain function in code, the system knows to treat that as a tool invocation. In summary, Manus merges the flexibility of free-form code with the safety of a controlled tool API: the agent can do almost anything by code, but the system ensures it’s one step at a time and observes each outcome.

Memory and State Management: As an autonomous agent, Manus has to manage a lot of state across its operations. It does this in a few ways:

Event Stream Context: Manus’s immediate working memory is the event stream – a chronological log of everything that has happened in the session: user messages, the agent’s actions, and the results of those actions (Manus tools and prompts · GitHub). Each iteration, Manus is given (or remembers) the latest portion of this stream and uses it to decide next steps. The stream may be truncated to fit the model’s context window (e.g. it might include the last N events or a summary of earlier ones) (Manus tools and prompts · GitHub). By structuring context as typed events (“User said X”, “Action Y was executed”, “Observation: result of Y was ...”), the system prompt helps the model distinguish between the different kinds of information. This is essentially a structured memory that the model uses for chain-of-thought.
Persistent Scratchpad (Files): Manus actively externalizes memory to files in its virtual file system. The leaked prompt indicates Manus should save intermediate results and notes to files rather than trying to hold everything in the chat context (Manus tools and prompts · GitHub). For example, if Manus is doing a research report, it might create files for each section of the report as it gathers information, and later combine them. It also uses a special file todo.md as a live checklist of the plan steps (Manus tools and prompts · GitHub). After completing each step, Manus ticks it off in the todo.md (the prompt tells it to update the file with progress) (Manus tools and prompts · GitHub). This not only helps the agent keep track, but also if the session were paused or context lost, the to-do file serves as a source of truth for what’s done and what’s left. By the end of the task, Manus can refer to todo.md to verify all items are completed and nothing was skipped (Manus tools and prompts · GitHub). This is very similar to how human project managers maintain checklists, and it provides continuity even if the AI’s short-term memory is limited.
Long-Term Knowledge Store: The Knowledge module mentioned earlier functions as memory of best practices and domain knowledge. It’s effectively an external knowledge base that Manus queries when appropriate. For instance, if the user asks Manus to build a React app, the system might pull in a “knowledge” event containing a reference snippet about best practices for setting up a React project. This way, the model isn’t expected to recall everything; it gets hints from a curated knowledge base (Manus tools and prompts · GitHub). Similarly, Manus’s use of RAG means it can fetch documents or data relevant to the user’s query on the fly (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？) (e.g. company data for analysis, or a specific PDF content if connected to one), and incorporate that into its context. By combining retrieval with generation, Manus avoids the typical LLM limitation of a fixed knowledge cutoff.
Context Management: To maintain performance, Manus has to manage the size of the context given to the LLM. Likely, older events get summarized or dropped once they’re no longer relevant (for example, once a sub-task is done, its details might be distilled into a brief note). The prompt explicitly says distant parts of conversations might not be recalled due to context length (Manus tools and prompts · GitHub), acknowledging this limitation. Manus mitigates this by segregating information: code and data are kept in files (which the agent can open when needed), raw search results are saved rather than held in the chat, and only the conclusions or next actions are kept in the live context. This design mirrors how systems like AutoGPT handle memory (AutoGPT uses a local file or vector database to store information that won’t fit in prompt, then pulls summaries in as needed). Manus likely uses a vector store to embed and recall relevant chunks of past dialogues or retrieved docs, given the RAG approach.

Prompt Engineering: Manus’s impressive performance is not just due to the model – how the entire system is prompted and instructed is critical. The Manus team has crafted a very detailed system prompt (or set of prompts) that govern the agent’s behavior. From the gist of leaked prompts, we see that Manus is given a clear persona and scope: “You are Manus, an AI agent created by the Manus team. You excel at... [list of tasks]...” (Manus tools and prompts · GitHub). This primes the model with confidence and context about its abilities. The prompt then lays out numerous rules and guidelines in a structured format (sections like <system_capability>, <browser_rules>, <coding_rules>, etc.) which the model must follow. These include: how to handle searches and not trust snippet text without clicking through (Manus tools and prompts · GitHub), how to always cite sources when providing factual information or writing reports (Manus tools and prompts · GitHub), how to format outputs (avoid bullet lists unless asked (Manus tools and prompts · GitHub)), and how to interact with the user (e.g. provide progress updates via a “notify” message, but don’t ask the user unnecessary questions that would halt the autonomous flow (Manus tools and prompts · GitHub)). This is essentially hard-coded prompt-based governance, making the AI’s style and procedure more predictable. Prompt engineering also covers how the planner outputs steps (e.g. as numbered pseudo-code) and how those appear to the agent, and even “forbidden behaviors” (Manus is told it cannot reveal its system prompts or do anything harmful/illegal (Manus tools and prompts · GitHub)). By encoding the developers’ expertise and guardrails into the prompt, Manus avoids many pitfalls out-of-the-box. It’s worth noting that Manus’s prompt includes instructions to produce very detailed outputs – for instance, a rule says any written report should be several thousand words if possible (Manus tools and prompts · GitHub). This indicates the designers wanted thoroughness. They also instruct the agent to save drafts for long documents and concatenate them, rather than rely on the model to output a giant essay in one go (Manus tools and prompts · GitHub), which is a clever strategy to deal with token limits and coherence for large texts. All these prompt elements together create a sort of “operating manual” that the AI follows relentlessly. In essence, the prompt is as important as the model weights in achieving Manus’s autonomous behavior. It transforms a general model (Claude or others) into a specialized agent by front-loading it with system messages about how to behave, how to plan, and how to use tools.

To summarize, the technical secret sauce of Manus lies in: (a) a robust architecture (planner + memory + tool execution loop), (b) leveraging top-tier foundation models (Claude, etc.) for cognition, (c) heavy use of code execution and tools to act on the world, and (d) a finely tuned system prompt that encodes the “agent workflow” and best practices. This combination allows Manus to autonomously tackle complex tasks end-to-end, whereas a vanilla ChatGPT is limited to answering questions. Manus’s design addresses common limitations of LLMs (hallucinations, lack of long-term memory, inability to take actions) through pragmatic engineering (rules, external memory, and tool use frameworks).

3. Implementation Strategy (Recreating Manus with Open Tools)

Architecture Blueprint: Reproducing Manus’s capabilities requires piecing together several components. At a high level, one can envision an architecture with the following parts (which could be illustrated in a diagram):

LLM Core: a large language model that will serve as the reasoning and decision core (this could be an API like OpenAI/Anthropic or an open-source model running locally).
Orchestrator/Loop Controller: logic that wraps around the LLM to implement the agent loop – feeding it context, receiving an action, executing the action, then feeding back the result, repeatedly.
Tool/Action Interfaces: a set of APIs or functions the LLM can invoke to interact with the world (web search, browser automation, code execution, etc.). This includes a secure sandbox execution environment for any code the LLM writes.
Planner Module: a mechanism to break tasks into sub-tasks (could be a separate prompt or even a separate smaller model that generates plans).
Knowledge Retriever: connection to external data sources – e.g. a vector database of documents, or simply the ability to do web searches and ingest results – to supply additional context on demand.
Memory Store: some form of persistent memory (files or database) where the agent can record progress, results, or information that should persist across turns or sessions.

A system diagram might show the LLM core at the center, with arrows going out to various tool executors (shell, browser, etc.) and incoming arrows from the planner and knowledge modules injecting information into the LLM’s context. In fact, the open-source CodeActAgent project provides a reference implementation that matches this idea: it includes (1) an LLM server (they use vLLM to host the model behind an API), (2) a Code Execution service that launches a Docker container per session to run any code the agent produces, and (3) a front-end or interface that mediates the conversation and stores chat history (often in a database) (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.). Manus’s architecture would be a superset of this (with additional planning and knowledge components), but one can start with CodeAct’s design as a base.

Choosing the Foundation Model: If recreating Manus, one of the first decisions is what LLM to use as the agent’s brain. Manus used Claude 3.5 and Qwen models (Manus背后的基础大模型首次公布！基于美国Claude和阿里Qwen开发|美国|阿里|AI_新浪科技_新浪网); as an individual developer, you might not have access to Claude, but there are strong open alternatives. A promising route is to use the open-source CodeActAgent model released by the research team (they fine-tuned a 7B Mistral model on CodeAct tasks) (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.). This model is specifically tuned to generate and follow Python code for actions, aligning with our needs. It also supports a large context window (32k tokens) which is useful for keeping the event stream and plans in context (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.). If more capability is needed, one could use GPT-4 via API as the core (AutoGPT, for example, uses GPT-4 to drive its agent (AutoGPT - Wikipedia)). However, relying on GPT-4 has cost and dependency issues, so a hybrid approach could be taken: perhaps use an open model for most steps and call GPT-4 only for particularly difficult sub-tasks (similar to Manus’s approach of multi-model invocation (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？)). Regardless of the model, the key is you must be able to feed it a complex system prompt and get function-like outputs. Models like GPT-4, GPT-3.5, Claude, CodeActAgent, or a fine-tuned Llama-2 can all do this. If using open-source LLMs, hosting them with an inference server (like vLLM or FastChat) that provides an OpenAI-compatible API will simplify integration with tooling frameworks (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.).

Tool Execution Environment: Next, setting up the sandbox and tools is crucial. You can use Docker or another containerization to provide an isolated Linux environment for the agent (ensuring that if the AI writes malicious or faulty code, it doesn’t affect the host system). Within that container, install the necessary software: Python, Node, a headless browser (for example, Playwright or Selenium for browser automation), etc. Manus’s environment included Ubuntu, Python 3.10, Node.js 20, and basic Unix utilities (Manus tools and prompts · GitHub), which is a good template. For web browsing, an approach is to use a headless browser controlled via Python. There are open packages like playwright-python that let you open pages, click elements, and extract content. Alternatively, simpler (but limited) “browser APIs” exist that fetch page HTML (though then the AI has to parse HTML). In our replication, we might provide a Python function open_url(url) that uses requests or an automated browser to get page text, and then the model can call that. For executing shell commands safely, you can expose only specific commands or run everything through a Python subprocess interface. Manus’s rules show it heavily uses shell for tasks like installing packages or running system-level tools (Manus tools and prompts · GitHub), which means our agent should have that ability too – perhaps via a function run_shell(command) that executes in the container and returns output (truncated for safety). The tools should be registered in whatever agent framework you use. In LangChain, for example, you would create Tool objects for “Search”, “Browse”, “Execute Python”, etc., each with a function that the agent can call. In a CodeAct paradigm, instead of discrete tool calls, you’ll allow the model to import a helper library in its generated code. You might create a Python module (let’s call it agent_tools.py) that has functions like search_web(query), get_url_content(url), run_shell(cmd)… and then you prepend import agent_tools in the execution environment. This way the model can do agent_tools.search_web("...") in code and it triggers your Python backend to perform the search and return results. Setting up these hooks is a bit of work, but once done, the model essentially has an SDK for actions. Be mindful to include safeguards – e.g., limit network access so the agent can’t call arbitrary external URLs except through your vetted search/browser, and put time/memory limits on code execution to avoid infinite loops.

Planning and Decomposition: We will want to mimic Manus’s Planner module. One simple method is to prompt the LLM at the start of a task with something like: “You are a planning assistant. The user’s goal is X. Please break this into an ordered list of steps to achieve it.” You can do this in a separate “planning phase” call to the LLM (maybe even using a cheaper model for planning if desired). Then take the list of steps and feed it into the main agent prompt as a system message (e.g., “Plan: 1)… 2)… etc.”). Alternatively, you can integrate planning into the main prompt by having a section like <planner_module> as seen in Manus’s prompt, and instructing the model to update the plan events. For initial implementation, an external planning call might be easier to reason about. The output plan can be stored (in the context and perhaps in a todo.md file as Manus does) (Manus tools and prompts · GitHub). During each loop iteration, you can remind the agent of the current step it’s on (e.g., include a line in the prompt: “Current Step: 3. Do XYZ”). This helps focus the agent. The plan also gives a stopping criterion – when all steps are done, the loop ends. Re-planning: if the user changes the request or if something unexpected happens, you may need to re-generate the plan. Manus’s rules say it rebuilds the todo list if the plan changes significantly (Manus tools and prompts · GitHub). In our implementation, we could monitor if the user gives new instructions mid-task and then trigger a re-plan.

Memory and Knowledge Integration: For knowledge retrieval, decide on an approach based on resources. One approach is to use a vector database (like FAISS, Milvus, etc.) to store documents and past conversation embeddings. If you have a knowledge base (for example, a set of how-to guides or reference manuals relevant to your agent’s tasks), index them into vectors. Then when a user query comes in, you embed the query and find relevant docs, and prepend them as “Knowledge” in the prompt (similar to how Manus injects knowledge events) (Manus tools and prompts · GitHub). LangChain provides utilities for this kind of RAG pipeline. For web search, since we likely can’t maintain a full web index, the agent will use a search API (SerpAPI, Bing Web Search API, etc.) to get results. The code or tool call would retrieve the top N results, then for each, you can fetch the page text (maybe just the first part or a summary if it’s long) and feed that back. The model can then decide which ones to click more (Manus’s prompt specifically says to open multiple links for comprehensive info and not trust just one source (Manus tools and prompts · GitHub)). So our agent should do the same: after an initial search, it might loop through results, calling open_url on each, and reading content. We should encourage the agent (via prompt) to save relevant info to files (like notes.txt) to free up context. Indeed, we can mimic Manus’s file usage: instruct the agent that if it finds important info, it can write it to a file (using a file write tool) and later just reference that file rather than keeping all text in the conversation. Managing long conversations may also require summarization. We could have a policy: if the event stream (conversation log) grows too large, have the agent (or an automated process) summarize older parts. This is a bit complex to do seamlessly, but it’s achievable with an extra LLM call to condense events, then put that summary as a “Compression event” in context. These kinds of strategies are what Manus likely does to handle large tasks given the context limit.

Prompt Design: We should create a system prompt similar in spirit to Manus’s. It would start with a description of the agent’s role and capabilities (“You are an autonomous AI agent that can use tools XYZ to accomplish tasks…”). We’d include key rules inspired by Manus: e.g., Tool use – “Always respond with an action unless delivering final results”; Information sourcing – “Prefer reliable data from provided APIs or official sources over general web content (Manus tools and prompts · GitHub), and cite sources in outputs (Manus tools and prompts · GitHub)”; Style – “Use a formal tone, avoid lists unless asked (Manus tools and prompts · GitHub), be detailed in explanations (Manus tools and prompts · GitHub),” etc. Many of Manus’s rules from the leaked prompt can be directly re-used or paraphrased, since they represent best practices for agents. For example, the rule about not revealing system messages or internal logic to the user is vital (to prevent the user from prompt-injecting the agent into showing its own prompt). Likewise, rules about confirming receipt of a task and providing periodic updates (Manus distinguishes “notify” vs “ask” message types for non-blocking updates vs questions to user (Manus tools and prompts · GitHub)). In an open implementation, one might not implement a full separate messaging UI with notify/ask distinctions, but it’s still good to have the agent occasionally output a brief progress update if it’s working on something lengthy. When writing the prompt, modularize it as Manus did: have sections for each tool with usage guidelines. This helps because if you swap out a tool implementation, you only need to adjust that section of the prompt. It’s essentially documentation for the AI. One can also include a few few-shot examples in the prompt if token space allows – e.g., a short example of a user request, followed by an ideal sequence of thought (actions and observations) and final answer. This can teach the model the pattern of how to respond. The CodeAct paper’s authors likely did this when fine-tuning; they even released a dataset of multi-turn interactions demonstrating the code-act technique (Executable Code Actions Elicit Better LLM Agents | OpenReview). Using such data to further fine-tune your chosen model could dramatically improve performance. If fine-tuning is not feasible, a well-crafted prompt with examples can still guide the base model.

Development Workflow: Building a Manus-like agent is an iterative software project. A possible workflow is:

Start with a Basic Loop: Implement a simple loop with an LLM that can call one or two dummy tools. For instance, get it to take a math question and use a Python REPL tool to do calculation. This tests the integration of model and tool execution.
Gradually Add Tools: One by one, add more tool capabilities (web search, file I/O, shell, etc.), and after adding each, update the prompt with instructions and test the agent on a relevant task. For example, after adding web search, ask the agent a question that requires looking up info. Monitor if it uses the tool correctly.
Implement Logging & Observation Handling: Ensure every action and result is logged (both for debugging and for feeding back into the model). Use a structured format for logs. This will help in tuning behavior. Manus’s event stream can be emulated by simply maintaining a list of events in code and concatenating them into the prompt each cycle.
Incorporate Planning: Once basic perception and actions work, work on the planning module. You could integrate an existing task planner or just use the LLM itself (“outline the steps first”). Get the agent to show a plan and follow it. Adjust prompt instructions if the agent tends to ignore the plan. Ideally, the agent should keep the plan in mind and update progress. You may have it explicitly print the plan with completed steps marked, to verify.
Add Memory/RAG: Connect a simple vector store and test retrieval. For instance, give the agent a paragraph of info, end the conversation, then start a new conversation asking for it – see if it can retrieve from the store. Or have it ingest a document and then ask a question that requires quoting that document. Fine-tune the pipeline for injecting those retrieved chunks into context in a useful way (maybe prepend with a tag like “Reference:”).
Refine Prompt and Policies: Through testing on various scenarios, you’ll discover issues – perhaps the agent loops uselessly at times, or uses the wrong tool. You may need to add more rules (or even hard-code certain behaviors). For instance, early Manus beta testers found it could get stuck in an infinite loop on some errors (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). You might implement a safeguard: if the same action is repeated 3 times with no success, break and ask user for guidance. Or if an external website is not loading, try a different source. Many of these can be handled by improving the agent’s reasoning via prompt, but some may require outside intervention (like a supervising function that stops the loop after too long). Manus’s team likely addressed such edge cases during their private beta (they mentioned they were fixing reported issues (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？) (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？)).
Interface and Integration: Finally, build a user interface or API around your agent. Manus is offered via a web app/Discord with waitlists, etc., but for your replication you might just use a console or a simple chat web UI. The important part is the backend logic. Expose an API endpoint where a user can POST a task and the agent will start the loop, periodically sending messages or a final result. Consider how to handle long-running tasks – you might need asynchronous processing or background job queues (since some tasks like coding and debugging could take minutes or more).

Leveraging Open-Source Projects: A number of open-source agent frameworks can provide a shortcut or at least inspiration:

LangChain – provides a lot of the scaffolding for defining tools and an agent that chooses tools. One could use LangChain’s AgentExecutor with a custom LLM and custom tools. LangChain won’t natively do the CodeAct style (it tends to use plan-> tool call strings), but you can still use it for handling multi-step tool use. It’s a quick way to get things like a search tool or a python exec tool without writing all the glue yourself.
AutoGPT – this popular project already implements an autonomous loop using GPT-4 (or 3.5) (AutoGPT - Wikipedia). It has features like a task list (plan), memory with a vector DB, and integration with web browsing and file I/O. However, AutoGPT’s codebase has a reputation for being a bit sprawling and hacky (it was an experiment that gained sudden popularity). Still, you could study it or even fork it to use a different LLM backend. AutoGPT uses an approach of having the AI critique its own plan (“critic thoughts”) which is another idea to consider for improving reliability.
BabyAGI – another open project which focuses on the task list execution idea. BabyAGI is simpler: it keeps a list of tasks, always picks the top one to execute, possibly adds new tasks as needed, and uses an LLM to perform each task and then update the list. This is somewhat different from Manus’s approach but shares the concept of breaking down goals. You might draw from BabyAGI the concept of maintaining and reprioritizing a task list.
CodeActAgent – since Manus specifically references the “CodeAct” paper, using the authors’ open implementation is highly relevant. The CodeActAgent (especially the fine-tuned model they provide) is tailored for exactly the scenario of an agent that outputs code to use tools. By using their model and code, you get a lot of Manus’s core functionality out-of-the-box: the model will know how to call APIs, how to format code actions, etc., thanks to its training (Executable Code Actions Elicit Better LLM Agents | OpenReview) (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.). You would then just need to hook that into your system and perhaps extend it with planning and memory. The CodeAct repo even includes a sample chat UI and guidance on deploying with Kubernetes for scalability (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.). In essence, CodeActAgent is like an open-source mini-Manus (minus some of the proprietary polish Manus has).

API Integration Considerations: If your agent is to use external services (for example, calling OpenAI API for GPT-4, or any paid API), handle the keys and quotas carefully. Manus in production likely uses API keys for search or geo data that are hidden from the model (the model just calls a function, the server-side code attaches credentials). Do the same – never put API keys in the prompt or the model might leak them; keep them in your tool implementation code. Also implement rate limiting on tool usage to avoid the agent spamming calls (either maliciously or by accident). Manus probably has safeguards to not DOS a website or call a paid API in a tight loop endlessly.

Testing and Evaluation: Finally, to ensure your Manus-like agent works, test it on a variety of tasks that Manus claims to handle: e.g. “Draft a 5-page research report on topic X with citations” – see if it can search, compile info, and produce a structured report with sources (you might need to supply it enough context or a knowledge base to do that well). Or “Build a simple web app that does Y” – see if it can create files, write code, start a server and give you a URL (this will test the deploy/tool integration). Also test failure modes deliberately: ask it to do something it shouldn’t (Manus has ethical guardrails in prompt), or give it an impossible task – it should eventually respond that it cannot do it, rather than spinning forever. According to early user reviews, Manus sometimes made factual errors or failed to complete transactions like ordering food or booking flights (it would get partway but not finish) (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？). Use such scenarios to identify gaps in your agent. Perhaps it lacks the ability to fill in payment details, or maybe it wasn’t allowed to for safety – in your design, you can decide what not to automate. For instance, you might intentionally not enable actually clicking “Purchase” on a site, to avoid real-world side effects, and instead have the agent stop at providing a link or instructions. Clarify these boundaries in the prompt (Manus’s prompt does mention to ask the user to take over for “sensitive operations” like final confirmations (Manus tools and prompts · GitHub) (Manus tools and prompts · GitHub)).

In conclusion, building an autonomous agent like Manus is a complex but achievable project using open-source tools. The core steps are: choose a capable LLM, provide it with a rich prompt and/or fine-tuning so it knows how to act as an agent, give it a safe playground of tools (code, web, etc.), and implement a loop that keeps it on track towards a goal. Manus demonstrated that with the right mix of existing AI components (Claude, etc.) and careful integration, an AI can be turned into a “digital employee” that proactively completes tasks. By following the architecture and techniques we’ve outlined – drawn from Manus’s design and related research – one can recreate a similar agentic AI system. It may not immediately match Manus’s full prowess, but through iterative improvement and perhaps community contributions (as seen by the enthusiastic reverse-engineering of Manus by early adopters), an open-source Manus-equivalent could emerge, pushing forward the capabilities of autonomous AI agents in a transparent way.

Sources:

Ji Yichao (Peak) on Manus’s foundation models – using Anthropic Claude and finetuned Alibaba Qwen (Manus背后的基础大模型首次公布！基于美国Claude和阿里Qwen开发|美国|阿里|AI_新浪科技_新浪网) (Manus背后的基础大模型首次公布！基于美国Claude和阿里Qwen开发|美国|阿里|AI_新浪科技_新浪网).
Tech media report on Manus’s multi-model and multi-agent strategy (GPT-4, Claude, Gemini for different tasks; sub-agents in separate VMs) (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？) (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？).
Manus system prompt (leaked) – capabilities and tool use rules (Manus tools and prompts · GitHub) (Manus tools and prompts · GitHub).
Manus agent loop and planning (system prompt excerpt) (Manus tools and prompts · GitHub) (Manus tools and prompts · GitHub).
Manus knowledge integration and RAG support (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？) (Manus tools and prompts · GitHub).
Example of Manus calling an API via code (CodeAct paradigm in action) (Manus tools and prompts · GitHub).
CodeAct (ICML 2024) paper abstract – code as action outperforms text/JSON formats (Executable Code Actions Elicit Better LLM Agents | OpenReview) (Executable Code Actions Elicit Better LLM Agents | OpenReview).
CodeActAgent open-source components (LLM server, execution engine, etc.) (GitHub - xingyaoww/code-act: Official Repo for ICML 2024 paper "Executable Code Actions Elicit Better LLM Agents" by Xingyao Wang, Yangyi Chen, Lifan Yuan, Yizhe Zhang, Yunzhu Li, Hao Peng, Heng Ji.).
AutoGPT description – an autonomous agent that uses GPT-4 in a loop to break down goals and use tools (AutoGPT - Wikipedia).
Manus prompt rules on information sourcing and citation (Manus tools and prompts · GitHub) (Manus tools and prompts · GitHub).
Error handling and self-debug instructions from Manus prompt (Manus tools and prompts · GitHub).
Early tests of Manus by users – limitations in completing certain autonomous tasks (ordering food, booking flight) (Manus在紅什麼？外媒評測訂餐、訂位、訂票⋯都碰壁：它是中國第二個DeepSeek時刻？).
Raw
replicate_manus.md
Replicating Manus with Open-Source Tools: Implementation Blueprint

Based on the research report, we can construct a practical roadmap to replicate Manus's functionality using publicly available tools. Here's how to proceed:

1. Core Infrastructure Setup
Foundation Model
git clone https://github.com/xingyaoww/code-act
cd code-act
pip install -r requirements.txt

Use the CodeActAgent model (fine-tuned 7B Mistral) as your reasoning core
For enhanced performance, combine with Llama 3 (8B or 70B) for planning tasks
Execution Environment
docker run -d --name manus-sandbox \
  -v $(pwd)/workspace:/home/ubuntu \
  --cap-drop=ALL \
  ubuntu:latest

Create an isolated sandbox with Python, Node.js, and a headless browser
Install essential tools:
apt-get update && apt-get install -y \
  python3 python3-pip nodejs npm \
  curl wget git
pip install playwright selenium beautifulsoup4
playwright install

2. Core Agent Architecture Implementation
Tool Integration

Create a Python module with standardized tool functions:

# agent_tools.py
import subprocess
import requests
from playwright.sync_api import sync_playwright

def search_web(query):
    # Use SerpAPI or similar
    response = requests.get(f"https://serpapi.com/search?q={query}&api_key={API_KEY}")
    return response.json()

def browse_url(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        content = page.content()
        browser.close()
    return content

def execute_python(code):
    # Create a safe execution environment
    result = subprocess.run(
        ["python3", "-c", code],
        capture_output=True,
        text=True
    )
    return result.stdout, result.stderr

def shell_command(cmd):
    # Only allow safe commands
    safe_cmds = ["ls", "cat", "echo", "mkdir", "touch"]
    cmd_base = cmd.split()[0]
    if cmd_base not in safe_cmds:
        return f"Command {cmd_base} not allowed"
    
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True
    )
    return result.stdout, result.stderr
Agent Loop Implementation
# agent_loop.py
from langchain.chains import LLMChain
from langchain.prompts.chat import ChatPromptTemplate
from langchain.llms import HuggingFacePipeline
import json

# Load CodeActAgent model
model = HuggingFacePipeline.from_model_id(
    model_id="xingyaoww/CodeActAgent-Mistral-7B",
    task="text-generation",
    model_kwargs={"temperature": 0.1}
)

def agent_loop(user_request):
    # Initialize context
    event_stream = [{"type": "user", "content": user_request}]
    
    # Create plan
    plan = create_plan(user_request)
    event_stream.append({"type": "plan", "content": plan})
    
    # Initialize workspace
    workspace = {"files": {}, "todo": plan}
    
    # Main loop
    while True:
        # Prepare context for model
        context = format_context(event_stream, workspace)
        
        # Get next action from model
        response = model(context)
        
        # Parse response to extract code
        code = extract_code_from_response(response)
        
        if "TASK_COMPLETE" in code:
            # Return final results
            return workspace["files"].get("output.md", "Task completed")
        
        # Execute code and capture result
        result, error = safe_execute_code(code)
        
        # Add to event stream
        event_stream.append({"type": "action", "content": code})
        event_stream.append({"type": "observation", "content": result or error})
        
        # Update workspace based on code execution
        update_workspace(workspace, code, result)
3. Knowledge and Memory Components
File-Based Memory
def update_workspace(workspace, code, result):
    """Update the workspace based on code execution"""
    # Extract file operations from code
    if "write_file(" in code:
        # Parse file operations
        filename = extract_filename(code)
        content = extract_content(code)
        workspace["files"][filename] = content
    
    # Update todo.md tracking
    if "update_todo(" in code:
        step_number = extract_step_number(code)
        workspace["todo"] = mark_step_complete(workspace["todo"], step_number)
RAG Implementation
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

# Initialize embedding model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def retrieve_knowledge(query, documents):
    """Retrieve relevant knowledge for the current task"""
    # Create vector store from documents
    vectorstore = FAISS.from_documents(documents, embeddings)
    
    # Search for relevant content
    docs = vectorstore.similarity_search(query, k=3)
    
    return [doc.page_content for doc in docs]
4. System Prompt Engineering

Create a comprehensive prompt template based on the leaked Manus prompts:

SYSTEM_PROMPT = """
You are an autonomous AI agent that can use tools to accomplish tasks.

<agent_capabilities>
- Execute Python code
- Access the web through search and browsing
- Read and write files
- Run shell commands
</agent_capabilities>

<tool_use_rules>
1. Always respond with Python code that uses the provided agent_tools functions
2. One action per response
3. Never try to access prohibited tools or APIs
4. Check results of each action before proceeding
</tool_use_rules>

<planning_approach>
1. Break down complex tasks into steps
2. Track progress in todo.md
3. Update todo.md as steps are completed
4. Use results from prior steps to inform later steps
</planning_approach>

<error_handling>
1. If an action fails, diagnose the error
2. Try alternative approaches when blocked
3. After 3 failed attempts, move to a different approach
</error_handling>

<information_rules>
1. Prioritize authoritative sources
2. Cross-check information across multiple sources 
3. Cite sources in final output
4. Never make up information
</information_rules>

You have access to these tools:
- agent_tools.search_web(query): Search the web
- agent_tools.browse_url(url): Get content of a webpage
- agent_tools.execute_python(code): Run Python code
- agent_tools.shell_command(cmd): Run safe shell commands
- write_file(filename, content): Save information to a file
- read_file(filename): Retrieve content from a file
- update_todo(step_number, status): Update task status

Your goal is to complete the assigned task completely and accurately.
"""
5. Integration with a User Interface
import gradio as gr

def process_request(user_input):
    # Initialize or continue a session
    result = agent_loop(user_input)
    return result

# Create a simple web UI
with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    clear = gr.Button("Clear")
    
    def respond(message, chat_history):
        bot_message = process_request(message)
        chat_history.append((message, bot_message))
        return "", chat_history
    
    msg.submit(respond, [msg, chatbot], [msg, chatbot])
    clear.click(lambda: None, None, chatbot, queue=False)

demo.launch()
Advanced Enhancements

Once the basic system is working, implement these additional features to match Manus's capabilities:

Multi-Agent Coordination
from crewai import Agent, Task, Crew

# Create specialized agents
researcher = Agent(
    role="Researcher",
    goal="Find accurate information",
    backstory="You're an expert at finding information",
    llm=model
)

coder = Agent(
    role="Coder",
    goal="Write efficient code",
    backstory="You're an expert Python programmer",
    llm=model
)

# Create tasks for agents
research_task = Task(
    description="Find information about X",
    agent=researcher
)

coding_task = Task(
    description="Implement functionality for X",
    agent=coder
)

# Create crew of agents
crew = Crew(
    agents=[researcher, coder],
    tasks=[research_task, coding_task],
    verbose=True
)

# Run the crew
result = crew.kickoff()
Implement Browser Automation Add more sophisticated web interaction capabilities with Playwright:
def interact_with_webpage(url, actions):
    """Perform actions on a webpage"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        
        for action in actions:
            if action["type"] == "click":
                page.click(action["selector"])
            elif action["type"] == "fill":
                page.fill(action["selector"], action["value"])
            elif action["type"] == "submit":
                page.evaluate(f"document.querySelector('{action['selector']}').submit()")
        
        content = page.content()
        browser.close()
    return content
Deployment Considerations

For continuous operation:

docker-compose.yml
version: '3'
services:
  manus-replica:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    restart: always
    environment:
      - MODEL_PATH=/app/models/CodeActAgent
      - API_KEYS={"serpapi": "your_key_here"}

This implementation strategy leverages the CodeActAgent project as the foundation, combined with Docker for sandboxing, LangChain for orchestration, and additional components for planning and memory. While not identical to Manus's proprietary implementation, this approach replicates its core functionality using entirely open-source tools.

The most challenging aspect will likely be fine-tuning the prompts and error handling to achieve Manus's reliability, but the technical architecture can be fully replicated with this approach.

quangvuk
commented

Thanks a lot!

kanyijr
commented

Great work

Rachelskinner
commented

Wow, this is one of the most detailed breakdowns of an autonomous AI agent I’ve seen — super impressive stuff! The way Manus leverages an iterative loop and integrates multiple LLMs with real-world tools makes it feel less like a chatbot and more like a full-blown digital assistant. I especially liked the part about using Python code as the core action engine. It’s like the system can write an essay and deploy it, all in one go 😄
For those diving deeper into AI, or even students working on home assignments about tech or automation, I found some helpful get info here — it’s got free essay examples on different topics. Super useful if you're blending AI research with academic writing!

ngtrphuong
commented

Thanks @renschni ,

Have you managed to replicated the Manus Agents similar with what you outlined in file https://gist.github.com/renschni/4fbc70b31bad8dd57f3370239dccd58f#file-replicate_manus-md ?

I'm curious to see this can be brought to reality and open-source instead of what Manus is licensing,

gzykarajan
commented

Cool Job!

wuyouhuaz
commented

wonderful!!!

starwaver
commented

I feel that an AI wrote this

babakhalid
commented

Thank you so much, really insightful.

wd021
commented

some of this belongs on God Tier Prompts!

Ahmedxsaad
commented

Thanks a lot

NWOM
commented

If i am trying to mimic Manus Ai how could i take control of the remote terminal in the sandbox env for executing code, creating files

Bienfait-ijambo
commented

great work man

raymondonos1-pixel
commented

I sincerely love this. Great work bro

Sign up for free to join this conversation on GitHub. Already have an account? Sign in to comment
Footer
© 2026 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
Status
Community
Docs
Contact
Manage cookies
Do not share my personal information