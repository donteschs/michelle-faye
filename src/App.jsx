import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ───
const supabase = createClient(
  "https://obcopcseuuwmjprcbrnf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY29wY3NldXV3bWpwcmNicm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjA5NzAsImV4cCI6MjA5MDEzNjk3MH0.TybdJ1ocDTjr46vOYOYlV1yqKi-wT0Gjdd5eMAaeZp4"
);

const ADMIN_EMAIL = "michele.fay@sfr.fr";
const CATEGORIES = ["Tous", "Récits", "Témoignages", "Journal", "Réflexions politiques"];
const CITATIONS = [
  "Écrire, c'est donner une voix à ceux qui n'en ont plus.",
  "La mémoire est le fil invisible qui relie les générations.",
  "Chaque témoignage est une graine plantée dans la conscience collective.",
  "Le silence n'est pas l'oubli — c'est l'attente d'une plume.",
  "Nos histoires sont des ponts entre hier et demain.",
  "La parole écrite traverse le temps comme l'eau traverse la pierre.",
  "On n'écrit pas pour soi, on écrit pour ceux qui viendront après.",
];

const css = `
:root{--cream:#FAF7F2;--cream-dark:#F0EBE3;--ink:#2C2420;--ink-light:#5C534D;--ink-faint:#9B9088;--blue:#4A6FA5;--blue-light:#E8EFF8;--blue-deep:#2D4A7A;--gold:#C4955A;--gold-light:#F5EDE0;--rose:#B85C5C;--white:#FFFFFF;--serif:'Playfair Display',Georgia,serif;--body:'Source Serif 4',Georgia,serif;--transition:all .3s cubic-bezier(.4,0,.2,1)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--cream);color:var(--ink);font-family:var(--body);font-size:18px;line-height:1.75;-webkit-font-smoothing:antialiased}
.sw{min-height:100vh;display:flex;flex-direction:column}
.sh{background:rgba(255,255,255,.95);border-bottom:1px solid var(--cream-dark);position:sticky;top:0;z-index:100;backdrop-filter:blur(12px)}
.hi{max-width:1100px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
.st{font-family:var(--serif);font-size:24px;font-weight:600;color:var(--ink);cursor:pointer;letter-spacing:-.02em;transition:var(--transition)}
.st:hover{color:var(--blue)}.st span{font-style:italic;font-weight:400;color:var(--gold)}
.nl{display:flex;gap:28px;list-style:none;align-items:center}
.nk{font-family:var(--body);font-size:14px;font-weight:500;color:var(--ink-light);cursor:pointer;text-decoration:none;letter-spacing:.03em;text-transform:uppercase;transition:var(--transition);position:relative;padding-bottom:2px}
.nk::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--gold);transition:width .3s ease}
.nk:hover::after,.nk.active::after{width:100%}.nk:hover,.nk.active{color:var(--ink)}
.na{background:var(--blue);color:white!important;padding:8px 18px;border-radius:6px;font-size:13px;letter-spacing:.05em}
.na::after{display:none!important}.na:hover{background:var(--blue-deep);color:white!important}
.n-out{background:transparent;color:var(--ink-faint)!important;border:1px solid var(--cream-dark);padding:6px 14px;border-radius:6px;font-size:12px}
.n-out::after{display:none!important}.n-out:hover{border-color:var(--rose);color:var(--rose)!important}
.hb{display:none;background:none;border:none;cursor:pointer;padding:8px}
.hb span{display:block;width:24px;height:2px;background:var(--ink);margin:5px 0;transition:var(--transition)}
.mc{flex:1;max-width:1100px;margin:0 auto;padding:0 24px;width:100%}
.hero{padding:80px 0 60px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.hero-text h1{font-family:var(--serif);font-size:52px;line-height:1.15;font-weight:700;color:var(--ink);margin-bottom:20px;letter-spacing:-.03em}
.hero-text h1 em{font-style:italic;color:var(--blue);font-weight:600}
.hero-text p{font-size:19px;color:var(--ink-light);line-height:1.8;margin-bottom:32px}
.hero-photo{display:flex;justify-content:center}
.pf{width:320px;height:400px;background:linear-gradient(135deg,var(--cream-dark),var(--gold-light));border-radius:12px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(44,36,32,.1)}
.pf::before{content:'';position:absolute;inset:8px;border:1px solid var(--gold);border-radius:8px;opacity:.4}
.pi{font-family:var(--serif);font-size:80px;font-weight:700;color:var(--gold);opacity:.6}
.cban{background:var(--white);border-left:4px solid var(--gold);padding:28px 36px;margin:0 0 60px;border-radius:0 8px 8px 0;box-shadow:0 2px 20px rgba(44,36,32,.04)}
.cban blockquote{font-family:var(--serif);font-size:22px;font-style:italic;color:var(--ink);line-height:1.6}
.clab{font-family:var(--body);font-size:12px;text-transform:uppercase;letter-spacing:.15em;color:var(--gold);margin-bottom:8px;font-weight:600}
.sec{display:flex;align-items:center;gap:16px;margin-bottom:36px}
.sec h2{font-family:var(--serif);font-size:28px;font-weight:600;white-space:nowrap}
.sec::after{content:'';flex:1;height:1px;background:var(--cream-dark)}
.ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:28px;margin-bottom:60px}
.ac{background:var(--white);border-radius:10px;padding:32px;cursor:pointer;transition:var(--transition);border:1px solid transparent;position:relative;overflow:hidden}
.ac:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(44,36,32,.08);border-color:var(--cream-dark)}
.cc{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--blue);margin-bottom:12px;display:inline-block}
.ac h3{font-family:var(--serif);font-size:22px;font-weight:600;color:var(--ink);margin-bottom:10px;line-height:1.35}
.cdate{font-size:13px;color:var(--ink-faint);margin-bottom:14px}
.cex{font-size:16px;color:var(--ink-light);line-height:1.7;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ibdg{position:absolute;top:16px;right:16px;width:10px;height:10px;background:var(--gold);border-radius:50%}
.cflt{display:flex;gap:10px;margin-bottom:36px;flex-wrap:wrap}
.ctb{padding:8px 20px;border-radius:100px;border:1px solid var(--cream-dark);background:var(--white);font-family:var(--body);font-size:14px;color:var(--ink-light);cursor:pointer;transition:var(--transition)}
.ctb:hover{border-color:var(--blue);color:var(--blue)}
.ctb.active{background:var(--blue);color:white;border-color:var(--blue)}
.asingle{max-width:720px;margin:60px auto 80px}
.aback{font-size:14px;color:var(--blue);cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-bottom:32px;font-weight:500;transition:var(--transition)}
.aback:hover{color:var(--blue-deep)}
.acat{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--blue);margin-bottom:16px}
.asingle h1{font-family:var(--serif);font-size:42px;font-weight:700;line-height:1.2;margin-bottom:16px;letter-spacing:-.02em}
.adateS{font-size:15px;color:var(--ink-faint);margin-bottom:40px;padding-bottom:32px;border-bottom:1px solid var(--cream-dark)}
.abody{font-size:19px;line-height:1.9;color:var(--ink)}.abody p{margin-bottom:24px}
.sbar{margin-top:48px;padding-top:32px;border-top:1px solid var(--cream-dark);display:flex;gap:12px;align-items:center}
.sbar>span{font-size:13px;color:var(--ink-faint);text-transform:uppercase;letter-spacing:.1em;font-weight:600}
.sbtn{padding:8px 16px;border-radius:6px;border:1px solid var(--cream-dark);background:var(--white);font-size:13px;color:var(--ink-light);cursor:pointer;transition:var(--transition)}
.sbtn:hover{background:var(--blue-light);color:var(--blue);border-color:var(--blue)}
.about-page{max-width:760px;margin:60px auto 80px}
.about-page h1{font-family:var(--serif);font-size:42px;font-weight:700;margin-bottom:32px}
.about-page h2{font-family:var(--serif);font-size:26px;font-weight:600;margin:40px 0 16px}
.about-page p{font-size:18px;line-height:1.85;color:var(--ink-light);margin-bottom:20px}
.ahigh{background:var(--gold-light);border-left:4px solid var(--gold);padding:24px 28px;margin:32px 0;border-radius:0 8px 8px 0}
.ahigh p{font-family:var(--serif);font-style:italic;color:var(--ink);font-size:19px;margin:0}
.contact-page{max-width:600px;margin:60px auto 80px}
.contact-page h1{font-family:var(--serif);font-size:42px;font-weight:700;margin-bottom:12px}
.contact-page>p{font-size:18px;color:var(--ink-light);margin-bottom:40px}
.fg{margin-bottom:24px}
.fg label{display:block;font-size:14px;font-weight:600;color:var(--ink);margin-bottom:8px;letter-spacing:.02em}
.fg input,.fg textarea,.fg select{width:100%;padding:14px 16px;border:1px solid var(--cream-dark);border-radius:8px;font-family:var(--body);font-size:16px;color:var(--ink);background:var(--white);transition:var(--transition);outline:none}
.fg input:focus,.fg textarea:focus,.fg select:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-light)}
.fg textarea{min-height:160px;resize:vertical}
.btn{background:var(--blue);color:white;border:none;padding:14px 36px;border-radius:8px;font-family:var(--body);font-size:16px;font-weight:600;cursor:pointer;transition:var(--transition);letter-spacing:.02em}
.btn:hover{background:var(--blue-deep);transform:translateY(-1px)}
.btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.btn-out{background:transparent;color:var(--blue);border:1px solid var(--blue)}
.btn-out:hover{background:var(--blue-light);transform:none}
.btn-cancel{background:transparent;color:var(--ink-light);border:1px solid var(--cream-dark)}
.btn-sm{padding:8px 18px;font-size:14px}
.admin-page{max-width:760px;margin:40px auto 80px}
.admin-page h1{font-family:var(--serif);font-size:32px;font-weight:700;margin-bottom:8px}
.admin-page>p{color:var(--ink-light);margin-bottom:32px;font-size:16px}
.aform{background:var(--white);border-radius:12px;padding:36px;box-shadow:0 2px 20px rgba(44,36,32,.04);margin-bottom:40px}
.aform h2{font-family:var(--serif);font-size:22px;margin-bottom:24px}
.arow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chr{display:flex;align-items:center;gap:10px;margin-bottom:24px;margin-top:4px}
.chr input[type="checkbox"]{width:18px;height:18px;accent-color:var(--gold)}
.chr label{font-size:15px;color:var(--ink-light);cursor:pointer}
.alist{display:flex;flex-direction:column;gap:12px}
.aitem{background:var(--white);border-radius:8px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--cream-dark);transition:var(--transition)}
.aitem:hover{border-color:var(--blue-light)}
.aitem h4{font-family:var(--serif);font-size:17px;margin-bottom:4px}
.aitem>div:first-child span{font-size:13px;color:var(--ink-faint)}
.aacts{display:flex;gap:8px}
.aacts button{padding:6px 14px;border-radius:6px;border:1px solid var(--cream-dark);background:var(--white);font-size:13px;cursor:pointer;transition:var(--transition);font-family:var(--body)}
.aacts .ebt:hover{background:var(--blue-light);color:var(--blue)}
.aacts .dbt{color:var(--rose)}.aacts .dbt:hover{background:#fef2f2;border-color:var(--rose)}
.sf{background:var(--ink);color:rgba(255,255,255,.6);padding:48px 24px;margin-top:auto}
.finner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
.fbrand{font-family:var(--serif);font-size:20px;color:rgba(255,255,255,.85)}
.fbrand span{color:var(--gold);font-style:italic}
.flinks{display:flex;gap:24px;list-style:none}
.flinks li{font-size:14px;cursor:pointer;transition:var(--transition)}
.flinks li:hover{color:white}
.icards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
.icard{background:linear-gradient(135deg,var(--gold-light),var(--white));border-radius:10px;padding:28px;cursor:pointer;transition:var(--transition);border-left:4px solid var(--gold)}
.icard:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(196,149,90,.12)}
.icard h3{font-family:var(--serif);font-size:20px;margin-bottom:8px}
.notif{position:fixed;bottom:24px;right:24px;background:var(--ink);color:white;padding:14px 24px;border-radius:8px;font-size:15px;z-index:1000;animation:su .3s ease;box-shadow:0 8px 30px rgba(0,0,0,.2)}
.notif-err{background:var(--rose)}
@keyframes su{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.ld{display:flex;align-items:center;justify-content:center;padding:80px 0;color:var(--ink-faint);font-size:18px;font-style:italic;gap:2px}
.dot{display:inline-block;animation:pls 1.4s infinite ease-in-out}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes pls{0%,80%,100%{opacity:.3}40%{opacity:1}}
.mn{position:fixed;inset:0;background:var(--white);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px}
.mn .nk{font-size:20px}
.mclose{position:absolute;top:20px;right:24px;background:none;border:none;font-size:28px;cursor:pointer;color:var(--ink)}
.login-box{max-width:420px;margin:80px auto;background:var(--white);border-radius:16px;padding:48px;box-shadow:0 4px 30px rgba(44,36,32,.06)}
.login-box h2{font-family:var(--serif);font-size:28px;margin-bottom:8px;text-align:center}
.login-box>p{text-align:center;color:var(--ink-faint);font-size:15px;margin-bottom:32px}
.login-err{background:#fef2f2;color:var(--rose);padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:20px;text-align:center}
.cmt-section{margin-top:60px;padding-top:40px;border-top:1px solid var(--cream-dark)}
.cmt-section h3{font-family:var(--serif);font-size:24px;margin-bottom:24px}
.cmt-card{background:var(--white);border-radius:10px;padding:20px 24px;margin-bottom:16px;border:1px solid var(--cream-dark);position:relative}
.cmt-author{font-weight:600;font-size:15px;color:var(--ink);margin-bottom:2px}
.cmt-date{font-size:12px;color:var(--ink-faint);margin-bottom:10px}
.cmt-text{font-size:16px;line-height:1.7;color:var(--ink-light)}
.cmt-del{position:absolute;top:16px;right:16px;background:none;border:none;font-size:18px;color:var(--ink-faint);cursor:pointer;transition:var(--transition)}
.cmt-del:hover{color:var(--rose)}
.cmt-form{background:var(--white);border-radius:12px;padding:28px;margin-top:20px;border:1px solid var(--cream-dark)}
.cmt-form h4{font-family:var(--serif);font-size:18px;margin-bottom:16px}
.no-cmt{color:var(--ink-faint);font-style:italic;font-size:16px;margin-bottom:20px}
.admin-badge{display:inline-block;background:var(--gold-light);color:var(--gold);font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;letter-spacing:.05em;text-transform:uppercase;margin-left:8px}
@media(max-width:768px){
.nl{display:none}.hb{display:block}
.hero{grid-template-columns:1fr;gap:40px;padding:40px 0}
.hero-text h1{font-size:36px}.hero-photo{order:-1}
.pf{width:200px;height:250px}.pi{font-size:50px}
.ag{grid-template-columns:1fr}
.asingle h1,.about-page h1,.contact-page h1{font-size:32px}
.arow{grid-template-columns:1fr}
.finner{flex-direction:column;gap:20px;text-align:center}
.flinks{flex-wrap:wrap;justify-content:center}
.icards{grid-template-columns:1fr}
}`;

function fmtDate(d){return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
function fmtTime(d){return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}

export default function App(){
  const[page,setPage]=useState("home");
  const[articles,setArticles]=useState([]);
  const[loading,setLoading]=useState(true);
  const[selArticle,setSelArticle]=useState(null);
  const[catFilter,setCatFilter]=useState("Tous");
  const[mobNav,setMobNav]=useState(false);
  const[notif,setNotif]=useState(null);
  const[notifErr,setNotifErr]=useState(false);
  const[citIdx,setCitIdx]=useState(0);
  const[saving,setSaving]=useState(false);
  const[isAdmin,setIsAdmin]=useState(false);
  const[user,setUser]=useState(null);
  const[loginEmail,setLoginEmail]=useState("");
  const[loginPass,setLoginPass]=useState("");
  const[loginErr,setLoginErr]=useState("");
  const[loggingIn,setLoggingIn]=useState(false);
  const[editId,setEditId]=useState(null);
  const[fTitle,setFTitle]=useState("");
  const[fCat,setFCat]=useState("Récits");
  const[fContent,setFContent]=useState("");
  const[fImportant,setFImportant]=useState(false);
  const[cName,setCName]=useState("");
  const[cEmail,setCEmail]=useState("");
  const[cMsg,setCMsg]=useState("");
  const[comments,setComments]=useState([]);
  const[cmtName,setCmtName]=useState("");
  const[cmtText,setCmtText]=useState("");
  const[cmtLoading,setCmtLoading]=useState(false);
  const topRef=useRef(null);

  useEffect(()=>{const s=document.createElement("style");s.textContent=css;document.head.appendChild(s);return()=>document.head.removeChild(s)},[]);

  // Check session on load
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);setIsAdmin(session.user.email===ADMIN_EMAIL)}
    });
  },[]);

  const loadArticles=useCallback(async()=>{
    try{setLoading(true);const{data,error}=await supabase.from("articles").select("*").order("date",{ascending:false});
      if(error)throw error;setArticles(data||[])
    }catch(e){notify("Erreur de chargement",true)}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{loadArticles()},[loadArticles]);
  useEffect(()=>{const t=setInterval(()=>setCitIdx(i=>(i+1)%CITATIONS.length),12000);return()=>clearInterval(t)},[]);

  const loadComments=useCallback(async(aid)=>{
    try{setCmtLoading(true);const{data}=await supabase.from("comments").select("*").eq("article_id",aid).order("created_at",{ascending:false});
      setComments(data||[])
    }catch{setComments([])}
    finally{setCmtLoading(false)}
  },[]);

  const nav=(p,a=null)=>{setPage(p);setSelArticle(a);setMobNav(false);if(a)loadComments(a.id);topRef.current?.scrollIntoView({behavior:"smooth"})};
  const notify=(m,e=false)=>{setNotif(m);setNotifErr(e);setTimeout(()=>setNotif(null),3000)};
  const resetForm=()=>{setEditId(null);setFTitle("");setFCat("Récits");setFContent("");setFImportant(false)};

  const handleLogin=async()=>{
    setLoginErr("");setLoggingIn(true);
    try{
      const{data,error}=await supabase.auth.signInWithPassword({email:loginEmail,password:loginPass});
      if(error)throw error;
      setUser(data.user);setIsAdmin(data.user.email===ADMIN_EMAIL);
      setLoginEmail("");setLoginPass("");notify("Bienvenue, Michelle !");setPage("admin");
    }catch(e){setLoginErr(e.message||"Email ou mot de passe incorrect")}
    finally{setLoggingIn(false)}
  };

  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setUser(null);setIsAdmin(false);nav("home");notify("Déconnectée");
  };

  const handleSave=async()=>{
    if(!fTitle.trim()||!fContent.trim()){notify("Veuillez remplir le titre et le contenu.",true);return}
    setSaving(true);
    try{
      if(editId){
        const{error}=await supabase.from("articles").update({title:fTitle,category:fCat,content:fContent,important:fImportant}).eq("id",editId);
        if(error)throw error;notify("Article modifié !");
      }else{
        const{error}=await supabase.from("articles").insert({title:fTitle,category:fCat,content:fContent,important:fImportant,date:new Date().toISOString().split("T")[0]});
        if(error)throw error;notify("Article publié !");
      }
      resetForm();await loadArticles();
    }catch(e){notify("Erreur lors de l'enregistrement",true)}
    finally{setSaving(false)}
  };

  const handleEdit=a=>{setEditId(a.id);setFTitle(a.title);setFCat(a.category);setFContent(a.content);setFImportant(a.important);topRef.current?.scrollIntoView({behavior:"smooth"})};
  const handleDel=async id=>{try{await supabase.from("articles").delete().eq("id",id);notify("Article supprimé.");await loadArticles()}catch{notify("Erreur",true)}};

  const handleComment=async()=>{
    if(!cmtName.trim()||!cmtText.trim()){notify("Veuillez remplir votre nom et commentaire.",true);return}
    try{
      const{error}=await supabase.from("comments").insert({article_id:selArticle.id,author_name:cmtName,content:cmtText});
      if(error)throw error;setCmtText("");notify("Commentaire publié !");loadComments(selArticle.id);
    }catch{notify("Erreur",true)}
  };

  const handleDelComment=async id=>{
    try{await supabase.from("comments").delete().eq("id",id);notify("Commentaire supprimé.");loadComments(selArticle.id)}catch{notify("Erreur",true)}
  };

  const filtered=catFilter==="Tous"?articles:articles.filter(a=>a.category===catFilter);
  const importants=articles.filter(a=>a.important);

  const Nav=()=><>
    <li><span className={`nk ${page==="home"?"active":""}`} onClick={()=>nav("home")}>Accueil</span></li>
    <li><span className={`nk ${page==="articles"?"active":""}`} onClick={()=>nav("articles")}>Écrits</span></li>
    <li><span className={`nk ${page==="about"?"active":""}`} onClick={()=>nav("about")}>À propos</span></li>
    <li><span className={`nk ${page==="contact"?"active":""}`} onClick={()=>nav("contact")}>Contact</span></li>
    {isAdmin?<>
      <li><span className={`nk na ${page==="admin"?"active":""}`} onClick={()=>nav("admin")}>Publier</span></li>
      <li><span className="nk n-out" onClick={handleLogout}>Déconnexion</span></li>
    </>:<li><span className={`nk na ${page==="login"?"active":""}`} onClick={()=>nav("login")}>Admin</span></li>}
  </>;

  const Loader=()=><div className="ld">Chargement<span className="dot"> .</span><span className="dot">.</span><span className="dot">.</span></div>;

  return(
    <div className="sw" ref={topRef}>
      <header className="sh"><div className="hi">
        <div className="st" onClick={()=>nav("home")}>Michelle <span>Faye</span></div>
        <ul className="nl"><Nav/></ul>
        <button className="hb" onClick={()=>setMobNav(true)}><span/><span/><span/></button>
      </div></header>

      {mobNav&&<div className="mn"><button className="mclose" onClick={()=>setMobNav(false)}>×</button>
        <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:"24px",alignItems:"center"}}><Nav/></ul>
      </div>}

      <main className="mc">
        {page==="home"&&<>
          <section className="hero">
            <div className="hero-text">
              <h1>La mémoire est une <em>lumière</em> qui ne s'éteint jamais</h1>
              <p>Bienvenue dans l'univers de Michelle Faye — autrice, témoin et voix engagée. Ici se rassemblent récits, témoignages et réflexions, nourris par une vie au service de la communauté.</p>
              <button className="btn" onClick={()=>nav("articles")}>Découvrir mes écrits →</button>
            </div>
            <div className="hero-photo"><div className="pf"><span className="pi">MF</span></div></div>
          </section>
          <div className="cban"><div className="clab">✦ Citation du jour</div><blockquote>« {CITATIONS[citIdx]} »</blockquote></div>
          {importants.length>0&&<section style={{marginBottom:60}}>
            <div className="sec"><h2>✦ Textes importants</h2></div>
            <div className="icards">{importants.map(a=><div key={a.id} className="icard" onClick={()=>nav("article",a)}><div className="cc">{a.category}</div><h3>{a.title}</h3></div>)}</div>
          </section>}
          <section style={{marginBottom:60}}>
            <div className="sec"><h2>Derniers écrits</h2></div>
            {loading?<Loader/>:<>
              <div className="ag">{articles.slice(0,4).map(a=><div key={a.id} className="ac" onClick={()=>nav("article",a)}>
                {a.important&&<div className="ibdg"/>}<div className="cc">{a.category}</div><h3>{a.title}</h3><div className="cdate">{fmtDate(a.date)}</div><div className="cex">{a.content}</div>
              </div>)}</div>
              {articles.length>4&&<div style={{textAlign:"center"}}><button className="btn btn-out" onClick={()=>nav("articles")}>Voir tous les écrits →</button></div>}
            </>}
          </section>
        </>}

        {page==="articles"&&<section style={{padding:"60px 0 80px"}}>
          <div className="sec"><h2>Tous les écrits</h2></div>
          <div className="cflt">{CATEGORIES.map(c=><button key={c} className={`ctb ${catFilter===c?"active":""}`} onClick={()=>setCatFilter(c)}>{c}</button>)}</div>
          {loading?<Loader/>:<div className="ag">
            {filtered.length===0&&<p style={{color:"var(--ink-faint)",fontStyle:"italic"}}>Aucun article dans cette catégorie.</p>}
            {filtered.map(a=><div key={a.id} className="ac" onClick={()=>nav("article",a)}>
              {a.important&&<div className="ibdg"/>}<div className="cc">{a.category}</div><h3>{a.title}</h3><div className="cdate">{fmtDate(a.date)}</div><div className="cex">{a.content}</div>
            </div>)}
          </div>}
        </section>}

        {page==="article"&&selArticle&&<article className="asingle">
          <div className="aback" onClick={()=>nav("articles")}>← Retour aux écrits</div>
          <div className="acat">{selArticle.category}</div>
          <h1>{selArticle.title}</h1>
          <div className="adateS">{fmtDate(selArticle.date)}</div>
          <div className="abody">{selArticle.content.split("\n").filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>
          <div className="sbar"><span>Partager</span><button className="sbtn" onClick={()=>notify("Lien copié !")}>Copier le lien</button><button className="sbtn" onClick={()=>notify("Partage par email")}>Email</button></div>
          <div className="cmt-section">
            <h3>Commentaires ({comments.length})</h3>
            {cmtLoading?<Loader/>:<>
              {comments.length===0&&<p className="no-cmt">Aucun commentaire pour le moment. Soyez le premier à réagir !</p>}
              {comments.map(c=><div key={c.id} className="cmt-card">
                <div className="cmt-author">{c.author_name}</div>
                <div className="cmt-date">{fmtTime(c.created_at)}</div>
                <div className="cmt-text">{c.content}</div>
                {isAdmin&&<button className="cmt-del" onClick={()=>handleDelComment(c.id)} title="Supprimer">×</button>}
              </div>)}
            </>}
            <div className="cmt-form">
              <h4>Laisser un commentaire</h4>
              <div className="fg" style={{marginBottom:12}}><input type="text" value={cmtName} onChange={e=>setCmtName(e.target.value)} placeholder="Votre nom"/></div>
              <div className="fg" style={{marginBottom:16}}><textarea value={cmtText} onChange={e=>setCmtText(e.target.value)} placeholder="Votre commentaire..." style={{minHeight:100}}/></div>
              <button className="btn btn-sm" onClick={handleComment}>Publier le commentaire</button>
            </div>
          </div>
        </article>}

        {(page==="login"||page==="admin")&&!isAdmin&&<div className="login-box">
          <h2>Espace admin</h2>
          <p>Connectez-vous pour publier et gérer les articles.</p>
          {loginErr&&<div className="login-err">{loginErr}</div>}
          <div className="fg"><label>Email</label><input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="votre@email.com"/></div>
          <div className="fg"><label>Mot de passe</label><input type="password" value={loginPass} onChange={e=>{setLoginPass(e.target.value);setLoginErr("")}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></div>
          <button className="btn" style={{width:"100%"}} onClick={handleLogin} disabled={loggingIn}>{loggingIn?"Connexion...":"Se connecter"}</button>
        </div>}

        {page==="about"&&<div className="about-page">
          <h1>À propos de Michelle Faye</h1>
          <p>Michelle Faye est une autrice et citoyenne engagée, profondément ancrée dans sa communauté. Depuis de nombreuses années, elle consacre sa plume à raconter les histoires de ceux qui l'entourent, à témoigner des luttes quotidiennes et à réfléchir au monde tel qu'il est — et tel qu'il pourrait être.</p>
          <div className="ahigh"><p>« Je n'écris pas pour être lue. J'écris pour que nos histoires ne disparaissent pas avec ceux qui les ont vécues. »</p></div>
          <h2>Un engagement au quotidien</h2>
          <p>Active dans la vie associative et politique de son quartier, Michelle croit en la force de la parole et de l'écrit comme outils de transformation sociale.</p>
          <h2>L'écriture comme héritage</h2>
          <p>Ses écrits — récits, témoignages, réflexions politiques et pages de journal — constituent un patrimoine vivant. Ce site est né du désir de partager cet héritage avec le plus grand nombre.</p>
        </div>}

        {page==="contact"&&<div className="contact-page">
          <h1>Contact</h1>
          <p>Une réaction à un texte ? Un témoignage à partager ? N'hésitez pas à écrire à Michelle.</p>
          <div style={{background:"var(--white)",borderRadius:12,padding:36,boxShadow:"0 2px 20px rgba(44,36,32,.04)"}}>
            <div className="fg"><label>Votre nom</label><input type="text" value={cName} onChange={e=>setCName(e.target.value)} placeholder="Prénom et nom"/></div>
            <div className="fg"><label>Votre email</label><input type="email" value={cEmail} onChange={e=>setCEmail(e.target.value)} placeholder="votre@email.com"/></div>
            <div className="fg"><label>Votre message</label><textarea value={cMsg} onChange={e=>setCMsg(e.target.value)} placeholder="Écrivez votre message ici..."/></div>
            <button className="btn" onClick={()=>{notify("Message envoyé ! Merci.");setCName("");setCEmail("");setCMsg("")}}>Envoyer le message</button>
          </div>
        </div>}

        {page==="admin"&&isAdmin&&<div className="admin-page">
          <h1>Espace de publication <span className="admin-badge">Admin</span></h1>
          <p>Bienvenue Michelle. Publiez, modifiez ou supprimez vos écrits ici.</p>
          <div className="aform">
            <h2>{editId?"Modifier l'article":"Publier un nouvel écrit"}</h2>
            <div className="fg"><label>Titre</label><input type="text" value={fTitle} onChange={e=>setFTitle(e.target.value)} placeholder="Ex : Souvenirs d'un dimanche de mars"/></div>
            <div className="arow">
              <div className="fg"><label>Catégorie</label><select value={fCat} onChange={e=>setFCat(e.target.value)}>{CATEGORIES.filter(c=>c!=="Tous").map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div style={{display:"flex",alignItems:"flex-end",paddingBottom:24}}><div className="chr"><input type="checkbox" id="imp" checked={fImportant} onChange={e=>setFImportant(e.target.checked)}/><label htmlFor="imp">Texte important</label></div></div>
            </div>
            <div className="fg"><label>Contenu</label><textarea value={fContent} onChange={e=>setFContent(e.target.value)} placeholder="Collez ou écrivez votre texte ici..." style={{minHeight:240}}/></div>
            <div style={{display:"flex",gap:12}}>
              <button className="btn" onClick={handleSave} disabled={saving}>{saving?"Enregistrement...":editId?"Enregistrer":"Publier l'article"}</button>
              {editId&&<button className="btn btn-cancel" onClick={resetForm}>Annuler</button>}
            </div>
          </div>
          <div className="sec"><h2>Articles publiés ({articles.length})</h2></div>
          {loading?<Loader/>:<div className="alist">{articles.map(a=><div key={a.id} className="aitem">
            <div><h4>{a.title}{a.important?" ★":""}</h4><span>{a.category} · {fmtDate(a.date)}</span></div>
            <div className="aacts"><button className="ebt" onClick={()=>handleEdit(a)}>Modifier</button><button className="dbt" onClick={()=>handleDel(a.id)}>Supprimer</button></div>
          </div>)}</div>}
        </div>}
      </main>

      <footer className="sf"><div className="finner">
        <div className="fbrand">Michelle <span>Faye</span> · Écrits & Mémoires</div>
        <ul className="flinks"><li onClick={()=>nav("home")}>Accueil</li><li onClick={()=>nav("articles")}>Écrits</li><li onClick={()=>nav("about")}>À propos</li><li onClick={()=>nav("contact")}>Contact</li></ul>
      </div></footer>

      {notif&&<div className={`notif ${notifErr?"notif-err":""}`}>{notif}</div>}
    </div>
  );
}
