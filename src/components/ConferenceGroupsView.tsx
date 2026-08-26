import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  ArrowRightLeft, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles, 
  Check, 
  ShieldAlert,
  RotateCcw,
  User,
  Crown
} from "lucide-react";
import { ConferenceGroup, ConferenceMember, PersonRole } from "../types";
import { db } from "../lib/firebase";
import { doc, updateDoc, setDoc, writeBatch, collection } from "firebase/firestore";
import { INITIAL_CONFERENCE_GROUPS } from "../lib/seedData";
import { logActivity } from "../lib/activityLog";
import { ROLE_OPTIONS, roleLabel, isServantRole } from "../lib/roles";

interface ConferenceGroupsViewProps {
  groups: ConferenceGroup[];
  isAdmin: boolean;
  onRefreshData?: () => void;
}

export default function ConferenceGroupsView({ groups, isAdmin, onRefreshData }: ConferenceGroupsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");

  // Modals
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [addMemberName, setAddMemberName] = useState<string>("");
  const [addMemberGroupId, setAddMemberGroupId] = useState<string>("g1");
  const [addMemberRole, setAddMemberRole] = useState<PersonRole>("makhdoom");

  const [moveMemberData, setMoveMemberData] = useState<{
    sourceGroup: ConferenceGroup;
    member: ConferenceMember;
  } | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string>("");

  const [editMemberData, setEditMemberData] = useState<{
    group: ConferenceGroup;
    member: ConferenceMember;
  } | null>(null);
  const [editMemberName, setEditMemberName] = useState<string>("");
  const [editMemberRole, setEditMemberRole] = useState<PersonRole>("makhdoom");

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Group stats
  const totalMembersCount = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.members?.length || 0), 0);
  }, [groups]);

  // Search filter
  const filteredGroups = useMemo(() => {
    let result = groups;

    if (selectedGroupFilter !== "all") {
      result = result.filter(g => g.id === selectedGroupFilter);
    }

    if (!searchTerm.trim()) return result;

    const query = searchTerm.toLowerCase().trim();
    return result.map(g => {
      const matchingMembers = g.members?.filter(m => m.name.toLowerCase().includes(query)) || [];
      return {
        ...g,
        members: matchingMembers
      };
    }).filter(g => g.members.length > 0 || g.name.toLowerCase().includes(query) || g.code.toLowerCase().includes(query));
  }, [groups, selectedGroupFilter, searchTerm]);

  // Handle Add Member
  const handleSaveNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!addMemberName.trim()) return;

    setActionLoading(true);
    try {
      const targetGroup = groups.find(g => g.id === addMemberGroupId);
      if (!targetGroup) return;

      const newMember: ConferenceMember = {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: addMemberName.trim(),
        role: addMemberRole
      };

      const updatedMembers = [...(targetGroup.members || []), newMember];
      const docRef = doc(db, "conferenceGroups", targetGroup.id);
      await setDoc(docRef, { ...targetGroup, members: updatedMembers }, { merge: true });

      logActivity(
        "إضافة عضو لمجموعة",
        `${newMember.name} (${roleLabel(addMemberRole)}) لـ ${targetGroup.name}`
      );

      setAddMemberName("");
      setAddMemberRole("makhdoom");
      setShowAddMember(false);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error adding group member:", err);
      alert("حدث خطأ أثناء إضافة العضو.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Move Member (Transfer between groups)
  const handleOpenMoveModal = (group: ConferenceGroup, member: ConferenceMember) => {
    setMoveMemberData({ sourceGroup: group, member });
    // Default target group to first other group
    const otherGroup = groups.find(g => g.id !== group.id);
    setTargetGroupId(otherGroup?.id || "g1");
  };

  const handleConfirmMoveMember = async () => {
    if (!isAdmin) return;
    if (!moveMemberData || !targetGroupId) return;
    if (moveMemberData.sourceGroup.id === targetGroupId) {
      alert("العضو موجود بالفعل في هذه المجموعة!");
      return;
    }

    setActionLoading(true);
    try {
      const sourceGroup = moveMemberData.sourceGroup;
      const targetGroup = groups.find(g => g.id === targetGroupId);

      if (!targetGroup) return;

      // Remove from source group
      const newSourceMembers = sourceGroup.members.filter(m => m.id !== moveMemberData.member.id);
      
      // Add to target group
      const newTargetMembers = [...(targetGroup.members || []), moveMemberData.member];

      // Update both documents in Firestore batch
      const batch = writeBatch(db);
      const sourceRef = doc(db, "conferenceGroups", sourceGroup.id);
      const targetRef = doc(db, "conferenceGroups", targetGroup.id);

      batch.set(sourceRef, { ...sourceGroup, members: newSourceMembers }, { merge: true });
      batch.set(targetRef, { ...targetGroup, members: newTargetMembers }, { merge: true });

      await batch.commit();

      logActivity(
        "نقل عضو بين مجموعات",
        `${moveMemberData.member.name} من ${sourceGroup.name} إلى ${targetGroup.name}`
      );

      setMoveMemberData(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error moving group member:", err);
      alert("حدث خطأ أثناء نقل العضو.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Member Name
  const handleOpenEditModal = (group: ConferenceGroup, member: ConferenceMember) => {
    setEditMemberData({ group, member });
    setEditMemberName(member.name);
    setEditMemberRole(member.role || "makhdoom");
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!editMemberData || !editMemberName.trim()) return;

    setActionLoading(true);
    try {
      const group = editMemberData.group;
      const updatedMembers = group.members.map(m => {
        if (m.id === editMemberData.member.id) {
          return { ...m, name: editMemberName.trim(), role: editMemberRole };
        }
        return m;
      });

      const docRef = doc(db, "conferenceGroups", group.id);
      await setDoc(docRef, { ...group, members: updatedMembers }, { merge: true });

      logActivity(
        "تعديل بيانات عضو",
        `${editMemberName.trim()} (${roleLabel(editMemberRole)}) في ${group.name}`
      );

      setEditMemberData(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error editing member name:", err);
      alert("حدث خطأ أثناء تعديل الاسم.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async (group: ConferenceGroup, member: ConferenceMember) => {
    if (!isAdmin) return;
    if (!window.confirm(`هل أنت أؤكد حذف "${member.name}" من ${group.name}؟`)) return;

    setActionLoading(true);
    try {
      const updatedMembers = group.members.filter(m => m.id !== member.id);
      const docRef = doc(db, "conferenceGroups", group.id);
      await setDoc(docRef, { ...group, members: updatedMembers }, { merge: true });

      logActivity("حذف عضو من مجموعة", `${member.name} من ${group.name}`);

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error deleting member:", err);
      alert("حدث خطأ أثناء حذف العضو.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset to original PDF list
  const handleResetToDefault = async () => {
    if (!isAdmin) return;
    setActionLoading(true);
    try {
      const batch = writeBatch(db);
      for (const cg of INITIAL_CONFERENCE_GROUPS) {
        const ref = doc(db, "conferenceGroups", cg.id);
        batch.set(ref, cg);
      }
      await batch.commit();
      setShowResetConfirm(false);
      if (onRefreshData) onRefreshData();
      alert("تمت إعادة توزيع المجموعات إلى القائمة الأصلية بنجاح!");
    } catch (err) {
      console.error("Error resetting conference groups:", err);
      alert("حدث خطأ أثناء إعادة التعيين.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-black mb-3">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>تقسيم مجموعات مؤتمر ISO 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              توزيع مجموعات الأولاد (G1 - G4)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-2xl font-medium">
              توزيع الأولاد في الورش والدراسات اليومية للمؤتمر. يمكنك البحث باسم الولد، أو نقل أي عضو بين المجموعات بسهولة.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => {
                  setAddMemberGroupId(groups[0]?.id || "g1");
                  setAddMemberName("");
                  setAddMemberRole("makhdoom");
                  setShowAddMember(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة عضو جديد</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                title="إعادة التوزيع إلى القائمة الأصلية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">إجمالي الأولاد</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">{totalMembersCount} ولد</span>
          </div>

          {groups.map((g) => (
            <div 
              key={g.id} 
              onClick={() => setSelectedGroupFilter(selectedGroupFilter === g.id ? "all" : g.id)}
              className={`border rounded-2xl p-3 text-center cursor-pointer transition-all ${
                selectedGroupFilter === g.id 
                  ? "bg-indigo-500/20 border-indigo-400 shadow-md scale-102" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block truncate">{g.code}</span>
              <span className="text-base sm:text-lg font-black text-white mt-0.5 block">{g.members?.length || 0} عضو</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن اسم ولد لتحديد مجموعته (مثال: أبانوب، يوسف، مينا)..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedGroupFilter("all")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedGroupFilter === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            الكل ({totalMembersCount})
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroupFilter(selectedGroupFilter === g.id ? "all" : g.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                selectedGroupFilter === g.id
                  ? "bg-slate-800 text-white border-indigo-400 shadow-md"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {g.code} ({g.members?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Conference Groups Grid (G1 - G4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGroups.map((group) => {
          const isHighlighted = searchTerm.trim().length > 0;

          return (
            <div
              key={group.id}
              className={`bg-slate-900/80 backdrop-blur-xl border rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                group.borderColor || "border-slate-800"
              }`}
            >
              <div>
                {/* Group Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-lg shrink-0"
                      style={{ backgroundColor: group.color || "#6366f1" }}
                    >
                      {group.code}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        {group.name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        عدد الأعضاء الحالي: <span className="text-amber-400">{group.members?.length || 0} فرد</span>
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                  <button
                    onClick={() => {
                      setAddMemberGroupId(group.id);
                      setAddMemberName("");
                      setAddMemberRole("makhdoom");
                      setShowAddMember(true);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="إضافة عضو لهذه المجموعة"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إضافة عضو</span>
                  </button>
                  )}
                </div>

                {/* Members List */}
                <div className="mt-4 space-y-2">
                  {group.members && group.members.length > 0 ? (
                    group.members.map((member, idx) => {
                      const isMatch = searchTerm.trim() && member.name.toLowerCase().includes(searchTerm.toLowerCase().trim());

                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isMatch
                              ? "bg-amber-500/20 border-amber-400/80 shadow-lg shadow-amber-500/10 scale-101"
                              : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className={`text-xs sm:text-sm font-bold block truncate ${
                                isMatch ? "text-amber-300 font-extrabold" : "text-slate-100"
                              }`}>
                                {member.name}
                              </span>
                              {member.role && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold inline-block mt-0.5 ${
                                  isServantRole(member.role)
                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                    : "bg-white/10 text-slate-400 border-white/10"
                                }`}>
                                  {roleLabel(member.role)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Member Actions */}
                          {isAdmin && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Transfer Button */}
                            <button
                              onClick={() => handleOpenMoveModal(group, member)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                              title="نقل إلى مجموعة أخرى"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span>نقل</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(group, member)}
                              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="تعديل الاسم"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteMember(group, member)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="حذف العضو"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                      <p className="text-xs text-slate-500 font-bold">لا يوجد أولاد في هذه المجموعة حالياً.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Group Footer */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>ISO Conference 2026</span>
                <span className="text-indigo-400/80">{group.code}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 animate-scale-up">
            <button
              onClick={() => setShowAddMember(false)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">إضافة عضو جديد للمجموعة</h3>
                <p className="text-xs text-slate-400 mt-0.5">أدخل الاسم واختر الدور والمجموعة المستهدفة</p>
              </div>
            </div>

            <form onSubmit={handleSaveNewMember} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">الاسم بالكامل</label>
                <input
                  type="text"
                  value={addMemberName}
                  onChange={(e) => setAddMemberName(e.target.value)}
                  placeholder="مثال: ديفيد هاني"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">الدور / الصفة</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAddMemberRole(opt.value)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        addMemberRole === opt.value
                          ? isServantRole(opt.value)
                            ? "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-lg shadow-violet-500/20"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20"
                          : "bg-black/20 border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">المجموعة</label>
                <select
                  value={addMemberGroupId}
                  onChange={(e) => setAddMemberGroupId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.members?.length || 0} عضو)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "جاري الحفظ..." : "حفظ العضو"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move / Transfer Member Modal */}
      {moveMemberData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 animate-scale-up">
            <button
              onClick={() => setMoveMemberData(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">نقل عضو بين المجموعات</h3>
                <p className="text-xs text-slate-400 mt-0.5">تغيير مجموعة الولد وتحديث القوائم فوراً</p>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">الولد المراد نقله</span>
                <span className="text-base font-black text-amber-400 block mt-1">{moveMemberData.member.name}</span>
                <span className="text-xs text-slate-400 block mt-1">المجموعة الحالية: <strong className="text-white">{moveMemberData.sourceGroup.name}</strong></span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">اختر المجموعة الجديدة</label>
                <div className="grid grid-cols-2 gap-2">
                  {groups.map((g) => {
                    const isCurrent = g.id === moveMemberData.sourceGroup.id;
                    const isSelected = g.id === targetGroupId;

                    return (
                      <button
                        key={g.id}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setTargetGroupId(g.id)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? "bg-slate-950/40 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-indigo-600/20 border-indigo-400 text-white shadow-md shadow-indigo-600/10"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span className="text-xs font-black block">{g.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 block mt-1">
                          {isCurrent ? "المجموعة الحالية" : `${g.members?.length || 0} عضو`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleConfirmMoveMember}
                  disabled={actionLoading || targetGroupId === moveMemberData.sourceGroup.id}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "جاري النقل..." : "تأكيد نقل العضو 🔄"}
                </button>
                <button
                  type="button"
                  onClick={() => setMoveMemberData(null)}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMemberData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 animate-scale-up">
            <button
              onClick={() => setEditMemberData(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">تعديل اسم الولد</h3>
                <p className="text-xs text-slate-400 mt-0.5">تعديل أي خطأ مطبعي في اسم العضو</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">الاسم المعدل</label>
                <input
                  type="text"
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">الدور / الصفة</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditMemberRole(opt.value)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        editMemberRole === opt.value
                          ? isServantRole(opt.value)
                            ? "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-lg shadow-violet-500/20"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20"
                          : "bg-black/20 border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "جاري التعديل..." : "تحديث البيانات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMemberData(null)}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">إعادة تعيين القائمة الأصلية؟</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
              سيتم إعادة توزيع المجموعات الاربعة (G1 - G4) وحفظ الـ 32 اسماً الأصلية كما وردت في مستند المؤتمر.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={handleResetToDefault}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "جاري الاستعادة..." : "تأكيد الاستعادة الأصلية"}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
