'use strict';
const BASE_IMG='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const START='2026-11-12';

const DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const PER_DATE={
 '2026-11-12':{type:'cardioA',helm:true},
 '2026-11-13':{type:'strengthA',helm:true},
 '2026-11-14':{type:'rest'},
 '2026-11-15':{type:'recovery', german:'courseSunday'},
 '2026-11-16':{type:'strengthB',helm:true},
 '2026-11-17':{type:'cardioB',helm:true},
 '2026-11-18':{type:'strengthA',helm:true,german:'courseWednesday'},
 '2026-11-19':{type:'cardioA',helm:true},
 '2026-11-20':{type:'strengthB',helm:true},
 '2026-11-21':{type:'rest'},
 '2026-11-22':{type:'recovery',german:'courseSunday'},
 '2026-11-23':{type:'strengthA',helm:true},
 '2026-11-24':{type:'cardioB',helm:true},
 '2026-11-25':{type:'strengthB',helm:true,german:'courseWednesday'}
};
const EX={
 squat:{name:'Goblet Squat',ar:'سكوات بدمبل واحد قدام الصدر',id:'Dumbbell_Squat',target:'10 reps',reps:10,kg:true,tip:'ابدأ من غير وزن لو لازم. انزل لمدى مريح وخلي ركبتك في اتجاه صوابع رجلك.'},
 push:{name:'Push-Ups on Handles',ar:'ضغط باستخدام مقابض الضغط',id:'Pushups',target:'6–10 reps',reps:8,kg:false,tip:'ثبّت المقابض على أرض مش بتتزحلق. خليك بخط مستقيم، ولو صعب اعمل الضغط من الركب.'},
 row:{name:'Supported One-Arm Dumbbell Row',ar:'سحب دامبل للظهر بإيد واحدة مع سند',id:'One-Arm_Dumbbell_Row',target:'10 / arm',reps:10,kg:true,tip:'اسند إيدك على سطح ثابت قوي، حافظ على ظهرك مستقيم واسحب الكوع جنب جسمك. الوزن لكل دامبل.'},
 deadlift:{name:'Dumbbell Romanian Deadlift',ar:'ديدليفت روماني للعضلة الخلفية والمؤخرة',id:'Stiff-Legged_Dumbbell_Deadlift',target:'10 reps',reps:10,kg:true,tip:'ارجع الحوض لورا مع ثني خفيف للركبة. متقوسش ضهرك، ولو صعب اكتفي بمدى حركة صغير.'},
 curl:{name:'Alternating Hammer Curl',ar:'بايسبس هامر بالتبادل',id:'Alternate_Hammer_Curl',target:'10 / arm',reps:10,kg:true,tip:'الكوع جنب الجسم. متأرجحش بالظهر عشان ترفع الوزن.'},
 press:{name:'Dumbbell Floor Press',ar:'ضغط صدر بالدامبلز على الأرض',id:'Dumbbell_Floor_Press',target:'8–12 reps',reps:10,kg:true,tip:'خلي الكوع قريب من الجسم بزاوية مريحة. انزل ببطء لحد ما الذراع يلمس الأرض.'},
 lateral:{name:'Dumbbell Lateral Raise',ar:'رفرفة جانبية للكتف',id:'Side_Lateral_Raise',target:'12 reps',reps:12,kg:true,tip:'وزن خفيف جدًا، ارفع لحد مستوى الكتف بدون هز جسمك.'}
};
const WORKOUT={
 strengthA:{title:'Workout A · Full Body + Biceps',subtitle:'رجل + صدر + ظهر + خلفية الرجل + باي',exercises:['squat','push','row','deadlift','curl']},
 strengthB:{title:'Workout B · Full Body + Shoulders',subtitle:'رجل + صدر + ظهر + كتف + خلفية الرجل',exercises:['squat','press','row','lateral','deadlift']},
 cardioA:{title:'Outdoor Easy Run/Walk',subtitle:'جري خفيف ومشي بالتبادل · 30 دقيقة'},
 cardioB:{title:'Outdoor Easy Run/Walk',subtitle:'جري خفيف ومشي بالتبادل · 30 دقيقة'},
 recovery:{title:'Sunday Easy Run/Walk',subtitle:'جري أخف يوم الأحد · 30 دقيقة'}
};

let state={days:{}}; let cloud=null; let user=null; let stopWatch=null; let selectedDate=''; let activeTab='today'; let saveError=''; let calendarShift=0; let bound=false;
const el=(id)=>document.getElementById(id);
const isoToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateObj=(s)=>new Date(s+'T12:00:00+01:00');
const weekday=(s)=>dateObj(s).getUTCDay();
const dateLong=(s)=>new Intl.DateTimeFormat('ar-EG',{timeZone:'Europe/Berlin',day:'numeric',month:'long',weekday:'long'}).format(dateObj(s));
const daysBetween=(a,b)=>Math.round((dateObj(b)-dateObj(a))/86400000);
function parseDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null; let d=new Date(s+'T12:00:00Z');return isNaN(+d)?null:d;}
function addDay(s,n){let d=parseDate(s);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function getPlan(date){if(PER_DATE[date])return PER_DATE[date];let delta=daysBetween(START,date);return PER_DATE[addDay(START,((delta%14)+14)%14)];}
function dataDay(date){return state.days?.[date]||{};}
function val(date,k){return dataDay(date)[k];}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function prefillKey(date,ex){let prior=Object.keys(state.days||{}).filter(d=>d<date&&getPlan(d)?.type?.startsWith('strength')).sort().reverse();for(let d of prior){let row=dataDay(d);let q=row[ex+'_1_kg'];if(q!==undefined&&q!==null&&q!=='')return q;}return null;}
async function write(date,field,value){
 if(!user||!cloud)return;
 if(!state.days)state.days={};if(!state.days[date])state.days[date]={};
 state.days[date][field]=value;
 try{await cloud.write(user.uid,date,field,value);saveError='';}
 catch(e){saveError='تعذر حفظ التعديل في السحابة. تأكد من الإنترنت ومن صلاحيات Firestore.';
   const status=el('saveStatus');if(status)status.textContent=saveError;
   console.error('Cloud save failed',e);
 }
}

function done(date,k){return !!val(date,k);}
function tab(t){activeTab=t;el('nav').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));render();window.scrollTo({top:0,behavior:'smooth'});}
function yesNo(date,k,label,hint=''){return `<label class="task-row"><input type="checkbox" data-check="${esc(k)}" data-date="${date}" ${done(date,k)?'checked':''}/><span><strong>${label}</strong>${hint?`<span class="hint">${hint}</span>`:''}</span></label>`;}
function strength(date,program){let p=WORKOUT[program];let rows=p.exercises.map((id,index)=>{let e=EX[id];let prior=prefillKey(date,id);let sets=[1,2].map(set=>{let kgKey=id+'_'+set+'_kg', repsKey=id+'_'+set+'_reps', doneKey=id+'_'+set+'_done';let kg=val(date,kgKey), reps=val(date,repsKey);return `<div class="set-row"><div><strong class="small">Set ${set}</strong></div><div><label>${e.kg?'kg / dumbbell':'Bodyweight'}</label>${e.kg?`<input type="number" data-save="${kgKey}" data-date="${date}" min="0" max="100" step="0.5" value="${kg===undefined?'':esc(kg)}" placeholder="${prior===null?'kg':esc(prior)}" aria-label="${esc(e.name)} set ${set} weight kg per dumbbell"/>`:`<input disabled value="BW"/>`}</div><div><label>${e.sec?'Seconds':'Reps'}</label><input type="number" data-save="${repsKey}" data-date="${date}" min="0" max="300" step="1" value="${reps===undefined?'':esc(reps)}" placeholder="${e.reps}" aria-label="${esc(e.name)} set ${set} reps"/></div><button class="set-done ${done(date,doneKey)?'yes':''}" data-setdone="${doneKey}" data-date="${date}">${done(date,doneKey)?'✓':'تم'}</button></div>`}).join('');return `<div class="ex-card"><div class="ex-head"><div><h4 dir="ltr" style="text-align:right">${index+1}. ${esc(e.name)}</h4><div class="arabic">${esc(e.ar)}</div></div><span class="tag">2 × ${esc(e.target)}</span></div><div class="pic-pair"><div class="pic"><img loading="lazy" src="${BASE_IMG+e.id}/0.jpg" alt="${esc(e.name)} starting position" onerror="this.style.display='none'"/><span>START</span></div><div class="pic"><img loading="lazy" src="${BASE_IMG+e.id}/1.jpg" alt="${esc(e.name)} finish position" onerror="this.style.display='none'"/><span>END</span></div></div><div class="instructions">${esc(e.tip)}</div>${sets}<div class="tip">راحة 60–90 ثانية بين المجموعات. في تمارين الدامبلز الوزن المكتوب لكل دامبل منفرد؛ للـGoblet Squat هو وزن الدامبل الواحد المستخدم.</div></div>`}).join('');
return `<section class="box"><div class="divider-label"><div><h3>${p.title}</h3><div class="desc">${p.subtitle}</div></div><span class="tag">30 دقيقة</span></div><div class="timing"><span>5د إحماء</span><span>20د تمارين</span><span>5د تهدئة</span></div><div class="callout">ابدأ كل تمرين بوزن تقدر تعمل بيه العدات بتكنيك نظيف، ولسه فاضلك 2–3 عدات في طاقتك. ابدأ بمجموعتين. بعد أسبوعين زوّد عدة أو وزنًا صغيرًا فقط لما الأداء يبقى سهل.</div><h4 class="mini-title">التمارين بالصور والوزن والعدات</h4>${rows}</section>`;
}
function cardio(date,program){
 let p=WORKOUT[program];
 let sunday=program==='recovery';
 let pair=sunday?'1 min Easy Jog + 3 min Walk':'2 min Easy Jog + 2 min Walk';
 return `<section class="box"><div class="divider-label"><div><h3>${p.title}</h3><div class="desc">${p.subtitle}</div></div><span class="tag">30 دقيقة</span></div>
 <div class="callout">الجري برّه البيت مش في الأوضة. خليك على سرعة تقدر تتكلم معاها. لو الجو تلج أو الأرض زلقة، بلاش جري، واختار مشي في مكان آمن أو ريّح.</div>
 <div class="activity"><div class="act-emoji">🚶</div><div style="flex:1"><strong>Warm-up Walk</strong><span>مشي نشيط + حرّك كتافك ورجلك بهدوء</span></div><div class="duration">5 دقائق</div></div>
 <div class="activity"><div class="act-emoji">🏃</div><div style="flex:1"><strong>${pair} × 5</strong><span>كرّر الجولة خمس مرات. ${sunday?'جري هادي جدًا لأن عندك كورس.':'ابدأ بسرعة سهلة، ولو صعب خليها دقيقة جري وثلاث مشي.'}</span></div><div class="duration">20 دقيقة</div></div>
 <div class="activity"><div class="act-emoji">🚶</div><div style="flex:1"><strong>Cool-down Walk</strong><span>امشِ ببطء لحد ما النفس يرجع طبيعي</span></div><div class="duration">5 دقائق</div></div>
 <div class="timer"><strong id="timerDisplay">30:00</strong><div id="timerPhase" class="desc">ابدأ بـ5 دقائق مشي نشيط</div><button class="btn" id="timerStart">ابدأ الجري / المؤقت</button><button class="btn secondary" id="timerReset">إعادة</button></div>
 ${yesNo(date,'exercise','خلصت الـ30 دقيقة جري ومشي؟','علّم صح حتى لو احتجت تمشي أكتر من المخطط. مش سباق.')}
 </section>`;
}
function german(date,plan){
 const course=plan.german==='courseWednesday'?'الأربعاء 18:00–21:00':plan.german==='courseSunday'?'الأحد 11:00–14:00':null;
 return `<section class="box"><div class="divider-label"><h3>🇩🇪 ألماني B2</h3><span class="tag">${course?'الكورس':'30 دقيقة'}</span></div>
 ${course?`<p class="desc">عندك كورس ${course}. مش مطلوب 30 دقيقة زيادة.</p>`:''}
 <div class="mini-title">إنت ناوي تعمل إيه؟</div>
 <textarea data-save="german_text" data-date="${date}" placeholder="اكتب بنفسك موضوع / مهمة الألماني، من غير اقتراحات">${esc(val(date,'german_text')??'')}</textarea>
 ${yesNo(date,'german',course?'حضرت الكورس؟':'خلصت الـ30 دقيقة ألماني؟')}</section>`;
}
function helm(date,plan){if(!plan.helm)return '';
 return `<section class="box"><div class="divider-label"><h3>💻 Helmholtz</h3><span class="tag">ساعتين</span></div>
 <div class="mini-title">إنت ناوي تشتغل على إيه؟</div>
 <textarea data-save="helm_text" data-date="${date}" placeholder="مهمتك أنت، مش اقتراح من التطبيق">${esc(val(date,'helm_text')??'')}</textarea>
 <div class="desc">55 دقيقة تركيز، 10 دقايق راحة، 55 دقيقة تركيز.</div>
 ${yesNo(date,'helm_task1','خلصت أول 55 دقيقة؟')}
 ${yesNo(date,'helm_task2','خلصت تاني 55 دقيقة؟')}</section>`;
}
function tomorrow(){
 const date=addDay(isoToday(),1),p=getPlan(date);
 if(p.type==='rest')return `<section class="box"><span class="pill">${esc(dateLong(date))}</span><h3>بكرة السبت ☕</h3><p>إجازة كاملة زي ما اتفقنا. مفيش حاجة تتكتب.</p></section>`;
 const course=p.german==='courseWednesday'?'كورس 18:00–21:00':p.german==='courseSunday'?'كورس 11:00–14:00':'';
 return `<section class="box"><span class="pill">${esc(dateLong(date))}</span><h2 style="margin:5px 0 10px">حضّر بكرة في دقيقة 📝</h2>
 <div class="desc">إنت اللي بتحدد مهمة الألماني وهيلمهولتز. مفيش اقتراحات جاهزة، وأي تعديل بيتحفظ تلقائيًا.</div>
 <div class="mini-title">🇩🇪 ألماني ${course?'· '+course:'· 30 دقيقة'}</div>
 <textarea data-save="german_text" data-date="${date}" placeholder="بكرة هعمل...">${esc(val(date,'german_text')??'')}</textarea>
 ${p.helm?`<div class="mini-title">💻 هيلمهولتز · ساعتين</div><textarea data-save="helm_text" data-date="${date}" placeholder="بكرة هشتغل على...">${esc(val(date,'helm_text')??'')}</textarea>`:''}
 <p class="small muted">مش لازم تكتب حاجة لو لسه مقررتش. التمرين هيتعرض تلقائيًا، والألماني وهيلمهولتز من كلامك إنت.</p>
 <button class="btn secondary" data-open-date="${date}">معاينة يوم بكرة</button>
 <div id="saveStatus" class="small" style="color:var(--red)">${esc(saveError)}</div></section>`;
}
function cardForDate(date){let p=getPlan(date);if(p.type==='rest')return `<div class="hero"><div><span class="pill">راحة كاملة</span><h2>السبت أجازة ❤️</h2><p>مفيش تمرين ولا ألماني ولا هيلمهولتز. استمتع بيومك من غير تعويض.</p></div><div class="circle">☕</div></div>`;
let awake=val(date,'awake');let label=awake?'صحيت ✓':'صحيت ☀️';let course=!!p.german?.startsWith('course');let title=awake?'يلا نكمّل يومنا':'صباح الفل! ☀️';let workout=WORKOUT[p.type];let exerciseHtml=p.type.startsWith('strength')?strength(date,p.type):cardio(date,p.type);let summary=`${workout.title} · ${course?'كورس ألماني':'ألماني 30د'}${p.helm?' · هيلمهولتز ساعتين':''}`;
return `<div class="hero"><div><span class="pill">${esc(dateLong(date))} · الأسبوع ${stage(date)}</span><h2>${title}</h2><p>${esc(summary)}</p></div><button class="wake ${awake?'done':''}" data-wake="${date}">${label}</button></div><div class="subline">${awake?`ضغطت «صحيت» الساعة ${esc(new Date(awake).toLocaleTimeString('ar-EG',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit'}))}.`:'اضغط «صحيت» من الموبايل أو اللاب، وكل تفاصيل اليوم تحت.'} مفيش ساعة بداية ثابتة. <button class="btn secondary" data-tab-jump="tomorrow">اكتب خطة بكرة 📝</button></div><div id="saveStatus" class="small" style="color:var(--red)">${esc(saveError)}</div><div class="columns"><div>${exerciseHtml}</div><div>${german(date,p)}<section class="box"><h3>☕ بريك الأكل والقهوة والشاور</h3><div class="desc">30 دقيقة بين المذاكرة والشغل، أو حسب راحتك.</div>${yesNo(date,'break','خلصت البريك؟')}</section>${helm(date,p)}</div></div>`;}
function coverage(date){let p=getPlan(date),d=dataDay(date);if(p.type==='rest')return {n:0,total:0,pct:100};let ex = p.type.startsWith('strength')?WORKOUT[p.type].exercises.flatMap(id=>[id+'_1_done',id+'_2_done']):['exercise'];let all=[...ex,'german',...(p.helm?['helm_task1','helm_task2']:[])];return {n:all.filter(k=>d[k]).length,total:all.length,pct:Math.round(all.filter(k=>d[k]).length/all.length*100)};}
function cycleStart(){
 const diff=Math.max(0,daysBetween(START,isoToday()));
 return addDay(START,Math.floor(diff/14)*14);
}
function displayStart(){return addDay(cycleStart(),calendarShift*14);}
function stage(date){return Math.max(1,Math.floor(Math.max(0,daysBetween(START,date))/7)+1);}
function calendar(){
 const base=displayStart();let html=`<section class="box"><div class="divider-label"><h3>🗓️ خريطة الأسبوعين</h3><span class="tag">الأسبوع ${stage(base)}–${stage(addDay(base,13))}</span></div><div class="cloud-actions"><button class="btn secondary" id="previousCycle">← الأسبوعين اللي فاتوا</button><button class="btn secondary" id="currentCycle">الحالي</button><button class="btn secondary" id="nextCycle">الأسبوعين اللي جايين →</button></div><div class="desc">المواعيد بتتكمل تلقائيًا بعد اليوم 14. السبت إجازة، وكورسات الألماني ثابتة.</div><div class="day-grid">`;
 for(let i=0;i<14;i++){let date=addDay(base,i),p=getPlan(date),c=coverage(date),day=WORKOUT[p.type]?.title||'Rest day';
  html+=`<button class="day-card ${date===selectedDate?'sel':''}" data-select="${date}"><div class="flexrow"><strong>${esc(dateLong(date))}</strong><span class="tag">${p.type==='rest'?'إجازة':'أسبوع '+stage(date)}</span></div><div class="summary" style="margin-top:6px">${esc(day)}${p.helm?' · Helmholtz 2h':''}</div>${p.type!=='rest'?`<div class="progress"><div style="width:${c.pct}%"></div></div><div class="small muted">${c.n}/${c.total} مهمة</div>`:''}</button>`;
 }
 return html+'</div></section>';
}
function progress(){
 const base=displayStart(),count={strength:0,cardio:0,german:0,helm:0};let all=[];
 for(let i=0;i<14;i++){
  const date=addDay(base,i),p=getPlan(date),d=dataDay(date),c=coverage(date);
  if(p.type.startsWith('strength')&&WORKOUT[p.type].exercises.some(id=>d[id+'_1_done']||d[id+'_2_done']))count.strength++;
  if((p.type.startsWith('cardio')||p.type==='recovery')&&d.exercise)count.cardio++;
  if(d.german)count.german++;
  if(p.helm&&d.helm_task1&&d.helm_task2)count.helm++;
  all.push({date,p,c});
 }
 return `<section class="box"><h3>📈 تقدم الأسبوعين · الأسبوع ${stage(base)}–${stage(addDay(base,13))}</h3>
 <div class="desc">تقدر تشوف أي أسبوعين قدام أو ورا من صفحة التقويم. تسجيلاتك القديمة محفوظة.</div>
 <div class="grid2"><div class="stat"><strong>${count.strength}/6</strong><span>جلسات مقاومة</span></div><div class="stat"><strong>${count.cardio}/6</strong><span>جلسات جري</span></div><div class="stat"><strong>${count.german}/12</strong><span>أيام ألماني</span></div><div class="stat"><strong>${count.helm}/10</strong><span>أيام هيلمهولتز</span></div></div>
 ${all.map(x=>`<div style="display:flex;align-items:center;gap:12px;margin:11px 0"><div style="width:115px;font-size:12px">${esc(dateLong(x.date))}</div><div class="progress" style="flex:1;margin:0"><div style="width:${x.c.pct}%"></div></div><div class="small muted" style="min-width:36px">${x.c.total?x.c.pct+'%':'راحة'}</div></div>`).join('')}
 <div class="callout">بعد الأسبوعين: نفس الروتين، ومعاه زيادة صغيرة في العدات أو الوزن لما تكون جاهز. مفيش حاجة بتتصفر.</div></section>`;
}
function settings(){
 if(!user)return '<section class="box">سجل دخولك الأول.</section>';
 return `<section class="box"><h3>☁️ ربط الأجهزة</h3><p>إنت داخل بحساب <strong>${esc(user.email||'Google')}</strong>. أي تعديل بيتحفظ في Firebase ويتزامن مع الموبايل واللاب على نفس الحساب، حتى لو اللاب مطفي.</p>
 <div class="notice">بياناتك الشخصية مش موجودة في GitHub. GitHub Pages بيستضيف التطبيق بس. متحطش ملفات <code>routine_data.json</code> أو أي معلومات شخصية في الـRepo.</div>
 <button class="btn secondary" id="copyLink">نسخ رابط التطبيق</button>
 <h3>💾 نسخ احتياطية</h3><button class="btn secondary" id="exportBtn">تحميل Backup (JSON)</button>
 <p class="small muted">عندك بيانات من النسخة اللي كانت على اللاب؟ حمّل الـBackup منها وبعدين استورده هنا مرة واحدة.</p>
 <label for="importFile" class="mini-title">استيراد Backup من التطبيق القديم</label>
 <input type="file" id="importFile" accept=".json,application/json">
 <div id="importStatus" class="small muted"></div><hr/>
 <h3>بعد أول 14 يوم</h3><p>الجدول بيكمل تلقائيًا كل أسبوعين، والتسجيلات بتفضل محفوظة. تقدر ترجع للأسبوعين اللي فاتوا من «الـ14 يوم».</p>
 <button class="btn secondary" id="signOut">تسجيل خروج</button></section>`;
}

function render(){let today=isoToday();let content='';if(activeTab==='today'){content=cardForDate(selectedDate);}else if(activeTab==='tomorrow'){content=tomorrow();}else if(activeTab==='calendar'){content=calendar();}else if(activeTab==='progress'){content=progress();}else{content=settings();}el('content').innerHTML=content;el('topDate').textContent=dateLong(today);if(el('timerDisplay'))paintRunTimer();}
let debouncers={};
function bind(){
 if(bound)return;bound=true;
 el('nav').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)tab(b.dataset.tab);});
 el('content').addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  const date=b.dataset.date;
  if(b.id==='retryBoot'){location.reload();return;}
  if(b.id==='retryBoot'){location.reload();return;}
  if(b.id==='signIn'){b.disabled=true;b.textContent='جاري تسجيل الدخول…';try{await cloud.signIn();}catch(err){b.disabled=false;b.textContent='تسجيل الدخول بحساب Google';setInfo('فشل تسجيل الدخول: '+(err?.message||'خطأ غير معروف'));}return;}
  if(b.id==='signOut'){await cloud.signOut();return;}
  if(!user)return;
  if(b.dataset.wake){const d=b.dataset.wake;if(!val(d,'awake'))await write(d,'awake',new Date().toISOString());render();}
  if(b.dataset.select){selectedDate=b.dataset.select;tab('today');}
  if(b.dataset.tabJump){tab(b.dataset.tabJump);}
  if(b.dataset.openDate){selectedDate=b.dataset.openDate;tab('today');}
  if(b.dataset.setdone){const key=b.dataset.setdone;await write(date,key,!done(date,key));render();}
  if(b.id==='timerStart')toggleTimer();if(b.id==='timerReset')resetTimer();
  if(b.id==='previousCycle'){calendarShift-=1;render();}
  if(b.id==='nextCycle'){calendarShift+=1;render();}
  if(b.id==='currentCycle'){calendarShift=0;render();}
  if(b.id==='copyLink'){try{await navigator.clipboard.writeText(location.href);b.textContent='اتنسخ ✓';}catch(_){b.textContent='انسخ عنوان الصفحة من فوق';}}
  if(b.id==='exportBtn')exportBackup();
 });
 el('content').addEventListener('change',async e=>{
  const o=e.target;if(!user)return;
  if(o.matches('[data-check]')){write(o.dataset.date,o.dataset.check,o.checked);}
  else if(o.matches('input[data-save]')){write(o.dataset.date,o.dataset.save,o.value);}
  else if(o.id==='importFile')await importBackup(o);
 });
 el('content').addEventListener('input',e=>{
  const o=e.target;if(!user||!o.matches('textarea[data-save]'))return;
  const id=o.dataset.date+'::'+o.dataset.save;
  clearTimeout(debouncers[id]);debouncers[id]=setTimeout(()=>write(o.dataset.date,o.dataset.save,o.value),700);
 });
 el('content').addEventListener('focusout',()=>{
  if(user && !['TEXTAREA','INPUT'].includes(document.activeElement?.tagName)){
    // Deferred re-render after finishing edits, not while typing.
  }
 });
}
let runTimer={elapsed:0,startedAt:null,id:null,program:null};
function fmtT(n){n=Math.max(0,Math.ceil(n));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function runningSeconds(){return runTimer.elapsed+(runTimer.startedAt===null?0:(Date.now()-runTimer.startedAt)/1000);}
function runPhase(secs,program){
 let easy=program==='recovery',jog=easy?60:120;
 if(secs<300)return 'Warm-up Walk · امشي نشيط';
 if(secs>=1500)return secs>=1800?'خلصت 30 دقيقة ✓':'Cool-down Walk · امشي ببطء';
 let second=(secs-300)%240,round=Math.floor((secs-300)/240)+1;
 return second<jog?`Round ${round}/5 · 🏃 Easy Jog`: `Round ${round}/5 · 🚶 Walk`;
}
function paintRunTimer(){let t=el('timerDisplay'),p=el('timerPhase'),b=el('timerStart');if(!t||!p)return;let secs=runningSeconds(),program=runTimer.program||getPlan(selectedDate).type;t.textContent=fmtT(1800-secs);p.textContent=runPhase(secs,program);if(b)b.textContent=secs>=1800?'خلصت! ✓':runTimer.id?'إيقاف مؤقت':secs>0?'كمّل الجري':'ابدأ الجري / المؤقت';if(secs>=1800&&runTimer.id){clearInterval(runTimer.id);runTimer.id=null;runTimer.elapsed=1800;runTimer.startedAt=null;}}
function toggleTimer(){if(runTimer.id){runTimer.elapsed=runningSeconds();runTimer.startedAt=null;clearInterval(runTimer.id);runTimer.id=null;paintRunTimer();return;}if(runningSeconds()>=1800){resetTimer();}runTimer.program=getPlan(selectedDate).type;runTimer.startedAt=Date.now();runTimer.id=setInterval(paintRunTimer,500);paintRunTimer();}
function resetTimer(){if(runTimer.id)clearInterval(runTimer.id);runTimer={elapsed:0,startedAt:null,id:null,program:getPlan(selectedDate).type};paintRunTimer();}

function setInfo(message){const info=el('info');if(info)info.textContent=message;}
function showSignedOut(){
 el('nav').hidden=true;
 el('content').innerHTML=`<section class="box"><h2>☀️ صباح الفل</h2><p>سجّل الدخول بحساب Google عشان تفتح نفس روتينك على الموبايل واللاب، وتفضل بياناتك متزامنة.</p><button class="btn" id="signIn">تسجيل الدخول بحساب Google</button><p class="small muted" id="info"></p></section>`;
}
function exportBackup(){
 const blob=new Blob([JSON.stringify({days:state.days||{}},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wake-routine-backup.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importBackup(input){
 const file=input.files?.[0],msg=el('importStatus');if(!file)return;
 try{
  const text=await file.text(),db=JSON.parse(text);
  if(!db.days||typeof db.days!=='object'||Array.isArray(db.days))throw new Error('الملف مش بصيغة Wake Routine');
  const n=Object.keys(db.days).length;
  if(!confirm(`هتستورد بيانات ${n} يوم. الحقول المطابقة هتتحدث؛ هل موافق؟`))return;
  msg.textContent='جاري نقل البيانات للسحابة…';
  const imported=await cloud.importDays(user.uid,db.days);
  msg.textContent=`تم استيراد ${imported} يوم ✓`;
 }catch(err){msg.textContent='تعذر الاستيراد: '+(err?.message||'خطأ');}
 input.value='';
}
async function init(){
 bind();selectedDate=isoToday();el('topDate').textContent=dateLong(selectedDate);
 // If external Firebase modules stall, don't leave the user on a silent loading screen.
 const bootTimeout=setTimeout(()=>{
   const content=el('content');
   if(content && content.textContent.includes('بيتم تجهيز التطبيق')){
     content.innerHTML='<section class="box"><h3>تحميل التطبيق اتأخر</h3><p>الواجهة اشتغلت، لكن Firebase لسه ما اتحمّلش. جرّب تحديث الصفحة بـ Ctrl + Shift + R، ولو المشكلة مستمرة افتح F12 ← Console وابعت أول رسالة خطأ حمرا.</p><p class="small muted">تأكد كمان إن المتصفح أو إضافة حظر الإعلانات مش مانعين www.gstatic.com.</p><button id="retryBoot" class="btn">إعادة المحاولة</button></section>';
   }
 },12000);
 try{
  const module=await import('./cloud.js');cloud=await module.makeCloud();
  clearTimeout(bootTimeout);
  if(!cloud.configured){
   el('content').innerHTML=`<section class="box"><h2>⚙️ جاهز لربط Firebase</h2><p>النسخة دي جاهزة لـGitHub Pages، لكن محتاجة تحط Firebase Web App Config في الملف <code>firebase-config.js</code> وتنشر قواعد <code>firestore.rules</code>.</p><div class="notice">التطبيق مش هيزامن لحد ما تكمل إعداد Firebase. افتح ملف <code>README_AR.md</code> اللي مع التحميل، فيه الخطوات بالتفصيل.</div></section>`;return;
  }
  cloud.listenAuth(u=>{
   if(user && u && user.uid === u.uid) return;
   if(stopWatch){stopWatch();stopWatch=null;}
   user=u;
   if(!u){state={days:{}};showSignedOut();return;}
   state={days:{}};el('nav').hidden=false;
   el('content').innerHTML='<section class="box">بنجيب تسجيلاتك من السحابة…</section>';
   stopWatch=cloud.watch(u.uid,days=>{
     state.days=days;saveError='';
     if(!['TEXTAREA','INPUT'].includes(document.activeElement?.tagName))render();
   },err=>{el('content').innerHTML=`<div class="error">خطأ اتصال بقاعدة البيانات: ${esc(err?.message||'Unknown')}. تأكد من Firebase Firestore Rules.</div>`;});
  });
 }catch(err){
  clearTimeout(bootTimeout);
  console.error(err);
  el('content').innerHTML=`<div class="error">تعذر تشغيل Firebase. تأكد من إعداداته والإنترنت. ${esc(err?.message||'')}</div>`;
 }
}
init();
