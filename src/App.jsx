import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import {
  LayoutDashboard, Leaf, FlaskConical, Bell, Settings, ChevronRight,
  Droplets, Thermometer, Wine, X, MapPin, Calendar,
  Filter, AlertCircle, CheckCircle, Clock, WifiOff, Gauge, Activity,
  BellRing, BellOff, User, Sliders, Shield, Save, Wifi,
  History, TrendingUp, ChevronDown, Database, RefreshCw,
  Power, Timer, Zap, StopCircle, PlayCircle, PauseCircle
} from "lucide-react";

// ── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bordo:"#4A0E0E", bordoLight:"#7A1F1F",
  cream:"#F5EFE6", creamDark:"#EAE0D0",
  slate:"#2D3748", slateLight:"#4A5568",
  olive:"#5C6B2E", oliveLight:"#7A8C3E",
  amber:"#B7791F",
};

// ── Generador de historial simulado ─────────────────────────────────────────
const genHoras = (base, spread, n=24) =>
  Array.from({length:n},(_,i)=>({
    t: `${String(i).padStart(2,"0")}:00`,
    v: parseFloat((base + (Math.random()-0.5)*spread*2).toFixed(2))
  }));
const genDias = (base, spread, n=30) =>
  Array.from({length:n},(_,i)=>({
    t:`D-${n-i}`, v:parseFloat((base+(Math.random()-0.5)*spread*2).toFixed(2))
  }));

// ── Datos principales ─────────────────────────────────────────────────────────
const parcelas = [
  { id:1, nombre:"Parcela Andes Norte",   variedad:"Malbec",            hectareas:12.5, plantacion:2015, fase:"Envero",     estado:"Óptimo",
    sensor:{ humedad:68, temp:22.4, radiacion:812, viento:14, estado:"online", ultimaLectura:"hace 4 min" },
    historial:{ humedad:genHoras(68,8), temp:genHoras(22.4,3), radiacion:genHoras(812,120), viento:genHoras(14,6) } },
  { id:2, nombre:"Parcela Río Sur",       variedad:"Cabernet Sauvignon",hectareas:8.3,  plantacion:2012, fase:"Maduración", estado:"Alerta",
    sensor:{ humedad:38, temp:26.1, radiacion:940, viento:22, estado:"online", ultimaLectura:"hace 2 min" },
    historial:{ humedad:genHoras(38,6), temp:genHoras(26.1,2), radiacion:genHoras(940,100), viento:genHoras(22,8) } },
  { id:3, nombre:"Parcela Loma Alta",     variedad:"Chardonnay",        hectareas:6.7,  plantacion:2018, fase:"Brotación",  estado:"Óptimo",
    sensor:{ humedad:72, temp:18.9, radiacion:620, viento:8,  estado:"online", ultimaLectura:"hace 6 min" },
    historial:{ humedad:genHoras(72,5), temp:genHoras(18.9,2), radiacion:genHoras(620,90), viento:genHoras(8,4) } },
  { id:4, nombre:"Parcela Valle Central", variedad:"Merlot",            hectareas:10.1, plantacion:2010, fase:"Envero",     estado:"Error sensor",
    sensor:{ humedad:null, temp:null, radiacion:null, viento:null, estado:"error", ultimaLectura:"hace 3 h 42 min" },
    historial:{ humedad:genHoras(55,10), temp:genHoras(21,3), radiacion:genHoras(800,100), viento:genHoras(15,5) } },
  { id:5, nombre:"Parcela Terrazas",      variedad:"Torrontés",         hectareas:5.9,  plantacion:2020, fase:"Floración",  estado:"Óptimo",
    sensor:{ humedad:61, temp:20.3, radiacion:755, viento:11, estado:"online", ultimaLectura:"hace 1 min" },
    historial:{ humedad:genHoras(61,7), temp:genHoras(20.3,2), radiacion:genHoras(755,95), viento:genHoras(11,5) } },
];

const depositos = [
  { id:1, nombre:"Depósito A-01",       tipo:"Acero Inox",     capacidad:50000, ocupacion:82,  lote:"LOT-2024-001", estado:"Fermentación",  variedad:"Malbec",            dias:12,
    sensor:{ temp:18.2, ph:3.41, brix:14.8, estado:"online" }, alertas:[],
    historial:{ temp:genDias(18.2,1.5,12), ph:genDias(3.41,0.08,12), brix:genDias(17,1.2,12).map((d,i)=>({...d,v:parseFloat((17-i*0.18).toFixed(2))})) } },
  { id:2, nombre:"Barrica Francesa 12", tipo:"Roble Francés",  capacidad:225,   ocupacion:100, lote:"LOT-2023-018", estado:"Crianza",        variedad:"Cabernet Sauvignon",dias:280,
    sensor:{ temp:14.5, ph:3.62, brix:6.1, estado:"online" },  alertas:[],
    historial:{ temp:genDias(14.5,0.6,30), ph:genDias(3.62,0.05,30), brix:genDias(6.1,0.3,30) } },
  { id:3, nombre:"Depósito B-03",       tipo:"Hormigón",       capacidad:30000, ocupacion:60,  lote:"LOT-2024-002", estado:"Clarificación",  variedad:"Chardonnay",        dias:45,
    sensor:{ temp:null, ph:null, brix:null, estado:"error" },   alertas:["Sensor desconectado desde hace 5 h"],
    historial:{ temp:genDias(12,0.8,45), ph:genDias(3.3,0.06,45), brix:genDias(3.5,0.4,45) } },
  { id:4, nombre:"Barrica Americana 07",tipo:"Roble Americano",capacidad:225,   ocupacion:100, lote:"LOT-2023-012", estado:"Crianza",        variedad:"Merlot",            dias:340,
    sensor:{ temp:15.1, ph:3.55, brix:5.8, estado:"online" },  alertas:[],
    historial:{ temp:genDias(15.1,0.5,30), ph:genDias(3.55,0.04,30), brix:genDias(5.8,0.25,30) } },
  { id:5, nombre:"Depósito C-02",       tipo:"Acero Inox",     capacidad:80000, ocupacion:35,  lote:"LOT-2024-003", estado:"Fermentación",  variedad:"Torrontés",         dias:6,
    sensor:{ temp:22.8, ph:3.18, brix:20.4, estado:"online" }, alertas:["°Brix elevado (20.4) — revisar avance","pH bajo del rango óptimo"],
    historial:{ temp:genDias(22.8,1.8,6), ph:genDias(3.18,0.05,6), brix:genDias(20.4,0.8,6).map((d,i)=>({...d,v:parseFloat((22-i*0.27).toFixed(2))})) } },
];

const chartCampo  = parcelas.filter(p=>p.sensor.estado==="online").map(p=>({name:p.nombre.split(" ")[1],humedad:p.sensor.humedad,temp:p.sensor.temp}));
const chartBodega = depositos.filter(d=>d.sensor.estado==="online").map(d=>({name:d.nombre.replace("Depósito ","Dep.").replace("Barrica ","Bar."),temp:d.sensor.temp,ph:d.sensor.ph,brix:d.sensor.brix}));

// ── Notificaciones ────────────────────────────────────────────────────────────
const NOTIFS_INIT = [
  { id:1, tipo:"error",  leida:false, titulo:"Sensor sin señal",      msg:"Parcela Valle Central desconectada. Última lectura: hace 3 h 42 min.", time:"Hace 3 h" },
  { id:2, tipo:"error",  leida:false, titulo:"Sensor bodega offline",  msg:"Depósito B-03 sin señal desde hace 5 h. Temp/pH/°Brix no disponibles.", time:"Hace 5 h" },
  { id:3, tipo:"alerta", leida:false, titulo:"°Brix fuera de rango",   msg:"Depósito C-02: °Brix 20.4, por encima del esperado.", time:"Hace 1 h" },
  { id:4, tipo:"alerta", leida:false, titulo:"pH bajo en C-02",        msg:"pH 3.18 por debajo del rango óptimo (3.20–3.60).", time:"Hace 1 h" },
  { id:5, tipo:"alerta", leida:true,  titulo:"Humedad baja · Río Sur", msg:"Humedad suelo 38%. Por debajo del umbral mínimo (45%).", time:"Hace 2 h" },
  { id:6, tipo:"ok",     leida:true,  titulo:"Fermentación estable",   msg:"LOT-2024-001 Malbec: 12 días. pH y °Brix dentro de rango óptimo.", time:"Hace 8 h" },
];

// ── Utilidades ────────────────────────────────────────────────────────────────
const estadoMap = {
  "Óptimo":        {bg:"bg-green-100",  text:"text-green-800",  dot:"#22c55e"},
  "Alerta":        {bg:"bg-amber-100",  text:"text-amber-800",  dot:"#f59e0b"},
  "Error sensor":  {bg:"bg-red-100",    text:"text-red-700",    dot:"#dc2626"},
  "Fermentación":  {bg:"bg-purple-100", text:"text-purple-800", dot:"#a855f7"},
  "Crianza":       {bg:"bg-amber-100",  text:"text-amber-800",  dot:"#f59e0b"},
  "Clarificación": {bg:"bg-blue-100",   text:"text-blue-800",   dot:"#3b82f6"},
};

const Badge = ({label}) => {
  const s = estadoMap[label]||{bg:"bg-gray-100",text:"text-gray-700",dot:"#9ca3af"};
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:s.dot}}/>{label}
    </span>
  );
};

const SensorBar = ({value,min,max,optMin,optMax,unit,label,color}) => {
  if(value===null) return <div className="flex items-center gap-1.5"><WifiOff size={11} style={{color:"#ef4444"}}/><span className="text-xs text-red-500">Sin señal</span></div>;
  const pct=Math.min(Math.max(((value-min)/(max-min))*100,0),100);
  const oMinP=((optMin-min)/(max-min))*100, oMaxP=((optMax-min)/(max-min))*100;
  const ok=value>=optMin&&value<=optMax;
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

// ── Selector de rango temporal ────────────────────────────────────────────────
const RangeSelector = ({value, onChange, options}) => (
  <div className="flex rounded-lg overflow-hidden border" style={{borderColor:C.creamDark}}>
    {options.map(o=>(
      <button key={o.v} onClick={()=>onChange(o.v)}
        className="px-3 py-1.5 text-xs font-semibold transition"
        style={{background:value===o.v?C.bordo:"white", color:value===o.v?"white":C.slateLight}}>
        {o.l}
      </button>
    ))}
  </div>
);

// ── Panel de Notificaciones ───────────────────────────────────────────────────
const NotifPanel = ({notifs,setNotifs,onClose}) => {
  const markAll = () => setNotifs(n=>n.map(x=>({...x,leida:true})));
  const markOne = id => setNotifs(n=>n.map(x=>x.id===id?{...x,leida:true}:x));
  const clear   = id => setNotifs(n=>n.filter(x=>x.id!==id));
  const iconos  = {
    error:<WifiOff size={14} style={{color:"#ef4444"}}/>,
    alerta:<AlertCircle size={14} style={{color:C.amber}}/>,
    ok:<CheckCircle size={14} style={{color:C.oliveLight}}/>
  };
  return (
    <div className="fixed inset-0 flex justify-end" style={{zIndex:99999}} onClick={onClose}>
      <div className="w-96 flex flex-col shadow-2xl" style={{background:"white",marginTop:64}} onClick={e=>e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{borderColor:C.creamDark}}>
          <div><p className="text-sm font-bold" style={{color:C.slate}}>Notificaciones</p><p className="text-xs" style={{color:C.slateLight}}>{notifs.filter(n=>!n.leida).length} sin leer</p></div>
          <div className="flex items-center gap-2">
            <button onClick={markAll} className="text-xs px-2.5 py-1 rounded-lg border" style={{borderColor:C.creamDark,color:C.slateLight}}>Marcar todas</button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} style={{color:C.slateLight}}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifs.length===0&&(
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BellOff size={32} style={{color:C.creamDark}}/><p className="text-sm" style={{color:C.slateLight}}>Sin notificaciones</p>
            </div>
          )}
          {notifs.map(n=>(
            <div key={n.id} className="px-5 py-4 border-b hover:bg-gray-50 transition" style={{background:n.leida?"white":"#fdfaf7",borderColor:C.creamDark}}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{iconos[n.tipo]}</div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>markOne(n.id)}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold" style={{color:C.slate}}>{n.titulo}</p>
                    {!n.leida&&<span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:C.bordo}}/>}
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{color:C.slateLight}}>{n.msg}</p>
                  <p className="text-xs mt-1" style={{color:"#ccc"}}>{n.time}</p>
                </div>
                <button onClick={()=>clear(n.id)} className="p-1 hover:bg-gray-200 rounded"><X size={12} style={{color:"#ccc"}}/></button>
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
  {id:"dashboard",    label:"Dashboard",     icon:LayoutDashboard},
  {id:"campo",        label:"Campo",         icon:Leaf},
  {id:"bodega",       label:"Bodega",        icon:FlaskConical},
  {id:"configuracion",label:"Configuración", icon:Settings},
];

const Sidebar = ({active,setActive}) => {
  const errCampo  = parcelas.filter(p=>p.sensor.estado==="error").length;
  const errBodega = depositos.filter(d=>d.sensor.estado==="error").length + depositos.filter(d=>d.alertas.length>0&&d.sensor.estado!=="error").length;
  const badges = {campo:errCampo,bodega:errBodega};
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col" style={{background:C.bordo,minHeight:"100vh"}}>
      {/* Logo WineData */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:C.bordoLight}}>
            <Wine size={20} color={C.cream}/>
          </div>
          <div>
            <p className="text-sm font-bold tracking-widest uppercase" style={{color:C.cream,fontFamily:"'Georgia',serif"}}>WineData</p>
            <p className="text-xs" style={{color:"rgba(245,239,230,.5)"}}>Suite de Gestión</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({id,label,icon:Icon})=>{
          const isActive=active===id, badge=badges[id];
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
const Header = ({title,notifCount,onBell}) => (
  <header className="h-16 flex items-center justify-between px-8 border-b" style={{background:"white",borderColor:C.creamDark}}>
    <div>
      <h1 className="text-lg font-semibold" style={{color:C.slate,fontFamily:"'Georgia',serif"}}>{title}</h1>
      <p className="text-xs" style={{color:C.slateLight}}>Temporada 2024–2025 · Mendoza, Argentina · WineData</p>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={onBell} className="relative p-2 rounded-lg hover:bg-gray-100 transition">
        <Bell size={18} style={{color:C.slateLight}}/>
        {notifCount>0&&<span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:"#ef4444",fontSize:9}}>{notifCount}</span>}
      </button>
      <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{background:C.bordo}}>+ Registrar</button>
    </div>
  </header>
);

// ── KPI Card draggable ────────────────────────────────────────────────────────
const KPICard = ({label,value,sub,icon:Icon,color,warn,dragHandleProps,isDragging}) => (
  <div className="rounded-2xl p-5 border select-none transition-shadow"
    style={{
      background:"white",
      borderColor:warn?"#fca5a5":C.creamDark,
      boxShadow: isDragging ? "0 12px 40px rgba(0,0,0,.18)" : undefined,
      transform: isDragging ? "scale(1.03)" : undefined,
      cursor: "default",
    }}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:(warn?"#ef4444":color)+"18"}}>
          <Icon size={20} style={{color:warn?"#ef4444":color}}/>
        </div>
        {/* Drag handle */}
        <div {...dragHandleProps} title="Arrastrar para reorganizar"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-grab active:cursor-grabbing"
          style={{color:"#ccc"}}>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/>
            <circle cx="3" cy="8" r="1.5"/><circle cx="9" cy="8" r="1.5"/>
            <circle cx="3" cy="13" r="1.5"/><circle cx="9" cy="13" r="1.5"/>
          </svg>
        </div>
      </div>
      {warn&&<span className="flex items-center gap-1 text-xs font-semibold text-red-500"><AlertCircle size={11}/>Atención</span>}
    </div>
    <p className="text-2xl font-bold" style={{color:warn?"#ef4444":C.slate}}>{value}</p>
    <p className="text-sm font-medium mt-0.5" style={{color:C.slate}}>{label}</p>
    {sub&&<p className="text-xs mt-1" style={{color:C.slateLight}}>{sub}</p>}
  </div>
);

// ── Dashboard responsive + drag & drop KPIs ───────────────────────────────────
const Dashboard = ({setActive}) => {
  const totalErr = parcelas.filter(p=>p.sensor.estado==="error").length + depositos.filter(d=>d.sensor.estado==="error").length;
  const totalAlt = depositos.reduce((a,d)=>a+d.alertas.length,0);
  const totalHa  = parcelas.reduce((a,p)=>a+p.hectareas,0).toFixed(1);
  const riegosActivos = 1; // Río Sur activo

  // KPI cards — sin Toneladas Cosechadas
  const KPIS_INIT = [
    { id:"ha",     label:"Hectáreas Cultivadas",  value:`${totalHa} ha`,  sub:"5 parcelas activas",       icon:Leaf,         color:C.oliveLight, warn:false },
    { id:"riego",  label:"Riegos Activos",         value:riegosActivos,    sub:"Ver módulo Campo",         icon:Droplets,     color:"#0ea5e9",    warn:false },
    { id:"err",    label:"Sensores con error",     value:totalErr,         sub:"Campo + Bodega",           icon:WifiOff,      color:"#ef4444",    warn:totalErr>0 },
    { id:"alt",    label:"Alertas de proceso",     value:totalAlt,         sub:"Parámetros fuera de rango",icon:AlertCircle,  color:C.amber,      warn:totalAlt>0 },
  ];

  const [kpis, setKpis]       = useState(KPIS_INIT);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const onDragStart = (i) => { setDragIdx(i); };
  const onDragEnter = (i) => { setOverIdx(i); };
  const onDragEnd   = ()  => {
    if(dragIdx!==null && overIdx!==null && dragIdx!==overIdx){
      const next = [...kpis];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(overIdx, 0, moved);
      setKpis(next);
    }
    setDragIdx(null); setOverIdx(null);
  };

  // Responsive: columnas según ancho de ventana
  const [cols, setCols] = useState(4);
  useEffect(()=>{
    const update = () => {
      const w = window.innerWidth;
      if(w < 640)       setCols(1);
      else if(w < 900)  setCols(2);
      else if(w < 1200) setCols(3);
      else              setCols(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Banner error sensores */}
      {totalErr>0&&(
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2" style={{background:"#fff5f5",borderColor:"#fca5a5"}}>
          <WifiOff size={18} style={{color:"#ef4444",flexShrink:0}}/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{totalErr} sensor{totalErr>1?"es":""} sin señal</p>
            <p className="text-xs text-red-500">Parcela Valle Central y Depósito B-03 fuera de línea.</p>
          </div>
          <button onClick={()=>setActive("campo")} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{background:"#ef4444"}}>Ir a Campo</button>
        </div>
      )}

      {/* KPIs drag & drop */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs" style={{color:C.slateLight}}>
            Arrastrá las tarjetas por el ícono <span style={{fontWeight:700}}>⠿</span> para reorganizarlas
          </p>
        </div>
        <div style={{
          display:"grid",
          gridTemplateColumns:`repeat(${cols}, minmax(0, 1fr))`,
          gap:"1.25rem",
        }}>
          {kpis.map((k,i)=>(
            <div key={k.id}
              draggable
              onDragStart={()=>onDragStart(i)}
              onDragEnter={()=>onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={e=>e.preventDefault()}
              style={{
                opacity: dragIdx===i ? 0.4 : 1,
                outline: overIdx===i && dragIdx!==i ? `2px dashed ${C.bordo}` : "none",
                borderRadius: 16,
                transition:"opacity .15s,outline .1s",
              }}>
              <KPICard
                {...k}
                isDragging={dragIdx===i}
                dragHandleProps={{
                  draggable:false,
                  onMouseDown: e => e.stopPropagation(),
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos — responsive stack en mobile */}
      <div style={{
        display:"grid",
        gridTemplateColumns: cols>=2 ? "1fr 1fr" : "1fr",
        gap:"1.25rem"
      }}>
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

      {/* Alertas recientes */}
      <div className="rounded-2xl p-6 border" style={{background:"white",borderColor:C.creamDark}}>
        <h3 className="text-sm font-semibold mb-4" style={{color:C.slate}}>Alertas Recientes</h3>
        <div className="space-y-2.5">
          {[
            {icon:WifiOff,    color:"#ef4444",    msg:"Parcela Valle Central — Sensor sin señal. Última lectura hace 3 h 42 min.", time:"Hace 3 h"},
            {icon:WifiOff,    color:"#ef4444",    msg:"Depósito B-03 — Sensor fuera de línea. Temp/pH/°Brix no disponibles.",     time:"Hace 5 h"},
            {icon:AlertCircle,color:C.amber,      msg:"Depósito C-02 — °Brix 20.4, por encima del esperado. Revisar fermentación.",time:"Hace 1 h"},
            {icon:AlertCircle,color:C.amber,      msg:"Depósito C-02 — pH 3.18, por debajo del óptimo (3.20–3.60).",             time:"Hace 1 h"},
            {icon:AlertCircle,color:C.amber,      msg:"Parcela Río Sur — Humedad suelo 38%. Considerar riego.",                   time:"Hace 2 h"},
            {icon:CheckCircle,color:C.oliveLight, msg:"LOT-2024-001 Malbec — 12 días fermentación. pH y °Brix en rango.",        time:"Hace 8 h"},
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

// ── Mapa Leaflet ──────────────────────────────────────────────────────────────
const parcelasGeo = [
  {id:1,lat:-33.0420,lng:-68.8760,nombre:"Parcela Andes Norte",   variedad:"Malbec",            estado:"Óptimo",       sensor:{humedad:68, temp:22.4,estado:"online"}},
  {id:2,lat:-33.0290,lng:-68.8580,nombre:"Parcela Río Sur",       variedad:"Cabernet Sauvignon",estado:"Alerta",        sensor:{humedad:38, temp:26.1,estado:"online"}},
  {id:3,lat:-33.0510,lng:-68.8430,nombre:"Parcela Loma Alta",     variedad:"Chardonnay",        estado:"Óptimo",       sensor:{humedad:72, temp:18.9,estado:"online"}},
  {id:4,lat:-33.0650,lng:-68.8700,nombre:"Parcela Valle Central", variedad:"Merlot",            estado:"Error sensor", sensor:{humedad:null,temp:null,estado:"error"}},
  {id:5,lat:-33.0580,lng:-68.8520,nombre:"Parcela Terrazas",      variedad:"Torrontés",         estado:"Óptimo",       sensor:{humedad:61, temp:20.3,estado:"online"}},
];
const parcelasPoligonos = [
  {id:1,color:"#22c55e",coords:[[-33.0380,-68.8810],[-33.0380,-68.8710],[-33.0460,-68.8710],[-33.0460,-68.8810]]},
  {id:2,color:"#f59e0b",coords:[[-33.0250,-68.8630],[-33.0250,-68.8530],[-33.0330,-68.8530],[-33.0330,-68.8630]]},
  {id:3,color:"#22c55e",coords:[[-33.0470,-68.8480],[-33.0470,-68.8380],[-33.0550,-68.8380],[-33.0550,-68.8480]]},
  {id:4,color:"#ef4444",coords:[[-33.0610,-68.8750],[-33.0610,-68.8650],[-33.0690,-68.8650],[-33.0690,-68.8750]]},
  {id:5,color:"#22c55e",coords:[[-33.0540,-68.8570],[-33.0540,-68.8470],[-33.0620,-68.8470],[-33.0620,-68.8570]]},
];

const MapaParcelas = ({onSelect}) => {
  const mapRef=useRef(null), instanceRef=useRef(null);
  useEffect(()=>{
    if(!document.getElementById("leaflet-css")){
      const l=document.createElement("link"); l.id="leaflet-css"; l.rel="stylesheet";
      l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }
    const init=()=>{
      if(!mapRef.current||instanceRef.current) return;
      const L=window.L;
      const map=L.map(mapRef.current,{center:[-33.048,-68.862],zoom:13,zoomControl:true});
      instanceRef.current=map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© OpenStreetMap',maxZoom:19}).addTo(map);
      parcelasPoligonos.forEach(pol=>{
        L.polygon(pol.coords,{color:pol.color,fillColor:pol.color,fillOpacity:0.2,weight:2,dashArray:pol.id===4?"6,4":null}).addTo(map);
      });
      parcelasGeo.forEach(p=>{
        const color=p.estado==="Óptimo"?"#22c55e":p.estado==="Alerta"?"#f59e0b":"#ef4444";
        const esError=p.sensor.estado==="error";
        const html=`<div style="background:white;border:2.5px solid ${color};border-radius:12px 12px 12px 0;padding:5px 8px;box-shadow:0 2px 8px rgba(0,0,0,.18);min-width:110px;font-family:sans-serif;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
            <span style="font-size:10px;font-weight:700;color:#2D3748;">${p.nombre.replace("Parcela ","")}</span>
          </div>
          <div style="font-size:9px;color:#4A5568;">${p.variedad}</div>
          ${esError
            ? `<div style="font-size:9px;color:#ef4444;font-weight:600;margin-top:2px;">⚠ Sin señal</div>`
            : `<div style="font-size:9px;color:#4A5568;margin-top:2px;">💧${p.sensor.humedad}% · 🌡${p.sensor.temp}°C</div>`
          }
        </div>`;
        const icon=L.divIcon({html,className:"",iconAnchor:[0,0]});
        const marker=L.marker([p.lat,p.lng],{icon}).addTo(map);
        marker.on("click",()=>{ const pf=parcelas.find(x=>x.id===p.id); if(pf) onSelect(pf); });
      });
    };
    if(window.L){ init(); } else {
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload=init; document.head.appendChild(s);
    }
    return ()=>{ if(instanceRef.current){ instanceRef.current.remove(); instanceRef.current=null; } };
  },[]);
  return (
    <div className="rounded-2xl border overflow-hidden relative" style={{borderColor:C.creamDark,height:360,zIndex:0,position:"relative"}}>
      <div ref={mapRef} style={{width:"100%",height:"100%"}}/>
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 p-3 rounded-xl shadow-lg" style={{background:"white",border:`1px solid ${C.creamDark}`,pointerEvents:"none",zIndex:1000}}>
        <p className="text-xs font-semibold mb-0.5" style={{color:C.slate}}>Estado parcela</p>
        {[["#22c55e","Óptimo"],["#f59e0b","Alerta"],["#ef4444","Error sensor"]].map(([col,lbl])=>(
          <div key={lbl} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{background:col}}/><span className="text-xs" style={{color:C.slateLight}}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Modal Historial Parcela ───────────────────────────────────────────────────
const HistorialParcelaModal = ({parcela,onClose}) => {
  const [rango,setRango] = useState("24h");
  const [metrica,setMetrica] = useState("humedad");
  const data = parcela.historial[metrica] || [];
  const sliced = rango==="24h" ? data.slice(-24) : rango==="7d" ? data.slice(-7) : data;
  const metricas = [
    {v:"humedad",l:"Humedad",unit:"%",color:C.oliveLight},
    {v:"temp",   l:"Temp.",  unit:"°C",color:C.amber},
    {v:"radiacion",l:"Rad.", unit:"W/m²",color:"#f59e0b"},
    {v:"viento", l:"Viento", unit:"km/h",color:C.slateLight},
  ];
  const m = metricas.find(x=>x.v===metrica);
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,.5)",zIndex:99999}} onClick={onClose}>
      <div className="rounded-2xl w-[640px] shadow-2xl overflow-hidden" style={{position:"relative",zIndex:100000}} onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-5 flex items-center justify-between" style={{background:C.bordo}}>
          <div>
            <div className="flex items-center gap-2">
              <History size={16} color={C.cream}/>
              <h2 className="text-base font-bold" style={{color:C.cream,fontFamily:"'Georgia',serif"}}>WineData · Historial de Campo</h2>
            </div>
            <p className="text-sm mt-0.5" style={{color:"rgba(245,239,230,.65)"}}>{parcela.nombre} · {parcela.variedad}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X size={18} color={C.cream}/></button>
        </div>
        <div className="p-6 space-y-5" style={{background:"white"}}>
          {/* Selectores */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {metricas.map(m2=>(
                <button key={m2.v} onClick={()=>setMetrica(m2.v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                  style={{background:metrica===m2.v?m2.color:"white",color:metrica===m2.v?"white":C.slateLight,borderColor:metrica===m2.v?m2.color:C.creamDark}}>
                  {m2.l}
                </button>
              ))}
            </div>
            <RangeSelector value={rango} onChange={setRango} options={[{v:"24h",l:"24 h"},{v:"7d",l:"7 d"},{v:"30d",l:"30 d"}]}/>
          </div>
          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sliced}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4"/>
              <XAxis dataKey="t" tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false} unit={m?.unit}/>
              <Tooltip contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}} formatter={v=>[`${v}${m?.unit}`,m?.l]}/>
              <Line type="monotone" dataKey="v" stroke={m?.color||C.bordo} strokeWidth={2} dot={false} activeDot={{r:4}}/>
            </LineChart>
          </ResponsiveContainer>
          {/* Stats resumen */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {l:"Mínimo",  v:Math.min(...sliced.map(d=>d.v)).toFixed(1)},
              {l:"Máximo",  v:Math.max(...sliced.map(d=>d.v)).toFixed(1)},
              {l:"Promedio",v:(sliced.reduce((a,d)=>a+d.v,0)/sliced.length).toFixed(1)},
              {l:"Lecturas",v:sliced.length},
            ].map((s,i)=>(
              <div key={i} className="rounded-xl p-3" style={{background:C.cream}}>
                <p className="text-xs" style={{color:C.slateLight}}>{s.l}</p>
                <p className="text-lg font-bold mt-0.5" style={{color:C.slate}}>{s.v}<span className="text-xs font-normal ml-1">{i<3?m?.unit:""}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Modal Parcela (detalle + acceso al historial) ─────────────────────────────
const ParcelaModal = ({parcela,onClose}) => {
  const {sensor}=parcela;
  const esError=sensor.estado==="error";
  const [showHistorial,setShowHistorial]=useState(false);
  if(showHistorial) return <HistorialParcelaModal parcela={parcela} onClose={()=>setShowHistorial(false)}/>;
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,.45)",zIndex:99999}} onClick={onClose}>
      <div className="rounded-2xl w-[500px] shadow-2xl overflow-hidden" style={{position:"relative",zIndex:100000}} onClick={e=>e.stopPropagation()}>
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
              {icon:MapPin,  label:"Fase",       value:parcela.fase},
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
                  <p className="text-xs text-red-400 mt-1">Última lectura: {sensor.ultimaLectura}. Verificar conectividad del nodo.</p>
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
            <button onClick={()=>setShowHistorial(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:C.bordo}}>
              <History size={14}/> Ver historial WineData
            </button>
            <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{color:C.slate,borderColor:C.creamDark}}>Registrar intervención</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Estado inicial de riego por parcela ───────────────────────────────────────
const RIEGO_INIT = {
  1: { activo:false, modo:"manual",      zona:"completa", duracionMin:30,  programado:"",      ultimoRiego:"Ayer 06:30",  litros:0    },
  2: { activo:true,  modo:"manual",      zona:"completa", duracionMin:24,  programado:"",      ultimoRiego:"Hoy 08:00",   litros:1840 },
  3: { activo:false, modo:"auto",        zona:"norte",    duracionMin:30,  programado:"06:00", ultimoRiego:"Hoy 06:00",   litros:0    },
  4: { activo:false, modo:"manual",      zona:"completa", duracionMin:30,  programado:"",      ultimoRiego:"Hace 3 días", litros:0    },
  5: { activo:false, modo:"programado",  zona:"completa", duracionMin:45,  programado:"07:30", ultimoRiego:"Hoy 07:30",   litros:0    },
};
const ZONAS = ["completa","norte","sur","este","oeste","sector A","sector B"];

// ── Modal control de riego ────────────────────────────────────────────────────
const RiegoModal = ({parcela, riego, onSave, onClose}) => {
  const [cfg, setCfg] = useState({...riego});
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k,v) => setCfg(c=>({...c,[k]:v}));
  const humedadActual = parcela.sensor.humedad;
  const humedadBaja   = humedadActual !== null && humedadActual < 45;

  const toggleRiego = () => {
    if(cfg.activo){ setCfg(c=>({...c,activo:false,litros:0})); }
    else { setConfirm(true); }
  };
  const activar = () => {
    setCfg(c=>({...c,activo:true,ultimoRiego:"Ahora"}));
    setConfirm(false);
  };
  const guardar = () => {
    onSave(parcela.id, cfg);
    setSaved(true);
    setTimeout(()=>{ setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,.55)",zIndex:99999}} onClick={onClose}>
      <div className="rounded-2xl w-[540px] shadow-2xl overflow-hidden" style={{position:"relative",zIndex:100000}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{background: cfg.activo ? "#14532d" : C.bordo}}>
          <div>
            <div className="flex items-center gap-2">
              <Droplets size={16} color={C.cream}/>
              <h2 className="text-base font-bold" style={{color:C.cream,fontFamily:"Georgia,serif"}}>Control de Riego · WineData</h2>
            </div>
            <p className="text-sm mt-0.5" style={{color:"rgba(245,239,230,.65)"}}>{parcela.nombre} · {parcela.variedad} · {parcela.hectareas} ha</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X size={18} color={C.cream}/></button>
        </div>

        <div className="p-6 space-y-4" style={{background:"white"}}>

          {/* Alerta humedad baja */}
          {humedadBaja && (
            <div className="flex items-start gap-3 p-3 rounded-xl border" style={{background:"#fff8e1",borderColor:"#fde68a"}}>
              <AlertCircle size={14} style={{color:C.amber,flexShrink:0,marginTop:1}}/>
              <p className="text-xs" style={{color:"#92400e"}}>
                Humedad actual <strong>{humedadActual}%</strong> — por debajo del umbral mínimo (45%). Se recomienda activar riego.
              </p>
            </div>
          )}

          {/* Estado + botón principal */}
          <div className="flex items-center justify-between p-4 rounded-2xl border-2" style={{
            background:cfg.activo?"#f0fdf4":C.cream,
            borderColor:cfg.activo?"#86efac":C.creamDark,
          }}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.activo?"bg-green-500":"bg-gray-300"}`}
                  style={cfg.activo?{boxShadow:"0 0 0 3px #bbf7d0"}:{}}/>
                <p className="text-sm font-bold" style={{color:cfg.activo?"#166534":C.slate}}>
                  {cfg.activo ? "Riego activo" : "Riego inactivo"}
                </p>
              </div>
              {cfg.activo && <p className="text-xs mt-1 ml-4" style={{color:"#166534"}}>Zona: {cfg.zona} · {cfg.duracionMin} min · {cfg.modo}</p>}
              {!cfg.activo && cfg.programado && cfg.modo!=="manual" && (
                <p className="text-xs mt-1 ml-4" style={{color:C.slateLight}}>Próximo: {cfg.programado} (modo {cfg.modo})</p>
              )}
            </div>
            <button onClick={toggleRiego}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{background:cfg.activo?"#ef4444":"#16a34a"}}>
              {cfg.activo ? <><StopCircle size={15}/> Detener</> : <><PlayCircle size={15}/> Activar</>}
            </button>
          </div>

          {/* Panel de confirmación */}
          {confirm && (
            <div className="p-4 rounded-xl border-2 space-y-3" style={{background:"#f0fdf4",borderColor:"#86efac"}}>
              <p className="text-sm font-semibold" style={{color:"#166534"}}>⚠ Confirmar activación de riego</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{color:C.slateLight}}>Zona a regar</p>
                  <select value={cfg.zona} onChange={e=>set("zona",e.target.value)}
                    className="w-full text-sm border rounded-xl px-3 py-2 outline-none"
                    style={{borderColor:"#86efac",color:C.slate}}>
                    {ZONAS.map(z=><option key={z} value={z}>{z.charAt(0).toUpperCase()+z.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{color:C.slateLight}}>Duración</p>
                  <div className="flex items-center gap-2">
                    <input type="number" value={cfg.duracionMin} min={5} max={180} onChange={e=>set("duracionMin",+e.target.value)}
                      className="w-full text-sm border rounded-xl px-3 py-2 outline-none text-center font-bold"
                      style={{borderColor:"#86efac",color:C.slate}}/>
                    <span className="text-xs flex-shrink-0" style={{color:C.slateLight}}>min</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={activar} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{background:"#16a34a"}}>
                  ✓ Confirmar
                </button>
                <button onClick={()=>setConfirm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border" style={{color:C.slate,borderColor:C.creamDark}}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Configuración detallada */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{color:C.slateLight}}>Zona de riego</p>
              <select value={cfg.zona} onChange={e=>set("zona",e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 outline-none"
                style={{borderColor:C.creamDark,color:C.slate}}>
                {ZONAS.map(z=><option key={z} value={z}>{z.charAt(0).toUpperCase()+z.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{color:C.slateLight}}>Modo de operación</p>
              <div className="flex rounded-xl overflow-hidden border" style={{borderColor:C.creamDark}}>
                {[{v:"manual",l:"Manual"},{v:"auto",l:"Auto"},{v:"programado",l:"Program."}].map(o=>(
                  <button key={o.v} onClick={()=>set("modo",o.v)}
                    className="flex-1 py-2 text-xs font-semibold transition"
                    style={{background:cfg.modo===o.v?C.oliveLight:"white",color:cfg.modo===o.v?"white":C.slateLight}}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{color:C.slateLight}}>Duración (minutos)</p>
              <div className="flex items-center gap-2">
                <input type="number" value={cfg.duracionMin} min={5} max={180} onChange={e=>set("duracionMin",+e.target.value)}
                  className="w-full text-sm border rounded-xl px-3 py-2 outline-none text-center font-bold"
                  style={{borderColor:C.creamDark,color:C.slate}}/>
                <span className="text-xs flex-shrink-0" style={{color:C.slateLight}}>min</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{color:C.slateLight}}>Horario programado</p>
              <input type="time" value={cfg.programado||"06:00"} onChange={e=>set("programado",e.target.value)}
                className="w-full text-sm border rounded-xl px-3 py-2 outline-none"
                style={{borderColor:C.creamDark,color:C.slate}}/>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {l:"Último riego",  v:cfg.ultimoRiego},
              {l:"Litros hoy",    v:cfg.litros>0?`${cfg.litros.toLocaleString()} L`:"—"},
              {l:"Humedad suelo", v:humedadActual!==null?`${humedadActual}%`:"Sin señal"},
            ].map((s,i)=>(
              <div key={i} className="rounded-xl p-3" style={{background:C.cream}}>
                <p className="text-xs" style={{color:C.slateLight}}>{s.l}</p>
                <p className="text-sm font-bold mt-0.5" style={{color:C.slate}}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* Guardar */}
          <div className="flex gap-3">
            <button onClick={guardar}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{background:saved?"#22c55e":C.bordo}}>
              {saved ? <><CheckCircle size={14}/> Guardado</> : <><Save size={14}/> Guardar configuración</>}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{color:C.slate,borderColor:C.creamDark}}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Módulo Campo ──────────────────────────────────────────────────────────────
const Campo = () => {
  const [selected,setSelected]=useState(null);
  const [riegoModal,setRiegoModal]=useState(null);
  const [riegoState,setRiegoState]=useState(RIEGO_INIT);

  const saveRiego=(parcelaId,cfg)=>{
    setRiegoState(r=>({...r,[parcelaId]:cfg}));
  };

  const riegosActivos = Object.values(riegoState).filter(r=>r.activo).length;

  return (
    <div className="p-8 space-y-6">
      {selected&&<ParcelaModal parcela={selected} onClose={()=>setSelected(null)}/>}
      {riegoModal&&(
        <RiegoModal
          parcela={riegoModal}
          riego={riegoState[riegoModal.id]}
          onSave={saveRiego}
          onClose={()=>setRiegoModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{color:C.slate}}>Parcelas y Sensores de Campo</h2>
          <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Clic en un pin o fila para ver detalle. Control de riego por zona disponible.</p>
        </div>
        <div className="flex items-center gap-3">
          {riegosActivos>0&&(
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{background:"#dcfce7",color:"#166534"}}>
              <Droplets size={11}/> {riegosActivos} riego{riegosActivos>1?"s":""} activo{riegosActivos>1?"s":""}
            </span>
          )}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm" style={{borderColor:C.creamDark,color:C.slate}}>
            <Filter size={14}/> Filtrar
          </button>
        </div>
      </div>

      <MapaParcelas onSelect={setSelected}/>

      {/* Resumen de riego */}
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:C.creamDark}}>
        <div className="px-5 py-3.5 flex items-center gap-3" style={{background:C.cream}}>
          <Droplets size={15} style={{color:C.oliveLight}}/>
          <h3 className="text-sm font-semibold" style={{color:C.slate}}>Estado de Riego por Parcela</h3>
          <span className="ml-auto text-xs" style={{color:C.slateLight}}>Activá o configurá el riego de cada zona desde esta tabla</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{background:"#fafaf8"}}>
              <tr>
                {["Parcela","Zona","Modo","Duración","Programado","Último riego","Litros hoy","Estado","Riego"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{color:C.slateLight}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{background:"white"}}>
              {parcelas.map(p=>{
                const r=riegoState[p.id];
                const esError=p.sensor.estado==="error";
                const humedadBaja=p.sensor.humedad!==null&&p.sensor.humedad<45;
                return (
                  <tr key={p.id} className="border-t hover:bg-green-50 transition" style={{borderColor:C.creamDark,background:r.activo?"#f0fdf4":undefined}}>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold" style={{color:C.slate}}>{p.nombre}</p>
                      <p className="text-xs" style={{color:C.slateLight}}>{p.variedad}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium capitalize" style={{color:C.slate}}>{r.zona}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full capitalize"
                        style={{background:r.modo==="auto"?"#dcfce7":r.modo==="programado"?"#dbeafe":C.cream,
                                color:r.modo==="auto"?"#166534":r.modo==="programado"?"#1d4ed8":C.slate}}>
                        {r.modo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{color:C.slate}}>{r.duracionMin} min</td>
                    <td className="px-4 py-3.5 text-xs" style={{color:C.slateLight}}>{r.programado||"—"}</td>
                    <td className="px-4 py-3.5 text-xs" style={{color:C.slateLight}}>{r.ultimoRiego}</td>
                    <td className="px-4 py-3.5 text-xs" style={{color:C.slate}}>{r.litros>0?`${r.litros.toLocaleString()} L`:"—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0`}
                          style={{background:r.activo?"#22c55e":humedadBaja?"#f59e0b":"#d1d5db"}}/>
                        <span className="text-xs font-semibold"
                          style={{color:r.activo?"#166534":humedadBaja?"#92400e":C.slateLight}}>
                          {r.activo?"Activo":humedadBaja?"Baja humedad":"Inactivo"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={()=>setRiegoModal(p)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        style={{
                          background:r.activo?"#dcfce7":humedadBaja?"#fff8e1":"white",
                          color:r.activo?"#166534":humedadBaja?C.amber:C.bordo,
                          border:`1px solid ${r.activo?"#86efac":humedadBaja?"#fde68a":C.creamDark}`
                        }}>
                        <Droplets size={11}/> {r.activo?"Gestionar":"Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de sensores */}
      <div className="rounded-2xl border overflow-hidden" style={{borderColor:C.creamDark}}>
        <div className="px-5 py-3.5" style={{background:C.cream}}>
          <h3 className="text-sm font-semibold" style={{color:C.slate}}>Lecturas de Sensores IoT</h3>
        </div>
        <table className="w-full text-sm">
          <thead style={{background:"#fafaf8"}}>
            <tr>
              {["Parcela / Fase","Variedad","ha","Humedad","Temp.","Radiación","Viento","Estado",""].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{color:C.slateLight}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{background:"white"}}>
            {parcelas.map(p=>{
              const s=p.sensor, esError=s.estado==="error";
              return (
                <tr key={p.id} className="border-t hover:bg-amber-50 transition" style={{borderColor:C.creamDark,background:esError?"#fff9f9":undefined}}>
                  <td className="px-4 py-3.5 cursor-pointer" onClick={()=>setSelected(p)}>
                    <p className="text-xs font-semibold" style={{color:C.slate}}>{p.nombre}</p>
                    <p className="text-xs" style={{color:C.slateLight}}>{p.fase}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{color:C.slateLight}}>{p.variedad}</td>
                  <td className="px-4 py-3.5 text-xs" style={{color:C.slateLight}}>{p.hectareas}</td>
                  {esError?(
                    <td colSpan={4} className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500"><WifiOff size={12}/>Sin señal · {s.ultimaLectura}</span>
                    </td>
                  ):(
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
                  <td className="px-4 py-3.5">
                    <button onClick={()=>setSelected(p)} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:shadow transition" style={{borderColor:C.creamDark,color:C.bordo}}>
                      <History size={11}/> Historial
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Modal Historial Depósito ──────────────────────────────────────────────────
const HistorialDepositoModal = ({deposito,onClose}) => {
  const [metrica,setMetrica]=useState("temp");
  const [rango,setRango]=useState("7d");
  const data = deposito.historial[metrica]||[];
  const sliced = rango==="7d" ? data.slice(-7) : rango==="15d" ? data.slice(-15) : data;
  const metricas=[
    {v:"temp",l:"Temperatura",unit:"°C", color:C.amber},
    {v:"ph",  l:"pH",         unit:"",   color:C.bordo},
    {v:"brix",l:"°Brix",      unit:"°",  color:C.oliveLight},
  ];
  const m=metricas.find(x=>x.v===metrica);

  // Rangos óptimos por estado
  const rangos={
    "Fermentación":{temp:[15,22],ph:[3.2,3.6],brix:[8,18]},
    "Crianza":     {temp:[12,16],ph:[3.2,3.8],brix:[0,8]},
    "Clarificación":{temp:[10,20],ph:[3.1,3.8],brix:[0,6]},
  }[deposito.estado]||{temp:[10,25],ph:[3.0,4.0],brix:[0,25]};
  const [lo,hi]=rangos[metrica]||[0,100];

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,.55)",zIndex:99999}} onClick={onClose}>
      <div className="rounded-2xl w-[680px] shadow-2xl overflow-hidden" style={{position:"relative",zIndex:100000}} onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-5 flex items-center justify-between" style={{background:C.bordo}}>
          <div>
            <div className="flex items-center gap-2">
              <History size={16} color={C.cream}/>
              <h2 className="text-base font-bold" style={{color:C.cream,fontFamily:"'Georgia',serif"}}>WineData · Historial de Bodega</h2>
            </div>
            <p className="text-sm mt-0.5" style={{color:"rgba(245,239,230,.65)"}}>{deposito.nombre} · {deposito.variedad} · {deposito.lote}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X size={18} color={C.cream}/></button>
        </div>
        <div className="p-6 space-y-5" style={{background:"white"}}>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {metricas.map(m2=>(
                <button key={m2.v} onClick={()=>setMetrica(m2.v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                  style={{background:metrica===m2.v?m2.color:"white",color:metrica===m2.v?"white":C.slateLight,borderColor:metrica===m2.v?m2.color:C.creamDark}}>
                  {m2.l}
                </button>
              ))}
            </div>
            <RangeSelector value={rango} onChange={setRango} options={[{v:"7d",l:"7 d"},{v:"15d",l:"15 d"},{v:"30d",l:"Todo"}]}/>
          </div>

          {/* Zona óptima info */}
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{background:C.cream}}>
            <CheckCircle size={13} style={{color:C.oliveLight}}/>
            <p className="text-xs" style={{color:C.slate}}>
              Rango óptimo para <strong>{deposito.estado}</strong>: <strong>{lo}–{hi}{m?.unit}</strong>
            </p>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sliced}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4"/>
              {/* Banda de zona óptima simulada con líneas de referencia */}
              <XAxis dataKey="t" tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:10,fill:C.slateLight}} axisLine={false} tickLine={false} unit={m?.unit} domain={["auto","auto"]}/>
              <Tooltip contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,.1)"}} formatter={v=>[`${v}${m?.unit}`,m?.l]}/>
              <Line type="monotone" dataKey="v" stroke={m?.color||C.bordo} strokeWidth={2.5} dot={false} activeDot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-3">
            {[
              {l:"Mínimo",  v:Math.min(...sliced.map(d=>d.v)).toFixed(2)},
              {l:"Máximo",  v:Math.max(...sliced.map(d=>d.v)).toFixed(2)},
              {l:"Promedio",v:(sliced.reduce((a,d)=>a+d.v,0)/sliced.length).toFixed(2)},
              {l:"Lecturas",v:sliced.length},
            ].map((s,i)=>{
              const warn = i<3 && (parseFloat(s.v)<lo||parseFloat(s.v)>hi);
              return (
                <div key={i} className="rounded-xl p-3" style={{background:warn?"#fff5f5":C.cream,border:`1px solid ${warn?"#fca5a5":C.creamDark}`}}>
                  <p className="text-xs" style={{color:C.slateLight}}>{s.l}</p>
                  <p className="text-lg font-bold mt-0.5" style={{color:warn?"#ef4444":C.slate}}>{s.v}<span className="text-xs font-normal ml-1">{i<3?m?.unit:""}</span></p>
                  {warn&&<p className="text-xs text-red-400">Fuera de rango</p>}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:C.creamDark,color:C.slate}}>
              <Database size={13}/> Exportar CSV
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border" style={{borderColor:C.creamDark,color:C.slate}}>
              <RefreshCw size={13}/> Actualizar datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tarjeta Depósito ──────────────────────────────────────────────────────────
const DepositoCard = ({d,onHistorial}) => {
  const {sensor}=d;
  const esError=sensor.estado==="error";
  const rangos={
    "Fermentación":{temp:[15,22],ph:[3.2,3.6],brix:[8,18]},
    "Crianza":     {temp:[12,16],ph:[3.2,3.8],brix:[0,8]},
    "Clarificación":{temp:[10,20],ph:[3.1,3.8],brix:[0,6]},
  }[d.estado]||{temp:[10,25],ph:[3.0,4.0],brix:[0,25]};
  const inRange=(v,[lo,hi])=>v!==null&&v>=lo&&v<=hi;
  const metrics=[
    {icon:Thermometer,label:"Temp.", value:sensor.temp, unit:"°C",ok:inRange(sensor.temp,rangos.temp),ref:`${rangos.temp[0]}–${rangos.temp[1]}°C`},
    {icon:Activity,   label:"pH",   value:sensor.ph,   unit:"",  ok:inRange(sensor.ph,  rangos.ph),  ref:`${rangos.ph[0]}–${rangos.ph[1]}`},
    {icon:Gauge,      label:"°Brix",value:sensor.brix, unit:"°", ok:inRange(sensor.brix,rangos.brix),ref:`${rangos.brix[0]}–${rangos.brix[1]}°Bx`},
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
      {esError?(
        <div className="flex items-start gap-2 p-3 rounded-xl border" style={{background:"#fff5f5",borderColor:"#fca5a5"}}>
          <WifiOff size={14} style={{color:"#ef4444",flexShrink:0}}/>
          <div><p className="text-xs font-semibold text-red-600">Sensor sin señal</p><p className="text-xs text-red-400 mt-0.5">{d.alertas[0]}</p></div>
        </div>
      ):(
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
      {/* Botón historial */}
      <button onClick={()=>onHistorial(d)} className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border hover:shadow transition" style={{borderColor:C.creamDark,color:C.bordo}}>
        <History size={12}/> Ver historial WineData
      </button>
    </div>
  );
};

// ── Módulo Bodega ─────────────────────────────────────────────────────────────
const Bodega = () => {
  const [historialDep,setHistorialDep]=useState(null);
  const cols=["Fermentación","Clarificación","Crianza"];
  return (
    <div className="p-8 space-y-6">
      {historialDep&&<HistorialDepositoModal deposito={historialDep} onClose={()=>setHistorialDep(null)}/>}
      <div>
        <h2 className="text-base font-semibold" style={{color:C.slate}}>Control de Depósitos y Barricas</h2>
        <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Temperatura · pH · °Brix en tiempo real. Accedé al historial Winedata desde cada depósito.</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {cols.map(col=>{
          const items=depositos.filter(d=>d.estado===col);
          const errores=items.filter(d=>d.sensor.estado==="error").length;
          const alertas=items.filter(d=>d.alertas.length>0&&d.sensor.estado!=="error").length;
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
              <div className="space-y-4">{items.map(d=><DepositoCard key={d.id} d={d} onHistorial={setHistorialDep}/>)}</div>
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
  const [cfg,setCfg]=useState({
    pushErrorSensor:true, pushAlertaParametro:true, pushDiarioResumen:false,
    emailDiario:true, emailCritico:true,
    humedadMin:45, tempMaxFerm:22, brixAlertaFerm:19, phMin:3.2, phMax:3.6,
    intervaloSensor:5, retencionDias:90,
    nombre:"Juan Argüello", email:"j.arguello@bodegavindemia.com", rol:"Gerente de Producción",
    // Asiduidad de datos
    frecCampoMin:5, frecBodegaMin:2, frecResumenH:8,
    frecAlertaInmediata:true, frecBatchHorario:false, frecDigestoDiario:true,
    formatoExport:"CSV",
  });
  const set=(k,v)=>setCfg(c=>({...c,[k]:v}));
  const [saved,setSaved]=useState(false);
  const save=()=>{ setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const Section=({icon:Icon,title,sub,children})=>(
    <div className="rounded-2xl border overflow-hidden" style={{borderColor:C.creamDark}}>
      <div className="flex items-center gap-3 px-6 py-4" style={{background:C.cream}}>
        <Icon size={16} style={{color:C.bordo}}/><div><h3 className="text-sm font-semibold" style={{color:C.slate}}>{title}</h3>{sub&&<p className="text-xs mt-0.5" style={{color:C.slateLight}}>{sub}</p>}</div>
      </div>
      <div className="p-6" style={{background:"white"}}>{children}</div>
    </div>
  );
  const Row=({label,sub,children})=>(
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{borderColor:C.creamDark}}>
      <div><p className="text-sm" style={{color:C.slate}}>{label}</p>{sub&&<p className="text-xs mt-0.5" style={{color:C.slateLight}}>{sub}</p>}</div>
      {children}
    </div>
  );
  const Num=({val,k,min,max,step=1,unit=""})=>(
    <div className="flex items-center gap-2">
      <input type="number" value={val} min={min} max={max} step={step}
        onChange={e=>set(k,parseFloat(e.target.value))}
        className="w-20 text-center text-sm font-semibold border rounded-lg px-2 py-1.5 outline-none"
        style={{borderColor:C.creamDark,color:C.slate}}/>
      {unit&&<span className="text-xs" style={{color:C.slateLight}}>{unit}</span>}
    </div>
  );

  const freqOptions=[
    {v:1,l:"1 min"},{v:2,l:"2 min"},{v:5,l:"5 min"},{v:10,l:"10 min"},{v:15,l:"15 min"},{v:30,l:"30 min"},{v:60,l:"1 hora"}
  ];

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{color:C.slate}}>Configuración · WineData</h2>
          <p className="text-xs mt-0.5" style={{color:C.slateLight}}>Frecuencia de datos, notificaciones, umbrales y seguridad.</p>
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
              <input value={v} onChange={e=>set(k,e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2 outline-none" style={{borderColor:C.creamDark,color:C.slate}}/>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ASIDUIDAD / FRECUENCIA DE DATOS ── */}
      <Section icon={RefreshCw} title="Frecuencia de recepción de datos" sub="Configurá con qué asiduidad WineData recibe y procesa las lecturas de cada módulo">
        <Row label="Sensores de campo (parcelas)" sub="Intervalo de polling a los nodos IoT de viñedo">
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:C.creamDark}}>
            {freqOptions.map(o=>(
              <button key={o.v} onClick={()=>set("frecCampoMin",o.v)}
                className="px-2.5 py-1.5 text-xs font-semibold transition"
                style={{background:cfg.frecCampoMin===o.v?C.bordo:"white",color:cfg.frecCampoMin===o.v?"white":C.slateLight}}>
                {o.l}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Sensores de bodega (depósitos)" sub="Intervalo de lectura de Temp/pH/°Brix">
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:C.creamDark}}>
            {freqOptions.slice(0,5).map(o=>(
              <button key={o.v} onClick={()=>set("frecBodegaMin",o.v)}
                className="px-2.5 py-1.5 text-xs font-semibold transition"
                style={{background:cfg.frecBodegaMin===o.v?C.bordo:"white",color:cfg.frecBodegaMin===o.v?"white":C.slateLight}}>
                {o.l}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Resumen consolidado" sub="Generación del informe de estado general del sistema">
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:C.creamDark}}>
            {[{v:1,l:"1 h"},{v:4,l:"4 h"},{v:8,l:"8 h"},{v:24,l:"24 h"}].map(o=>(
              <button key={o.v} onClick={()=>set("frecResumenH",o.v)}
                className="px-3 py-1.5 text-xs font-semibold transition"
                style={{background:cfg.frecResumenH===o.v?C.bordo:"white",color:cfg.frecResumenH===o.v?"white":C.slateLight}}>
                {o.l}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Alertas inmediatas" sub="Envío en tiempo real ante eventos críticos (sensor offline, parámetro fuera de rango)">
          <Toggle on={cfg.frecAlertaInmediata} onChange={v=>set("frecAlertaInmediata",v)}/>
        </Row>
        <Row label="Batch horario de historial" sub="Consolida y escribe el historial WineData una vez por hora">
          <Toggle on={cfg.frecBatchHorario} onChange={v=>set("frecBatchHorario",v)}/>
        </Row>
        <Row label="Digesto diario" sub="Resumen del día enviado cada mañana con métricas clave">
          <Toggle on={cfg.frecDigestoDiario} onChange={v=>set("frecDigestoDiario",v)}/>
        </Row>
        <Row label="Formato de exportación WineData" sub="Formato por defecto al descargar historiales">
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor:C.creamDark}}>
            {["CSV","JSON","XLSX"].map(f=>(
              <button key={f} onClick={()=>set("formatoExport",f)}
                className="px-3 py-1.5 text-xs font-semibold transition"
                style={{background:cfg.formatoExport===f?C.bordo:"white",color:cfg.formatoExport===f?"white":C.slateLight}}>
                {f}
              </button>
            ))}
          </div>
        </Row>
        {/* Resumen de config actual */}
        <div className="mt-4 p-4 rounded-xl" style={{background:C.cream}}>
          <p className="text-xs font-semibold mb-2" style={{color:C.slate}}>Resumen de configuración actual</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {l:"Campo",v:`cada ${cfg.frecCampoMin} min`},
              {l:"Bodega",v:`cada ${cfg.frecBodegaMin} min`},
              {l:"Resumen",v:`cada ${cfg.frecResumenH} h`},
            ].map((s,i)=>(
              <div key={i} className="rounded-lg p-2.5" style={{background:"white",border:`1px solid ${C.creamDark}`}}>
                <p className="text-xs" style={{color:C.slateLight}}>{s.l}</p>
                <p className="text-sm font-bold mt-0.5" style={{color:C.slate}}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Push notifications */}
      <Section icon={BellRing} title="Push Notifications">
        <Row label="Error de sensor" sub="Alerta inmediata cuando un sensor pierde señal"><Toggle on={cfg.pushErrorSensor} onChange={v=>set("pushErrorSensor",v)}/></Row>
        <Row label="Parámetro fuera de rango" sub="pH, °Brix o temperatura en valores críticos"><Toggle on={cfg.pushAlertaParametro} onChange={v=>set("pushAlertaParametro",v)}/></Row>
        <Row label="Resumen diario" sub="Notificación con el estado de todas las parcelas a las 8:00 h"><Toggle on={cfg.pushDiarioResumen} onChange={v=>set("pushDiarioResumen",v)}/></Row>
        <Row label="Alertas por email" sub="Envío de email ante evento crítico"><Toggle on={cfg.emailCritico} onChange={v=>set("emailCritico",v)}/></Row>
        <Row label="Reporte diario por email" sub="Informe PDF automatizado cada mañana"><Toggle on={cfg.emailDiario} onChange={v=>set("emailDiario",v)}/></Row>
        <div className="mt-4 p-4 rounded-xl border flex items-center justify-between" style={{background:C.cream,borderColor:C.creamDark}}>
          <div><p className="text-sm font-semibold" style={{color:C.slate}}>Probar notificaciones</p><p className="text-xs mt-0.5" style={{color:C.slateLight}}>Envía una notificación de prueba a este dispositivo.</p></div>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold border" style={{borderColor:C.bordo,color:C.bordo}}>Enviar prueba</button>
        </div>
      </Section>

      {/* Umbrales */}
      <Section icon={Sliders} title="Umbrales de Alerta">
        <Row label="Humedad mínima de suelo" sub="Dispara alerta por debajo de este valor"><Num val={cfg.humedadMin} k="humedadMin" min={10} max={80} unit="%"/></Row>
        <Row label="Temperatura máx. en fermentación"><Num val={cfg.tempMaxFerm} k="tempMaxFerm" min={15} max={30} unit="°C"/></Row>
        <Row label="°Brix máximo en fermentación"><Num val={cfg.brixAlertaFerm} k="brixAlertaFerm" min={10} max={25} step={0.1} unit="°Bx"/></Row>
        <Row label="pH mínimo"><Num val={cfg.phMin} k="phMin" min={2.5} max={3.5} step={0.01}/></Row>
        <Row label="pH máximo"><Num val={cfg.phMax} k="phMax" min={3.0} max={4.5} step={0.01}/></Row>
      </Section>

      {/* Seguridad */}
      <Section icon={Shield} title="Seguridad">
        <Row label="Autenticación de dos factores"><Toggle on={true} onChange={()=>{}}/></Row>
        <Row label="Sesión activa"><span className="text-xs font-semibold text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Activa · Chrome / macOS</span></Row>
        <Row label="Última sesión" sub="Dispositivo registrado"><span className="text-xs" style={{color:C.slateLight}}>Hoy, 09:14 h</span></Row>
      </Section>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
const titles = {
  dashboard:"Dashboard General",
  campo:"Módulo de Campo · Viñedos",
  bodega:"Módulo de Bodega · Producción",
  configuracion:"Configuración · WineData",
};

export default function App() {
  const [active,setActive]  = useState("dashboard");
  const [notifs,setNotifs]  = useState(NOTIFS_INIT);
  const [bellOpen,setBell]  = useState(false);
  const unread = notifs.filter(n=>!n.leida).length;
  return (
    <div className="flex h-screen overflow-hidden" style={{fontFamily:"'Inter',sans-serif"}}>
      <Sidebar active={active} setActive={setActive}/>
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