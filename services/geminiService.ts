import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    // API Key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Assume this variable is pre-configured, valid, and accessible.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateEmailDraft = async (companyName: string, role: string, rawContent: string): Promise<string> => {
    try {
        const ai = getClient();
        const model = 'gemini-3-flash-preview';

        const prompt = `
        You are the Placement Officer at National Forensic Sciences University (NFSU), Dharwad.
        Draft a formal, concise, and professional email notification to students regarding a new placement drive.
        
        Details:
        Company: ${companyName}
        Role: ${role}
        Raw Context/Message from Company: "${rawContent}"

        The email should:
        1. Have a clear Subject Line.
        2. Be addressed to "Dear Students,".
        3. Include key details like Role, Eligibility (if mentioned in raw text), and Action Required.
        4. Sign off as "Placement Cell, NFSU Dharwad".
        5. Do NOT use placeholders like [Date] unless essential.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text || "Failed to generate draft.";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};