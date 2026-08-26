// تشفير كلمات المرور باستخدام SHA-256 عن طريق Web Crypto API المدمجة في المتصفح.
// ملحوظة مهمة: التشفير ده بيمنع إن كلمة السر تبقى ظاهرة كنص صريح في قاعدة
// البيانات، لكنه مش بديل عن تحقق حقيقي من طرف السيرفر (زي Firebase Authentication).
// شخص متمرس تقنيًا يقدر يتجاوز شاشة الدخول عن طريق التعامل المباشر مع قاعدة
// البيانات. الاستخدام المناسب هنا هو لتطبيقات بسيطة منخفضة الحساسية فقط.

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
