const toast=document.querySelector("#toast");
let toastTimer;
function notify(message){
  if(!toast)return;
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),4000);
}
async function loadDemoInquiries(){
  const body=document.querySelector("#inquiries tbody");
  if(!body)return;
  try{
    const response=await fetch("/api/demo/inquiries");
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Unable to load demo inquiries");
    const rows=(data.inquiries||[]).map(item=>{
      const tr=document.createElement("tr");
      const values=[item.contact_name,item.matter_type,new Date(item.created_at).toLocaleString(),"Demo workspace",item.status];
      values.forEach((value,index)=>{
        const td=document.createElement("td");
        if(index===4){
          const label=document.createElement("label");
          label.className="new";
          label.textContent=value;
          td.append(label);
        }else td.textContent=value;
        tr.append(td);
      });
      return tr;
    });
    if(rows.length){
      body.replaceChildren(...rows);
      const note=document.querySelector(".table-panel .sample");
      if(note)note.textContent="Demo/test records only. Real client intake is disabled until firm authentication and tenant protections are complete.";
    }
  }catch(error){console.info("Demo inquiry list not available:",error.message)}
}
document.querySelector("#new")?.addEventListener("click",async()=>{
  const button=document.querySelector("#new");
  button.disabled=true;
  const previous=button.textContent;
  button.textContent="Saving test client…";
  try{
    const response=await fetch("/api/demo/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Could not save test client");
    await loadDemoInquiries();
    notify("Test client saved to the Lawcall D1 database.");
  }catch(error){notify(error.message||"Could not save test client. Check the D1 binding.");}
  finally{button.disabled=false;button.textContent=previous;}
});
try{const response=await fetch("/api/health");if(!response.ok)throw Error();await response.json()}catch(error){console.info("API health check unavailable in preview")}
loadDemoInquiries();
