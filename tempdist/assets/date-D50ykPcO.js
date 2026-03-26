const r=(t,e="Chưa cập nhật")=>{if(!t)return e;const i=new Date(t);return Number.isNaN(i.getTime())?e||t:i.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})};export{r as f};
