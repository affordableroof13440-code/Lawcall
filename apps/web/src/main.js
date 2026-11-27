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
        if(index===4){const label=document.createElement("label");label.className="new";label.textContent=value;td.append(label)}
        else td.textContent=value;
        tr.append(td);
      });
      return tr;
    });
    if(rows.length)body.replaceChildren(...rows);
    const note=document.querySelector(".table-panel .sample");
    if(note)note.textContent="Fictional test entries only. Do not enter real client or confidential information.";
  }catch(error){console.info("Demo inquiry list not available:",error.message)}
}
function openInquiryForm(){
  if(document.querySelector("#demo-inquiry-dialog"))return;
  const dialog=document.createElement("dialog");
  dialog.id="demo-inquiry-dialog";
  dialog.innerHTML=`
    <form id="demo-inquiry-form" method="dialog">
      <div class="demo-form-head"><div><p class="eyebrow">DEMO WORKSPACE</p><h2>New test inquiry</h2></div><button type="button" class="demo-close" aria-label="Close">×</button></div>
      <p class="demo-warning">Use made-up information only. This is a demo form, not secure real-client intake. Do not enter actual client details, confidential facts, or sensitive information.</p>
      <label>Contact name <input name="contact_name" maxlength="100" required placeholder="e.g. Alex Test"></label>
      <label>Email <input name="email" type="email" maxlength="160" placeholder="alex@example.test"></label>
      <label>Phone <input name="phone" type="tel" maxlength="40" placeholder="555-0100"></label>
      <label>Matter type <select name="matter_type" required><option value="">Choose a matter type</option><option>Personal injury</option><option>Family law</option><option>Employment law</option><option>Criminal defense</option><option>Immigration</option><option>Estate planning</option><option>Other (test)</option></select></label>
      <label>Short test description <textarea name="details" maxlength="1000" rows="4" placeholder="Enter a fictional example only"></textarea></label>
      <div class="demo-form-actions"><button type="button" class="demo-cancel">Cancel</button><button type="submit" class="demo-save">Save test inquiry</button></div>
      <p class="demo-form-foot">Saved to the Lawcall D1 demo table. Not a real client record.</p>
    </form>`;
  document.body.append(dialog);
  const close=()=>dialog.close();
  dialog.querySelector(".demo-close").addEventListener("click",close);
  dialog.querySelector(".demo-cancel").addEventListener("click",close);
  dialog.addEventListener("click",event=>{if(event.target===dialog)close()});
  dialog.querySelector("form").addEventListener("submit",async event=>{
    event.preventDefault();
    const form=event.currentTarget;
    const save=form.querySelector(".demo-save");
    const values=Object.fromEntries(new FormData(form).entries());
    save.disabled=true;save.textContent="Saving…";
    try{
      const response=await fetch("/api/demo/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not save test inquiry");
      dialog.close();dialog.remove();
      await loadDemoInquiries();
      notify("Test inquiry saved to the Lawcall D1 database.");
    }catch(error){notify(error.message||"Could not save test inquiry.")}
    finally{save.disabled=false;save.textContent="Save test inquiry";}
  });
  dialog.showModal();
}
document.querySelector("#new")?.addEventListener("click",openInquiryForm);
try{const response=await fetch("/api/health");if(!response.ok)throw Error();await response.json()}catch(error){console.info("API health check unavailable in preview")}
loadDemoInquiries();
