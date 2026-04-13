import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const features = [
  { name: 'חיפוש ידני', free: true, pro: true },
  { name: 'זיהוי AI מתמונה', free: '10 ביום', pro: 'ללא הגבלה' },
  { name: 'פרטים בסיסיים', free: true, pro: true },
  { name: 'פרטים מורחבים', free: false, pro: true },
  { name: 'היסטוריית חיפושים', free: false, pro: true },
  { name: 'רכבים שמורים', free: false, pro: true },
  { name: 'השוואת רכבים', free: false, pro: true },
  { name: 'ייצוא PDF', free: false, pro: true },
  { name: 'ללא פרסומות', free: false, pro: true },
  { name: 'תמיכה בעדיפות', free: false, pro: true },
];

const faqs = [
  { q: 'מה קורה אחרי 10 סריקות AI?', a: 'לאחר 10 סריקות AI ביום, תוכל להמשיך לחפש ידנית ללא הגבלה. כדי להמשיך להשתמש ב-AI, שדרג ל-Pro.' },
  { q: 'איך מבטלים מנוי?', a: 'ניתן לבטל את המנוי בכל עת דרך דף החשבון. המנוי יישאר פעיל עד סוף תקופת החיוב.' },
  { q: 'האם המידע מדויק?', a: 'המידע מגיע ישירות ממאגרי data.gov.il הממשלתיים ומתעדכן באופן שוטף.' },
  { q: 'מאיפה המידע?', a: 'כל הנתונים מגיעים ממשרד התחבורה דרך פלטפורמת הנתונים הפתוחים של ממשלת ישראל (data.gov.il).' },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="pricing-page">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-rubik font-bold text-3xl sm:text-4xl mb-3">תוכניות ומחירים</h1>
          <p className="text-white/50 text-base">בחר את התוכנית שמתאימה לך</p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16 max-w-2xl mx-auto">
          {/* Free */}
          <motion.div variants={fadeUp} className="glass-card p-6" data-testid="pricing-card-free">
            <h3 className="font-rubik font-bold text-xl mb-1">חינם</h3>
            <p className="text-sm text-white/40 mb-4">לשימוש בסיסי</p>
            <div className="text-4xl font-rubik font-bold mb-6">$0<span className="text-base text-white/40 font-normal">/חודש</span></div>
            <Button data-testid="pricing-start-free-btn" onClick={() => navigate('/login')} variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl mb-4">
              התחל בחינם
            </Button>
          </motion.div>

          {/* Pro */}
          <motion.div variants={fadeUp} className="glass-card p-6 border-blue-500/30 relative" data-testid="pricing-card-pro">
            <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> פופולרי
            </div>
            <h3 className="font-rubik font-bold text-xl mb-1 text-blue-400">Pro</h3>
            <p className="text-sm text-white/40 mb-4">לשימוש מקצועי</p>
            <div className="text-4xl font-rubik font-bold mb-6">$5<span className="text-base text-white/40 font-normal">/חודש</span></div>
            <Button data-testid="pricing-upgrade-btn" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl mb-4">
              שדרג ל-Pro
            </Button>
          </motion.div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card p-6 mb-16 hover:translate-y-0" data-testid="features-comparison">
          <h2 className="font-rubik font-bold text-xl mb-6 text-center">השוואת תוכניות</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-3 text-sm text-white/50 font-normal">תכונה</th>
                  <th className="text-center py-3 text-sm text-white/50 font-normal w-24">חינם</th>
                  <th className="text-center py-3 text-sm text-blue-400 font-medium w-24">Pro</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 text-sm">{f.name}</td>
                    <td className="text-center py-3">
                      {f.free === true ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> :
                       f.free === false ? <X className="w-4 h-4 text-white/20 mx-auto" /> :
                       <span className="text-xs text-white/50">{f.free}</span>}
                    </td>
                    <td className="text-center py-3">
                      {f.pro === true ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> :
                       <span className="text-xs text-blue-400">{f.pro}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto mb-16" data-testid="pricing-faq">
          <h2 className="font-rubik font-bold text-xl mb-6 text-center">שאלות נפוצות</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-5 border-white/5" data-testid={`faq-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-right hover:no-underline py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-white/50 pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
