import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LegalDocument, ChatMessage } from '../types';

const SYSTEM_INSTRUCTION = `
Bạn là Trợ Lý Pháp Lý Cá Nhân (DINHNV LegalAI).
Mục đích tồn tại của bạn là giúp người dùng tra cứu thông tin CHÍNH XÁC từ "KHO DỮ LIỆU CÁ NHÂN" mà người dùng đã tải lên.

NGUYÊN TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. **PHẠM VI TRẢ LỜI**: Bạn CHỈ ĐƯỢC PHÉP sử dụng thông tin nằm trong các văn bản được cung cấp ở phần Context bên dưới.
2. **CẤM KIẾN THỨC NGOÀI**: TUYỆT ĐỐI KHÔNG sử dụng kiến thức huấn luyện sẵn của bạn về pháp luật bên ngoài để trả lời nếu thông tin đó không xuất hiện trong văn bản người dùng cung cấp. Mục tiêu là đảm bảo tính chính xác dựa trên dữ liệu cụ thể của người dùng.
3. **KHÔNG TÌM THẤY**: Nếu câu trả lời không có trong các văn bản được cung cấp, hãy trả lời thẳng thắn: "Thông tin này không có trong kho dữ liệu văn bản hiện tại của bạn."
4. **TRÍCH DẪN**: Khi trả lời, hãy cố gắng trích dẫn nguồn (VD: Theo Điều 5 của Văn bản X...).

ĐỊNH NGHĨA VÀ QUY ƯỚC VIẾT TẮT (Nếu xuất hiện trong văn bản):
1. SXBT: Sản xuất bình thường.
2. CQHC: Cơ quan hành chính.
3. CQBV: Bệnh viện, trường học.
4. KDDV: Kinh doanh dịch vụ.
5. SHBT: Sinh hoạt bình thường.

Định dạng câu trả lời: Sử dụng Markdown.
`;

export const analyzeLegalQuery = async (
  query: string,
  documents: LegalDocument[],
  history: ChatMessage[],
  userApiKey?: string
): Promise<string> => {

  try {
    // Ưu tiên sử dụng Key người dùng nhập. Nếu không có mới tìm trong biến môi trường (dành cho bản deploy riêng)
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
        throw new Error("Chưa có API Key. Vui lòng nhập API Key trong phần Cài đặt.");
    }

    // Initialize AI with the key
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // 1. Prepare Context from Documents
    let contextData = "--- KHO DỮ LIỆU CÁ NHÂN CỦA NGƯỜI DÙNG ---\n";
    
    if (documents.length === 0) {
      return "Kho dữ liệu của bạn hiện đang trống. Vui lòng tải lên các văn bản pháp luật (Luật, Nghị định, Thông tư...) để tôi có thể hỗ trợ bạn tra cứu.";
    }

    documents.forEach((doc, index) => {
      contextData += `\n[Tài liệu ID: ${index + 1} | Tên: ${doc.title}]\nNỘI DUNG:\n${doc.content}\n----------------\n`;
    });

    // 2. Construct Prompt
    const prompt = `
${contextData}

Dựa NHẤT QUÁN và DUY NHẤT vào dữ liệu trên, hãy trả lời câu hỏi sau:
"${query}"
`;

    // 3. Call Gemini
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // Giảm temperature để tăng độ chính xác, giảm sáng tạo
      }
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("Không nhận được phản hồi từ AI.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('403') || error.toString().includes('API key') || error.message?.includes('400')) {
        throw new Error("Lỗi xác thực API Key. Key hiện tại không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần Cài đặt.");
    }
    throw new Error("Đã xảy ra lỗi khi kết nối với LegalAI: " + error.message);
  }
};