# TalkBase Report-Ready README

This document is intentionally detailed and structured so another AI agent (or student team) can expand it into a 30-40 page academic or project report without re-reading the full codebase.

The structure below follows the requested format:

- 1. INTRODUCTION
- 2. LITERATURE REVIEW
- 3. SYSTEM REQUIREMENT AND ANALYSIS
- 4. TOOLS AND TECHNOLOGY USED
- 5. SYSTEM DESIGN AND ARCHITECTURE
- 6. IMPLEMENTATION AND SNAPSHOTS

## Suggested Pagination Plan (for final report)

Use this mapping while converting to the final report PDF:

- Introduction: pages 1-10
- Literature Review: pages 11-12
- System Requirement and Analysis: pages 13-14
- Tools and Technology Used: pages 15-16
- System Design and Architecture: pages 16-22
- Implementation and Snapshots: pages 23-34
- Testing, limitations, future scope, conclusion, references, appendix: pages 35-40

---

## 1. INTRODUCTION

### 1.1 Problem Statement

Modern teams use multiple kinds of data stores at the same time:

- Relational databases (MySQL/PostgreSQL)
- Flat files (CSV/Excel) for business-side analysis

Most users who need insights from these systems are not experts in SQL or Pandas code. This creates a dependency bottleneck where business users must wait for technical users to write queries.

The core problem solved by TalkBase is:

- Convert natural language (and speech) into safe, executable queries for multiple datasource types
- Execute only read-only operations to prevent accidental data modification
- Return results in a usable structure and generate visualizations
- Keep user sessions/history and support real-time query autocomplete

Key practical challenge in this domain:

- LLMs can generate invalid or unsafe queries
- Different backends require different execution logic
- Multi-tenant systems need strict auth + datasource ownership checks
- Query outputs need to be visualized and optionally exported/shared

TalkBase addresses these with a backend-centric architecture built on FastAPI + agent routing + layered validation.

### 1.2 Objectives

Primary objectives of this project:

1. Build a unified backend API for NL-to-query execution across SQL (MySQL/PostgreSQL) and Pandas (CSV/Excel) datasources.
2. Enforce strict read-only query constraints at agent level.
3. Provide secure user authentication using JWT cookie sessions.
4. Enable datasource onboarding (SQL connect, file upload for Pandas).
5. Support visualization suggestion and chart generation from query results.
6. Support query autocomplete based on datasource schema.
7. Persist query history by session for chat-like workflows.
8. Support export and collaboration features (CSV export, email results, speech-to-text input).

Secondary objectives:

- Keep modules separated for easier extension
- Keep request/response schemas explicit with Pydantic models
- Add test scripts for major capability areas

### 1.3 Applications

Typical applications for TalkBase:

- Business analytics assistant for non-technical users
- Internal data exploration tool for startups and SMB teams
- Educational platform for teaching query concepts using NL input
- Rapid ad-hoc analysis over uploaded CSV/Excel files
- Unified analytics gateway for mixed SQL database + spreadsheet data landscapes

Potential domain usage:

- Sales analytics
- Operations reporting
- Customer behavior analysis
- Inventory and order tracking
- Regional performance dashboards

### 1.4 Existing Solution

Common existing categories:

1. SQL-only conversational BI tools
2. Standalone dashboard tools requiring manual query setup
3. Single-backend LLM demos with weak safety controls

Observed gaps (that TalkBase targets):

- No native multi-backend unification in one NL query endpoint
- Limited query safety guardrails
- Limited extensibility and transparency
- Weak support for Pandas/Excel data workflows
- Minimal built-in support for sessionized chat history and export in one backend

### 1.5 Proposed Solution

TalkBase proposes a modular backend architecture:

- FastAPI service as control plane
- Auth layer for session identity
- Datasource manager for connection metadata
- AI router that dispatches queries by datasource type
- Specialized agents per backend:
  - SQLAgent
  - PandasAgent
- Shared LLM integration (Groq)
- Visualization agent (suggest + generate charts)
- Autocomplete engine (schema-aware + cache)
- History store for session continuity
- Export/speech integrations

Core design principle:

- One user query path, multiple backend-specific executors, and strict read-only safety before execution.

### 1.6 Gantt Chart

Use this implementation-aligned Gantt representation in the report.

```mermaid
gantt
    title TalkBase Development Plan
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements and scope freeze        :done, a1, 2025-10-01, 7d
    Architecture design                  :done, a2, 2025-10-08, 6d
    section Core Backend
    Auth and session middleware          :done, b1, 2025-10-14, 7d
    Datasource onboarding APIs           :done, b2, 2025-10-21, 8d
    AI router and agent skeleton         :done, b3, 2025-10-29, 6d
    SQL/Pandas agent logic               :done, b4, 2025-11-04, 12d
    section AI Features
    LLM integration and query refinement :done, c1, 2025-11-16, 8d
    Autocomplete engine                  :done, c2, 2025-11-24, 6d
    Visualization suggestion/generation  :done, c3, 2025-11-30, 10d
    section UX and Extensions
    Query history and session sidebar    :done, d1, 2025-12-10, 6d
    CSV/email/speech endpoints           :done, d2, 2025-12-16, 7d
    section Validation
    Test scripts and tuning              :done, e1, 2025-12-23, 10d
    Documentation and report prep        :active, e2, 2026-01-03, 8d
```

---

## 2. LITERATURE REVIEW

### 2.1 Literature Survey

This project sits at the intersection of:

- Text-to-query generation
- Conversational analytics
- Multi-datasource data access
- LLM safety and controllability

Survey themes to include in final report:

1. Text-to-SQL benchmarks and methods
2. Conversational BI platforms and limits
3. Agentic architecture for tool execution
4. Data safety and read-only enforcement approaches

Practical synthesis from code-level perspective:

- TalkBase uses prompt-based generation plus deterministic validation.
- It does not trust LLM output directly.
- It introduces iterative refinement (up to 3 passes) after validation or execution errors, with a second LLM acting as a semantic validator.
- It extends beyond SQL by implementing separate execution and validation logic for SQL databases and Pandas (CSV/Excel) files.

Recommended literature pointers for final report references:

- WikiSQL, Spider, BIRD benchmarks
- LangChain agent/tooling patterns
- Prompt engineering for structured output
- Enterprise safe-query systems and database governance

---

## 3. SYSTEM REQUIREMENT AND ANALYSIS

### 3.1 System Analysis

#### 3.1.1 Functional Requirements

Authentication and user management:

- Register user
- Login user
- Set/clear secure session cookie
- Resolve current user from cookie middleware
- Forgot/reset password through an e-mailed, time-limited link

Datasource management:

- Connect to MySQL/PostgreSQL and validate with SELECT 1
- Upload CSV/Excel and validate it loads in Pandas
- List and delete datasources per user

AI query workflows:

- Execute NL query via /ai/query
- Route by datasource type
- Reject questions that are not data-analytical (relevance guardrail)
- Generate SQL/Pandas query via Groq
- Validate read-only (deterministic check + LLM validator) and refine up to 3 times
- Execute and return results
- Persist session history

Analytics augmentation:

- Suggest visualizations from resultset
- Generate requested chart as Plotly JSON
- Provide autocomplete suggestions while typing

Additional utility features:

- Session history list/fetch/delete
- CSV export
- Email results with optional chart image
- Speech-to-text for voice input

#### 3.1.2 Non-Functional Requirements

Security:

- PBKDF2 password hashing
- JWT signed token in HTTP-only cookie
- Datasource ownership validation before query execution
- Password encryption in datasource metadata storage

Reliability:

- Startup Mongo ping and index preparation
- Fallback behavior for autocomplete and chart suggestions
- Structured errors with HTTP status mapping

Performance:

- Cached schema and suggestion generation in autocomplete
- Query result size caps in history persistence and some agent executions

Maintainability:

- Modular folder structure
- Per-domain routers/schemas/stores
- Reusable BaseAgent abstraction

#### 3.1.3 User Roles

- Authenticated end user: connect datasources, ask queries, view history, export/share results
- System maintainer/admin (implicit): configure env vars, monitor logs, tune LLM and datasource settings

#### 3.1.4 Constraints and Assumptions

- Groq API key required for full AI capabilities
- MongoDB required for app metadata and history
- SQL execution requires network-accessible DB and valid credentials
- Pandas mode requires uploadable file and memory capacity

---

## 4. TOOLS AND TECHNOLOGY USED

### 4.1 Tools and Technology

#### 4.1.1 Backend Framework and Runtime

- FastAPI
- Uvicorn
- Python 3.11 virtual environment (observed)

#### 4.1.2 Databases and Data Engines

- MongoDB via PyMongo (users, password_resets, datasources, query_history)
- MySQL via SQLAlchemy + PyMySQL
- PostgreSQL via SQLAlchemy + psycopg2
- Pandas for CSV/Excel query execution context

#### 4.1.3 AI/LLM Stack

- Groq Python SDK
- Primary model: openai/gpt-oss-120b (query generation, relevance check, refinement, chart suggestions, autocomplete)
- Validator model: llama-3.3-70b-versatile (semantic validation of generated queries)
- Speech-to-text: whisper-large-v3

#### 4.1.4 Visualization and Reporting

- Plotly Express + Graph Objects
- Kaleido (for chart image conversion in email flow)

#### 4.1.5 Security and Identity

- Passlib PBKDF2_SHA256
- PyJWT HS256
- Cryptography/Fernet for datasource password encryption

#### 4.1.6 Supporting Libraries (from requirements)

- python-dotenv
- python-multipart
- httpx
- faker
- matplotlib
- langchain (present dependency)

#### 4.1.7 Frontend (for system completeness)

- React + Vite
- Axios API client with credentials
- Route-level protected pages

#### 4.1.8 Development and Testing Assets

- Scripted test files for autocomplete, Excel data, SQL normal-form classification, visualization
- Demo data generators and guides

---

## 5. SYSTEM DESIGN AND ARCHITECTURE

### 5.1 Workflow

![TalkBase workflow](Workflow.png)

*Figure 5.1 - End-to-end runtime workflow (Workflow.png).*

Main runtime workflow:

1. User registers or logs in; the server sets a signed JWT in an HTTP-only cookie.
2. User connects a datasource (MySQL/PostgreSQL connection or CSV/Excel upload) or selects a saved one.
3. User submits a typed question (with schema-aware autocomplete) or a spoken one (Groq Whisper speech-to-text).
4. Backend authenticates the request (AuthMiddleware + require_user) and verifies that the user owns the datasource.
5. AI router dispatches to SQLAgent (mysql / psql) or PandasAgent (CSV / Excel).
6. Agent runs the relevance guardrail (Groq); questions that are not data-analytical are rejected with guidance.
7. Agent extracts schema context.
8. LLM (Groq) generates the SQL or Pandas query.
9. Agent validates it: a deterministic read-only check, then an LLM validator (accepted at confidence >= 0.8); the query is refined and re-checked up to 3 times.
10. Agent executes the query; on an execution error the LLM refines it and execution is retried (up to 3 attempts).
11. Backend persists the exchange in query_history (successes and failures) and returns QueryResponse with the session_id.
12. Frontend displays the result table (or the error message).
13. Optional: visualization suggestions and charts, CSV export, e-mail results, session history.

### 5.2 Data Flow Diagram

![TalkBase data flow diagram](Dataflow.png)

*Figure 5.2 - Data flow between the user, frontend, FastAPI routes, data stores and external services (Dataflow.png).*

Elements in the diagram:

- External entity: the User (browser).
- External services: Groq API (LLM and Whisper), SMTP server, and the user's own MySQL/PostgreSQL database.
- Processes: React frontend, and the FastAPI backend with AuthMiddleware (JWT cookie -> request.state.user) in front of three route groups: /auth, /datasources and /ai.
- Data stores: MongoDB database "talkbase" (users, password_resets, datasources, query_history) and local file storage data/uploads/<user_id>/ for uploaded CSV/Excel files.
- Flow colours: teal = authentication, green = datasources, violet = AI queries, charts, speech and export.

Key flows:

- /auth routes read and write users and password_resets; password-reset links are sent through SMTP.
- /datasources routes read and write datasources (passwords are Fernet-encrypted), save uploaded files to local storage and run a SELECT 1 connection test against the user's SQL database.
- /ai routes read datasource details (and check ownership) from datasources, read uploaded files, inspect the schema and run read-only SELECT statements on the SQL database, call Groq (generation, relevance, validation, chart suggestions, autocomplete, speech), save and read query_history, send CSV (+ chart PNG) through SMTP, and return QueryResponse, Plotly JSON or CSV to the frontend.

### 5.3 ER Diagram

![TalkBase ER diagram](ER%20diagram.png)

*Figure 5.3 - MongoDB collections and their logical relationships (ER diagram.png).*

Collections in the MongoDB database "talkbase" (references are logical; MongoDB does not enforce foreign keys):

| Collection | Purpose | Key fields |
| --- | --- | --- |
| users | Registered accounts | _id, username (unique), email (unique, lower-case), password_hash (PBKDF2-SHA256), created_at |
| password_resets | One-time password-reset tokens | _id, user_id, token_hash (unique, SHA-256), expires_at (TTL index), used, created_at |
| datasources | Saved SQL connections and uploaded files | _id, user_id, type (mysql / psql / pandas), details, created_at, updated_at |
| query_history | One document per question and answer | _id, user_id, session_id, datasource_id, datasource_type, natural_query, generated_query, success, row_count, llm_used, error, results (max 200 rows), columns, created_at |

Relationships:

- users 1 -> 0..* datasources (owns)
- users 1 -> 0..* query_history (asks)
- users 1 -> 0..* password_resets (requests)
- datasources 1 -> 0..* query_history (queried in)

Notes:

- datasources.details embeds either SQL connection settings (type, host, port, database, username, password - Fernet-encrypted) or uploaded-file metadata (filename, path, rows, columns).
- A chat session is not a separate collection: all query_history documents that share a session_id form one session.
- user_id is stored as an ObjectId in datasources and as a string in password_resets and query_history.

### 5.4 UML Diagram

![TalkBase UML class diagram](UML.png)

*Figure 5.4 - Backend class diagram (UML.png).*

Main classes and modules:

- AI Endpoints (ai/router.py): FastAPI controller for the /ai routes; calls AIRouter, VisualizationAgent, QueryAutocomplete, SpeechService, HistoryStore and EmailService.
- AIRouter: chooses the agent by datasource type (mysql / psql -> SQLAgent, pandas -> PandasAgent), loads the datasource through DatasourceStore, verifies ownership and builds the QueryResponse.
- BaseAgent (abstract): shared pipeline - relevance check, generation, validation and refinement loop, execution with retry. Abstract operations: get_schema_context, validate_readonly, execute_query.
- SQLAgent: SQLAlchemy execution for MySQL / PostgreSQL; only SELECT / WITH are allowed; adds a 2NF / 3NF label.
- PandasAgent: loads CSV / Excel into a DataFrame, blocks forbidden patterns and runs the generated code in a restricted namespace.
- VisualizationAgent: suggests and generates Plotly charts (13 chart types).
- QueryAutocomplete: schema-aware suggestions with schema and suggestion caches (5-minute TTL).
- GroqLLM module: relevance classification, generation, refinement, semantic validation (llama-3.3-70b-versatile) and completions (openai/gpt-oss-120b). SpeechService uses Whisper through the same client.
- DatasourceStore, HistoryStore, EmailService: persistence and delivery helpers.
- Pydantic schemas: QueryRequest, QueryResponse, DataSourceType.

Relationships: SQLAgent and PandasAgent inherit from BaseAgent; AIRouter holds one instance of each agent; BaseAgent, VisualizationAgent, QueryAutocomplete and SpeechService depend on the Groq client; AIRouter and QueryAutocomplete depend on DatasourceStore.

### 5.5 Activity Diagram

![TalkBase activity diagram](Activity.png)

*Figure 5.5 - Activity (swimlane) diagram of POST /ai/query (Activity.png).*

Swimlanes: Frontend, API (FastAPI + AIRouter), Agent (SQLAgent / PandasAgent), Groq LLM and Data stores.

Highlights:

- Only an unauthenticated request ends early (401 and redirect to /login).
- Every other failure - datasource not found or not owned, question not data-analytical, validation failed, execution failed after 3 attempts - becomes success = false with an error message; it is still saved to query_history and returned to the UI.
- Two loops: up to 3 refinement iterations while validating, and up to 3 execution attempts in which the query is refined with the execution error.

### 5.6 Sequence Diagram

![TalkBase sequence diagram](sequence.png)

*Figure 5.6 - Sequence of a natural-language query (sequence.png).*

Participants: User, Frontend, FastAPI, AIRouter, Agent, Groq API, Data source and MongoDB.

Message groups (numbers match the diagram):

- 1-6: question entry (optional voice via POST /ai/speech-to-text and Whisper) and Send.
- 7-10: POST /ai/query, JWT check (alt: 401), session_id.
- 11-14: route_query, datasource lookup in MongoDB and ownership check (alt: error response).
- 15-18: process(), relevance classification (alt: not a data question).
- 19-22: schema context and query generation.
- 23-28: validation loop (read-only check, LLM validator, refinement) and the final read-only check.
- 29-32: execution loop (execute, refine on error).
- 33-37: result back to the router, save_history_entry, QueryResponse + session_id to the frontend, rendering.

### 5.7 API Surface Summary (for report appendix)

Authentication endpoints:

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me
- POST /auth/forgot-password
- POST /auth/reset-password

Datasource endpoints:

- GET /datasources/
- POST /datasources/sql/connect
- POST /datasources/pandas/upload
- DELETE /datasources/{datasource_id}

AI endpoints:

- POST /ai/query
- GET /ai/schema/{datasource_id}
- GET /ai/health
- POST /ai/visualize/suggest
- POST /ai/visualize/generate
- POST /ai/autocomplete
- DELETE /ai/autocomplete/cache/{datasource_id}
- GET /ai/history
- GET /ai/history/{session_id}
- DELETE /ai/history/{session_id}
- POST /ai/speech-to-text
- POST /ai/export/csv
- POST /ai/export/email

---

## 6. IMPLEMENTATION AND SNAPSHOTS

### 6.1 System Implementation

This section is implementation-grounded and can be expanded into long-form chapters.

#### 6.1.1 Backend Entry and Boot Lifecycle

Implemented in backend/app.py:

- Loads environment variables
- Configures logging
- Initializes FastAPI app metadata
- Applies conditional CORS middleware
- Applies AuthMiddleware globally
- Registers routers: auth, datasources, ai
- Startup tasks:
  - ping_db()
  - ensure_indexes() for users (unique email, unique username) and password_resets (unique token_hash, TTL on expires_at)
  - Groq client status logging

#### 6.1.2 Authentication and Session Management

Auth stack implementation details:

- Register:
  - Validates payload with Pydantic
  - Hashes password using pbkdf2_sha256
  - Persists user with unique email/username enforcement
- Login:
  - Verifies credentials
  - Issues JWT with sub, iat, exp
  - Stores JWT in HTTP-only cookie
- Middleware:
  - Reads cookie on each request
  - Decodes token
  - Resolves public user and injects request.state.user
- require_user dependency:
  - Enforces auth on protected endpoints
- Password reset:
  - forgot-password always returns a generic response (no account enumeration)
  - Stores only the SHA-256 hash of a random token in password_resets (expires after 30 minutes by default)
  - Sends the reset link through SMTP; reset-password verifies the token, updates the password hash and marks the token used

#### 6.1.3 Datasource Management

SQL onboarding:

- Supports mysql and psql
- Builds SQLAlchemy URL dynamically
- Executes SELECT 1 to validate connectivity
- Saves encrypted credentials in datasources collection

Pandas onboarding:

- Accepts csv/xlsx/xls uploads
- Stores in per-user folder under data/uploads/{user_id}
- Reads via Pandas to validate file integrity
- Stores filename/path/shape/columns as datasource details

#### 6.1.4 Query Execution Pipeline and Agent Behavior

BaseAgent pipeline includes:

- Relevance classification (guardrail)
- Initial query generation
- Validation-driven refinement loop (read-only check plus LLM validator, up to 3 iterations)
- Execution-driven refinement loop (up to 3 attempts)
- Response normalization

SQLAgent behavior:

- Extracts schema from inspector (tables, columns, PK/FK)
- Blocks unsafe SQL keywords and multi-statements
- Executes with SQLAlchemy and serializes values
- Adds a heuristic 2NF / 3NF label (single table vs. joins)

PandasAgent behavior:

- Loads DataFrame from configured file
- Validates against forbidden patterns and AST
- Executes in restricted namespace
- Returns DataFrame/Series/scalar/list as serializable records
- Multi-statement code returns the value of its last expression (or last assigned variable)
- Single rows, grouped Series, period labels and numpy values are normalised into JSON-safe records

#### 6.1.5 Visualization Implementation

Visualization suggestion:

- Converts results to DataFrame
- Analyzes column data types and structure
- Requests ranked chart recommendations from Groq
- Falls back to rule-based suggestions on parse failure

Visualization generation:

- Supports 13 chart types
- Applies optional x/y/group_by/customization inputs
- Returns Plotly JSON + frontend config

#### 6.1.6 Autocomplete Implementation

Autocomplete engine:

- Handles short input with starter suggestions
- Uses schema cache and suggestion cache
- Validates datasource ownership
- Generates NL suggestions with low-latency prompt
- Uses fallback keyword suggestion templates on error

#### 6.1.7 History, Export, and Speech Extensions

History:

- Creates new session_id when absent
- Persists each exchange in query_history
- Lists sessions by latest activity
- Fetches ordered session messages
- Supports session deletion

Export:

- CSV endpoint converts list-of-dicts to download stream
- Email endpoint sends CSV and optional chart image via SMTP

Speech:

- Validates audio content type and size (max 25 MB)
- Uses Groq whisper-large-v3 for transcription
- Auto-translates non-English to English

### 6.2 Snapshots

Use this section as final-report snapshot checklist. Replace placeholders with actual screenshots while writing the final PDF.

#### 6.2.1 UI and Flow Snapshots (Frontend)

Capture these screens:

1. Home page
2. Register page
3. Login page
4. Dashboard showing quick actions and saved datasources
5. SQL datasource setup form
6. Spreadsheet upload setup form
7. Query page with chat panel and session sidebar
8. Query result table rendering
9. Visualization suggestion list and rendered chart
10. Session history load and replay

#### 6.2.2 API and Backend Snapshots

Capture these evidence points:

1. /auth/register success response
2. /auth/login response + cookie set
3. /datasources/sql/connect success
4. /datasources/pandas/upload success
5. /ai/query with SQL datasource
6. /ai/query with Pandas datasource
7. /ai/visualize/suggest response payload
8. /ai/visualize/generate chart JSON payload
9. /ai/autocomplete response in typing flow
10. /ai/history listing and /ai/history/{session_id}
11. /ai/export/csv download
12. /ai/export/email success
13. /ai/speech-to-text transcription result

#### 6.2.3 Database Snapshots

Capture these MongoDB records:

1. users collection sample docs
2. password_resets sample docs (hashed token, expiry)
3. datasources collection sample docs (password encrypted)
4. query_history sample docs with session grouping
5. indexes: users (email unique, username unique) and password_resets (token_hash unique, expires_at TTL)

#### 6.2.4 Test and Validation Snapshots

Capture script outputs for:

- backend/test_autocomplete.py
- backend/test_excel_data.py
- backend/test_sql_normal_form.py
- backend/test_visualization.py

---

## Appendix A: Environment Variables

Mandatory or commonly used:

- AUTH_JWT_SECRET
- AUTH_TOKEN_EXPIRE_MINUTES
- AUTH_REMEMBER_ME_EXPIRE_MINUTES
- AUTH_COOKIE_NAME
- COOKIE_SECURE
- COOKIE_SAMESITE
- GROQ_API_KEY
- MONGO_URI
- MONGO_DB_NAME
- CORS_ORIGINS
- FRONTEND_URL
- PASSWORD_RESET_EXPIRE_MINUTES
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM

---

## Appendix B: Key Data Structures

Auth payloads:

- RegisterRequest: username, email, password
- LoginRequest: email, password
- UserPublic: id, username, email

AI payloads:

- QueryRequest: query, datasource_id, session_id?
- QueryResponse: success, query, generated_query, datasource_type, normal_form, results, columns, row_count, error, llm_used, confidence, session_id
- VisualizationSuggestRequest/Response
- VisualizationGenerateRequest/Response
- AutocompleteRequest/Response
- ExportCSVRequest
- EmailResultsRequest/Response
- SpeechToTextResponse

---

## Appendix C: Known Limitations and Improvement Opportunities

Current technical gaps to mention in report:

1. Static salt is used in datasource credential encryption key derivation.
2. No distributed cache (schema/suggestions are in-memory per instance).
3. No global rate limiting or per-user quota controls.
4. SQL query timeout controls are not explicitly enforced at agent level.
5. No end-to-end automated integration tests across full stack in one run.
6. Frontend and backend may evolve with route contract drift; API client has legacy helper entries not directly used by backend routes.

Future enhancements:

1. Redis cache for autocomplete and schema metadata.
2. Centralized secrets management for encryption and JWT keys.
3. Per-datasource query timeout and cost controls.
4. Structured observability (metrics + tracing).
5. Stronger policy engine for query governance.
6. Streaming partial responses for long-running query generation.

---

## Appendix D: Report Writing Instructions for Next AI Agent

When expanding this into 30-40 pages:

1. Keep section numbering exactly aligned with chapter headings in this file.
2. Convert each subsection into:
   - Concept explanation
   - Code mapping
   - Data examples
   - Diagram explanation
   - Critical analysis
3. Add at least 2-3 pages of evaluation and discussion:
   - Correctness examples per datasource type
   - Failure case handling
   - Security analysis
4. Include a references section with at least 10 citations.
5. Add screenshot evidence for every item in section 6.2.

This file is the technical source blueprint for the final report.
