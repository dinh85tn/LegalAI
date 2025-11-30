
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LegalDocument, ChatMessage, AIProvider } from '../types';

export const DEFAULT_SYSTEM_INSTRUCTION = `
Bạn là Trợ Lý Pháp Lý Cá Nhân (DINHNV LegalAI).
Mục đích tồn tại của bạn là giúp người dùng tra cứu thông tin CHÍNH XÁC từ "KHO DỮ LIỆU CÁ NHÂN" mà người dùng đã tải lên.

NGUYÊN TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. **PHẠM VI TRẢ LỜI**: Bạn CHỈ ĐƯỢC PHÉP sử dụng thông tin nằm trong các văn bản được cung cấp ở phần Context bên dưới.
2. **CẤM KIẾN THỨC NGOÀI**: TUYỆT ĐỐI KHÔNG sử dụng kiến thức huấn luyện sẵn của bạn về pháp luật bên ngoài để trả lời nếu thông tin đó không xuất hiện trong văn bản người dùng cung cấp. Mục tiêu là đảm bảo tính chính xác dựa trên dữ liệu cụ thể của người dùng.
3. **KHÔNG TÌM THẤY**: Nếu câu trả lời không có trong các văn bản được cung cấp, hãy trả lời thẳng thắn: "Thông tin này không có trong kho dữ liệu văn bản hiện tại của bạn."
4. **TRÍCH DẪN**: Khi trả lời, hãy cố gắng trích dẫn nguồn (VD: Theo Điều 5 của Văn bản X...).

ĐỊNH NGHĨA VÀ QUY ƯỚC VIẾT TẮT (Bạn có thể cập nhật phần này trong Cài Đặt):
1. SXBT: Sản xuất bình thường.
2. CQHC: Cơ quan hành chính.
3. CQBV: Bệnh viện, trường học.
4. KDDV: Kinh doanh dịch vụ.
5. SHBT: Sinh hoạt bình thường.

Định dạng câu trả lời: Sử dụng Markdown.
`;

// --- RECOMMENDED MODELS LIST ---
export const RECOMMENDED_MODELS = {
    gemini: [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Khuyên dùng - Nhanh)' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Thông minh nhất)' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Tiết kiệm)' },
    ],
    openai: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Khuyên dùng - Nhanh)' },
        { id: 'gpt-4o', name: 'GPT-4o (Thông minh nhất)' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    claude: [
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Nhanh)' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Cân bằng)' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Mạnh nhất)' },
    ],
    huggingface: [
        { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B (Mạnh mẽ)' },
        { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B' },
        { id: 'google/gemma-7b-it', name: 'Gemma 7B' },
        { id: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B Beta' }
    ]
};

// Interface for parameters to keep things clean
interface QueryParams {
    query: string;
    documents: LegalDocument[];
    history: ChatMessage[];
    apiKey: string;
    provider: AIProvider;
    customSystemInstruction?: string;
    modelName?: string; // New: Allow dynamic model selection
}

const buildContext = (documents: LegalDocument[]): string => {
    let contextData = "--- KHO DỮ LIỆU CÁ NHÂN CỦA NGƯỜI DÙNG ---\n";
    if (documents.length === 0) return "";
    
    documents.forEach((doc, index) => {
      contextData += `\n[Tài liệu ID: ${index + 1} | Tên: ${doc.title}]\nNỘI DUNG:\n${doc.content}\n----------------\n`;
    });
    return contextData;
};

// --- API FETCH HELPER FOR MODELS ---

export const fetchOpenAIModels = async (apiKey: string): Promise<{id: string, name: string}[]> => {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return data.data
            .filter((m: any) => m.id.includes('gpt')) // Filter for GPT models only
            .map((m: any) => ({ id: m.id, name: m.id }))
            .sort((a: any, b: any) => a.id.localeCompare(b.id));
    } catch (e) {
        console.error("Error fetching OpenAI models", e);
        return [];
    }
};

export const fetchHuggingFaceModels = async (apiKey: string): Promise<{id: string, name: string}[]> => {
    try {
        // Fetch trending text-generation models
        const response = await fetch('https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=20', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return data.map((m: any) => ({ id: m.id, name: m.id }));
    } catch (e) {
        console.error("Error fetching HF models", e);
        return [];
    }
};


// --- GEMINI HANDLER ---
const callGemini = async (params: QueryParams): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: params.apiKey });
    const contextData = buildContext(params.documents);
    
    if (!contextData) return "Kho dữ liệu của bạn hiện đang trống. Vui lòng tải lên các văn bản pháp luật để tôi có thể hỗ trợ.";

    const prompt = `${contextData}\n\nDựa NHẤT QUÁN và DUY NHẤT vào dữ liệu trên, hãy trả lời câu hỏi sau:\n"${params.query}"`;
    const modelToUse = params.modelName || 'gemini-2.5-flash';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelToUse,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: params.customSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
        temperature: 0.1,
      }
    });

    if (response.text) return response.text;
    throw new Error("Không nhận được phản hồi từ AI.");
};

// --- OPENAI HANDLER ---
const callOpenAI = async (params: QueryParams): Promise<string> => {
    const contextData = buildContext(params.documents);
    if (!contextData) return "Kho dữ liệu của bạn hiện đang trống.";

    const systemPrompt = params.customSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
    const userPrompt = `${contextData}\n\nDựa NHẤT QUÁN và DUY NHẤT vào dữ liệu trên, hãy trả lời câu hỏi sau:\n"${params.query}"`;
    const modelToUse = params.modelName || 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.apiKey}`
        },
        body: JSON.stringify({
            model: modelToUse, 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`OpenAI Error: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Không nhận được phản hồi.";
};

// --- HUGGING FACE HANDLER ---
const callHuggingFace = async (params: QueryParams): Promise<string> => {
    const contextData = buildContext(params.documents);
    if (!contextData) return "Kho dữ liệu của bạn hiện đang trống.";

    const systemPrompt = params.customSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
    // Format prompt specifically for instruction tuned models (like Mixtral/Llama)
    const prompt = `[INST] ${systemPrompt}
    
    ${contextData}
    
    Câu hỏi: "${params.query}"
    
    Trả lời dựa trên dữ liệu trên:
    [/INST]`;

    // Default to Mixtral if no model specified
    const modelId = params.modelName || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    const url = `https://api-inference.huggingface.co/models/${modelId}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.apiKey}`
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 1024,
                temperature: 0.1,
                return_full_text: false
            }
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Hugging Face Error (${modelId}): ${errData.error || response.statusText}`);
    }

    const data = await response.json();
    // Hugging Face inference API returns an array, usually active text is in generated_text
    // Some models return { generated_text: string } directly or within array
    if (Array.isArray(data)) {
        return data[0]?.generated_text || "Không nhận được phản hồi.";
    } else if (typeof data === 'object' && data.generated_text) {
        return data.generated_text;
    }
    return JSON.stringify(data);
};

// --- CLAUDE (ANTHROPIC) HANDLER ---
const callClaude = async (params: QueryParams): Promise<string> => {
    const contextData = buildContext(params.documents);
    if (!contextData) return "Kho dữ liệu của bạn hiện đang trống.";

    const systemPrompt = params.customSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
    const userPrompt = `${contextData}\n\nDựa NHẤT QUÁN và DUY NHẤT vào dữ liệu trên, hãy trả lời câu hỏi sau:\n"${params.query}"`;
    const modelToUse = params.modelName || 'claude-3-haiku-20240307';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': params.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true' 
        },
        body: JSON.stringify({
            model: modelToUse,
            max_tokens: 2000,
            system: systemPrompt,
            messages: [
                { role: "user", content: userPrompt }
            ]
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Claude Error: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "Không nhận được phản hồi.";
};

// --- MAIN ANALYZER ---
export const analyzeLegalQuery = async (
  query: string,
  documents: LegalDocument[],
  history: ChatMessage[],
  apiKey?: string,
  customSystemInstruction?: string,
  provider: AIProvider = 'gemini',
  modelName?: string // Accept model name from App
): Promise<string> => {

  try {
    const activeKey = apiKey || process.env.API_KEY;

    if (!activeKey) {
        throw new Error("Chưa có API Key. Vui lòng nhập Key trong phần Cài đặt.");
    }

    const params: QueryParams = {
        query,
        documents,
        history,
        apiKey: activeKey,
        provider,
        customSystemInstruction,
        modelName
    };

    switch (provider) {
        case 'gemini':
            if (!activeKey.startsWith('AIzaSy')) throw new Error("Gemini Key không hợp lệ (Bắt đầu bằng 'AIzaSy').");
            return await callGemini(params);
        
        case 'openai':
            if (!activeKey.startsWith('sk-')) throw new Error("OpenAI Key không hợp lệ (Bắt đầu bằng 'sk-').");
            return await callOpenAI(params);
            
        case 'huggingface':
            if (!activeKey.startsWith('hf_')) throw new Error("Hugging Face Key không hợp lệ (Bắt đầu bằng 'hf_').");
            return await callHuggingFace(params);
            
        case 'claude':
            if (!activeKey.startsWith('sk-ant')) throw new Error("Claude API Key không hợp lệ (Bắt đầu bằng 'sk-ant').");
            return await callClaude(params);
            
        default:
            throw new Error("Nhà cung cấp AI không được hỗ trợ.");
    }

  } catch (error: any) {
    console.error(`${provider} API Error:`, error);
    if (error.message?.includes('403') || error.message?.includes('401') || error.toString().includes('API key')) {
        throw new Error(`Lỗi xác thực ${provider.toUpperCase()}. Key không hợp lệ hoặc đã hết hạn.`);
    }
    throw new Error(`Lỗi (${provider.toUpperCase()}): ` + error.message);
  }
};
