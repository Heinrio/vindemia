import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  LayoutDashboard, Leaf, FlaskConical, Bell, Settings, ChevronRight,
  Droplets, Thermometer, Wine, X, MapPin, Calendar,
  Filter, AlertCircle, CheckCircle, Clock, WifiOff, Gauge, Activity,
  BellRing, BellOff, User, Sliders, Shield, Database, ChevronDown, Save, Wifi
} from "lucide-react";

// ── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bordo: "#4A0E0E", bordoLight: "#7A1F1F",
  cream: "#F5EFE6", creamDark: "#EAE0D0",
  slate: "#2D3748", slateLight: "#4A5568",
  olive: "#5C6B2E", oliveLight: "#7A8C3E",
  amber: "#B7791F",
};

// ── Datos ─────────────────────────────────────────────────────────────────────
const parcelas = [
  { id:1, nombre:"Parcela Andes Norte",   variedad:"Malbec",            hectareas:12.5, plantacion:2015, fase:"Envero",     estado:"Óptimo",
    mapX:18, mapY:22, sensor:{ humedad:68, temp:22.4, radiacion:812, viento:14,  estado:"online", ultimaLectura:"hace 4 min" } },
  { id:2, nombre:"Parcela Río Sur",       variedad:"Cabernet Sauvignon",hectareas:8.3,  plantacion:2012, fase:"Maduración", estado:"Alerta",
    mapX:60, mapY:15, sensor:{ humedad:38, temp:26.1, radiacion:940, viento:22,  estado:"online", ultimaLectura:"hace 2 min" } },
  { id:3, nombre:"Parcela Loma Alta",     variedad:"Chardonnay",        hectareas:6.7,  plantacion:2018, fase:"Brotación",  estado:"Óptimo",
    mapX:80, mapY:50, sensor:{ humedad:72, temp:18.9, radiacion:620, viento:8,   estado:"online", ultimaLectura:"hace 6 min" } },
  { id:4, nombre:"Parcela Valle Central", variedad:"Merlot",            hectareas:10.1, plantacion:2010, fase:"Envero",     estado:"Error sensor",
    mapX:30, mapY:62, sensor:{ humedad:null, temp:null, radiacion:null, viento:null, estado:"error", ultimaLectura:"hace 3 h 42 min" } },
  { id:5, nombre:"Parcela Terrazas",      variedad:"Torrontés",         hectareas:5.9,  plantacion:2020, fase:"Floración",  estado:"Óptimo",
    mapX:65, mapY:72, sensor:{ humedad:61, temp:20.3, radiacion:755, viento:11,  estado:"online", ultimaLectura:"hace 1 min" } },
];

const depositos = [
  { id:1, nombre:"Depósito A-01",      tipo:"Acero Inox",    capacidad:50000, ocupacion:82,  lote:"LOT-2024-001", estado:"Fermentación",  variedad:"Malbec",            dias:12,
    sensor:{ temp:18.2, ph:3.41, brix:14.8, estado:"online" }, alertas:[] },
  { id:2, nombre:"Barrica Francesa 12",tipo:"Roble Francés", capacidad:225,   ocupacion:100, lote:"LOT-2023-018", estado:"Crianza",        variedad:"Cabernet Sauvignon",dias:280,
    sensor:{ temp:14.5, ph:3.62, brix:6.1,  estado:"online" }, alertas:[] },
  { id:3, nombre:"Depósito B-03",      tipo:"Hormigón",      capacidad:30000, ocupacion:60,  lote:"LOT-2024-002", estado:"Clarificación",  variedad:"Chardonnay",        dias:45,
    sensor:{ temp:null, ph:null,  brix:null, estado:"error"  }, alertas:["Sensor desconectado desde hace 5 h"] },
  { id:4, nombre:"Barrica Americana 07",tipo:"Roble Americano",capacidad:225, ocupacion:100, lote:"LOT-2023-012", estado:"Crianza",        variedad:"Merlot",            dias:340,
    sensor:{ temp:15.1, ph:3.55, brix:5.8,  estado:"online" }, alertas:[] },
  { id:5, nombre:"Depósito C-02",      tipo:"Acero Inox",    capacidad:80000, ocupacion:35,  lote:"LOT-2024-003", estado:"Fermentación",  variedad:"Torrontés",         dias:6,
    sensor:{ temp:22.8, ph:3.18, brix:20.4, estado:"online" }, alertas:["°Brix elevado (20.4) — revisar avance de fermentación","pH bajo del rango óptimo (3.2–3.6)"] },
];

const chartCampo  = parcelas.filter(p=>p.sensor.estado==="online").map(p=>({ name:p.nombre.split(" ")[1], humedad:p.sensor.humedad, temp:p.sensor.temp }));
const chartBodega = depositos.filter(d=>d.sensor.estado==="online").map(d=>({ name:d.nombre.replace("Depósito ","Dep.").replace("Barrica ","Bar."), temp:d.sensor.temp, ph:d.sensor.ph, brix:d.sensor.brix }));

// ── Notificaciones ────────────────────────────────────────────────────────────
const NOTIFS_INIT = [
  { id:1, tipo:"error",   leida:false, titulo:"Sensor sin señal",           msg:"Parcela Valle Central desconectada. Última lectura: hace 3 h 42 min.",    time:"Hace 3 h" },
  { id:2, tipo:"error",   leida:false, titulo:"Sensor bodega offline",       msg:"Depósito B-03 sin señal desde hace 5 h. Temp/pH/°Brix no disponibles.",   time:"Hace 5 h" },
  { id:3, tipo:"alerta",  leida:false, titulo:"°Brix fuera de rango",        msg:"Depósito C-02: °Brix 20.4, por encima del esperado para fermentación.",   time:"Hace 1 h" },
  { id:4, tipo:"alerta",  leida:false, titulo:"pH bajo en C-02",             msg:"pH 3.18 por debajo del rango óptimo (3.20–3.60).",                        time:"Hace 1 h" },
  { id:5, tipo:"alerta",  leida:true,  titulo:"Humedad baja · Río Sur",      msg:"Humedad suelo 38%. Por debajo del umbral mínimo (45%).",                  time:"Hace 2 h" },
  { id:6, tipo:"ok",      leida:true,  titulo:"Fermentación estable",        msg:"LOT-2024-001 Malbec: 12 días. pH y °Brix dentro de rango óptimo.",        time:"Hace 8 h" },
];

// ── Utilidades ────────────────────────────────────────────────────────────────
const estadoMap = {
  "Óptimo":        { bg:"bg-green-100",  text:"text-green-800",  dot:"#22c55e" },
  "Alerta":        { bg:"bg-amber-100",  text:"text-amber-800",  dot:"#f59e0b" },
  "Error sensor":  { bg:"bg-red-100",    text:"text-red-700",    dot:"#dc2626" },
  "Fermentación":  { bg:"bg-purple-100", text:"text-purple-800", dot:"#a855f7" },
  "Crianza":       { bg:"bg-amber-100",  text:"text-amber-800",  dot:"#f59e0b" },
  "Clarificación": { bg:"bg-blue-100",   text:"text-blue-800",   dot:"#3b82f6" },
};

const Badge = ({ label }) => {
  const s = estadoMap[label] || { bg:"bg-gray-100", text:"text-gray-700", dot:"#9ca3af" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }} />{label}
    </span>
  );
};

const SensorBar = ({ value, min, max, optMin, optMax, unit, label, color }) => {
  if (value===null) return <div className="flex items-center gap-1.5"><WifiOff size={11} style={{color:"#ef4444"}}/><span className="text-xs text-red-500">Sin señal</span></div>;
  const pct = Math.min(Math.max(((value-min)/(max-min))*100,0),100);
  const oMinP = ((optMin-min)/(max-min))*100, oMaxP = ((optMax-min)/(max-min))*100;
  const ok = value>=optMin && value<=optMax;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{color:C.slateLight}}>{label}</span>
        <span className="text-xs font-bold flex items-center gap-1" style={{color:ok?C.oliveLight:"#ef4444"}}>
          {value}{unit}{!ok&&<AlertCircle size={10}/>}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-gray-200">
        <div className="absolute h-full rounded-full opacity-20" style={{left:`${oMinP}%`,width:`${oMaxP-oMinP}%`,background:C.oliveLight}}/>
        <div className="absolute h-full rounded-full" style={{width:`${pct}%`,background:ok?color:"#ef4444"}}/>
      </div>
      <div className="flex justify-between mt-0.5" style={{fontSize:9,color:"#ccc"}}><span>{min}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );
};

// ── Panel de Notificaciones ───────────────────────────────────────────────────
const NotifPanel = ({ notifs, setNotifs, onClose }) => {
  const markAll = () => setNotifs(n => n.map(x=>({...x,leida:true})));
  const markOne = id => setNotifs(n => n.map(x=>x.id===id?{...x,leida:true}:x));
  const clear   = id => setNotifs(n => n.filter(x=>x.id!==id));

  const iconos = { error: <WifiOff size={14} style={{color:"#ef4444"}}/>, alerta: <AlertCircle size={14} style={{color:C.amber}}/>, ok: <CheckCircle size={14} style={{color:C.oliveLight}}/> };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-96 flex flex-col shadow-2xl" style={{background:"white", marginTop:64}} onClick={e=>e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{borderColor:C.creamDark}}>
          <div>
            <p className="text-sm font-bold" style={{color:C.slate}}>Notificaciones</p>
            <p className="text-xs" style={{color:C.slateLight}}>{notifs.filter(n=>!n.leida).length} sin leer</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAll} className="text-xs px-2.5 py-1 rounded-lg border" style={{borderColor:C.creamDark,color:C.slateLight}}>Marcar todas</button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} style={{color:C.slateLight}}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y" style={{divideColor:C.creamDark}}>
          {notifs.length===0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BellOff size={32} style={{color:C.creamDark}}/>
              <p className="text-sm" style={{color:C.slateLight}}>Sin notificaciones</p>
            </div>
          )}
          {notifs.map(n => (
            <div key={n.id} className="px-5 py-4 hover:bg-gray-50 transition" style={{background:n.leida?"white":"#fdfaf7"}}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{iconos[n.tipo]}</div>
                <div className="flex-1 min-w-0" onClick={()=>markOne(n.id)} style={{cursor:"pointer"}}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold" style={{color:C.slate}}>{n.titulo}</p>
                    {!n.leida && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:C.bordo}}/>}
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{color:C.slateLight}}>{n.msg}</p>
                  <p className="text-xs mt-1" style={{color:"#ccc"}}>{n.time}</p>
                </div>
                <button onClick={()=>clear(n.id)} className="p-1 hover:bg-gray-200 rounded flex-shrink-0"><X size={12} style={{color:"#ccc"}}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const navItems = [
  { id:"dashboard",    label:"Dashboard",     icon:LayoutDashboard },
  { id:"campo",        label:"Campo",         icon:Leaf },
  { id:"bodega",       label:"Bodega",        icon:FlaskConical },
  { id:"configuracion",label:"Configuración", icon:Settings },
];

const Sidebar = ({ active, setActive, notifCount }) => {
  const errCampo  = parcelas.filter(p=>p.sensor.estado==="error").length;
  const errBodega = depositos.filter(d=>d.sensor.estado==="error").length + depositos.filter(d=>d.alertas.length>0&&d.sensor.estado!=="error").length;
  const badges = { campo:errCampo, bodega:errBodega };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col" style={{background:C.bordo,minHeight:"100vh"}}>
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:C.bordoLight}}>
            <Wine size={20} color={C.cream}/>
          </div>
          <div>
            <p className="text-sm font-bold tracking-widest uppercase" style={{color:C.cream,fontFamily:"'Georgia',serif"}}>Vid-Data</p>
            <p className="text-xs" style={{color:"rgba(245,239,230,.5)"}}>Suite de Gestión</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({id,label,icon:Icon})=>{
          const isActive = active===id;
          const badge = badges[id];
          return (
            <button key={id} onClick={()=>setActive(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{background:isActive?"rgba(245,239,230,.15)":"transparent",color:isActive?C.cream:"rgba(245,239,230,.55)"}}>
              <Icon size={18} style={{color:isActive?C.cream:"rgba(245,239,230,.45)"}}/>
              <span className="flex-1 text-left">{label}</span>
              {badge>0
                ? <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{background:"#ef4444",color:"white"}}>{badge}</span>
                : isActive&&<ChevronRight size={14} style={{color:C.cream}}/>
              }
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:C.bordoLight,color:C.cream}}>JA</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{color:C.cream}}>Juan Argüello</p>
            <p className="text-xs truncate" style={{color:"rgba(245,239,230,.4)"}}>Gerente de Producción</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ── Header ────────────────────────────────────────────────────────────────────
const Header = ({ title, notifCount, onBell }) => (
  <header className="h-16 flex items-center justify-between px-8 border-b" style={{background:"white",borderColor:C.creamDark}}>
    <div>
      <h1 className="text-lg font-semibold" style={{color:C.slate,fontFamily:"'Georgia',serif"}}>{title}</h1>
      <p className="text-xs" style={{color:C.slateLight}}>Temporada 2024–2025 · Mendoza, Argentina</p>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={onBell} className="relative p-2 rounded-lg hover:bg-gray-100 transition">
        <Bell size={18} style={{color:C.slateLight}}/>
        {notifCount>0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:"#ef4444",fontSize:9}}>{notifCount}</span>
        )}
      </button>
      <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{background:C.bordo}}>+ Registrar</button>
    </div>
  </header>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KPICard = ({label,value,sub,icon:Icon,color,warn}) => (
  <div className="rounded-2xl p-5 border" style={{background:"white",borderColor:warn?"#fca5a5":C.creamDark}}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:(warn?"#ef4444":color)+"18"}}>
        <Icon size={20} style={{color:warn?"#ef4444":color}}/>
      </div>
      {warn&&<span className="flex items-center gap-1 text-xs font-semibold text-red-500"><AlertCircle size={11}/>Atención</span>}
    </div>
    <p className="text-2xl font-bold" style={{color:warn?"#ef4444":C.slate}}>{value}</p>
    <p className="text-sm font-medium mt-0.5" style={{color:C.slate}}>{label}</p>
    {sub&&<p className="text-xs mt-1" style={{color:C.slateLight}}>{sub}</p>}
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = ({setActive}) => {
  const totalErr = parcelas.filter(p=>p.sensor.estado==="error").length + depositos.filter(d=>d.sensor.estado==="error").length;
  const totalAlt = depositos.reduce((a,d)=>a+d.alertas.length,0);
  const totalHa  = parcelas.reduce((a,p)=>a+p.hectareas,0).toFixed(1);
  return (
    <div className="p-8 space-y-8">
      {totalErr>0&&(
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2" style={{background:"#fff5f5",borderColor:"#fca5a5"}}>
          <WifiOff size={18} style={{color:"#ef4444",flexShrink:0}}/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{totalErr} sensor{totalErr>1?"es":""} sin señal</p>
            <p className="text-xs text-red-500">Parcela Valle Central y Depósito B-03 fuera de línea. Datos no disponibles.</p>
          </div>
          <button onClick={()=>setActive("campo")} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{background:"#ef4444"}}>Ir a Campo</button>
        </div>
      )}
      <div className="grid grid-cols-4 gap-5">
        <KPICard label="Hectáreas Cultivadas" value={`${totalHa} ha`} sub="5 parcelas" icon={Leaf} color={C.oliveLight}/>
        <KPICard label="Toneladas Cosechadas" value="218 t" sub="Temporada 2024" icon={FlaskConical} color={C.amber}/>
        <KPICard label="Sensores con error" value={totalErr} sub="Campo + Bodega" icon={WifiOff} color="#ef4444" warn={totalErr>0}/>
        <KPICard label="Alertas de proceso" value={totalAlt} sub="Parámetros fuera de rango" icon={AlertCircle} color={C.amber} warn={totalAlt>0}/>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl p-6 border" style={{background:"white",borderColor:C.creamDark}}>
          <h3 className="text-sm font-semibold mb-1" style={{color:C.slate}}>Humedad y Temperatura · Parcelas en línea</h3>
          <p className="text-xs mb-4" style={{color:C.slateLight}}>Valle Central excluida (sin señal)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartCampo} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{fontSize:11,fill:C.slateLight}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="h" tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="t" orientation="right" tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}/>
              <Bar yAxisId="h" dataKey="humedad" name="Humedad %" fill={C.oliveLight} radius={[4,4,0,0]}/>
              <Bar yAxisId="t" dataKey="temp" name="Temp °C" fill={C.amber} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-6 border" style={{background:"white",borderColor:C.creamDark}}>
          <h3 className="text-sm font-semibold mb-1" style={{color:C.slate}}>°Brix y pH · Depósitos en línea</h3>
          <p className="text-xs mb-4" style={{color:C.slateLight}}>B-03 excluido (sin señal)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartBodega} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{fontSize:9,fill:C.slateLight}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="brix" tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="ph" orientation="right" tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false} domain={[0,8]}/>
              <Tooltip contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}/>
              <Bar yAxisId="brix" dataKey="brix" name="°Brix" fill={C.bordo} radius={[4,4,0,0]}/>
              <Bar yAxisId="ph" dataKey="ph" name="pH" fill={C.slateLight} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl p-6 border" style={{background:"white",borderColor:C.creamDark}}>
        <h3 className="text-sm font-semibold mb-4" style={{color:C.slate}}>Alertas Recientes</h3>
        <div className="space-y-2.5">
          {[
            {icon:WifiOff,    color:"#ef4444",   msg:"Parcela Valle Central — Sensor sin señal. Última lectura hace 3 h 42 min.",       time:"Hace 3 h"},
            {icon:WifiOff,    color:"#ef4444",   msg:"Depósito B-03 — Sensor fuera de línea. Temp/pH/°Brix no disponibles.",           time:"Hace 5 h"},
            {icon:AlertCircle,color:C.amber,     msg:"Depósito C-02 — °Brix 20.4, por encima del esperado. Revisar fermentación.",      time:"Hace 1 h"},
            {icon:AlertCircle,color:C.amber,     msg:"Depósito C-02 — pH 3.18, por debajo del óptimo (3.20–3.60).",                    time:"Hace 1 h"},
            {icon:AlertCircle,color:C.amber,     msg:"Parcela Río Sur — Humedad suelo 38%. Considerar riego.",                          time:"Hace 2 h"},
            {icon:CheckCircle,color:C.oliveLight,msg:"LOT-2024-001 Malbec — 12 días fermentación. pH y °Brix en rango.",               time:"Hace 8 h"},
          ].map((a,i)=>(
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{background:C.cream}}>
              <a.icon size={14} style={{color:a.color,marginTop:1,flexShrink:0}}/>
              <p className="text-xs flex-1" style={{color:C.slate}}>{a.msg}</p>
              <span className="text-xs flex-shrink-0" style={{color:C.slateLight}}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Mapa Leaflet (OpenStreetMap) ──────────────────────────────────────────────
// Coordenadas reales de Luján de Cuyo, Mendoza — zona vitivinícola
const parcelasGeo = [
  { id:1, lat:-33.0420, lng:-68.8760, nombre:"Parcela Andes Norte",   variedad:"Malbec",            estado:"Óptimo",       sensor:{ humedad:68, temp:22.4, estado:"online" } },
  { id:2, lat:-33.0290, lng:-68.8580, nombre:"Parcela Río Sur",       variedad:"Cabernet Sauvignon",estado:"Alerta",        sensor:{ humedad:38, temp:26.1, estado:"online" } },
  { id:3, lat:-33.0510, lng:-68.8430, nombre:"Parcela Loma Alta",     variedad:"Chardonnay",        estado:"Óptimo",       sensor:{ humedad:72, temp:18.9, estado:"online" } },
  { id:4, lat:-33.0650, lng:-68.8700, nombre:"Parcela Valle Central", variedad:"Merlot",            estado:"Error sensor", sensor:{ humedad:null, temp:null, estado:"error" } },
  { id:5, lat:-33.0580, lng:-68.8520, nombre:"Parcela Terrazas",      variedad:"Torrontés",         estado:"Óptimo",       sensor:{ humedad:61, temp:20.3, estado:"online" } },
];

// Polígonos de parcelas (lat/lng aproximados)
const parcelasPoligonos = [
  { id:1, color:"#22c55e", coords:[[-33.0380,-68.8810],[-33.0380,-68.8710],[-33.0460,-68.8710],[-33.0460,-68.8810]] },
  { id:2, color:"#f59e0b", coords:[[-33.0250,-68.8630],[-33.0250,-68.8530],[-33.0330,-68.8530],[-33.0330,-68.8630]] },
  { id:3, color:"#22c55e", coords:[[-33.0470,-68.8480],[-33.0470,-68.8380],[-33.0550,-68.8380],[-33.0550,-68.8480]] },
  { id:4, color:"#ef4444", coords:[[-33.0610,-68.8750],[-33.0610,-68.8650],[-33.0690,-68.8650],[-33.0690,-68.8750]] },
  { id:5, color:"#22c55e", coords:[[-33.0540,-68.8570],[-33.0540,-68.8470],[-33.0620,-68.8470],[-33.0620,-68.8570]] },
];

const MapaParcelas = ({ onSelect }) => {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    // Inyectar CSS de Leaflet si no está ya
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapRef.current || instanceRef.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, {
        center: [-33.048, -68.862],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });
      instanceRef.current = map;

      // Tiles OpenStreetMap (estilo similar a Google Maps)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Polígonos de parcelas
      parcelasPoligonos.forEach(pol => {
        L.polygon(pol.coords, {
          color: pol.color,
          fillColor: pol.color,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: pol.id === 4 ? "6,4" : null,
        }).addTo(map);
      });

      // Markers con iconos personalizados HTML
      parcelasGeo.forEach(p => {
        const color = p.estado === "Óptimo" ? "#22c55e" : p.estado === "Alerta" ? "#f59e0b" : "#ef4444";
        const esError = p.sensor.estado === "error";

        const iconHtml = `
          <div style="
            background:white;
            border:2.5px solid ${color};
            border-radius:12px 12px 12px 0;
            padding:5px 8px;
            box-shadow:0 2px 8px rgba(0,0,0,.18);
            min-width:110px;
            font-family:sans-serif;
            transform:rotate(0deg);
            cursor:pointer;
          ">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;${esError ? "animation:pulse 1.5s infinite;" : ""}"></span>
              <span style="font-size:10px;font-weight:700;color:#2D3748;white-space:nowrap;">${p.nombre.replace("Parcela ","")}</span>
            </div>
            <div style="font-size:9px;color:#4A5568;">${p.variedad}</div>
            ${esError
              ? `<div style="font-size:9px;color:#ef4444;font-weight:600;margin-top:2px;">⚠ Sin señal</div>`
              : `<div style="font-size:9px;color:#4A5568;margin-top:2px;">💧${p.sensor.humedad}% · 🌡${p.sensor.temp}°C</div>`
            }
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: "",
          iconAnchor: [0, 0],
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);

        // Click abre el modal de detalle (conectado a parcelas originales)
        marker.on("click", () => {
          const parcelaFull = parcelas.find(x => x.id === p.id);
          if (parcelaFull) onSelect(parcelaFull);
        });
      });

      // Estilo CSS para pulso en error
      if (!document.getElementById("map-pulse-style")) {
        const style = document.createElement("style");
        style.id = "map-pulse-style";
        style.textContent = `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`;
        document.head.appendChild(style);
      }
    };

    // Cargar Leaflet JS si no está
    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-2xl border overflow-hidden relative" style={{ borderColor: C.creamDark, height: 380 }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {/* Leyenda superpuesta */}
      <div className="absolute bottom-4 left-4 z-50 flex flex-col gap-1.5 p-3 rounded-xl shadow-lg"
        style={{ background: "white", border: `1px solid ${C.creamDark}`, pointerEvents: "none" }}>
        <p className="text-xs font-semibold mb-0.5" style={{ color: C.slate }}>Estado parcela</p>
        {[["#22c55e","Óptimo"],["#f59e0b","Alerta"],["#ef4444","Error sensor"]].map(([col,lbl]) => (
          <div key={lbl} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: col }} />
            <span className="text-xs" style={{ color: C.slateLight }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Modal Parcela ─────────────────────────────────────────────────────────────
const ParcelaModal = ({ parcela, onClose }) => {
  const { sensor } = parcela;
  const esError = sensor.estado==="error";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,.45)"}} onClick={onClose}>
      <div className="rounded-2xl w-[500px] shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-5 flex items-start justify-between" style={{background:C.bordo}}>
          <div>
            <h2 className="text-lg font-bold" style={{color:C.cream,fontFamily:"'Georgia',serif"}}>{parcela.nombre}</h2>
            <p className="text-sm mt-0.5" style={{color:"rgba(245,239,230,.65)"}}>{parcela.variedad} · {parcela.hectareas} ha</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X size={18} color={C.cream}/></button>
        </div>
        <div className="p-6 space-y-5" style={{background:"white"}}>
          <div className="grid grid-cols-3 gap-3">
            {[
              {icon:Leaf,    label:"Variedad",   value:parcela.variedad},
              {icon:Calendar,label:"Plantación", value:parcela.plantacion},
              {icon:MapPin,  label:"Fase",        value:parcela.fase},
            ].map((r,i)=>(
              <div key={i} className="flex flex-col gap-1 p-3 rounded-xl" style={{background:C.cream}}>
                <r.icon size={13} style={{color:C.bordo}}/>
                <p className="text-xs" style={{color:C.slateLight}}>{r.label}</p>
                <p className="text-sm font-semibold" style={{color:C.slate}}>{r.value}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{color:C.slate}}>Lecturas del sensor IoT</p>
              {esError
                ? <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500"><WifiOff size={11}/>Sin señal · {sensor.ultimaLectura}</span>
                : <span className="flex items-center gap-1.5 text-xs text-green-600"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>En línea · {sensor.ultimaLectura}</span>
              }
            </div>
            {esError ? (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2" style={{background:"#fff5f5",borderColor:"#fca5a5"}}>
                <WifiOff size={16} style={{color:"#ef4444",flexShrink:0}}/>
                <div>
                  <p className="text-sm font-semibold text-red-700">Sensor fuera de línea</p>
                  <p className="text-xs text-red-400 mt-1">Última lectura válida: {sensor.ultimaLectura}. Verificar alimentación y conectividad del nodo.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <SensorBar value={sensor.humedad}   min={0} max={100}  optMin={50} optMax={80}  unit="%" label="Humedad de suelo" color={C.oliveLight}/>
                <SensorBar value={sensor.temp}      min={0} max={45}   optMin={15} optMax={25}  unit="°C" label="Temperatura amb." color={C.amber}/>
                <SensorBar value={sensor.radiacion} min={0} max={1200} optMin={400} optMax={900} unit=" W/m²" label="Radiación solar" color="#f59e0b"/>
                <SensorBar value={sensor.viento}    min={0} max={60}   optMin={0}  optMax={30}  unit=" km/h" label="Velocidad viento" color={C.slateLight}/>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:C.bordo}}>Ver historial</button>
            <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{color:C.slate,borderColor:C.creamDark}}>Registrar intervención</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Módulo Campo ──────────────────────────────────────────────────────────────
const Campo = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div className="p-8 space-y-6">
      {selected&&<ParcelaModal parcela={selected} onClose={()=>setSelected(null)}/>}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{color:C.slate}}>Parcelas y Sensores de Campo</h2>
          <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Haz clic en un pin del mapa o en una fila para ver el detalle</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm" style={{borderColor:C.creamDark,color:C.slate}}>
          <Filter size={14}/> Filtrar
        </button>
      </div>

      <MapaParcelas onSelect={setSelected}/>

      <div className="rounded-2xl border overflow-hidden" style={{borderColor:C.creamDark}}>
        <table className="w-full text-sm">
          <thead style={{background:C.cream}}>
            <tr>
              {["Parcela / Fase","Variedad","ha","Humedad","Temp.","Radiación","Viento","Estado"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{color:C.slateLight}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{background:"white"}}>
            {parcelas.map(p=>{
              const s = p.sensor, esError = s.estado==="error";
              return (
                <tr key={p.id} onClick={()=>setSelected(p)}
                  className="border-t cursor-pointer hover:bg-amber-50 transition"
                  style={{borderColor:C.creamDark,background:esError?"#fff9f9":undefined}}>
                  <td className="px-4 py-3.5"><p className="text-xs font-semibold" style={{color:C.slate}}>{p.nombre}</p><p className="text-xs" style={{color:C.slateLight}}>{p.fase}</p></td>
                  <td className="px-4 py-3.5 text-xs" style={{color:C.slateLight}}>{p.variedad}</td>
                  <td className="px-4 py-3.5 text-xs" style={{color:C.slateLight}}>{p.hectareas}</td>
                  {esError ? (
                    <td colSpan={4} className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500"><WifiOff size={12}/>Sin señal · {s.ultimaLectura}</span>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-gray-200"><div className="h-1.5 rounded-full" style={{width:`${s.humedad}%`,background:s.humedad<45?"#ef4444":C.oliveLight}}/></div>
                          <span className="text-xs" style={{color:s.humedad<45?"#ef4444":C.slate}}>{s.humedad}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{color:C.slate}}>{s.temp} °C</td>
                      <td className="px-4 py-3.5 text-xs" style={{color:C.slate}}>{s.radiacion} W/m²</td>
                      <td className="px-4 py-3.5 text-xs" style={{color:C.slate}}>{s.viento} km/h</td>
                    </>
                  )}
                  <td className="px-4 py-3.5"><Badge label={p.estado}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Módulo Bodega ─────────────────────────────────────────────────────────────
const DepositoCard = ({d}) => {
  const {sensor} = d;
  const esError = sensor.estado==="error";
  const rangos = {
    "Fermentación":  {temp:[15,22],ph:[3.2,3.6],brix:[8,18]},
    "Crianza":       {temp:[12,16],ph:[3.2,3.8],brix:[0,8]},
    "Clarificación": {temp:[10,20],ph:[3.1,3.8],brix:[0,6]},
  }[d.estado]||{temp:[10,25],ph:[3.0,4.0],brix:[0,25]};
  const inRange = (v,[lo,hi]) => v!==null&&v>=lo&&v<=hi;
  const metrics = [
    {icon:Thermometer,label:"Temp.", value:sensor.temp, unit:"°C", ok:inRange(sensor.temp,rangos.temp), ref:`${rangos.temp[0]}–${rangos.temp[1]}°C`},
    {icon:Activity,   label:"pH",    value:sensor.ph,   unit:"",   ok:inRange(sensor.ph,  rangos.ph),   ref:`${rangos.ph[0]}–${rangos.ph[1]}`},
    {icon:Gauge,      label:"°Brix", value:sensor.brix, unit:"°",  ok:inRange(sensor.brix,rangos.brix), ref:`${rangos.brix[0]}–${rangos.brix[1]}°Bx`},
  ];
  return (
    <div className="p-4 rounded-2xl border hover:shadow-md transition" style={{background:"white",borderColor:esError?"#fca5a5":d.alertas.length>0?"#fde68a":C.creamDark}}>
      <div className="flex items-start justify-between mb-2">
        <div><p className="text-sm font-bold" style={{color:C.slate}}>{d.nombre}</p><p className="text-xs mt-0.5" style={{color:C.slateLight}}>{d.variedad} · {d.tipo}</p></div>
        <Badge label={d.estado}/>
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs" style={{color:C.slateLight}}>Lote: <span style={{color:C.slate,fontWeight:600}}>{d.lote}</span></p>
        <span className="text-xs flex items-center gap-1" style={{color:C.slateLight}}><Clock size={10}/>{d.dias} días</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200"><div className="h-1.5 rounded-full" style={{width:`${d.ocupacion}%`,background:C.bordo}}/></div>
        <span className="text-xs font-semibold" style={{color:C.slate}}>{d.ocupacion}% · {(d.capacidad*d.ocupacion/100).toLocaleString()} L</span>
      </div>
      {esError ? (
        <div className="flex items-start gap-2 p-3 rounded-xl border" style={{background:"#fff5f5",borderColor:"#fca5a5"}}>
          <WifiOff size={14} style={{color:"#ef4444",flexShrink:0}}/>
          <div><p className="text-xs font-semibold text-red-600">Sensor sin señal</p><p className="text-xs text-red-400 mt-0.5">{d.alertas[0]}</p></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m,i)=>(
            <div key={i} className="rounded-xl p-2.5 border" style={{background:m.ok?C.cream:"#fff5f5",borderColor:m.ok?C.creamDark:"#fca5a5"}}>
              <div className="flex items-center justify-between mb-1.5"><m.icon size={11} style={{color:m.ok?C.slateLight:"#ef4444"}}/>{!m.ok&&<AlertCircle size={10} style={{color:"#ef4444"}}/>}</div>
              <p className="text-base font-bold leading-none" style={{color:m.ok?C.slate:"#ef4444"}}>{m.value}{m.unit}</p>
              <p className="text-xs mt-0.5" style={{color:C.slateLight}}>{m.label}</p>
              <p style={{fontSize:9,color:"#aaa",marginTop:2}}>óptimo {m.ref}</p>
            </div>
          ))}
        </div>
      )}
      {!esError&&d.alertas.map((a,i)=>(
        <div key={i} className="flex items-start gap-2 mt-2 p-2.5 rounded-lg" style={{background:"#fffbeb",border:"1px solid #fde68a"}}>
          <AlertCircle size={11} style={{color:C.amber,flexShrink:0,marginTop:1}}/>
          <p className="text-xs" style={{color:"#92400e"}}>{a}</p>
        </div>
      ))}
    </div>
  );
};

const Bodega = () => {
  const cols = ["Fermentación","Clarificación","Crianza"];
  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-base font-semibold" style={{color:C.slate}}>Control de Depósitos y Barricas</h2>
        <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Temperatura · pH · °Brix en tiempo real. Rango óptimo por etapa.</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {cols.map(col=>{
          const items = depositos.filter(d=>d.estado===col);
          const errores = items.filter(d=>d.sensor.estado==="error").length;
          const alertas = items.filter(d=>d.alertas.length>0&&d.sensor.estado!=="error").length;
          return (
            <div key={col}>
              <div className="flex items-center gap-2 mb-3">
                <Badge label={col}/>
                <span className="text-xs" style={{color:C.slateLight}}>{items.length} dep.</span>
                <span className="ml-auto flex items-center gap-1">
                  {errores>0&&<span className="flex items-center gap-1 text-xs font-semibold text-red-500"><WifiOff size={10}/>{errores}</span>}
                  {alertas>0&&<span className="flex items-center gap-1 text-xs font-semibold" style={{color:C.amber}}><AlertCircle size={10}/>{alertas}</span>}
                </span>
              </div>
              <div className="space-y-4">{items.map(d=><DepositoCard key={d.id} d={d}/>)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Módulo Configuración ──────────────────────────────────────────────────────
const Toggle = ({on,onChange}) => (
  <button onClick={()=>onChange(!on)} className="relative w-10 h-5 rounded-full transition-colors" style={{background:on?C.bordo:"#d1d5db"}}>
    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{left:on?"1.25rem":"0.125rem"}}/>
  </button>
);

const Configuracion = () => {
  const [cfg, setCfg] = useState({
    pushErrorSensor:true, pushAlertaParametro:true, pushDiarioResumen:false,
    emailDiario:true, emailCritico:true,
    humedadMin:45, tempMaxFerm:22, brixAlertaFerm:19, phMin:3.2, phMax:3.6,
    intervaloSensor:5, retencionDias:90,
    nombre:"Juan Argüello", email:"j.arguello@bodegavindemia.com", rol:"Gerente de Producción",
  });
  const set = (k,v) => setCfg(c=>({...c,[k]:v}));
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const Section = ({icon:Icon,title,children}) => (
    <div className="rounded-2xl border overflow-hidden" style={{borderColor:C.creamDark}}>
      <div className="flex items-center gap-3 px-6 py-4" style={{background:C.cream}}>
        <Icon size={16} style={{color:C.bordo}}/><h3 className="text-sm font-semibold" style={{color:C.slate}}>{title}</h3>
      </div>
      <div className="p-6" style={{background:"white"}}>{children}</div>
    </div>
  );

  const Row = ({label,sub,children}) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{borderColor:C.creamDark}}>
      <div><p className="text-sm" style={{color:C.slate}}>{label}</p>{sub&&<p className="text-xs mt-0.5" style={{color:C.slateLight}}>{sub}</p>}</div>
      {children}
    </div>
  );

  const Num = ({val,k,min,max,step=1,unit=""}) => (
    <div className="flex items-center gap-2">
      <input type="number" value={val} min={min} max={max} step={step}
        onChange={e=>set(k,parseFloat(e.target.value))}
        className="w-20 text-center text-sm font-semibold border rounded-lg px-2 py-1.5 outline-none"
        style={{borderColor:C.creamDark,color:C.slate}}/>
      {unit&&<span className="text-xs" style={{color:C.slateLight}}>{unit}</span>}
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{color:C.slate}}>Configuración del Sistema</h2>
          <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Notificaciones, umbrales de alerta y parámetros de sensores.</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition" style={{background:saved?"#22c55e":C.bordo}}>
          {saved?<><CheckCircle size={14}/>Guardado</>:<><Save size={14}/>Guardar cambios</>}
        </button>
      </div>

      {/* Perfil */}
      <Section icon={User} title="Perfil de usuario">
        <div className="grid grid-cols-3 gap-4">
          {[["Nombre",cfg.nombre,"nombre"],["Email",cfg.email,"email"],["Rol",cfg.rol,"rol"]].map(([l,v,k])=>(
            <div key={k}>
              <p className="text-xs font-semibold mb-1.5" style={{color:C.slateLight}}>{l}</p>
              <input value={v} onChange={e=>set(k,e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 outline-none"
                style={{borderColor:C.creamDark,color:C.slate}}/>
            </div>
          ))}
        </div>
      </Section>

      {/* Push notifications */}
      <Section icon={BellRing} title="Push Notifications">
        <Row label="Error de sensor" sub="Alerta inmediata cuando un sensor pierde señal"><Toggle on={cfg.pushErrorSensor} onChange={v=>set("pushErrorSensor",v)}/></Row>
        <Row label="Parámetro fuera de rango" sub="pH, °Brix o temperatura en valores críticos"><Toggle on={cfg.pushAlertaParametro} onChange={v=>set("pushAlertaParametro",v)}/></Row>
        <Row label="Resumen diario" sub="Notificación con el estado de todas las parcelas a las 8:00 h"><Toggle on={cfg.pushDiarioResumen} onChange={v=>set("pushDiarioResumen",v)}/></Row>
        <Row label="Alertas por email" sub="Envío de email ante evento crítico"><Toggle on={cfg.emailCritico} onChange={v=>set("emailCritico",v)}/></Row>
        <Row label="Reporte diario por email" sub="Informe PDF automatizado cada mañana"><Toggle on={cfg.emailDiario} onChange={v=>set("emailDiario",v)}/></Row>
        {/* Test de push */}
        <div className="mt-4 p-4 rounded-xl border flex items-center justify-between" style={{background:C.cream,borderColor:C.creamDark}}>
          <div>
            <p className="text-sm font-semibold" style={{color:C.slate}}>Probar notificaciones</p>
            <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Envía una notificación de prueba a este dispositivo.</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold border" style={{borderColor:C.bordo,color:C.bordo}}>Enviar prueba</button>
        </div>
      </Section>

      {/* Umbrales de alerta */}
      <Section icon={Sliders} title="Umbrales de Alerta">
        <Row label="Humedad mínima de suelo" sub="Dispara alerta cuando el sensor reporta por debajo"><Num val={cfg.humedadMin} k="humedadMin" min={10} max={80} unit="%"/></Row>
        <Row label="Temperatura máx. en fermentación" sub="°C en depósitos en etapa de fermentación"><Num val={cfg.tempMaxFerm} k="tempMaxFerm" min={15} max={30} unit="°C"/></Row>
        <Row label="°Brix máximo en fermentación" sub="Alerta si supera este valor"><Num val={cfg.brixAlertaFerm} k="brixAlertaFerm" min={10} max={25} step={0.1} unit="°Bx"/></Row>
        <Row label="pH mínimo" sub="Válido para todos los estados de proceso"><Num val={cfg.phMin} k="phMin" min={2.5} max={3.5} step={0.01}/></Row>
        <Row label="pH máximo"><Num val={cfg.phMax} k="phMax" min={3.0} max={4.5} step={0.01}/></Row>
      </Section>

      {/* Sensores */}
      <Section icon={Wifi} title="Configuración de Sensores">
        <Row label="Intervalo de lectura" sub="Frecuencia de polling a los nodos IoT"><Num val={cfg.intervaloSensor} k="intervaloSensor" min={1} max={60} unit="min"/></Row>
        <Row label="Retención de datos históricos" sub="Días que se conservan los registros en la base de datos"><Num val={cfg.retencionDias} k="retencionDias" min={30} max={365} unit="días"/></Row>
        <Row label="Protocolo de comunicación" sub="Activo en todos los nodos">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{background:C.cream,color:C.slate}}>MQTT v5 / TLS</span>
        </Row>
      </Section>

      {/* Seguridad */}
      <Section icon={Shield} title="Seguridad">
        <Row label="Autenticación de dos factores"><Toggle on={true} onChange={()=>{}}/></Row>
        <Row label="Sesión activa"><span className="text-xs font-semibold text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Activa · Chrome / macOS</span></Row>
        <Row label="Última sesión" sub="Dispositivo registrado">
          <span className="text-xs" style={{color:C.slateLight}}>Hoy, 09:14 h</span>
        </Row>
      </Section>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
const titles = {
  dashboard:"Dashboard General",
  campo:"Módulo de Campo · Viñedos",
  bodega:"Módulo de Bodega · Producción",
  configuracion:"Configuración del Sistema",
};

export default function App() {
  const [active, setActive]   = useState("dashboard");
  const [notifs, setNotifs]   = useState(NOTIFS_INIT);
  const [bellOpen, setBell]   = useState(false);
  const unread = notifs.filter(n=>!n.leida).length;

  return (
    <div className="flex h-screen overflow-hidden" style={{fontFamily:"'Inter',sans-serif"}}>
      <Sidebar active={active} setActive={setActive} notifCount={unread}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={titles[active]} notifCount={unread} onBell={()=>setBell(b=>!b)}/>
        {bellOpen&&<NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={()=>setBell(false)}/>}
        <main className="flex-1 overflow-y-auto" style={{background:"#F7F4EF"}}>
          {active==="dashboard"    &&<Dashboard    setActive={setActive}/>}
          {active==="campo"        &&<Campo/>}
          {active==="bodega"       &&<Bodega/>}
          {active==="configuracion"&&<Configuracion/>}
        </main>
      </div>
    </div>
  );
}