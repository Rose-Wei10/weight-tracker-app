export function friendlyError(error: unknown, zh = false): string {
  const code = (error as { code?: string })?.code || "";
  if (code.includes("unsafe-goal"))
    return zh
      ? "这个减重目标需要专业人士的个性化建议。可以选择维持目标或调整目标。"
      : "This loss goal needs individualized professional guidance. Choose maintenance or adjust your goal.";
  if (code.includes("failed-precondition"))
    return zh
      ? "AI 需要已验证的邮箱及正确配置的服务和设备验证。请查看设置文档。"
      : "AI needs a verified email and configured service/device attestation. See the setup guide.";
  if (code.includes("resource-exhausted"))
    return zh
      ? "已达到 AI 使用上限，请稍等一分钟或明天再试。"
      : "AI usage limit reached. Wait a minute or try again tomorrow.";
  if (
    code.includes("unauthenticated") ||
    code.includes("requires-recent-login")
  )
    return zh ? "请重新登录后重试。" : "Please sign in again and retry.";
  if (code.includes("permission-denied"))
    return zh
      ? "无法访问数据，请检查账户或安全规则。"
      : "Access denied. Check your account and security rules.";
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return zh
      ? "登录失败，请检查邮箱和密码。"
      : "Sign-in failed. Check your email and password.";
  if (code.includes("network") || code.includes("unavailable"))
    return zh
      ? "暂时无法连接，请检查网络后重试。"
      : "Unable to connect. Check your connection and retry.";
  if (code.includes("already-exists"))
    return zh
      ? "此日期已有记录，请编辑已有记录。"
      : "That date already has an entry. Edit the existing record.";
  return zh
    ? "操作失败，请检查输入并重试。"
    : "Unable to complete this action. Check your input and retry.";
}
