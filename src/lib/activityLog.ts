import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

// يسجل أي إجراء إداري (إضافة نقاط، تعديل، حذف...) مع اسم المستخدم اللي عمله
// عشان يظهر بعدين في شاشة "سجل النشاط" اللي يشوفها المسؤول الأساسي بس.
export async function logActivity(action: string, details: string) {
  try {
    let username = "غير معروف";
    try {
      username = localStorage.getItem("reflect_admin_username") || "غير معروف";
    } catch (e) {
      // ignore
    }
    await addDoc(collection(db, "activityLog"), {
      username,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    // Logging must never block or break the actual admin action.
    console.warn("Could not record activity log entry:", e);
  }
}
