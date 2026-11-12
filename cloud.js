export async function makeCloud() {
  const { firebaseConfig } = await import('./firebase-config.js');
  const ok = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PASTE_') &&
    firebaseConfig.projectId && !firebaseConfig.projectId.includes('PASTE_') &&
    firebaseConfig.appId && !firebaseConfig.appId.includes('PASTE_');
  if (!ok) return { configured:false };

  const v='13.2.0';
  const [{initializeApp},{getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut},
    {getFirestore, collection, doc, setDoc, onSnapshot, writeBatch}]= await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)
  ]);
  const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
  const own=(uid)=>collection(db,'users',uid,'days');
  const byDate=(uid,date)=>doc(db,'users',uid,'days',date);
  return {
    configured:true,
    listenAuth(cb){return onAuthStateChanged(auth,cb);},
    signIn(){return signInWithPopup(auth,new GoogleAuthProvider());},
    signOut(){return signOut(auth);},
    watch(uid,onData,onError){return onSnapshot(own(uid),snapshot=>{
      const days={}; snapshot.forEach(row=>days[row.id]=row.data()); onData(days);
    },onError);},
    write(uid,date,field,value){return setDoc(byDate(uid,date),{[field]:value},{merge:true});},
    async importDays(uid,days){
      // Existing fields on a date are merged, not erased. Batch limit stays under 500.
      const entries=Object.entries(days).filter(([d,v])=>/^\d{4}-\d{2}-\d{2}$/.test(d) &&
        v && typeof v==='object' && !Array.isArray(v));
      for(let i=0;i<entries.length;i+=300){
        const batch=writeBatch(db);
        for(const [date,fields] of entries.slice(i,i+300)){
          const safe={}; for(const [key,value] of Object.entries(fields)){
            if(/^[\w:.-]{1,100}$/.test(key) && ['string','number','boolean'].includes(typeof value) &&
              String(value).length<2001) safe[key]=value;
          }
          if(Object.keys(safe).length)batch.set(byDate(uid,date),safe,{merge:true});
        }
        await batch.commit();
      }
      return entries.length;
    }
  };
}
