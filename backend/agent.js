/**
 * LangGraph AI Agent System
 * Provides structured processing with state management and controllable workflows
 */

const { ChatGroq } = require('@langchain/groq');
const { StateGraph, END } = require('@langchain/langgraph');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { getPersonality, buildSystemPrompt } = require('./personality-config');

/**
 * Define the agent state structure
 */
class AgentState {
    constructor() {
        this.messages = [];
        this.userQuery = '';
        this.searchResults = [];
        this.sources = [];
        this.analysis = null;
        this.finalAnswer = '';
        this.confidence = 0.5;
        this.metadata = {};
        this.error = null;
    }
}

/**
 * LangGraph-based AI Agent
 */
class DocumentAgent {
    constructor(apiKey, options = {}) {
        this.llm = new ChatGroq({
            apiKey: apiKey,
            model: 'llama-3.3-70b-versatile',
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 1500
        });

        // Set personality
        this.personalityType = options.personality || 'government_professional';
        this.personality = getPersonality(this.personalityType);
        this.customInstructions = options.customInstructions || '';

        this.graph = this.buildGraph();
        this.searchHandler = null;
    }

    /**
     * Set agent personality
     */
    setPersonality(personalityType, customInstructions = '') {
        this.personalityType = personalityType;
        this.personality = getPersonality(personalityType);
        this.customInstructions = customInstructions;
        console.log(`[Agent] Personality set to: ${this.personality.name}`);
    }

    /**
     * Set external document search handler
     */
    setSearchHandler(handler) {
        this.searchHandler = handler;
    }

    /**
     * Build the LangGraph workflow
     */
    buildGraph() {
        const workflow = new StateGraph({
            channels: {
                messages: {
                    value: (x, y) => x.concat(y),
                    default: () => []
                },
                userQuery: {
                    value: (x, y) => y ?? x,
                    default: () => ''
                },
                searchResults: {
                    value: (x, y) => y ?? x,
                    default: () => []
                },
                sources: {
                    value: (x, y) => y ?? x,
                    default: () => []
                },
                analysis: {
                    value: (x, y) => y ?? x,
                    default: () => null
                },
                finalAnswer: {
                    value: (x, y) => y ?? x,
                    default: () => ''
                },
                confidence: {
                    value: (x, y) => y ?? x,
                    default: () => 0.5
                },
                metadata: {
                    value: (x, y) => ({ ...x, ...y }),
                    default: () => ({})
                },
                error: {
                    value: (x, y) => y ?? x,
                    default: () => null
                }
            }
        });

        // Add nodes
        workflow.addNode('analyze_query', this.analyzeQuery.bind(this));
        workflow.addNode('search_documents', this.searchDocuments.bind(this));
        workflow.addNode('generate_response', this.generateResponse.bind(this));
        workflow.addNode('validate_output', this.validateOutput.bind(this));
        workflow.addNode('format_response', this.formatResponse.bind(this));

        // Define the graph flow
        workflow.setEntryPoint('analyze_query');

        // Conditional edge from analyze_query
        workflow.addConditionalEdges(
            'analyze_query',
            this.shouldSearch.bind(this),
            {
                'search': 'search_documents',
                'direct': 'generate_response'
            }
        );

        workflow.addEdge('search_documents', 'generate_response');
        workflow.addEdge('generate_response', 'validate_output');
        workflow.addEdge('validate_output', 'format_response');
        workflow.addEdge('format_response', END);

        return workflow.compile();
    }

    /**
     * Process a query through the agent
     */
    async processQuery(userQuery, context = {}) {
        try {
            const initialState = {
                userQuery: userQuery,
                searchResults: context.searchResults || [],
                sources: context.sources || [],
                messages: [],
                metadata: {
                    startTime: Date.now(),
                    model: 'llama-3.3-70b-versatile',
                    provider: 'groq'
                }
            };

            const result = await this.graph.invoke(initialState);

            return {
                success: true,
                answer: result.finalAnswer,
                sources: result.sources,
                confidence: result.confidence,
                metadata: result.metadata,
                tokenCount: result.metadata.totalTokens || 0
            };
        } catch (error) {
            console.error('Agent processing error:', error);
            return {
                success: false,
                answer: 'I encountered an error processing your request. Please try again.',
                sources: [],
                confidence: 0,
                metadata: { error: error.message }
            };
        }
    }

    /**
     * Node: Analyze the user query
     */
    async analyzeQuery(state) {
        console.log('[Agent] Analyzing query...');

        const systemPrompt = `${this.personality.analysisPrompt}

Analyze the user's query and provide:
1. Query type (factual, procedural, comparison, summarization, etc.)
2. Whether document search is needed
3. Key search terms if needed
4. Expected response format

Respond in JSON format:
{
    "queryType": "type",
    "needsSearch": true/false,
    "searchTerms": ["term1", "term2"],
    "responseFormat": "paragraph/bullet_points/numbered_list"
}`;

        try {
            const messages = [
                new SystemMessage(systemPrompt),
                new HumanMessage(state.userQuery)
            ];

            const response = await this.llm.invoke(messages);
            const content = response.content;

            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            let analysis;

            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                analysis = {
                    queryType: 'general',
                    needsSearch: true,
                    searchTerms: [],
                    responseFormat: 'paragraph'
                };
            }

            return {
                ...state,
                analysis: analysis,
                messages: state.messages.concat([response]),
                metadata: {
                    ...state.metadata,
                    analysisTokens: response.response_metadata?.tokenUsage?.totalTokens || 0
                }
            };
        } catch (error) {
            console.error('Analysis error:', error);
            return {
                ...state,
                analysis: {
                    queryType: 'general',
                    needsSearch: true,
                    searchTerms: [],
                    responseFormat: 'paragraph'
                }
            };
        }
    }

    /**
     * Decision: Should we search documents?
     */
    shouldSearch(state) {
        // If we already have search results from context, skip search
        if (state.searchResults && state.searchResults.length > 0) {
            return 'direct';
        }

        // If analysis says we need search and we have a handler
        if (state.analysis?.needsSearch && this.searchHandler) {
            return 'search';
        }

        return 'direct';
    }

    /**
     * Node: Search documents
     */
    async searchDocuments(state) {
        console.log('[Agent] Searching documents...');

        if (!this.searchHandler) {
            return state;
        }

        try {
            const searchTerms = state.analysis?.searchTerms || [state.userQuery];
            const query = searchTerms.join(' ');

            const results = await this.searchHandler(query);

            return {
                ...state,
                searchResults: results.results || [],
                sources: results.sources || []
            };
        } catch (error) {
            console.error('Search error:', error);
            return {
                ...state,
                searchResults: [],
                sources: []
            };
        }
    }

    /**
     * Node: Generate response
     */
    async generateResponse(state) {
        console.log('[Agent] Generating response...');

        const contextText = state.searchResults
            .map(r => r.text || r)
            .join('\n\n');

        const hasContext = contextText.length > 0;

        // Build system prompt with personality
        let systemPrompt = buildSystemPrompt(this.personality, this.customInstructions);

        // Add context-specific instructions
        systemPrompt += `\n\nCRITICAL TASK INSTRUCTIONS:
1. ${hasContext ? 'Base your answer ONLY on the provided context from the knowledge base' : 'Provide a helpful response - no specific context available'}
2. ${hasContext ? 'If the context does not contain sufficient information, explicitly state this' : 'Clearly indicate you are providing general guidance'}
3. Do not make assumptions beyond the provided information
4. Maintain consistency with your personality and communication style

${hasContext ? `\n=== CONTEXT FROM KNOWLEDGE BASE ===\n${contextText}\n=== END CONTEXT ===` : '\n[No specific context available - provide general guidance based on your knowledge]'}`;

        try {
            const messages = [
                new SystemMessage(systemPrompt),
                new HumanMessage(state.userQuery)
            ];

            const response = await this.llm.invoke(messages);

            return {
                ...state,
                finalAnswer: response.content,
                messages: state.messages.concat([response]),
                metadata: {
                    ...state.metadata,
                    responseTokens: response.response_metadata?.tokenUsage?.totalTokens || 0,
                    totalTokens: (state.metadata.analysisTokens || 0) +
                                (response.response_metadata?.tokenUsage?.totalTokens || 0)
                }
            };
        } catch (error) {
            console.error('Generation error:', error);
            return {
                ...state,
                finalAnswer: 'Unable to generate response. Please try again.',
                error: error.message
            };
        }
    }

    /**
     * Node: Validate output
     */
    async validateOutput(state) {
        console.log('[Agent] Validating output...');

        let confidence = 0.5;

        // Increase confidence if we have sources
        if (state.sources && state.sources.length > 0) {
            confidence += 0.2;
        }

        // Increase confidence if response is substantial
        if (state.finalAnswer && state.finalAnswer.length > 100) {
            confidence += 0.1;
        }

        // Check for uncertainty indicators
        const uncertaintyPhrases = [
            'not sure', 'unclear', 'might', 'possibly', 'perhaps',
            'i don\'t have', 'cannot find', 'no information'
        ];

        const lowerAnswer = state.finalAnswer.toLowerCase();
        const hasUncertainty = uncertaintyPhrases.some(phrase =>
            lowerAnswer.includes(phrase)
        );

        if (hasUncertainty) {
            confidence -= 0.2;
        }

        // Increase confidence if answer directly addresses the query
        const queryWords = state.userQuery.toLowerCase().split(/\s+/);
        const answerWords = state.finalAnswer.toLowerCase().split(/\s+/);
        const overlap = queryWords.filter(word =>
            word.length > 3 && answerWords.includes(word)
        ).length;

        if (overlap > 2) {
            confidence += 0.1;
        }

        confidence = Math.max(0, Math.min(1, confidence));

        return {
            ...state,
            confidence: confidence,
            metadata: {
                ...state.metadata,
                validated: true,
                uncertaintyDetected: hasUncertainty
            }
        };
    }

    /**
     * Node: Format response
     */
    async formatResponse(state) {
        console.log('[Agent] Formatting response...');

        // Clean up the answer
        let formatted = state.finalAnswer.trim();

        // Remove markdown formatting while preserving structure
        formatted = this.removeMarkdown(formatted);

        // Remove excessive whitespace
        formatted = formatted.replace(/\n{3,}/g, '\n\n');

        // Ensure proper spacing after punctuation
        formatted = formatted.replace(/([.!?])([A-Z])/g, '$1 $2');

        // Add metadata about formatting
        const hasLists = /^[\s]*[-•*]\s/m.test(formatted) || /^\s*\d+\.\s/m.test(formatted);
        const hasSections = /^#{1,6}\s/m.test(formatted) || /^[A-Z][^.!?]*:$/m.test(formatted);
        const wordCount = formatted.split(/\s+/).length;

        return {
            ...state,
            finalAnswer: formatted,
            metadata: {
                ...state.metadata,
                endTime: Date.now(),
                processingTime: Date.now() - state.metadata.startTime,
                formatting: {
                    hasLists,
                    hasSections,
                    wordCount,
                    characterCount: formatted.length
                }
            }
        };
    }

    /**
     * Remove markdown formatting from text
     */
    removeMarkdown(text) {
        let cleaned = text;

        // Remove bold/italic markers (**text** or *text* or __text__ or _text_)
        cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // Bold + Italic
        cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');     // Bold
        cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');         // Italic
        cleaned = cleaned.replace(/___(.+?)___/g, '$1');       // Bold + Italic
        cleaned = cleaned.replace(/__(.+?)__/g, '$1');         // Bold
        cleaned = cleaned.replace(/_(.+?)_/g, '$1');           // Italic

        // Remove headers (# Header)
        cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1');

        // Remove inline code (`code`)
        cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

        // Remove code blocks (```code```)
        cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

        // Remove links but keep text [text](url)
        cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        // Remove images ![alt](url)
        cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

        // Remove strikethrough ~~text~~
        cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');

        // Remove horizontal rules (---, ***, ___)
        cleaned = cleaned.replace(/^[-*_]{3,}\s*$/gm, '');

        // Remove blockquotes (> text)
        cleaned = cleaned.replace(/^>\s+/gm, '');

        // Clean up any remaining backticks
        cleaned = cleaned.replace(/`/g, '');

        // Remove extra spaces that might have been left
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Restore proper line breaks
        cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');

        return cleaned.trim();
    }
}

module.exports = DocumentAgent;
