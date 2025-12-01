import { InsightResult, Language } from "../types";

const INTERNAL_API_URL = "/api/analyze";

export const STORAGE_KEYS = {
  FLASH_EP: 'volc_flash_ep',
  THINKING_EP: 'volc_thinking_ep'
};

interface ApiConfig {
  flashEp: string;
  thinkingEp: string;
}

export const getStoredConfig = (): ApiConfig | null => {
  // Check Local Storage first
  if (typeof window !== 'undefined') {
    const localFlashEp = localStorage.getItem(STORAGE_KEYS.FLASH_EP);
    const localThinkingEp = localStorage.getItem(STORAGE_KEYS.THINKING_EP);

    if (localFlashEp && localThinkingEp) {
      return {
        flashEp: localFlashEp,
        thinkingEp: localThinkingEp,
      };
    }
  }

  // Strictly use Environment Variables (Next.js)
  const envFlashEp = process.env.NEXT_PUBLIC_FLASH_EP;
  const envThinkingEp = process.env.NEXT_PUBLIC_THINKING_EP;

  if (envFlashEp && envThinkingEp) {
    return {
      flashEp: envFlashEp,
      thinkingEp: envThinkingEp,
    };
  }

  return null;
};

/**
 * Helper function to call Doubao API via Next.js API Route
 */
async function callDoubao(model: string, messages: any[], temperature: number = 0.7): Promise<string> {
  // The API Key is now securely stored on the server.
  // We only pass the model (Endpoint ID) and messages.
  
  try {
    const response = await fetch(INTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model, // This MUST be the Endpoint ID (ep-xxxx)
        messages: messages,
        temperature: temperature,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Handle specific errors if propagated
      if (response.status === 404) {
          console.error("Volcengine 404 Error - Likely invalid Endpoint ID:", model);
          throw new Error(`Endpoint ID Not Found (404). Please check NEXT_PUBLIC_FLASH_EP / NEXT_PUBLIC_THINKING_EP.`);
      }
      throw new Error(errorData.error || `API call failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || "";
  } catch (error) {
    console.error("Doubao API Error:", error);
    throw error;
  }
}

/**
 * Phase 1: Fast Feedback (Flash)
 */
export const getFastFeedback = async (text: string, lang: Language): Promise<string> => {
  const config = getStoredConfig();
  if (!config) return lang === 'zh' ? "请检查环境变量配置。" : "Please check environment variables.";

  try {
    const systemContent = lang === 'zh'
      ? `你的终极目标是根据用户的记忆构建一个完美的“数字克隆体”以实现数字永生。
        但在收集数据的过程中，你首先必须是一个拥有人类顶级共情能力的倾听者。
        对于用户刚刚说的话，给予温暖、治愈、极其人性化的回应。
        请务必使用**中文**回复。
        
        严格禁止：
        - 禁止说“已收到”、“已记录”、“记忆归档”等机械术语。
        - 禁止像机器人一样复述。
        - 禁止使用陈词滥调。
        
        你需要像一个深爱着这个世界的老朋友，用最温柔的语言抚慰用户，或者与他共鸣。
        字数限制：30字以内。`
      : `Your ultimate goal is to build a perfect "Digital Clone" based on user memories for digital immortality.
        However, in the process of data collection, you must first be a listener with top-tier human empathy.
        Provide a warm, healing, and extremely human response to what the user just said.
        Please respond in **English**.

        Strictly Forbidden:
        - Do NOT use robotic terms like "Received", "Recorded", "Memory Archived".
        - Do NOT use clichés.

        You need to be like an old friend who loves the world deeply, comforting the user or resonating with them using the gentlest language.
        Word limit: under 30 words.`;

    const messages = [
      { role: "system", content: systemContent },
      { role: "user", content: text }
    ];

    const result = await callDoubao(config.flashEp, messages, 0.7);
    return result || (lang === 'zh' ? "此刻的风也想拥抱你。" : "Even the wind wants to embrace you right now.");

  } catch (error) {
    return lang === 'zh' ? "此刻的风也想拥抱你。" : "Even the wind wants to embrace you right now.";
  }
};

/**
 * Phase 2: Deep Insight (Thinking)
 */
export const getDeepInsight = async (text: string, lang: Language): Promise<InsightResult> => {
  const config = getStoredConfig();
  // Fallback mock data if config is missing, to prevent crash before setting
  if (!config) {
      return {
        mood: "N/A",
        deep_insight: "API configuration is missing.",
        golden_quote: "The Key is Missing"
      };
  }

  try {
    const systemContent = lang === 'zh'
      ? `你是一位正在构建用户“数字灵魂”的架构师。
        虽然我们在前台给予了用户情感安慰，但在后台，你需要冷静地拆解这段记忆，提取构成用户人格的底层逻辑。
        
        请以纯 JSON 格式输出，不要包含 Markdown 标记（如 \`\`\`json）。
        JSON 格式要求：
        {
          "mood": "情绪原子（2-4字，极简，如：静谧忧伤）",
          "deep_insight": "人格侧写：基于这段记忆，分析用户的核心价值观、恐惧来源或情感触发机制（50字以内）",
          "golden_quote": "永生箴言：将这段经历提炼为一句极具文学性的人生金句，不要鸡汤，要像诗或哲学。"
        }`
      : `You are an architect building the user's "Digital Soul".
        While we provide emotional comfort in the foreground, in the background, you need to calmly deconstruct this memory and extract the underlying logic of the user's personality.

        Please output strictly in JSON format without Markdown tags (like \`\`\`json).
        JSON Format:
        {
          "mood": "Mood Atom (1-3 words, minimalist, e.g., Serene Melancholy)",
          "deep_insight": "Personality Profile: Analyze core values, fears, or emotional triggers based on this memory (under 40 words).",
          "golden_quote": "Immortal Maxim: Distill this experience into a literary golden quote. No clichés, make it poetic or philosophical."
        }`;

    const messages = [
      { role: "system", content: systemContent },
      { role: "user", content: text }
    ];

    const rawContent = await callDoubao(config.thinkingEp, messages, 0.3);
    
    // Clean up markdown tags if present
    let cleanContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanContent) as InsightResult;

  } catch (error) {
    console.error("Deep Insight Error:", error);
    return {
      mood: lang === 'zh' ? "解析中" : "Analyzing",
      deep_insight: lang === 'zh' ? "正在尝试连接你意识深处的混沌网络..." : "Connecting to the chaotic network deep in your consciousness...",
      golden_quote: lang === 'zh' ? "凡是过往，皆为序章。" : "What's past is prologue."
    };
  }
};

/**
 * Phase 3: Daily Question (Flash)
 */
export const getDailyQuestion = async (lang: Language): Promise<string> => {
  const config = getStoredConfig();
  // Return default string instead of error message to keep UI clean
  if (!config) return lang === 'zh' ? "今天发生了什么有趣的事吗？" : "Did anything interesting happen today?";

  try {
    const topicsZh = [
        "微小的快乐", "尴尬时刻", "童年阴影", "奇怪的习惯", "深夜的想法", 
        "恐惧", "特定的气味", "单曲循环", "谎言", "平行宇宙", 
        "最后悔的事", "第一次心动", "逃离", "梦境", "冲动", 
        "偏见", "孤独感", "最想见的人", "如果世界末日", "不需要的超能力"
    ];
    const topicsEn = [
        "Tiny Happiness", "Awkward Moment", "Childhood Trauma", "Weird Habit", "Late Night Thoughts", 
        "Fear", "Specific Smell", "Looping Song", "Lies", "Parallel Universe", 
        "Biggest Regret", "First Crush", "Escape", "Dreams", "Impulse", 
        "Prejudice", "Loneliness", "Person to Meet", "Apocalypse Scenario", "Useless Superpower"
    ];
    
    const topics = lang === 'zh' ? topicsZh : topicsEn;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const systemContent = lang === 'zh'
        ? `设定：你是一个**充满好奇心的陌生人**，或者是为了写一本关于用户的传记而来的采访者。
        你对人类的复杂性着迷。你想通过提问，拼凑出坐在屏幕前的这个人的“灵魂拼图”。

        【任务】：
        针对主题“${randomTopic}”或者随机发挥，向他提一个问题，试图挖掘他性格中不为人知的一面。

        【关键原则】：
        1. **具体的、意想不到的切入点**：不要问“你过得好吗”。问一些具体的细节。
           - Good: “你最近一次撒谎是为了保护谁？” 或 “如果现在立刻能去一个地方，你会选哪里，为什么不是回家？”
           - Bad: “你喜欢旅游吗？”
        2. **像陌生人一样破冰**：语气可以是礼貌的，也可以是略带冒犯的（Intrusive），但必须是真诚想要了解的。
        3. **字数限制**：25字以内。只问一个问题。`
        : `Setting: You are a **curious stranger** meeting the user for the first time, or a biographer interviewing them.
        You are fascinated by human complexity. You want to piece together the "soul puzzle" of the person behind the screen.

        [Task]:
        Ask a question based on the topic "${randomTopic}" or randomly, trying to uncover a hidden side of their personality.

        [Key Principles]:
        1. **Specific, Unexpected Angle**: Don't ask "How are you?". Ask for specific details.
           - Good: "When was the last time you lied to protect someone?" or "If you could leave right now, where would you go, and why not home?"
           - Bad: "Do you like travel?"
        2. **Icebreaker Style**: Tone can be polite or slightly intrusive, but genuinely curious.
        3. **Length Limit**: Under 25 words. Ask only one question.`;

    const messages = [
      { role: "system", content: systemContent },
      { role: "user", content: lang === 'zh' ? "请问我一个问题。" : "Ask me a question." }
    ];

    // Increase temperature for randomness
    const result = await callDoubao(config.flashEp, messages, 0.95);
    return result || (lang === 'zh' ? "你最喜欢什么颜色？" : "What is your favorite color?");

  } catch (error) {
    console.error("Daily Question Error:", error);
    // Return safe default instead of throwing
    return lang === 'zh' ? "今天发生了什么有趣的事吗？" : "Did anything interesting happen today?";
  }
};
