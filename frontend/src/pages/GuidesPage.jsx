import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Clock, ChevronDown, ChevronUp,
  ShoppingCart, Tag, Wrench, Shield, AlertTriangle,
  Car, Fuel, FileText, DollarSign, CheckCircle2,
  Battery, Thermometer, Gauge, X, ArrowRight
} from 'lucide-react';

const easing = [0.4, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } }
};

const categoryConfig = {
  'קנייה': { color: 'blue', icon: ShoppingCart, label: 'קנייה' },
  'מכירה': { color: 'emerald', icon: Tag, label: 'מכירה' },
  'אחזקה': { color: 'orange', icon: Wrench, label: 'אחזקה' },
  'ביטוח': { color: 'purple', icon: Shield, label: 'ביטוח' },
  'בטיחות': { color: 'red', icon: AlertTriangle, label: 'בטיחות' },
};

const categoryColors = {
  blue: {
    badge: 'bg-[#6390ff]/15 text-[#6390ff] border-[#6390ff]/25',
    iconBg: 'bg-gradient-to-br from-[#6390ff]/25 to-blue-500/10',
    glow: 'rgba(99,144,255,0.15)',
  },
  emerald: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    iconBg: 'bg-gradient-to-br from-emerald-500/25 to-green-500/10',
    glow: 'rgba(16,185,129,0.15)',
  },
  orange: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    iconBg: 'bg-gradient-to-br from-orange-500/25 to-amber-500/10',
    glow: 'rgba(249,115,22,0.15)',
  },
  purple: {
    badge: 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/25',
    iconBg: 'bg-gradient-to-br from-[#a78bfa]/25 to-purple-500/10',
    glow: 'rgba(167,139,250,0.15)',
  },
  red: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    iconBg: 'bg-gradient-to-br from-red-500/25 to-rose-500/10',
    glow: 'rgba(239,68,68,0.15)',
  },
};

const articles = [
  {
    id: 1,
    title: '10 דברים שחייבים לבדוק לפני קניית רכב יד שנייה',
    description: 'המדריך המלא לבדיקות שחובה לעשות לפני שסוגרים עסקה על רכב משומש. מתוקף הטסט ועד היסטוריית בעלויות.',
    category: 'קנייה',
    readTime: 8,
    icon: Car,
    content: `קניית רכב יד שנייה היא אחת ההחלטות הכלכליות המשמעותיות ביותר שנקבל. טעות בבחירה עלולה לעלות לנו עשרות אלפי שקלים בתיקונים ובעיות בלתי צפויות. הנה עשרת הדברים שחייבים לבדוק לפני שסוגרים עסקה:

1. תוקף הטסט (בדיקה שנתית)
בדקו מתי הטסט האחרון בוצע ומתי פג תוקפו. רכב עם טסט שעומד לפוג בקרוב עלול להפתיע אתכם בתיקונים יקרים שנדרשים כדי לעבור את הבדיקה. אם הטסט פג, זו נורה אדומה - ייתכן שהמוכר נמנע מלחדש אותו בגלל בעיות ידועות.

2. היסטוריית בעלויות
בדקו כמה בעלים היו לרכב ומה משך הזמן שכל אחד החזיק בו. רכב שהחליף ידיים רבות בזמן קצר עלול להעיד על בעיות חוזרות. רכב עם בעלים אחד או שניים לאורך שנים הוא בדרך כלל סימן חיובי.

3. סטטוס גניבה
בדקו במאגרים הרשמיים שהרכב לא דווח כגנוב. קניית רכב גנוב, גם בתום לב, עלולה להוביל לתפיסת הרכב על ידי המשטרה ואובדן מלא של ההשקעה. השתמשו בשירות שלנו לבדיקה מיידית.

4. היסטוריית תאונות
בקשו מהמוכר דוח מלא על תאונות קודמות. רכב שעבר תאונה חמורה עלול לסבול מבעיות מבניות סמויות שיתגלו רק בהמשך. שימו לב לפערי צבע בין חלקי הרכב - סימן אפשרי לתיקוני פח וצבע.

5. מצב הצמיגים
צמיגים חדשים עולים מאות עד אלפי שקלים. בדקו את עומק החריצים, תאריך הייצור (מוטבע על הצמיג), ושחיקה אחידה. שחיקה לא אחידה עלולה להעיד על בעיות במתלים או בפיזור הכבידה.

6. מצב המנוע
הקשיבו למנוע בהתנעה קרה - רעשים חריגים, רטט מוגזם או עשן מהאגזוז הם סימנים מדאיגים. בדקו את רמת ומצב שמן המנוע. שמן שחור וסמיך מעיד על אחזקה לקויה. ודאו שאין דליפות שמן מתחת לרכב.

7. מערכות אלקטרוניות
בדקו שכל המערכות האלקטרוניות פועלות תקין: חלונות חשמליים, מיזוג אוויר, מערכת מולטימדיה, חיישנים, מצלמה אחורית ונורות בלוח המחוונים. תיקוני חשמל ברכב יכולים להיות יקרים במיוחד.

8. חלודה בשלדה
בדקו את תחתית הרכב, סביב הגלגלים ובתוך תא המטען. חלודה נרחבת בשלדה עלולה לפגוע ביציבות המבנית של הרכב ולהוות סיכון בטיחותי. חלודה שטחית בנקודות מסוימות היא טבעית, אבל חלודה עמוקה היא סיבה לדאגה.

9. עקביות קילומטראז'
השוו את מספר הקילומטרים בדוח הטסט למד הקילומטרים הנוכחי. פערים חריגים עלולים להעיד על זיוף מד-אוד (rollback). חשבו שממוצע נסיעה סביר הוא כ-15,000-20,000 ק"מ בשנה.

10. השוואת מחיר לשוק
לפני שמציעים מחיר, בדקו את ערך הרכב בהתאם לשנה, דגם, קילומטראז' ומצב כללי. רכב במחיר נמוך משמעותית מהשוק עלול להעיד על בעיות נסתרות. רכב במחיר גבוה מהשוק אומר שיש מקום למשא ומתן.`
  },
  {
    id: 2,
    title: 'מתי הזמן הנכון למכור את הרכב?',
    description: 'תזמון נכון של מכירת הרכב יכול לחסוך לכם אלפי שקלים. למדו מתי כדאי למכור ומתי עדיף להמתין.',
    category: 'מכירה',
    readTime: 5,
    icon: Tag,
    content: `תזמון המכירה של הרכב הוא אחד הגורמים המשמעותיים ביותר במחיר שתקבלו. הנה הגורמים העיקריים שכדאי לשקול:

לפני תיקונים יקרים
אם הרכב צפוי לתיקון משמעותי כמו החלפת גיר, תזמון, מצמד או בעיית מנוע - שקלו למכור לפני התיקון. עלות התיקון לרוב לא תתווסף למחיר המכירה. רכב שעומד בפני תיקון של 10,000 שקל לא יימכר ב-10,000 שקל יותר אחרי התיקון.

לפני שפג תוקף הטסט
רכב עם טסט בתוקף שווה יותר מרכב עם טסט שפג. קונים מעדיפים רכב מוכן לנסיעה ללא השקעה נוספת. נסו למכור לפחות 2-3 חודשים לפני תום התוקף כדי לתת לקונה תחושת ביטחון.

עונתיות - מרץ-אפריל הם חודשים מצוינים
שוק הרכב בישראל מושפע מעונתיות. החודשים מרץ-אפריל הם תקופת שיא בביקוש - אחרי בונוסים שנתיים וחזרה לשגרה אחרי החגים. גם ספטמבר-אוקטובר הם חודשים חזקים. בקיץ ובחורף הביקוש יורד.

לפני אבני דרך של פחת
רכבים מאבדים ערך בצורה חדה בנקודות מסוימות: מעבר ל-100,000 ק"מ, מעבר ל-150,000 ק"מ, ואחרי 7-8 שנים מייצור. אם הרכב שלכם מתקרב לאחד מהמיילסטונים האלה, שקלו למכור לפני שתגיעו אליהם.

כלל האצבע הכלכלי
חשבו על העלות החודשית הכוללת של הרכב: תיקונים, ביטוח, דלק ופחת. כשהעלות החודשית מתחילה לטפס מעבר לעלות ליסינג של רכב חדש באותו סגמנט, זה בדרך כלל הזמן להחליף.

טיפים למקסום המחיר
שטפו את הרכב לעומק, תקנו שריטות קטנות, ודאו שכל המערכות עובדות ואספו את כל המסמכים (רישיון, ביטוח, היסטוריית טיפולים). רכב נקי ומאורגן עושה רושם ויכול להוסיף אלפי שקלים למחיר.`
  },
  {
    id: 3,
    title: 'מדריך אחזקה שנתית לרכב',
    description: 'מדריך מפורט לאחזקת הרכב לפי אבני דרך קילומטריות. שמרו על הרכב במצב מושלם וחסכו בתיקונים עתידיים.',
    category: 'אחזקה',
    readTime: 7,
    icon: Wrench,
    content: `אחזקה סדירה היא ההשקעה הטובה ביותר שתוכלו לעשות ברכב שלכם. היא מאריכה את חיי הרכב, שומרת על ערכו ומונעת תקלות יקרות. הנה מדריך אחזקה מפורט לפי קילומטראז':

כל 10,000 ק"מ - טיפול בסיסי
החלפת שמן מנוע ופילטר שמן היא הפעולה הבסיסית והחשובה ביותר. שמן נקי מגן על חלקי המנוע ומאריך את חייו. יחד עם כל החלפת שמן, בדקו את רמות הנוזלים (מים, בלמים, הגה כוח), לחץ אוויר בצמיגים, ומצב המגבים.

כל 30,000 ק"מ - טיפול מורחב
בנוסף לטיפול הבסיסי, זה הזמן להחליף פילטר אוויר למנוע ופילטר מיזוג אוויר (פילטר סביבה). פילטר אוויר סתום מפחית ביצועים ומגדיל צריכת דלק. בדקו גם את מצב רפידות הבלמים - אם הן דקות מ-3 מ"מ, הגיע זמן להחליף. סובבו צמיגים (קדימה-אחורה) לשחיקה אחידה.

כל 60,000 ק"מ - טיפול משמעותי
זו נקודת ביניים חשובה. החליפו נוזל בלמים (מומלץ כל שנתיים או 60,000 ק"מ), בדקו את מערכת הקירור והחליפו נוזל קירור במידת הצורך. בדקו את מצב הצמיגים ושקלו החלפה אם עומק החריצים ירד מתחת ל-3 מ"מ. בדקו את מצב המצבר - מצבר ממוצע מחזיק 3-5 שנים.

כל 100,000 ק"מ - טיפול מקיף
זה הטיפול הגדול. החליפו מצתים (בוגיות), בדקו והחליפו רצועת תזמון (קריטי - קרע ברצועה יכול להרוס את המנוע), החליפו נוזל גיר אוטומטי, בדקו את מערכת האגזוז ובצעו בדיקת מתלים מקיפה. זה גם הזמן לבדוק את כל הגומיות והאטמים.

תחזוקה עונתית
לפני הקיץ: בדקו מערכת מיזוג אוויר, רמת קירור ומצב צמיגים (חום מגביר שחיקה). לפני החורף: בדקו מצב מגבים, תאורה, מצבר ועומק חריצי צמיגים לאחיזה בגשם.

טיפ חשוב
שמרו את כל הקבלות וידעו מה בוצע ומתי. היסטוריית טיפולים מסודרת מעלה את ערך הרכב במכירה ונותנת לקונים ביטחון. השתמשו באפליקציה שלנו לתיעוד ומעקב.`
  },
  {
    id: 4,
    title: 'איך לחסוך בביטוח רכב',
    description: 'טיפים מעשיים שיכולים להוריד את פרמיית הביטוח שלכם במאות עד אלפי שקלים בשנה.',
    category: 'ביטוח',
    readTime: 6,
    icon: Shield,
    content: `ביטוח רכב הוא אחת ההוצאות הגדולות ביותר על רכב, ורבים משלמים יותר מדי בלי לדעת. הנה דרכים מוכחות לחסוך:

השוואת הצעות מחיר
זה הצעד הבסיסי והחשוב ביותר. קבלו הצעות מלפחות 3-4 חברות ביטוח שונות. ההבדלים יכולים להגיע לאלפי שקלים בשנה על אותו כיסוי בדיוק. אל תתעצלו - ההשוואה לוקחת שעה אבל חוסכת אלפים.

העלאת ההשתתפות העצמית
העלאת ההשתתפות העצמית מ-0 ל-2,000-3,000 שקל יכולה להוריד את הפרמיה ב-15-25%. אם אתם נהגים זהירים ולא מגישים תביעות קטנות, זו עסקה משתלמת. שימו את הכסף שחסכתם בצד למקרה חירום.

התקנת מערכת GPS/איתוראן
מערכת איתור גנבות מוכרת יכולה להוריד את הפרמיה ב-5-15%. חברות הביטוח יודעות שסיכויי ההשבה עולים דרמטית עם מערכת איתור, ולכן מעניקות הנחה. העלות השנתית של האיתוראן בדרך כלל נמוכה מהחיסכון בביטוח.

הנחות נהג זהיר
נהגים ללא תביעות ב-3 שנים האחרונות זכאים להנחות משמעותיות. חלק מהחברות מציעות עד 50% הנחה על ביטוח מקיף לנהגים עם "עבר נקי". שמרו על הרקורד הנקי - תביעה קטנה עלולה לעלות יותר בפרמיה ממה שתקבלו.

תשלום שנתי במקום חודשי
תשלום שנתי מראש חוסך 5-8% לעומת תשלומים חודשיים. חברות הביטוח מעדיפות תשלום מראש ומתגמלות על כך. אם יש לכם את האפשרות, זה חיסכון קל ומיידי.

ביטוח קבוצתי
בדקו אם מקום העבודה, ארגון מקצועי או ועד עובדים מציעים ביטוח קבוצתי. הנחות קבוצתיות יכולות להגיע ל-10-20% מהמחיר הרגיל. גם קופות חולים ולשכות מקצועיות מציעות לעתים הסדרים.

גיל הרכב וסוג הכיסוי
על רכבים ישנים (מעל 8 שנים), שקלו לוותר על ביטוח מקיף ולהסתפק בצד ג'. כשערך הרכב נמוך, הפרמיה של ביטוח מקיף עלולה להיות גבוהה ביחס למה שתקבלו בתביעה. חשבו את היחס עלות-תועלת.`
  },
  {
    id: 5,
    title: 'מדריך בטיחות: מה המשמעות של דירוג הבטיחות?',
    description: 'הבנת דירוג הבטיחות של הרכב - מה כל רמה כוללת ולמה זה חשוב בבחירת רכב.',
    category: 'בטיחות',
    readTime: 6,
    icon: AlertTriangle,
    content: `דירוג הבטיחות (רמת איבזור בטיחותי) הוא אחד הפרמטרים החשובים ביותר בבחירת רכב. המדד נע בין 1 ל-8 וקובע איזה מערכות בטיחות מותקנות ברכב.

רמות 1-2: בטיחות בסיסית
כוללות את הדרישות המינימליות: חגורות בטיחות, כריות אוויר קדמיות ומערכת ABS (מניעת נעילת גלגלים בבלימה). רמות אלו נפוצות ברכבים ישנים יותר או במודלים בסיסיים. ABS מונעת החלקה בבלימה חדה ומאפשרת שמירה על שליטה בהגה.

רמות 3-4: בטיחות משופרת
מוסיפות כריות אוויר צדדיות, כריות וילון לראש, מערכת ESC (בקרת יציבות אלקטרונית) וחיישני לחץ אוויר לצמיגים. ESC היא אחת ממערכות הבטיחות החשובות ביותר - היא מזהה אובדן שליטה ומפעילה בלימה סלקטיבית כדי לייצב את הרכב. מחקרים מראים שהיא מפחיתה תאונות קטלניות ב-30%.

רמות 5-6: בטיחות מתקדמת
כאן נכנסות מערכות אקטיביות: מערכת התרעה ליציאה מנתיב (Lane Departure Warning), בקרת שיוט אדפטיבית, חיישני חניה, מצלמה אחורית ומערכת זיהוי שלט תנועה. מערכות אלו לא רק מגנות בעת תאונה, אלא מסייעות למנוע אותה מלכתחילה.

רמות 7-8: בטיחות פרימיום
הרמות הגבוהות ביותר כוללות בלימת חירום אוטומטית (AEB), זיהוי הולכי רגל ורוכבי אופניים, מערכת שמירה על נתיב אקטיבית (Lane Keep Assist), ניטור שטח מת (Blind Spot Monitoring) ובקרת שיוט אדפטיבית עם עצירה אוטומטית. AEB לבדה יכולה למנוע כ-40% מהתנגשויות אחוריות.

מבחני Euro NCAP
הדירוג הישראלי מושפע ממבחני הריסוק האירופאיים Euro NCAP. המבחנים בודקים הגנה על מבוגרים, ילדים, הולכי רגל ומערכות סיוע לנהג. ציון 5 כוכבים הוא הגבוה ביותר. שימו לב שהציון משתנה בין שנות ייצור - כלי שקיבל 5 כוכבים ב-2015 לא בהכרח עומד בסטנדרט של 2024.

מה זה אומר בפועל?
בבחירת רכב, המלצתנו היא לחפש רמה 5 ומעלה, במיוחד אם יש לכם משפחה. ההבדל במחיר בין רמות הגימור לרוב קטן יחסית לערך שמערכות הבטיחות מספקות. בלימת חירום אוטומטית ובקרת יציבות הן המערכות שמצילות הכי הרבה חיים.`
  },
  {
    id: 6,
    title: 'בנזין, דיזל, חשמלי או היברידי - מה מתאים לך?',
    description: 'השוואה מקיפה בין סוגי ההנעה השונים. יתרונות, חסרונות ומה כדאי לבחור בהתאם לצרכים שלכם.',
    category: 'קנייה',
    readTime: 7,
    icon: Fuel,
    content: `בחירת סוג ההנעה היא אחת ההחלטות הראשונות בקניית רכב. לכל אפשרות יתרונות וחסרונות, וההחלטה הנכונה תלויה בדפוסי הנסיעה שלכם.

בנזין - הבחירה הקלאסית
יתרונות: מחיר רכישה נמוך יחסית, תחנות תדלוק בכל מקום, אחזקה פשוטה ומוכרת, מגוון רחב של דגמים. חסרונות: צריכת דלק גבוהה יחסית, פליטות מזהמות, מחיר דלק עולה. מתאים ל: נהגים שנוסעים בעיקר בעיר ובנסיעות קצרות עד בינוניות (עד 20,000 ק"מ בשנה).

דיזל - לנוסעים כבדים
יתרונות: צריכת דלק נמוכה ב-20-30% מבנזין, מומנט גבוה (טוב לנסיעות כביש ועומסים), מנוע עמיד לטווח ארוך. חסרונות: מחיר רכישה גבוה יותר, אחזקה יקרה יותר (פילטר חלקיקים DPF), פליטות חנקן, רעש מנוע גבוה יותר. מתאים ל: מי שנוסע מעל 25,000 ק"מ בשנה, בעיקר בכבישים בינעירוניים.

חשמלי - העתיד כבר כאן
יתרונות: עלות "תדלוק" נמוכה מאוד (חשמל זול מדלק), אפס פליטות, תחזוקה מינימלית (אין שמן, פילטרים, בלמים שוחקים פחות), תאוצה מרשימה ונסיעה שקטה, פטור מאגרה ומס קנייה מופחת. חסרונות: מחיר רכישה גבוה, חרדת טווח (300-500 ק"מ לרוב), זמן טעינה (30 דקות בטעינה מהירה), תשתית טעינה בישראל עדיין מתפתחת. מתאים ל: נוסעים עירוניים עם אפשרות טעינה בבית או בעבודה, נסיעות קבועות וצפויות.

היברידי - הפשרה החכמה
יתרונות: צריכת דלק נמוכה מבנזין רגיל, אין צורך בתשתית טעינה (היברידי רגיל), ערך מכירה חוזרת גבוה, מעבר חלק ושקט בין מנועים. חסרונות: מחיר רכישה גבוה יותר מבנזין, מורכבות טכנית (שני מנועים), סוללה שדורשת החלפה עתידית. מתאים ל: מי שרוצה לחסוך בדלק בלי לוותר על טווח ללא הגבלה.

היברידי נטען (Plug-in) - הטוב משני העולמות
מאפשר נסיעה חשמלית של 40-80 ק"מ ומעבר חלק לבנזין. אידיאלי למי שנוסע קצר ביומיום אבל צריך טווח לנסיעות ארוכות.

השורה התחתונה
חשבו על כמה קילומטרים אתם נוסעים בשנה, האם יש לכם חניה עם גישה לחשמל, ומה התקציב שלכם. לנסיעות עד 15,000 ק"מ בשנה - בנזין או חשמלי. מעל 25,000 ק"מ - דיזל או היברידי. מגמת השוק ברורה: חשמליים הולכים ומוזילים, וערכי המכירה החוזרת של דיזל יורדים.`
  },
  {
    id: 7,
    title: 'הוצאות נסתרות של בעלות על רכב',
    description: 'מעבר למחיר הרכישה, בעלות על רכב כוללת הוצאות שרבים לא מחשבים מראש. הנה הפירוט המלא.',
    category: 'קנייה',
    readTime: 6,
    icon: DollarSign,
    content: `כשקונים רכב, רבים מתמקדים במחיר הרכישה ושוכחים שהעלות האמיתית היא הרבה יותר. הנה פירוט מלא של כל ההוצאות השנתיות שכדאי לחשב מראש:

ביטוח חובה + מקיף
ביטוח חובה עולה כ-1,000-1,500 שקל בשנה. ביטוח מקיף, התלוי בגיל הנהג, סוג הרכב והיסטוריית תביעות, יכול לנוע בין 2,500 ל-8,000 שקל בשנה. ביחד, אלו כ-4,000-9,000 שקל בשנה שצריך לחשב.

טסט שנתי
הבדיקה השנתית עצמה עולה כ-250-350 שקל, אבל העלות האמיתית היא התיקונים שנדרשים כדי לעבור אותה. ברכבים ישנים, תיקונים לפני טסט יכולים להגיע לאלפי שקלים. ממוצע שנתי כולל: 500-3,000 שקל.

אגרת רישוי (אגרה)
אגרת רישוי שנתית עולה כ-1,200 שקל לרכבים רגילים. רכבים ירוקים (חשמליים והיברידיים) זוכים להנחה. זו הוצאה קבועה שחייבים לשלם ללא קשר לשימוש ברכב.

חניה
בעיר גדולה, חניה חודשית יכולה לעלות 300-800 שקל. תוסיפו דוחות חניה מדי פעם, חניונים בקניונים ובילויים - והסכום השנתי מגיע בקלות ל-5,000-10,000 שקל. זו לרוב ההוצאה הנסתרת הגדולה ביותר.

דלק
תלוי כמה נוסעים, אבל ממוצע של 15,000 ק"מ בשנה עם צריכה של 8 ליטר/100 ק"מ מסתכם בכ-8,000-10,000 שקל בשנה (תלוי במחיר הדלק). רכב חשמלי יעלה כ-2,000-3,000 שקל בחשמל לאותו מרחק.

פחת (ירידת ערך)
זו ההוצאה הגדולה ביותר שאף אחד לא מרגיש. רכב חדש מאבד כ-15-20% מערכו בשנה הראשונה, ו-10-12% בכל שנה שלאחר מכן. רכב שנקנה ב-150,000 שקל ייאבד כ-25,000 שקל בשנה הראשונה. זו הסיבה שרכב יד שנייה בן 2-3 שנים הוא לרוב עסקה טובה יותר.

תיקונים בלתי צפויים
גם רכב מטופל יכול להפתיע. חלון שנשבר, פנצ'ר, בעיה במיזוג, גומיות שנקרעו. שימו בצד 200-300 שקל בחודש לקרן חירום לרכב. ברכבים ישנים, הקצו יותר.

צמיגים
סט צמיגים חדש עולה בין 1,200 ל-4,000 שקל, תלוי בגודל ובמותג. צמיגים מחזיקים בממוצע 40,000-60,000 ק"מ, כלומר כ-700-1,500 שקל בשנה.

סיכום: עלות שנתית טיפוסית
לרכב בינוני בן 5 שנים, העלות השנתית הכוללת (ללא פחת) היא כ-20,000-35,000 שקל. עם פחת, הסכום יכול להגיע ל-40,000-50,000 שקל. זה 2,500-4,000 שקל בחודש. חשבו על המספרים האלה לפני שמחליטים על תקציב רכישה.`
  },
  {
    id: 8,
    title: 'איך לקרוא דוח בדיקת רכב',
    description: 'מדריך מפורט להבנת דוחות הבדיקה השנתית. מה כל סעיף אומר ומתי צריך לדאוג.',
    category: 'קנייה',
    readTime: 5,
    icon: FileText,
    content: `דוח בדיקת הרכב (טסט) הוא אחד המסמכים החשובים ביותר בקניית רכב משומש. הנה איך לקרוא אותו נכון:

מבנה הדוח
דוח הטסט מחולק למספר חלקים: פרטי הרכב (מספר רישוי, יצרן, דגם, שנה), תוצאות הבדיקה לפי מערכות, ליקויים שנמצאו (אם ישנם), והחלטה סופית - עבר/נכשל.

מערכת הבלימה
זה החלק הקריטי ביותר. הבודקים מודדים יעילות בלימה, מצב דיסקיות ורפידות, צינורות בלמים ובלם יד. אם יש הערות על "שחיקה" או "דליפה" - זו נורה אדומה. בלמים לא תקינים מסכנים חיים.

מערכת ההיגוי והמתלים
בדיקת רפיון בהיגוי, מצב זרועות מתלה, בולמי זעזועים ומסבים. רפיון בהיגוי מורגש כ"משחק" בהגה ויכול להעיד על חלקים שחוקים. החלפת מתלים עולה אלפי שקלים, אז שימו לב להערות בסעיף הזה.

שלדה ומרכב
הבודקים מחפשים חלודה, סדקים, עיוותים וסימני תאונה. "חלודה שטחית" היא פחות מדאיגה מ"חלודה חודרת" שפוגעת במבנה. עיוותים במרכב עלולים להעיד על תאונה שלא דווחה.

מנוע ומערכת פליטה
בדיקת דליפות שמן, מצב אטמים, רמת פליטה (בדיקת אגזוז), ורעשים חריגים. פליטת עשן שחור או כחול מהאגזוז מעידה על בעיות מנוע. רמת פליטה שלא עומדת בתקן עשויה לדרוש תיקון יקר של קטליזטור.

תאורה וחשמל
בדיקת כל נורות הרכב, מדי לוח מחוונים, צופרים ומגבים. ליקויים בתאורה הם בדרך כלל זולים לתיקון, אבל חשובים לבטיחות.

דגלים אדומים שצריך לשים לב אליהם
רכב שנכשל בטסט מספר פעמים רצופות, ליקויים חוזרים באותו סעיף (מעידים על בעיה כרונית), הערות על "שינוי מבנה" או "רכב אחרי תאונה", ומד אוד שלא תואם לבדיקות קודמות.

מה לעשות עם הדוח?
אם אתם קונים רכב, בקשו לראות את דוחות הטסט של 2-3 השנים האחרונות. השוו אותם ובדקו מגמות. ליקוי שהופיע פעם ותוקן הוא פחות מדאיג מליקוי חוזר. אם המוכר מסרב להראות דוחות - זו סיבה מספיקה לחשוד.`
  },
];

const categories = ['הכל', 'קנייה', 'מכירה', 'אחזקה', 'ביטוח', 'בטיחות'];

export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = activeCategory === 'הכל' || article.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Count articles per category
  const categoryCounts = useMemo(() => {
    const counts = { 'הכל': articles.length };
    categories.forEach(cat => {
      if (cat !== 'הכל') {
        counts[cat] = articles.filter(a => a.category === cat).length;
      }
    });
    return counts;
  }, []);

  const toggleArticle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6390ff]/20 to-[#a78bfa]/10 border border-[#6390ff]/20 mb-5">
            <BookOpen className="w-8 h-8 text-[#6390ff]" />
          </div>
          <h1 className="font-rubik font-bold text-3xl sm:text-4xl mb-3 gradient-text">
            מדריכים וטיפים
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-xl mx-auto mb-4">
            מדריכים מקצועיים ועצות מומחים לקנייה, מכירה ואחזקה חכמה של רכב בישראל
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6390ff]/10 border border-[#6390ff]/20">
            <BookOpen className="w-3.5 h-3.5 text-[#6390ff]" />
            <span className="text-xs font-medium text-[#6390ff]">{articles.length} מאמרים זמינים</span>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: easing }}
          className="mb-7"
        >
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
            <input
              type="text"
              placeholder="חיפוש מדריכים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium w-full pr-12 pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--input-bg)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: easing }}
          className="flex justify-center mb-8 overflow-x-auto pb-2"
        >
          <div className="inline-flex items-center gap-1.5 bg-[var(--input-bg)] border border-[var(--border-glass)] rounded-2xl p-1.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryBg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6390ff] to-[#a78bfa]"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {cat}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-rubik ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--border-glass)] text-[var(--text-secondary)]'
                    }`}>
                      {categoryCounts[cat]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article) => {
              const catConf = categoryConfig[article.category];
              const colorSet = categoryColors[catConf.color];
              const IconComp = article.icon;
              const isExpanded = expandedArticle === article.id;

              return (
                <motion.div
                  key={article.id}
                  variants={fadeUp}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-0 overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'md:col-span-2' : 'cursor-pointer'
                  }`}
                  style={{
                    '--hover-glow': colorSet.glow,
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.boxShadow = `0 8px 40px -8px ${colorSet.glow}`;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = `${colorSet.glow.replace('0.15', '0.4')}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.borderColor = '';
                  }}
                  onClick={() => !isExpanded && toggleArticle(article.id)}
                >
                  {/* Card header - always visible */}
                  {!isExpanded && (
                    <div className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colorSet.badge}`}>
                            {article.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)] opacity-60">
                            <Clock className="w-3.5 h-3.5" />
                            {article.readTime} דקות קריאה
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-xl ${colorSet.iconBg} border border-[var(--border-glass)]`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-rubik font-semibold text-base mb-2 leading-relaxed text-[var(--text-primary)]">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {article.description}
                      </p>

                      {/* Read more */}
                      <div className="flex items-center gap-1.5 mt-4 text-[#6390ff] text-sm font-medium">
                        <ChevronDown className="w-4 h-4" />
                        <span>קרא עוד</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: easing }}
                      >
                        {/* Article header */}
                        <div className="p-6 pb-0">
                          <div className="flex items-center justify-between mb-5">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleArticle(article.id); }}
                              className="w-9 h-9 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)] opacity-60">
                                <Clock className="w-3.5 h-3.5" />
                                {article.readTime} דקות קריאה
                              </span>
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colorSet.badge}`}>
                                {article.category}
                              </span>
                            </div>
                          </div>

                          <h2 className="font-rubik font-bold text-xl sm:text-2xl mb-2 leading-relaxed text-[var(--text-primary)]">
                            {article.title}
                          </h2>
                          <p className="text-sm text-[var(--text-secondary)] mb-5">
                            {article.description}
                          </p>
                        </div>

                        {/* Article content */}
                        <div className="px-6 pb-6 border-t border-[var(--border-glass)] pt-5" onClick={(e) => e.stopPropagation()}>
                          <div className="article-content text-sm text-[var(--text-secondary)] leading-[1.9] whitespace-pre-line">
                            {article.content}
                          </div>

                          {/* Back button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleArticle(article.id); }}
                            className="btn-primary mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                          >
                            <ArrowRight className="w-4 h-4" />
                            חזרה לרשימה
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easing }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-glass)] mb-5">
              <Search className="w-9 h-9 text-[var(--text-secondary)] opacity-40" />
            </div>
            <p className="text-[var(--text-primary)] text-lg font-rubik font-semibold mb-2">לא נמצאו מדריכים</p>
            <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto">נסו לחפש במילים אחרות או לבחור קטגוריה אחרת</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
