import{d as n,ae as o,j as t}from"./vendor-OLCrLkkl.js";import{X as l}from"./icons-D5e6pA0p.js";function d({title:i="Thông báo",message:r,onClose:a,duration:s=3500}){return n.useEffect(()=>{if(!r)return;const e=setTimeout(a,s);return()=>clearTimeout(e)},[r,a,s]),r?o.createPortal(t.jsxs("div",{className:`
        fixed left-1/2 top-6 z-[70] max-w-sm -translate-x-1/2
        rounded-xl border border-white/10
        bg-[#1a1a1a] px-4 py-3 text-sm text-white
        shadow-2xl shadow-emerald-500/20
        animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)]
      `,onClick:e=>{e.stopPropagation()},children:[t.jsxs("div",{className:"flex items-start gap-3",children:[t.jsxs("div",{children:[t.jsx("p",{className:"text-xs uppercase tracking-[0.2em] text-emerald-300/80",children:i}),t.jsx("p",{className:"font-semibold leading-relaxed",children:r})]}),t.jsx("button",{onClick:e=>{e.stopPropagation(),e.preventDefault(),a()},className:"mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition md:hover:bg-white/20","aria-label":"Đóng thông báo",children:t.jsx(l,{})})]}),t.jsx("style",{children:`
          @keyframes toast-in {
            from {
              opacity: 0;
              transform: translate(-50%, -14px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `})]}),document.body):null}export{d as T};
