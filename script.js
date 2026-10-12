/* WEDDING DETAILS — fill in these fields when confirmed. Leave blank if unknown. */
const invitation = {
  couple: ['Tanishka','Yash'],
  date: '',         // Example: '24 November 2027'
  venue: '',        // Example: 'The Grand Palace, Jaipur'
};

const gate = document.getElementById('gate');
const openButton = document.getElementById('openInvitation');
const soundButton = document.getElementById('soundButton');
const soundLabel = document.getElementById('soundLabel');
const score = document.getElementById('score');
const nav = document.getElementById('nav');
const progress = document.getElementById('pageProgress');
const toast = document.getElementById('toast');
let toastTimer;

function showToast(text){
  toast.textContent=text;toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer=window.setTimeout(()=>toast.classList.remove('show'),3200);
}

if(invitation.date) document.getElementById('dateValue').textContent=invitation.date;
if(invitation.venue) document.getElementById('venueValue').textContent=invitation.venue;
if(invitation.date&&invitation.venue) {
  document.querySelector('.details-fine').textContent='With love, we look forward to seeing you there.';
} else if(!invitation.date&&!invitation.venue) {
  document.querySelector('.event-info').innerHTML='<div class="event-field event-field-pending"><span class="eyebrow">WHEN & WHERE</span><span class="event-value">Celebration details coming soon</span></div>';
  document.querySelector('.details-fine').textContent='We will share the date and venue with you soon.';
}

openButton.addEventListener('click',()=>{
  gate.classList.add('is-opening');
  document.body.classList.remove('is-locked');
  gate.setAttribute('aria-hidden','true');
  document.getElementById('mainContent').inert=false;
  nav.inert=false;
  window.setTimeout(()=>{gate.style.display='none';},1400);
  const film = document.getElementById('heroVideo');
  if(film) film.play().catch(()=>{});
  window.scrollTo({top:0,behavior:'instant'});
});

function syncSound(){
  const playing=!score.paused;
  soundButton.classList.toggle('is-playing',playing);
  soundButton.setAttribute('aria-pressed',String(playing));
  soundButton.setAttribute('aria-label',playing?'Turn soundtrack off':'Turn soundtrack on');
  soundLabel.textContent=playing?'SOUND ON':'SOUND OFF';
}
soundButton.addEventListener('click',async()=>{
  if(score.paused){
    try{score.volume=.35; await score.play();}
    catch{showToast('Audio is unavailable on this device.');}
  }else{score.pause();}
  syncSound();
});
score.addEventListener('ended',syncSound);

const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}});
},{threshold:.12,rootMargin:'0px 0px -30px 0px'}):null;
document.querySelectorAll('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('in-view'));

let ticking=false;
function updateScroll(){
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  progress.style.transform=`scaleX(${Math.min(1,scrollY/max)})`;
  nav.classList.toggle('scrolled',scrollY>65);
  ticking=false;
}
window.addEventListener('scroll',()=>{
  if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}
},{passive:true});
updateScroll();

async function share(){
  const title='Tanishka & Yash — Wedding Invitation';
  const text='You are warmly invited to celebrate Tanishka and Yash!';
  const url=window.location.href.split('#')[0];
  if(navigator.share && window.location.protocol!=='file:'){
    try{await navigator.share({title,text,url});return;}
    catch(err){if(err.name==='AbortError')return;}
  }
  try{
    if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(url);showToast('Invitation link copied!');}
    else{showToast('Upload the website to share a public link.');}
  }catch{showToast('Open this invitation on a public website to share it.');}
}
document.getElementById('shareInvitation').addEventListener('click',share);

// Do not animate in non-visible tabs, and honour data-saving preferences where possible.
document.addEventListener('visibilitychange',()=>{
  const film=document.getElementById('heroVideo');
  if(document.hidden){film?.pause();}
  else if(!document.body.classList.contains('is-locked')){film?.play().catch(()=>{});}
});
