'use client';

/**
 * @file Gita Guidance Page
 * @description Interactive Bhagavad Gita shloka carousel with Sanskrit, Hindi, English,
 *              business applications, and key takeaways. 10 wisdom cards with navigation.
 */
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX } from 'lucide-react';

const shlokas = [
  {
    ch: '2.47', title: 'Focus on Process, Not Outcome',
    sanskrit: 'कर्मण्येवाधिकारस्ते\nमा फलेषु कदाचन।',
    transliteration: 'Karmanye vadhikaraste ma phaleshu kadachana\nMa karmaphalaheturbhurma te sangostvakarmani',
    hindi: 'तुम्हारा अधिकार केवल कर्म में है, फल में कभी नहीं।',
    meaning: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results, and never be attached to inaction.',
    examples: [
      'Build your product with excellence — don\'t obsess over daily revenue numbers',
      'A startup founder should focus on building value, not checking valuations daily',
      'Sales teams should focus on quality calls and relationships, not just hitting targets',
      'Write clean code because it\'s right, not because of performance reviews',
    ],
    summary: 'In business, obsessing over results creates anxiety and poor decisions. Focus on doing excellent work — the results will follow naturally.',
    img: '/krishna1.png', color: '#d4af37',
  },
  {
    ch: '2.14', title: 'Embrace Market Cycles',
    sanskrit: 'मात्रास्पर्शास्तु कौन्तेय\nशीतोष्णसुखदुःखदाः।',
    transliteration: 'Matra-sparshas tu kaunteya shitoshna-sukha-duhkha-dah\nAgamapayino \'nityas tams titikshasva bharata',
    hindi: 'सुख-दुःख अस्थायी हैं, उन्हें सहन करना सीखो।',
    meaning: 'The contact of the senses with their objects gives rise to feelings of heat and cold, pleasure and pain. They are temporary — they come and go. Bear them patiently.',
    examples: [
      'Markets go up and down — don\'t panic sell during crashes or over-invest during booms',
      'Business has seasons — a bad quarter doesn\'t define your company',
      'Client rejections are temporary — persistence through "no" leads to "yes"',
      'Tech trends change — today\'s failure could be tomorrow\'s innovation',
    ],
    summary: 'Business cycles, market crashes, and client losses are temporary. The entrepreneur who remains steady through both success and failure builds an unshakeable enterprise.',
    img: '/krishna2.png', color: '#f59e0b',
  },
  {
    ch: '3.21', title: 'Lead by Example',
    sanskrit: 'यद्यदाचरति श्रेष्ठः\nतत्तदेवेतरो जनः।',
    transliteration: 'Yad yad acharati shreshthah tat tad evetaro janah\nSa yat pramanam kurute lokas tad anuvartate',
    hindi: 'श्रेष्ठ पुरुष जो आचरण करता है, अन्य लोग उसका अनुसरण करते हैं।',
    meaning: 'Whatever action a great person performs, common people follow. Whatever standards they set, the world follows.',
    examples: [
      'If the CEO works with integrity, the entire organization follows suit',
      'A team lead who writes clean code inspires the whole team to do the same',
      'Founders who are transparent with their team build cultures of trust',
      'Leaders who admit mistakes create psychologically safe workplaces',
    ],
    summary: 'Your team doesn\'t follow your words — they follow your behavior. Culture is built from the top down through consistent example.',
    img: '/krishna3.png', color: '#10b981',
  },
  {
    ch: '6.5', title: 'Self-Discipline is Your Greatest Asset',
    sanskrit: 'उद्धरेदात्मनात्मानं\nनात्मानमवसादयेत्।',
    transliteration: 'Uddhared atmanatmanam natmanam avasadayet\nAtmaiva hyatmano bandhur atmaiva ripur atmanah',
    hindi: 'अपने आप को ऊपर उठाओ, अपने आप को गिरने मत दो।',
    meaning: 'Elevate yourself through your own effort; do not degrade yourself. The self is its own friend and its own enemy.',
    examples: [
      'Your habits determine your business success — discipline beats motivation',
      'No investor or mentor can save a founder who doesn\'t invest in self-growth',
      'The developer who keeps learning stays relevant; the one who stops becomes obsolete',
      'Your biggest competitor isn\'t another company — it\'s your own complacency',
    ],
    summary: 'You are both your greatest ally and your biggest obstacle. Self-discipline, continuous learning, and personal accountability are the foundations of excellence.',
    img: '/krishna4.png', color: '#8b5cf6',
  },
  {
    ch: '2.62', title: 'Avoid Obsession with Competition',
    sanskrit: 'ध्यायतो विषयान्पुंसः\nसङ्गस्तेषूपजायते।',
    transliteration: 'Dhyayato vishayan pumsah sangas teshupajayate\nSangat sanjayate kamah kamat krodho \'bhijayate',
    hindi: 'विषयों का चिंतन करने से आसक्ति उत्पन्न होती है।',
    meaning: 'When a person dwells on sense objects, attachment develops. From attachment arises desire, and from desire comes anger.',
    examples: [
      'Obsessing over competitors leads to copycat strategies instead of innovation',
      'Jealousy of a rival\'s funding round leads to reckless spending',
      'Attachment to a single client makes you vulnerable when they leave',
      'Fixation on short-term metrics destroys long-term strategic thinking',
    ],
    summary: 'Obsessive attachment — to competitors, outcomes, or material gains — clouds judgment. Successful businesses maintain awareness without attachment.',
    img: '/krishna5.png', color: '#ef4444',
  },
  {
    ch: '4.7', title: 'Disrupt When Standards Fall',
    sanskrit: 'यदा यदा हि धर्मस्य\nग्लानिर्भवति भारत।',
    transliteration: 'Yada yada hi dharmasya glanir bhavati bharata\nAbhyutthanam adharmasya tadatmanam srijamy aham',
    hindi: 'जब-जब धर्म की हानि होती है, तब-तब मैं प्रकट होता हूँ।',
    meaning: 'Whenever there is a decline of righteousness and rise of unrighteousness, I manifest myself.',
    examples: [
      'Uber disrupted taxi monopolies that had stopped innovating for customers',
      'When incumbents become complacent, it\'s the perfect time for startups to enter',
      'Quality decline in an industry is an opportunity to build something better',
      'When trust erodes in a market, the ethical player wins long-term',
    ],
    summary: 'Every market decline, every quality drop by incumbents, is a signal for the disruptor. The greatest businesses are born when someone restores excellence.',
    img: '/krishna6.png', color: '#06b6d4',
  },
  {
    ch: '18.48', title: 'Ship Imperfect, Iterate Later',
    sanskrit: 'सहजं कर्म कौन्तेय\nसदोषमपि न त्यजेत्।',
    transliteration: 'Sahajam karma kaunteya sa-dosham api na tyajet\nSarvarambha hi doshena dhumenagnir ivavritah',
    hindi: 'अपना स्वाभाविक कर्म दोषयुक्त होने पर भी न छोड़े।',
    meaning: 'One should not abandon one\'s innate duty even if it has some flaws. All endeavors are covered by some fault, just as fire is covered by smoke.',
    examples: [
      'Launch your MVP even if it\'s not perfect — feedback beats perfection',
      'Every great product had bugs in v1 — Gmail was in "beta" for 5 years',
      'Don\'t wait for the perfect business plan — start, learn, adapt',
      'An imperfect product that ships beats a perfect product that never launches',
    ],
    summary: 'No business venture is without flaws. Waiting for perfection is a form of inaction. Start with what you have, improve as you grow.',
    img: '/krishna1.png', color: '#f97316',
  },
  {
    ch: '11.33', title: 'Take Action Now',
    sanskrit: 'तस्मात्त्वमुत्तिष्ठ\nयशो लभस्व।',
    transliteration: 'Tasmat tvam uttishtha yasho labhasva\nJitva shatrun bhunkshva rajyam samriddham',
    hindi: 'इसलिए उठो और यश प्राप्त करो। शत्रुओं को जीतकर समृद्ध राज्य भोगो।',
    meaning: 'Therefore, arise and win glory. Conquer your enemies and enjoy a flourishing kingdom.',
    examples: [
      'Stop planning endlessly — the best time to start was yesterday, the next best is now',
      'Overcome analysis paralysis — imperfect action beats perfect inaction',
      'Your competitors won\'t wait — seize the market opportunity today',
      'Rise from setbacks quickly — dwelling in failure is worse than the failure itself',
    ],
    summary: 'Krishna\'s most powerful call to action. In business, there comes a moment when all analysis must stop and decisive action must begin. Fortune favors the bold.',
    img: '/krishna2.png', color: '#ec4899',
  },
  {
    ch: '2.48', title: 'Stay Balanced in Success & Failure',
    sanskrit: 'सिद्ध्यसिद्ध्योः समो भूत्वा\nसमत्वं योग उच्यते।',
    transliteration: 'Yoga-sthah kuru karmani sangam tyaktva dhananjaya\nSiddhy-asiddhyoh samo bhutva samatvam yoga uchyate',
    hindi: 'सिद्धि और असिद्धि में समान रहना ही योग है।',
    meaning: 'Perform your duty established in yoga, abandoning attachment, being indifferent to success and failure. This equanimity of mind is called Yoga.',
    examples: [
      'Don\'t celebrate a deal so much that you ignore risks, or mourn a loss so much you miss the next opportunity',
      'Equanimity during funding rounds — neither euphoria nor despair',
      'Treat product launches and failures as equal learning opportunities',
      'The balanced founder makes better decisions than the emotional one',
    ],
    summary: 'Equanimity — sameness of mind — is the highest business skill. It allows clear thinking during crises and humility during triumphs.',
    img: '/krishna3.png', color: '#14b8a6',
  },
  {
    ch: '3.35', title: 'Stay in Your Zone of Genius',
    sanskrit: 'श्रेयान्स्वधर्मो विगुणः\nपरधर्मात्स्वनुष्ठितात्।',
    transliteration: 'Shreyan sva-dharmo vigunah para-dharmat sv-anushthitat\nSva-dharme nidhanam shreyah para-dharmo bhayavahah',
    hindi: 'अपना दोषपूर्ण धर्म भी दूसरे के धर्म से श्रेष्ठ है।',
    meaning: 'It is better to perform one\'s own duty imperfectly than to master another\'s duty perfectly. It is better to die performing one\'s own duty; another\'s duty is fraught with danger.',
    examples: [
      'Don\'t copy a competitor\'s model — build on your unique strengths',
      'A tech founder shouldn\'t try to be a marketing guru — hire for it',
      'Focus on your core product; diversification without mastery is dangerous',
      'It\'s better to be the best at one thing than mediocre at ten',
    ],
    summary: 'The Gita warns against abandoning your unique strength to imitate others. Your dharma is your unique value proposition. Master it rather than chasing someone else\'s formula.',
    img: '/krishna4.png', color: '#7c3aed',
  },
];

export default function GeetaGuidancePage() {
  const [idx, setIdx] = useState(0);
  const s = shlokas[idx];

  const prev = () => setIdx(i => (i - 1 + shlokas.length) % shlokas.length);
  const next = () => setIdx(i => (i + 1) % shlokas.length);
  const random = () => setIdx(Math.floor(Math.random() * shlokas.length));

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cancel any ongoing speech when the shloka changes or component unmounts
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return () => window.speechSynthesis.cancel();
  }, [idx]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(s.hindi);
    utterance.lang = 'hi-IN'; // Hindi
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="h-full flex rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #080810, #0c0c1a)' }}>
      {/* Left Panel — Visual Context */}
      <div className="w-[34%] min-w-[280px] relative overflow-hidden flex-shrink-0 hidden lg:block">
        <img key={s.img + idx} src={s.img} alt="Lord Krishna" className="w-full h-full object-cover" style={{ animation: 'gfadeIn 0.6s ease' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 55%, rgba(8,8,16,0.97) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(8,8,16,0.8) 0%, transparent 30%)' }} />

        {/* Chapter Badge */}
        <div className="absolute bottom-6 left-5 right-5 p-4 rounded-[14px] backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="text-[15px] font-extrabold tracking-wide" style={{ color: '#d4af37' }}>📖 Chapter {s.ch} — Bhagavad Gita</div>
          <div className="text-xs text-[#94a3b8] mt-1">Wisdom Card {idx + 1} of {shlokas.length}</div>
        </div>
      </div>

      {/* Content — Right */}
      <div key={idx} className="flex-1 flex flex-col p-7 lg:px-10 overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-400">
        {/* Title */}
        <div className="flex items-center gap-4 mb-5">
          <span className="text-[38px]">🙏</span>
          <div>
            <div className="text-xs font-extrabold tracking-[2.5px] uppercase mb-0.5" style={{ color: s.color }}>Verse {s.ch}</div>
            <div className="text-[26px] font-extrabold text-[#f1f5f9] leading-tight">{s.title}</div>
          </div>
        </div>

        {/* Sanskrit Shloka */}
        <div className="p-5 rounded-[14px] mb-2" style={{ background: `linear-gradient(135deg, ${s.color}08, ${s.color}02)`, border: `1px solid ${s.color}18` }}>
          <div className="text-[clamp(26px,3vw,36px)] font-bold italic leading-relaxed whitespace-pre-line font-serif" style={{ color: '#d4af37', textShadow: '0 2px 30px rgba(212,175,55,0.12)' }}>
            "{s.sanskrit}"
          </div>
        </div>
        <div className="text-[13px] text-[#64748b] italic mb-5 whitespace-pre-line leading-relaxed pl-1">{s.transliteration}</div>

        {/* Hindi + English Meaning */}
        <div className="flex items-center gap-3 mb-2">
          <div className="text-base text-[#a5b4c8] leading-relaxed flex-1">
            🇮🇳 <span className="font-semibold text-[#c8d5e3]">{s.hindi}</span>
          </div>
          <button 
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-xs font-bold ${
              isSpeaking 
                ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/20' 
                : 'bg-[#5b5fd8]/10 border-[#5b5fd8]/30 text-[#818cf8] hover:bg-[#5b5fd8]/20'
            }`}
          >
            {isSpeaking ? (
              <><VolumeX size={14} /> Stop</>
            ) : (
              <><Volume2 size={14} /> Listen</>
            )}
          </button>
        </div>
        <div className="text-[15px] text-[#cbd5e1] leading-relaxed mb-5 p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
          📖 <span className="font-medium">{s.meaning}</span>
        </div>

        {/* Business Applications */}
        <div className="mb-5">
          <div className="text-xs font-extrabold tracking-[2px] mb-3 uppercase" style={{ color: s.color }}>💼 Business & Software Applications</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {s.examples.map((ex, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-[10px] transition-all duration-200 hover:border-opacity-30 group" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="w-6 h-6 rounded-[7px] flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: `${s.color}12`, color: s.color }}>{i + 1}</span>
                <span className="text-[13px] text-[#b0bec5] leading-relaxed">{ex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="p-4 rounded-[14px] mb-4" style={{ background: `${s.color}08`, borderLeft: `4px solid ${s.color}50` }}>
          <div className="text-xs font-extrabold tracking-[1.5px] mb-1.5 uppercase" style={{ color: s.color }}>🎯 Key Takeaway</div>
          <div className="text-[15px] text-[#e2e8f0] leading-relaxed font-medium">{s.summary}</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-auto pt-3 flex-shrink-0 border-t border-white/5">
          <button onClick={prev} title="Previous" className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#94a3b8] hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {shlokas.map((_, i) => (
                <div key={i} onClick={() => setIdx(i)} className="h-2 rounded cursor-pointer transition-all duration-300" style={{ width: i === idx ? 24 : 8, background: i === idx ? '#d4af37' : 'rgba(212,175,55,0.12)' }} />
              ))}
            </div>
            <button onClick={random} className="px-4 py-1.5 rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] text-xs font-bold flex items-center gap-1.5 hover:bg-[#d4af37]/12 transition-all cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" /> Random Wisdom
            </button>
          </div>

          <button onClick={next} title="Next" className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#94a3b8] hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gfadeIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
