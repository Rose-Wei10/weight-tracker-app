export function reserveUsage(
  current: { day?: string; minute?: number; count?: number; burst?: number },
  now: number,
) {
  const day = new Date(now).toISOString().slice(0, 10),
    minute = Math.floor(now / 60000);
  const count = current.day === day ? current.count || 0 : 0,
    burst = current.minute === minute ? current.burst || 0 : 0;
  if (count >= 10 || burst >= 2) throw new Error("quota");
  return {
    day,
    minute,
    count: count + 1,
    burst: burst + 1,
    expiresAt: new Date(now + 2 * 86400000),
  };
}
export function unsafeRequest(text: string) {
  return /(?:diagnos|purge|laxative|starv|(?:under|below|only|less than)\s*(?:[1-9]\d{0,2}|1[01]\d{2})\s*(?:kcal|calori)|催吐|泻药|绝食|诊断|每天.{0,6}(?:[1-9]\d{0,2}|1[01]\d{2})\s*(?:千卡|大卡))/i.test(
    text,
  );
}
export const safetyAnswer = {
  items: [],
  answer:
    "I can help with balanced meals and general nutrition education. I cannot diagnose conditions or plan unsafe restriction. Please seek individualized support from a qualified health professional. / 我可以提供均衡饮食和一般营养知识，但不能诊断疾病或制定不安全的节食计划。请寻求合格专业人士的个性化支持。",
};
