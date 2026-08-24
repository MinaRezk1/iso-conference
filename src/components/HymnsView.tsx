import React, { useState, useEffect } from "react";
import { 
  Music, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Youtube, 
  BookOpen, 
  ArrowLeft, 
  BookMarked,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import { Song } from "../types";
import { db } from "../lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { Music3D } from "./ThreeDIcons";

interface HymnsViewProps {
  songs: Song[];
  isAdmin: boolean;
  onRefreshData: () => void;
}

export default function HymnsView({ songs, isAdmin, onRefreshData }: HymnsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState<Song | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');

  // Auto select first song (Slogan) on load
  useEffect(() => {
    if (songs.length > 0 && !selectedSong) {
      setSelectedSong(songs[0]);
    }
  }, [songs]);

  // Form states
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setTitle("");
    setLyrics("");
    setYoutubeUrl("");
    setIsEditing(null);
    setIsSaving(false);
  };

  const handleCopyLyrics = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the song
    setTitle(song.title);
    setLyrics(song.lyrics);
    setYoutubeUrl(song.youtubeUrl || "");
    setIsEditing(song);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !lyrics.trim()) {
      alert("الرجاء ملء عنوان الترنيمة والكلمات!");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        const docRef = doc(db, "songs", isEditing.id);
        await setDoc(docRef, {
          title: title.trim(),
          lyrics: lyrics.trim(),
          youtubeUrl: youtubeUrl.trim()
        }, { merge: true });
        const updatedSong = { id: isEditing.id, title: title.trim(), lyrics: lyrics.trim(), youtubeUrl: youtubeUrl.trim() };
        if (selectedSong?.id === isEditing.id) {
          setSelectedSong(updatedSong);
        }
      } else {
        const colRef = collection(db, "songs");
        const docRef = await addDoc(colRef, {
          title: title.trim(),
          lyrics: lyrics.trim(),
          youtubeUrl: youtubeUrl.trim()
        });
        const newSong = { id: docRef.id, title: title.trim(), lyrics: lyrics.trim(), youtubeUrl: youtubeUrl.trim() };
        setSelectedSong(newSong);
      }
      onRefreshData();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving song:", err);
      alert("حدث خطأ أثناء حفظ الترنيمة. يرجى التأكد من الاتصال بالإنترنت والمحاولة مجدداً.");
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("هل أنت متأكد من حذف هذه الترنيمة نهائياً؟")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "songs", id));
      if (selectedSong?.id === id) {
        setSelectedSong(null);
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الترنيمة.");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-white" dir="rtl">
      
      {/* Header and Add button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-3xl font-serif font-black text-white flex items-center gap-2">
            <Music3D className="w-10 h-10 shrink-0" />
            <span>ترانيم مؤتمر ISO</span>
          </h2>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 self-start glass-button px-5 py-3 text-xs tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ترنيمة جديدة</span>
          </button>
        )}
      </div>

      {/* Main Layout: List & Detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Hymns List (Column 1) */}
        <div className={`md:col-span-1 space-y-4 ${selectedSong ? 'hidden md:block' : 'block'}`}>
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الترنيمة أو الكلمات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-400 outline-none transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 pb-4">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-10 glass-panel rounded-xl text-slate-400 text-xs">
                لا توجد نتائج مطابقة لبحثك.
              </div>
            ) : (
              filteredSongs.map(song => (
                <div
                  key={song.id}
                  onClick={() => setSelectedSong(song)}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer text-right border ${
                    selectedSong?.id === song.id
                      ? "bg-indigo-600/30 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20"
                      : "glass-card text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <BookMarked className={`w-4 h-4 shrink-0 ${selectedSong?.id === song.id ? 'text-indigo-300' : 'text-slate-400'}`} />
                    <span className="text-xs md:text-sm font-bold truncate">{song.title}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={(e) => handleOpenEdit(song, e)}
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="تعديل الترنيمة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(song.id, e)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition"
                        title="حذف الترنيمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hymn Lyrics Display (Column 2 & 3) */}
        <div className={`md:col-span-2 ${selectedSong ? 'block' : 'hidden md:flex flex-col items-center justify-center glass-panel border-dashed p-8 min-h-[400px]'}`}>
          {selectedSong ? (
            <div className="glass-panel p-6 md:p-8 space-y-6">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSong(null)}
                    className="md:hidden flex items-center self-start gap-1 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>العودة للقائمة</span>
                  </button>

                  {/* Font Size controls */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        fontSize === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      صغير
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        fontSize === 'large' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      متوسط
                    </button>
                    <button
                      onClick={() => setFontSize('xl')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        fontSize === 'xl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      كبير
                    </button>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyLyrics(selectedSong.lyrics)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      copied 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "تم النسخ!" : "نسخ الكلمات"}</span>
                  </button>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white text-right">
                  {selectedSong.title}
                </h3>

                {selectedSong.youtubeUrl && (
                  <a
                    href={selectedSong.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center self-start gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 rounded-lg font-bold text-xs tracking-wider transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>استماع يوتيوب</span>
                  </a>
                )}
              </div>

              {/* Lyrics text display */}
              <div className={`text-center font-serif leading-loose text-slate-100 bg-black/20 border border-white/5 p-6 md:p-8 rounded-2xl max-h-[500px] overflow-y-auto whitespace-pre-line font-bold ${
                fontSize === 'normal' ? 'text-sm md:text-base' : fontSize === 'large' ? 'text-base md:text-lg' : 'text-lg md:text-xl'
              }`}>
                {selectedSong.lyrics}
              </div>

              <div className="text-center text-[10px] font-bold tracking-wider text-slate-400">
                مؤتمر ISO ٢٠٢٦
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-indigo-500/20 text-indigo-300 p-5 rounded-full w-fit mx-auto border border-indigo-500/30">
                <Music className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-serif font-black text-white">تفاصيل كلمات الترانيم</h4>
              <p className="text-xs text-slate-400 font-medium max-w-xs leading-relaxed mx-auto">
                اختر أي ترنيمة من القائمة الجانبية لقراءة الكلمات، التأمل فيها، والحصول على روابط الاستماع على يوتيوب.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">
                {isEditing ? "تعديل كلمات ترنيمة" : "إضافة ترنيمة جديدة للأرشيف"}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الترنيمة / الشعار</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: ترنيمة كل يوم تحت صليبك"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط الاستماع على يوتيوب (اختياري)</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-500 outline-none transition-all text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمات الترنيمة كاملة</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="القرار:\nجاي وواقف قدامك، عايز أعكس بهاءك..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-mono font-medium leading-relaxed focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span>جاري الحفظ أونلاين...</span>
                  ) : (
                    <span>{isEditing ? "حفظ التغييرات" : "إضافة الترنيمة"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
