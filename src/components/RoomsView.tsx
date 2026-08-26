import React, { useState } from "react";
import { 
  Home, 
  Search, 
  Plus, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  X, 
  Users, 
  Building, 
  User, 
  Info,
  Layers,
  Sparkles,
  Edit3,
  ArrowRightLeft,
  Eraser,
  Sliders,
  BedDouble
} from "lucide-react";
import { Room, Occupant } from "../types";
import { db } from "../lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc, writeBatch } from "firebase/firestore";
import { syncRoomsWithLatest } from "../lib/seedData";
import { Home3D } from "./ThreeDIcons";

interface RoomsViewProps {
  rooms: Room[];
  isAdmin: boolean;
  onRefreshData: () => void;
}

export default function RoomsView({ rooms, isAdmin, onRefreshData }: RoomsViewProps) {
  const [isSyncingRooms, setIsSyncingRooms] = useState(false);

  const handleSyncRooms = async () => {
    if (!isAdmin) return;
    if (
      !window.confirm(
        "هيتم حذف كل الغرف الحالية نهائياً واستبدالها بقائمة الـ12 غرفة الرسمية (١٠١ - ١١٢) بأسماء فاضية. متأكد؟"
      )
    ) {
      return;
    }
    setIsSyncingRooms(true);
    try {
      await syncRoomsWithLatest();
      onRefreshData();
      alert("تمت مزامنة الغرف بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء مزامنة الغرف.");
    } finally {
      setIsSyncingRooms(false);
    }
  };

  const [filterType, setFilterType] = useState<'all' | 'boys' | 'servants'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState<Room | null>(null);
  const [showAddOccupant, setShowAddOccupant] = useState<Room | null>(null);
  const [showMoveOccupant, setShowMoveOccupant] = useState<{ room: Room; index: number; occupant: Occupant } | null>(null);
  const [showEditOccupant, setShowEditOccupant] = useState<{ room: Room; index: number; occupant: Occupant } | null>(null);

  // Form: Add / Edit Room
  const [roomNumber, setRoomNumber] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState<'boys' | 'servants'>('boys');
  const [capacity, setCapacity] = useState("4");

  // Form: Add Occupant
  const [occupantName, setOccupantName] = useState("");
  const [occupantRole, setOccupantRole] = useState<'boy' | 'servant'>('boy');

  // Form: Move Occupant
  const [targetRoomId, setTargetRoomId] = useState("");

  // Form: Edit Occupant
  const [editOccupantName, setEditOccupantName] = useState("");
  const [editOccupantRole, setEditOccupantRole] = useState<'boy' | 'servant'>('boy');

  // Stats calculation
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupants = rooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0);
  const remainingSpots = totalCapacity - totalOccupants;

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    // 1. Filter by category
    if (filterType !== 'all' && room.type !== filterType) return false;
    
    // 2. Filter by search (Room number, building, or occupant name)
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesRoom = room.roomNumber.toLowerCase().includes(searchLower) || room.building.toLowerCase().includes(searchLower);
    const matchesOccupant = room.occupants?.some(occ => occ.name.toLowerCase().includes(searchLower));
    
    return matchesRoom || matchesOccupant;
  });

  const handleOpenAddRoom = () => {
    setRoomNumber("");
    setBuilding("");
    setFloor("");
    setType("boys");
    setCapacity("4");
    setShowAddRoom(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setRoomNumber(room.roomNumber);
    setBuilding(room.building);
    setFloor(room.floor || "");
    setType(room.type);
    setCapacity(String(room.capacity));
    setShowEditRoom(room);
  };

  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!roomNumber || !building) {
      alert("الرجاء إدخال رقم الغرفة واسم المبنى!");
      return;
    }

    try {
      const colRef = collection(db, "rooms");
      await addDoc(colRef, {
        roomNumber,
        building,
        floor,
        type,
        capacity: Number(capacity) || 4,
        occupants: []
      });
      onRefreshData();
      setShowAddRoom(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة الغرفة.");
    }
  };

  const handleEditRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!showEditRoom) return;
    if (!roomNumber || !building) {
      alert("الرجاء إدخال رقم الغرفة واسم المبنى!");
      return;
    }

    try {
      const docRef = doc(db, "rooms", showEditRoom.id);
      await setDoc(docRef, {
        roomNumber,
        building,
        floor,
        type,
        capacity: Number(capacity) || 4
      }, { merge: true });
      onRefreshData();
      setShowEditRoom(null);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحديث بيانات الغرفة.");
    }
  };

  const handleQuickAdjustCapacity = async (room: Room, delta: number) => {
    if (!isAdmin) return;
    const newCap = Math.max(1, room.capacity + delta);
    try {
      const docRef = doc(db, "rooms", room.id);
      await setDoc(docRef, { capacity: newCap }, { merge: true });
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء ضبط سعة الغرفة.");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("هل أنت متأكد من حذف هذه الغرفة وكل المقيمين بها نهائياً؟")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "rooms", id));
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الغرفة.");
    }
  };

  const handleClearRoom = async (room: Room) => {
    if (!isAdmin) return;
    if (!window.confirm(`هل أنت متأكد من إخلاء الغرفة ${room.roomNumber} وإزالة جميع الأشخاص المسكنين بها؟`)) {
      return;
    }
    try {
      const docRef = doc(db, "rooms", room.id);
      await setDoc(docRef, { occupants: [] }, { merge: true });
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إخلاء الغرفة.");
    }
  };

  const handleAddOccupantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!showAddOccupant) return;
    if (!occupantName.trim()) {
      alert("الرجاء إدخال اسم الشخص المسكن!");
      return;
    }

    // Check capacity limit
    const currentOccupants = showAddOccupant.occupants || [];
    if (currentOccupants.length >= showAddOccupant.capacity) {
      if (!window.confirm("تحذير: الغرفة مكتملة العدد بالفعل! هل تود إضافة هذا الشخص وتجاوز السعة المحددة؟")) {
        return;
      }
    }

    try {
      const updatedOccupants = [...currentOccupants, { name: occupantName.trim(), role: occupantRole }];
      const docRef = doc(db, "rooms", showAddOccupant.id);
      await setDoc(docRef, { occupants: updatedOccupants }, { merge: true });
      
      onRefreshData();
      setShowAddOccupant(null);
      setOccupantName("");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسكين الشخص.");
    }
  };

  const handleOpenEditOccupant = (room: Room, index: number, occupant: Occupant) => {
    setEditOccupantName(occupant.name);
    setEditOccupantRole(occupant.role);
    setShowEditOccupant({ room, index, occupant });
  };

  const handleEditOccupantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!showEditOccupant) return;
    if (!editOccupantName.trim()) {
      alert("الرجاء إدخال اسم الشخص!");
      return;
    }

    try {
      const currentOccupants = [...(showEditOccupant.room.occupants || [])];
      currentOccupants[showEditOccupant.index] = {
        name: editOccupantName.trim(),
        role: editOccupantRole
      };

      const docRef = doc(db, "rooms", showEditOccupant.room.id);
      await setDoc(docRef, { occupants: currentOccupants }, { merge: true });
      onRefreshData();
      setShowEditOccupant(null);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تعديل بيانات المقيم.");
    }
  };

  const handleOpenMoveOccupant = (room: Room, index: number, occupant: Occupant) => {
    setTargetRoomId("");
    setShowMoveOccupant({ room, index, occupant });
  };

  const handleMoveOccupantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!showMoveOccupant) return;
    if (!targetRoomId) {
      alert("الرجاء اختيار الغرفة الجديدة لنقل الشخص إليها!");
      return;
    }

    const targetRoom = rooms.find(r => r.id === targetRoomId);
    if (!targetRoom) return;

    try {
      const batch = writeBatch(db);

      // 1. Remove from current room
      const sourceOccupants = showMoveOccupant.room.occupants.filter((_, idx) => idx !== showMoveOccupant.index);
      const sourceDocRef = doc(db, "rooms", showMoveOccupant.room.id);
      batch.set(sourceDocRef, { occupants: sourceOccupants }, { merge: true });

      // 2. Add to target room
      const targetOccupants = [...(targetRoom.occupants || []), showMoveOccupant.occupant];
      const targetDocRef = doc(db, "rooms", targetRoom.id);
      batch.set(targetDocRef, { occupants: targetOccupants }, { merge: true });

      await batch.commit();
      onRefreshData();
      setShowMoveOccupant(null);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء نقل المقيم إلى الغرفة الجديدة.");
    }
  };

  const handleRemoveOccupant = async (room: Room, indexToRemove: number) => {
    if (!isAdmin) return;
    if (!window.confirm("هل أنت متأكد من إلغاء تسكين هذا الشخص من هذه الغرفة؟")) {
      return;
    }

    try {
      const updatedOccupants = (room.occupants || []).filter((_, idx) => idx !== indexToRemove);
      const docRef = doc(db, "rooms", room.id);
      await setDoc(docRef, { occupants: updatedOccupants }, { merge: true });
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إلغاء التسكين.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-70 block mb-1">Accommodation & Rooms</span>
          <h2 className="text-3xl font-serif font-black text-white flex items-center gap-2">
            <Home3D className="w-10 h-10 shrink-0" />
            <span>تسكين الغرف وتوزيع الحضور</span>
          </h2>
          <p className="text-xs text-slate-300 mt-2 font-medium">البحث، التسكين، وتعديل بيانات غرف ومباني المؤتمر ونقل المقيمين بسهولة.</p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2 self-start">
            <button
              onClick={handleOpenAddRoom}
              className="flex items-center gap-1.5 glass-button px-5 py-3 text-xs tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة غرفة جديدة</span>
            </button>
            <button
              onClick={handleSyncRooms}
              disabled={isSyncingRooms}
              className="flex items-center gap-1.5 px-5 py-3 text-xs tracking-wider rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="حذف كل الغرف الحالية واستبدالها بالقائمة الرسمية الجديدة (١٠١-١١٢)"
            >
              <Eraser className="w-4 h-4" />
              <span>{isSyncingRooms ? "جارٍ المزامنة..." : "استبدال بالقائمة الرسمية (12 غرفة)"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Conference Accommodation Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
        <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">إجمالي الغرف</span>
          <span className="text-xl font-serif font-black text-indigo-300">{totalRooms} غرفة</span>
        </div>
        <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">إجمالي الأسرة</span>
          <span className="text-xl font-serif font-black text-white">{totalCapacity} شخص</span>
        </div>
        <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">تم تسكينهم</span>
          <span className="text-xl font-serif font-black text-emerald-400">{totalOccupants} شخص</span>
        </div>
        <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">الأماكن المتبقية</span>
          <span className={`text-xl font-serif font-black ${remainingSpots > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{remainingSpots} سرير</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث برقم الغرفة، اسم المبنى، أو اسم الشخص المسكن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-400 outline-none transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter categories */}
        <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/10 shrink-0 backdrop-blur-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterType === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterType('boys')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterType === 'boys' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            غرف الأولاد / المخدومين
          </button>
          <button
            onClick={() => setFilterType('servants')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterType === 'servants' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            غرف الخدام
          </button>
        </div>
      </div>

      {/* Rooms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel rounded-2xl text-slate-400 text-xs border-dashed">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <p className="font-bold">لا توجد غرف مسجلة أو مطابقة لبحثك.</p>
          </div>
        ) : (
          filteredRooms.map(room => {
            const count = room.occupants?.length || 0;
            const cap = room.capacity || 4;
            const isFull = count >= cap;

            // Header colors depending on type
            const typeColor = 
              room.type === 'boys' ? 'border-t-blue-500/50 from-blue-500/10' :
              'border-t-violet-500/50 from-violet-500/10';

            return (
              <div 
                key={room.id}
                className={`glass-card border-t-4 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-b to-transparent ${typeColor}`}
              >
                {/* Room title details */}
                <div className="p-5 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-sm ${
                          room.type === 'boys' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-violet-500/20 text-violet-300 border-violet-500/30'
                        }`}>
                          {room.type === 'boys' ? 'أولاد / مخدومين' : 'غرفة خدام'}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEditRoom(room)}
                            className="p-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                            title="تعديل بيانات الغرفة والسعة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-xl font-serif font-black text-white mt-2 drop-shadow-md">غرفة {room.roomNumber}</h3>
                    </div>

                    <div className="text-left flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold font-mono border px-2.5 py-1 rounded-lg backdrop-blur-sm ${isFull ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-white/5 text-slate-300 border-white/10'}`}>
                        {count} / {cap} أشخاص
                      </span>

                      {/* Quick Capacity Controls for Servant */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/5 mt-1">
                          <button
                            onClick={() => handleQuickAdjustCapacity(room, -1)}
                            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 font-mono font-bold"
                            title="تقليل السعة سرير واحد"
                          >
                            -
                          </button>
                          <span className="text-[10px] text-slate-400 font-bold px-1">سعة</span>
                          <button
                            onClick={() => handleQuickAdjustCapacity(room, 1)}
                            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 font-mono font-bold"
                            title="زيادة السعة سرير واحد"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room Location info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-medium border-b border-white/10 pb-4">
                    <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1.5 rounded-lg border border-white/5">
                      <Building className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                      <span className="truncate">{room.building}</span>
                    </div>
                    {room.floor && (
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1.5 rounded-lg border border-white/5">
                        <Layers className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                        <span>{room.floor}</span>
                      </div>
                    )}
                  </div>

                  {/* Occupants list */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        المسكنين في الغرفة:
                      </h4>

                      {isAdmin && count > 0 && (
                        <button
                          onClick={() => handleClearRoom(room)}
                          className="text-[10px] text-rose-400/80 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-500/10 px-2 py-0.5 rounded transition-colors"
                          title="إخلاء الغرفة بالكامل"
                        >
                          <Eraser className="w-3 h-3" />
                          <span>إخلاء</span>
                        </button>
                      )}
                    </div>
                    
                    {count === 0 ? (
                      <div className="text-xs text-slate-500 italic py-3 text-center border border-dashed border-white/10 rounded-xl bg-black/10">الغرفة فارغة تماماً.</div>
                    ) : (
                      <div className="space-y-2">
                        {room.occupants.map((occ, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between text-xs bg-white/5 border border-white/5 px-3 py-2.5 rounded-xl text-slate-300 group/item hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate font-bold text-white">{occ.name}</span>
                              {occ.role === 'servant' && (
                                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">خادم</span>
                              )}
                            </div>

                            {isAdmin && (
                              <div className="flex items-center gap-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditOccupant(room, idx, occ)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-md transition-colors cursor-pointer"
                                  title="تعديل الاسم أو الصفة"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenMoveOccupant(room, idx, occ)}
                                  className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-md transition-colors cursor-pointer"
                                  title="نقل إلى غرفة أخرى"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveOccupant(room, idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                                  title="إلغاء التسكين"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card action footer (Only for admin) */}
                {isAdmin && (
                  <div className="bg-black/20 border-t border-white/5 p-4 flex items-center justify-between gap-2 mt-auto backdrop-blur-sm">
                    <button
                      onClick={() => setShowAddOccupant(room)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/80 text-white hover:bg-indigo-500 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>تسكين شخص</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditRoom(room)}
                      className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                      title="تعديل الغرفة"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="حذف الغرفة بالكامل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">إضافة غرفة جديدة للمؤتمر</h3>
              <button 
                onClick={() => setShowAddRoom(false)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الغرفة</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="مثال: ١٠٤ أو ٢٠٥"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">سعة الغرفة (عدد الأشخاص)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المبنى</label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="مثال: مبنى مارمرقس"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الدور</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="مثال: الدور الأول"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع نزلاء الغرفة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('boys')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${type === 'boys' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    أولاد / مخدومين
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('servants')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${type === 'servants' ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    خدام
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  إضافة الغرفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">تعديل بيانات الغرفة {showEditRoom.roomNumber}</h3>
              <button 
                onClick={() => setShowEditRoom(null)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoomSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الغرفة</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="مثال: ١٠٤ أو ٢٠٥"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">سعة الغرفة (عدد الأسرة)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المبنى</label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="مثال: مبنى مارمرقس"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الدور</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="مثال: الدور الأول"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع نزلاء الغرفة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('boys')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${type === 'boys' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    أولاد / مخدومين
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('servants')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${type === 'servants' ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    خدام
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditRoom(null)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Occupant Modal */}
      {showAddOccupant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">تسكين في غرفة {showAddOccupant.roomNumber}</h3>
              <button 
                onClick={() => setShowAddOccupant(null)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOccupantSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم بالكامل</label>
                <input
                  type="text"
                  value={occupantName}
                  onChange={(e) => setOccupantName(e.target.value)}
                  placeholder="مثال: يوسف شريف"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الدور / الصفة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOccupantRole('boy')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${occupantRole === 'boy' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    مخدوم
                  </button>
                  <button
                    type="button"
                    onClick={() => setOccupantRole('servant')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${occupantRole === 'servant' ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    خادم
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOccupant(null)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  تسكين وحفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Occupant Modal */}
      {showEditOccupant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">تعديل بيانات المقيم</h3>
              <button 
                onClick={() => setShowEditOccupant(null)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditOccupantSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم بالكامل</label>
                <input
                  type="text"
                  value={editOccupantName}
                  onChange={(e) => setEditOccupantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الدور / الصفة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOccupantRole('boy')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${editOccupantRole === 'boy' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    مخدوم
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditOccupantRole('servant')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${editOccupantRole === 'servant' ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-lg shadow-violet-500/20' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    خادم
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditOccupant(null)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Occupant Modal */}
      {showMoveOccupant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">نقل ({showMoveOccupant.occupant.name}) إلى غرفة أخرى</h3>
              <button 
                onClick={() => setShowMoveOccupant(null)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveOccupantSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اختر الغرفة الجديدة</label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="" className="bg-slate-800">-- اختر غرفة من القائمة --</option>
                  {rooms
                    .filter(r => r.id !== showMoveOccupant.room.id)
                    .map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-800">
                        غرفة {r.roomNumber} - {r.building} ({r.occupants?.length || 0}/{r.capacity})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoveOccupant(null)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  تأكيد النقل 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

