import React, { useState, useEffect, useMemo } from 'react';
import {
LayoutDashboard, Users, UserPlus, CircleDollarSign, Building2,
FileText, ShieldAlert, Image as ImageIcon, History,
Settings, Plus, Search, Bell, CheckCircle2,
AlertCircle, ArrowUpRight, ArrowDownRight,
Wrench, Zap, Droplets, Calendar, FileCheck,
ChevronRight, ClipboardList, Camera, HardDrive,
LogOut, Filter, Download, Save, X, Edit, Trash2, Eye, Database, TrendingUp, TrendingDown, Trash,
Briefcase, Receipt, MapPin, Box, Package, ShieldCheck, Printer
} from 'lucide-react';

// --- Database Configuration (Conceptual Connection) ---
const DB_CONFIG = {
host: 'gateway02.us-east-1.prod.aws.tidbcloud.com',
user: '3UEtScgPrGx6DTw.c8d1a5469bae',
database: 'h667ndwT9e7Uvcqqw3D6DU',
status: 'Connected'
};

const App = () => {
const [activeTab, setActiveTab] = useState('dashboard');
const [isSidebarOpen, setSidebarOpen] = useState(true);
const [showModal, setShowModal] = useState(null);
const [selectedRoom, setSelectedRoom] = useState(null);

// Filters
const [roomFilter, setRoomFilter] = useState('ทั้งหมด');
const [financeFilter, setFinanceFilter] = useState('ทั้งหมด');
const [reportMonth, setReportMonth] = useState('มกราคม 2569');

// --- Core Data States (M1-M7) ---
const [rooms, setRooms] = useState([
{ id: '101', type: 'รายวัน', status: 'ว่าง', price: 500, guest: '-', meterE: 1250, meterW: 450 },
{ id: '102', type: 'รายเดือน', status: 'เช่าอยู่', price: 3500, guest: 'สมชาย ใจดี', phone: '081-234-5678', meterE: 2100, meterW: 880 },
{ id: '201', type: 'รายวัน', status: 'จอง', price: 500, guest: 'วิภาดา', meterE: 3320, meterW: 1120 },
{ id: 'H01', type: 'บ้านเช่า', status: 'เช่าอยู่', price: 12000, guest: 'สมศรี', meterE: 4500, meterW: 1500 }
]);

const [transactions, setTransactions] = useState([
{ id: 'T001', date: '2025-01-12', room: '102', amount: 4200, type: 'รายรับ', desc: 'ค่าเช่า + ค่าน้ำไฟ', status: 'สำเร็จ' },
{ id: 'T002', date: '2025-01-12', room: '-', amount: 1500, type: 'รายจ่าย', desc: 'ซื้อวัสดุทำความสะอาด', status: 'อนุมัติแล้ว' },
{ id: 'T003', date: '2025-01-13', room: '101', amount: 500, type: 'รายรับ', desc: 'ค่าห้องพักรายวัน', status: 'สำเร็จ' },
]);

const [employees, setEmployees] = useState([
{ id: 'EMP01', name: 'วิชัย รักงาน', role: 'แม่บ้าน', status: 'ปฏิบัติงาน' },
{ id: 'EMP02', name: 'มานะ ขยัน', role: 'ช่างเทคนิค', status: 'พักร้อน' }
]);

const [maintenance, setMaintenance] = useState([
{ id: 'M001', date: '2025-01-10', room: '102', issue: 'ก๊อกน้ำรั่ว', priority: 'ต่ำ', status: 'รอดำเนินการ' },
{ id: 'M002', date: '2025-01-14', room: '201', issue: 'แอร์ไม่เย็น', priority: 'สูง', status: 'กำลังซ่อม' }
]);

const [inventory, setInventory] = useState([
{ id: 'AST001', name: 'Smart TV 50"', category: 'เครื่องใช้ไฟฟ้า', room: '102', value: 15900, condition: 'ดีมาก' },
{ id: 'AST002', name: 'เครื่องทำน้ำอุ่น Panasonic', category: 'งานระบบ', room: '201', value: 3500, condition: 'ปกติ' },
{ id: 'AST003', name: 'โซฟารับแขก 3 ที่นั่ง', category: 'เฟอร์นิเจอร์', room: 'H01', value: 8900, condition: 'ชำรุดเล็กน้อย' },
{ id: 'AST004', name: 'ตู้เย็น 2 ประตู', category: 'เครื่องใช้ไฟฟ้า', room: '102', value: 12500, condition: 'ปกติ' },
]);

// --- Actions ---
const handleCheckIn = (e) => {
e.preventDefault();
const formData = new FormData(e.target);
const data = Object.fromEntries(formData);
setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, status: 'เช่าอยู่', guest: data.guestName, phone: data.phone } : r));
setShowModal(null);
};

// --- Components ---
const Modal = ({ title, children, onClose }) => (
<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
<div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
<div className="p-6 border-b flex justify-between items-center bg-slate-50">
<h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">{title}</h3>
<button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
</div>
<div className="p-6 overflow-y-auto max-h-[85vh]">{children}</div>
</div>
</div>
);

// --- View Generators ---

// Dashboard Overview
const DashboardView = () => (
<div className="space-y-8 animate-in fade-in">
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
{[
{ label: 'รายได้วันนี้', val: '฿5,700', Icon: CircleDollarSign, color: 'bg-emerald-500' },
{ label: 'ว่างพร้อมขาย', val: rooms.filter(r => r.status === 'ว่าง').length, Icon: Building2, color: 'bg-blue-500' },
{ label: 'งานซ่อมค้าง', val: maintenance.filter(m => m.status !== 'เสร็จแล้ว').length, Icon: ShieldAlert, color: 'bg-rose-500' },
{ label: 'พนักงานในกะ', val: employees.filter(e => e.status === 'ปฏิบัติงาน').length, Icon: Users, color: 'bg-indigo-500' },
].map((s, i) => (
<div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
<div className={`${s.color} p-4 rounded-2xl text-white`}>
  <s.Icon size={24} />
</div>
<div>
<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
<h3 className="text-2xl font-black text-slate-800">{s.val}</h3>
</div>
</div>
))}
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">  
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">  
      <h3 className="text-lg font-black mb-6 flex items-center gap-2 font-mono italic underline decoration-blue-500 decoration-4 underline-offset-8">  
        <Building2 className="text-blue-600"/> ผังห้องพักล่าสุด  
      </h3>  
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">  
        {rooms.map(r => (  
          <button key={r.id} onClick={() => {setSelectedRoom(r); setShowModal('quick-action');}} className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-105 ${r.status === 'ว่าง' ? 'border-emerald-100 bg-emerald-50/20' : 'border-blue-100 bg-blue-50/20'}`}>  
            <div className="flex justify-between">  
              <span className="font-black text-xl italic">{r.id}</span>  
              <div className={`w-2 h-2 rounded-full ${r.status === 'ว่าง' ? 'bg-emerald-500' : 'bg-blue-500'}`}/>  
            </div>  
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{r.status}</p>  
          </button>  
        ))}  
      </div>  
    </div>  
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">  
      <h3 className="text-lg font-black mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-600"/> ธุรกรรม</h3>  
      <div className="space-y-4">  
        {transactions.map(t => (  
          <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border-b last:border-0">  
            <div>  
              <p className="text-sm font-bold truncate w-32">{t.desc}</p>  
              <p className="text-[10px] text-slate-400 uppercase font-mono">{t.id} | {t.date}</p>  
            </div>  
            <p className={`font-black ${t.type === 'รายรับ' ? 'text-emerald-600' : 'text-rose-600'}`}>฿{t.amount}</p>  
          </div>  
        ))}  
      </div>  
      <button onClick={() => setActiveTab('financials')} className="w-full mt-4 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-xl transition-all">ดูทั้งหมด</button>  
    </div>  
  </div>  
</div>

);

// Financials View
const FinanceView = () => (
<div className="space-y-6 animate-in fade-in">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-emerald-500 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
<TrendingUp className="absolute -right-4 -bottom-4 opacity-10 w-32 h-32" />
<p className="text-xs font-bold opacity-80 uppercase mb-1">รายรับรวม (M2)</p>
<h2 className="text-4xl font-black italic">฿{transactions.filter(t => t.type === 'รายรับ').reduce((a, b) => a + b.amount, 0).toLocaleString()}</h2>
</div>
<div className="bg-rose-500 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
<TrendingDown className="absolute -right-4 -bottom-4 opacity-10 w-32 h-32" />
<p className="text-xs font-bold opacity-80 uppercase mb-1 text-rose-100">รายจ่ายรวม (M2)</p>
<h2 className="text-4xl font-black italic">฿{transactions.filter(t => t.type === 'รายจ่าย').reduce((a, b) => a + b.amount, 0).toLocaleString()}</h2>
</div>
<div className="bg-white p-8 rounded-3xl border-2 border-slate-100 flex flex-col justify-center shadow-sm">
<p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">กำไรสุทธิ</p>
<h2 className="text-4xl font-black text-blue-600 italic">฿{(transactions.filter(t => t.type === 'รายรับ').reduce((a, b) => a + b.amount, 0) - transactions.filter(t => t.type === 'รายจ่าย').reduce((a, b) => a + b.amount, 0)).toLocaleString()}</h2>
</div>
</div>
<div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
<div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
<div className="flex items-center gap-3">
<CircleDollarSign className="text-emerald-500" />
<h3 className="font-black italic">รายชื่อธุรกรรม (TiDB Connected)</h3>
</div>
<button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all"><Plus size={14}/> เพิ่มบันทึก</button>
</div>
<table className="w-full text-left">
<thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
<tr>
<th className="p-4">วันที่</th>
<th className="p-4">ยูนิต</th>
<th className="p-4">รายการ</th>
<th className="p-4 text-right">จำนวน</th>
<th className="p-4 text-center">สถานะ</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{transactions.map(t => (
<tr key={t.id} className="text-sm font-bold hover:bg-slate-50 transition-all">
<td className="p-4 text-slate-400 font-mono">{t.date}</td>
<td className="p-4 text-blue-600 font-black italic">{t.room}</td>
<td className="p-4">{t.desc}</td>
<td className={`p-4 text-right font-black ${t.type === 'รายรับ' ? 'text-emerald-600' : 'text-rose-600'}`}>
{t.type === 'รายรับ' ? '+' : '-'}฿{t.amount.toLocaleString()}
</td>
<td className="p-4 text-center">
<span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] uppercase font-black text-slate-500 border border-slate-200">{t.status}</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);

// M7 Reports View (รายงาน ร.1)
const ReportsView = () => (
<div className="animate-in fade-in space-y-8">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h3 className="text-2xl font-black italic">รายงานผู้เข้าพัก ร.1 (เทศบาล)</h3>
<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Government Monthly Guest Report</p>
</div>
<div className="flex gap-3">
<select
value={reportMonth}
onChange={(e) => setReportMonth(e.target.value)}
className="bg-white border rounded-2xl px-4 py-3 text-xs font-black shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
>
<option>มกราคม 2569</option>
<option>ธันวาคม 2568</option>
<option>พฤศจิกายน 2568</option>
</select>
<button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all">
<Printer size={16}/> พิมพ์รายงาน PDF
</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">  
    {[  
      { label: 'ผู้เข้าพักรวม', val: '42', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },  
      { label: 'สัญชาติไทย', val: '38', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },  
      { label: 'ต่างชาติ', val: '4', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },  
      { label: 'สถานะรายงาน', val: 'พร้อมส่ง', icon: CheckCircle2, color: 'text-orange-600', bg: 'bg-orange-50' },  
    ].map((stat, i) => (  
      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">  
         <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>  
         <div>  
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>  
            <h4 className="text-2xl font-black">{stat.val}</h4>  
         </div>  
      </div>  
    ))}  
  </div>  

  <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">  
    <div className="p-8 border-b bg-slate-50/30 flex justify-between items-center">  
       <div className="flex items-center gap-3">  
          <FileCheck className="text-blue-600" />  
          <h3 className="font-black italic">สมุดทะเบียนผู้เข้าพักประจำเดือน {reportMonth}</h3>  
       </div>  
       <div className="flex gap-2">  
          <button className="p-2 bg-white border rounded-xl text-slate-400 hover:text-blue-600"><Search size={18}/></button>  
          <button className="p-2 bg-white border rounded-xl text-slate-400 hover:text-blue-600"><Download size={18}/></button>  
       </div>  
    </div>  
    <table className="w-full text-left">  
      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">  
        <tr>  
          <th className="px-8 py-5">ลำดับ</th>  
          <th className="px-8 py-5">เลขห้อง</th>  
          <th className="px-8 py-5">ชื่อ-สกุล</th>  
          <th className="px-8 py-5">เลขบัตรประชาชน / Passport</th>  
          <th className="px-8 py-5">วันที่เข้าพัก</th>  
          <th className="px-8 py-5">วันที่ออก</th>  
          <th className="px-8 py-5 text-center">หลักฐาน</th>  
        </tr>  
      </thead>  
      <tbody className="divide-y divide-slate-100">  
        {rooms.filter(r => r.status === 'เช่าอยู่').map((guest, idx) => (  
          <tr key={guest.id} className="hover:bg-slate-50 transition-all font-bold">  
            <td className="px-8 py-5 text-xs text-slate-400">{idx + 1}</td>  
            <td className="px-8 py-5 text-blue-600 italic">{guest.id}</td>  
            <td className="px-8 py-5 text-sm">{guest.guest}</td>  
            <td className="px-8 py-5 text-xs font-mono tracking-tighter">  
              {guest.id === '102' ? '1-4302-0012x-xx-x' : '3-1005-0044x-xx-x'}  
            </td>  
            <td className="px-8 py-5 text-xs text-slate-500">12/01/2569</td>  
            <td className="px-8 py-5 text-xs text-slate-500">-</td>  
            <td className="px-8 py-5 text-center">  
              <button className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Eye size={16}/></button>  
            </td>  
          </tr>  
        ))}  
      </tbody>  
    </table>  
    <div className="p-6 bg-slate-50/50 border-t flex justify-end">  
       <p className="text-[10px] font-bold text-slate-400 uppercase italic">ข้อมูลอ้างอิงจากฐานข้อมูล TiDB Cloud • {DB_CONFIG.database}</p>  
    </div>  
  </div>  
</div>

);

// Content Router
const renderModuleContent = () => {
switch (activeTab) {
case 'dashboard': return <DashboardView />;
case 'financials': return <FinanceView />;
case 'reports': return <ReportsView />;
case 'rooms':
return (
<div className="animate-in fade-in space-y-6">
<div className="flex justify-between items-center">
<h3 className="text-2xl font-black italic">ทะเบียนยูนิตและห้องพัก (M3)</h3>
<div className="flex gap-2">
<button className="bg-white border p-3 rounded-2xl hover:bg-slate-50"><Filter size={18} /></button>
<button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl">+ ยูนิตใหม่</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{rooms.map(r => (
<div key={r.id} className="bg-white border rounded-3xl p-6 shadow-sm hover:border-blue-500 transition-all group">
<div className="flex justify-between items-start mb-4">
<div>
<h4 className="text-3xl font-black italic">{r.id}</h4>
<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.type}</p>
</div>
<div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.status === 'ว่าง' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
{r.status}
</div>
</div>
<div className="space-y-2 border-t pt-4">
<div className="flex justify-between text-xs font-bold"><span>ผู้พัก:</span> <span className="text-slate-500">{r.guest}</span></div>
<div className="flex justify-between text-xs font-bold"><span>มิเตอร์ไฟ:</span> <span className="text-orange-500 font-mono">{r.meterE}</span></div>
<div className="flex justify-between text-xs font-bold"><span>มิเตอร์น้ำ:</span> <span className="text-blue-500 font-mono">{r.meterW}</span></div>
</div>
<div className="mt-6 flex gap-2">
<button className="flex-1 bg-slate-50 py-2 rounded-xl text-xs font-black hover:bg-slate-100">แก้ไข</button>
<button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-black hover:bg-blue-100">ดูข้อมูล</button>
</div>
</div>
))}
</div>
</div>
);
case 'maintenance':
return (
<div className="animate-in fade-in space-y-6">
<h3 className="text-2xl font-black italic">แจ้งซ่อมและซ่อมบำรุง (M3.5)</h3>
<div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
<table className="w-full text-left">
<thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
<tr><th className="p-4">รหัส</th><th className="p-4">ห้อง</th><th className="p-4">ปัญหา</th><th className="p-4">ความสำคัญ</th><th className="p-4">สถานะ</th></tr>
</thead>
<tbody className="divide-y divide-slate-100">
{maintenance.map(m => (
<tr key={m.id} className="text-sm font-bold">
<td className="p-4 text-slate-400 font-mono">{m.id}</td>
<td className="p-4 text-blue-600 font-black italic">{m.room}</td>
<td className="p-4">{m.issue}</td>
<td className="p-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-black ${m.priority === 'สูง' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{m.priority}</span></td>
<td className="p-4"><span className="text-xs font-bold text-orange-500">{m.status}</span></td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
case 'inventory':
return (
<div className="animate-in fade-in space-y-6">
<h3 className="text-2xl font-black italic">ทะเบียนทรัพย์สิน (M4)</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{inventory.map(item => (
<div key={item.id} className="bg-white p-6 rounded-3xl border shadow-sm flex gap-4">
<div className="bg-slate-100 p-4 rounded-2xl h-fit"><Package className="text-slate-400" /></div>
<div>
<h4 className="font-black text-lg">{item.name}</h4>
<p className="text-xs text-slate-400 font-mono mb-2">{item.id}</p>
<div className="flex gap-2 text-xs font-bold text-slate-500">
<span className="bg-slate-50 px-2 py-1 rounded border">ห้อง {item.room}</span>
<span className="bg-slate-50 px-2 py-1 rounded border">{item.category}</span>
</div>
<p className="mt-2 text-emerald-600 font-black">฿{item.value.toLocaleString()}</p>
</div>
</div>
))}
</div>
</div>
);
case 'employees':
return (
<div className="animate-in fade-in space-y-6">
<h3 className="text-2xl font-black italic">บุคลากร (M5)</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{employees.map(e => (
<div key={e.id} className="bg-white p-6 rounded-3xl border shadow-sm text-center">
<div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black text-slate-300">
{e.name.charAt(0)}
</div>
<h4 className="font-black text-lg">{e.name}</h4>
<p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-4">{e.role}</p>
<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${e.status === 'ปฏิบัติงาน' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
{e.status}
</span>
</div>
))}
</div>
</div>
);
default: return <div className="p-12 text-center text-slate-400 font-black italic">ส่วนงานอื่นอยู่ระหว่างพัฒนา...</div>;
}
};

return (
<div className="flex min-h-screen bg-slate-50 font-sans text-slate-600 selection:bg-blue-100">
{/* Sidebar */}
<aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out shadow-2xl overflow-y-auto
  ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:w-0 lg:translate-x-0 lg:overflow-hidden'} 
  lg:relative`}>
<div className={`p-8 ${!isSidebarOpen && 'lg:hidden'}`}>
<div className="flex items-center gap-3 mb-10">
<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
<Building2 size={20} />
</div>
<div>
<h1 className="text-lg font-black italic tracking-tighter">THE APARTMENT</h1>
<p className="text-[10px] text-slate-400 uppercase tracking-widest">Management System</p>
</div>
</div>

<nav className="space-y-2">
<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-4">Menu</p>
{[
{ id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
{ id: 'rooms', label: 'ห้องพัก', icon: Building2 },
{ id: 'financials', label: 'การเงิน', icon: CircleDollarSign },
{ id: 'reports', label: 'รายงาน ร.1', icon: FileText },
{ id: 'maintenance', label: 'แจ้งซ่อม', icon: Wrench },
{ id: 'inventory', label: 'ทรัพย์สิน', icon: Package },
{ id: 'employees', label: 'พนักงาน', icon: Users },
].map(item => (
<button
key={item.id}
onClick={() => {
  setActiveTab(item.id);
  if (window.innerWidth < 1024) setSidebarOpen(false);
}}
className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
>
<item.icon size={18} />
{item.label}
</button>
))}
</nav>

<div className="mt-10 p-4 bg-slate-800 rounded-2xl border border-slate-700">
<div className="flex items-center gap-3 mb-2">
<Database size={14} className="text-emerald-400" />
<span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database Status</span>
</div>
<div className="flex items-center gap-2">
<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
<span className="text-xs font-bold text-emerald-400">Connected</span>
</div>
<p className="text-[10px] text-slate-500 mt-2 font-mono truncate">{DB_CONFIG.host}</p>
</div>
</div>
</aside>

{/* Main Content */}
<main className="flex-1 flex flex-col h-screen overflow-hidden relative">
{/* Header */}
<header className="h-20 bg-white/80 backdrop-blur-md border-b flex justify-between items-center px-8 z-40 sticky top-0">
<div className="flex items-center gap-4">
<button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-slate-800 transition-all">
<Filter size={20} />
</button>
<h2 className="text-xl font-black italic text-slate-800 uppercase tracking-tight">{activeTab}</h2>
</div>
<div className="flex items-center gap-4">
<div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
<Search size={16} className="text-slate-400" />
<input type="text" placeholder="ค้นหา..." className="bg-transparent border-none outline-none text-xs font-bold w-32 placeholder:text-slate-400" />
</div>
<button className="p-2 relative text-slate-400 hover:text-blue-600 transition-all">
<Bell size={20} />
<span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
</button>
<div className="w-8 h-8 bg-blue-100 rounded-full border-2 border-blue-200 flex items-center justify-center text-xs font-black text-blue-600">
AD
</div>
</div>
</header>

{/* Scrollable Content Area */}
<div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
<div className="max-w-7xl mx-auto">
{renderModuleContent()}
</div>
</div>
</main>

{/* Modal */}
{showModal && (
<Modal title={selectedRoom ? `จัดการห้อง ${selectedRoom.id}` : 'ดำเนินการ'} onClose={() => setShowModal(null)}>
{selectedRoom && (
<form onSubmit={handleCheckIn} className="space-y-4">
<div>
<label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อผู้เช่า</label>
<input name="guestName" defaultValue={selectedRoom.guest !== '-' ? selectedRoom.guest : ''} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="ระบุชื่อ-สกุล" />
</div>
<div>
<label className="block text-xs font-bold text-slate-500 uppercase mb-1">เบอร์โทรศัพท์</label>
<input name="phone" defaultValue={selectedRoom.phone} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="0xx-xxx-xxxx" />
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-xs font-bold text-slate-500 uppercase mb-1">มิเตอร์ไฟ (ล่าสุด)</label>
<input defaultValue={selectedRoom.meterE} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none" />
</div>
<div>
<label className="block text-xs font-bold text-slate-500 uppercase mb-1">มิเตอร์น้ำ (ล่าสุด)</label>
<input defaultValue={selectedRoom.meterW} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none" />
</div>
</div>
<button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">บันทึกข้อมูล</button>
</form>
)}
</Modal>
)}
</div>
);
};

export default App;
