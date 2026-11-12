# Wake Routine Cloud | تطبيق GitHub Pages + Firebase

## الفكرة
- GitHub Pages بيستضيف الواجهة فقط.
- Firebase Authentication: الدخول بحساب Google.
- Cloud Firestore: تسجيلاتك ومهامك اليومية خاصة بحسابك ومتزامنة بين الموبايل واللاب.
- **مفيش Python، ولا START_HERE.bat، ولا لاب لازم يفضل شغال**.
- التطبيق يكرر توزيع 14 يوم تلقائيًا بعد 25 نوفمبر. التقويم ينتقل للفترة الحالية والسابقة والتالية، وتسجيلاتك القديمة محفوظة.
- الألماني وهيلمهولتز: **إنت فقط اللي بتكتب مهمتهم بكرة**، بلا اقتراحات تلقائية.

## الإعداد لأول مرة (مرة واحدة)

### 1. اعمل Firebase Project
- افتح https://console.firebase.google.com/ واضغط **Add project**.
- اختار **Spark (No-cost)** وتجنب تفعيل أي خدمة تتطلب حساب دفع.
- من Project overview اضغط علامة **Web `</>`** وسمي التطبيق `Wake Routine`.
- في نهاية تسجيل تطبيق Web هتظهر `firebaseConfig` وفيها `apiKey`, `authDomain`, `projectId`, `appId`.

### 2. فعّل تسجيل الدخول
- في Firebase Console > **Build > Authentication > Sign-in method**.
- فعّل **Google**، واختار Support email لو مطلوب.
- في **Authentication > Settings > Authorized domains** ضيف `mohamedmostafa23.github.io` (من غير https أو `/wake-routine`).
- مهم: `github.io` دومين الـGitHub Pages الخاص بيك. لو بتستخدم دومين مختلف ضيفه.

### 3. فعّل قاعدة البيانات واضبط الأمان
- Firebase Console > **Build > Firestore Database > Create database**.
- استخدم **Standard edition** وأول قاعدة بيانات داخل المشروع للاستفادة من الـFree tier، واختار منطقة مناسبة.
- افتح **Rules** وبدّل المحتوى كله بنص ملف **`firestore.rules`** الموجود هنا.
- اضغط **Publish**. القاعدة بتسمح لكل مستخدم يقرأ/يعدل بياناته هو فقط.
- لا تستخدم قاعدة `allow read, write: if true;` أبدًا.

### 4. ربطنا كود التطبيق بـFirebase بالفعل ✅
- ملف **`firebase-config.js`** يحتوي بالفعل على إعدادات Web app في مشروع **`habiter-ae4ec`**.
- دي إعدادات عامة للعميل، مش كلمات مرور. **الأمان الحقيقي من Firebase Authentication وFirestore Rules**.
- **ممنوع** تحط private keys أو حساب service account أو محتويات `routine_data.json` في GitHub.

### 5. انشر على GitHub Pages
- افتح https://github.com/new واعمل Repo جديد اسمه **`wake-routine`** على حساب **`MohamedMostafa23`**، وخليه **Public** لو حسابك Free.
- ارفع **كل الملفات من داخل فولدر Wake_Routine_Cloud** إلى جذر الـRepo، مش الفولدر نفسه. ممكن تسحبهم على صفحة `Add file > Upload files`.
- روح **Settings > Pages**، واختار `Deploy from a branch` ثم `main` و`/(root)` واضغط Save.
- افتح الرابط اللي GitHub هيعرضه. غالبًا هيبقى `https://mohamedmostafa23.github.io/wake-routine/`.
- افتح نفس اللينك من اللاب والموبايل، وسجّل الدخول **بنفس حساب Google**.

### 6. لو عندك بيانات من النسخة القديمة
- في النسخة القديمة اعمل **Download JSON Backup**، أو خُد نسخة من `routine_data.json` من فولدرها.
- افتح النسخة السحابية > **حسابي** > **استيراد Backup**، واختر JSON.
- الاستيراد يضيف الأيام القديمة ويحدّث الحقول المتطابقة، ومش بيمسح الأيام التانية.
- **متنشرش ملف الـBackup على GitHub**، لأنه ممكن يحتوي على تفاصيل شغلك ومذاكرتك.

### 7. ضيف اختصار للموبايل
- Android / Chrome: قائمة ⋮ > Add to Home screen.
- iPhone / Safari: Share > Add to Home Screen.
- زر «صحيت» داخل التطبيق يدوي، مش إشعار أوتوماتيكي.

## بعد أول أسبوعين
- الجدول بيتكرر تلقائيًا في فترات 14 يوم بدون تاريخ انتهاء.
- في الأيام الأسبوعية A/B بتتبادل الزيادة بعد كل أسبوعين حسب خطة التكرار.
- أوزانك وعداتك بتتسجل وتقدر تشوف وزن آخر مرة في Placeholder.
- خليك على **مجموعتين للتمرين** كبداية. لما تعمل كل العدات بسهولة وبفورمة نظيفة في تمرينتين متتاليتين، زوّد عدة أو وزن صغير، مش الاثنين معًا.
- الجري: 5د مشي + 5 جولات (2د جري سهل و2د مشي) + 5د مشي. الأحد نسخة أخف (1د جري و3د مشي). ممكن تزود وقت الجري بعد التأقلم، فقط لو مرتاح.
- السبت إجازة تامة. الأربعاء والأحد كـGerman course ثابتة.

## حدود النسخة الحالية
- محتاجة إنترنت أول مرة للتسجيل والمزامنة ولصور التمارين.
- **لسه مش منشورة على حسابك**: لازم تعمل Firebase Project وGitHub Repo وتنفذ الخطوات فوق.
- **مفيش إشعارات Push** من غير إعدادات إضافية.
- فيه مزامنة مباشرة، لكن لو جهازين بيعدلوا نفس الخانة في نفس اللحظة، آخر حفظ بيكسب.
