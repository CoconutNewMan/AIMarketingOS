# Marketing Homepage + Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public marketing homepage with 7-language support, Stripe subscription + token top-up payments, contact form via Resend email, and expanded admin order management.

**Architecture:** `/` becomes a public marketing landing page; `/login` handles auth. Stripe Checkout handles payments; a `stripe-webhook` Edge Function updates user tier/tokens on success. Three new Edge Functions: `create-checkout`, `stripe-webhook`, `contact-form`. Admin panel gains an Orders tab and Inquiries tab.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS, Supabase Edge Functions (Deno), Stripe API, Resend API, react-i18next for translations.

## Global Constraints

- verbatimModuleSyntax: true — use `import { type X }` for type-only imports
- All Edge Functions must verify JWT via `verifyUser()` from `_shared/auth.ts` (except `stripe-webhook` which uses Stripe signature, and `contact-form` which is public)
- Supabase project ref: `tfbubpuzvqwryyqjimtw`
- Deploy to Vercel; Edge Functions to Supabase
- Chinese UI inside app; English-first public homepage with 7-language switcher
- No placeholder UI — every component must be production-ready

---

### Task 1: i18n Setup + Language Switcher

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/en.ts`
- Create: `src/i18n/locales/zh.ts`
- Create: `src/i18n/locales/ms.ts`
- Create: `src/i18n/locales/th.ts`
- Create: `src/i18n/locales/vi.ts`
- Create: `src/i18n/locales/id.ts`
- Create: `src/i18n/locales/hi.ts`
- Create: `src/components/LanguageSwitcher.tsx`
- Modify: `package.json` (add react-i18next, i18next)

**Interfaces:**
- Produces: `useTranslation()` hook available app-wide; `<LanguageSwitcher />` component

- [ ] **Step 1: Install i18n packages**

```bash
cd "C:\Users\hawki\OneDrive\Desktop\File\AIMarketingOS"
npm install react-i18next i18next
```

- [ ] **Step 2: Create English locale**

Create `src/i18n/locales/en.ts`:
```typescript
export default {
  nav: {
    features: 'Features',
    pricing: 'Pricing',
    login: 'Log In',
    getStarted: 'Get Started Free',
  },
  hero: {
    title: 'Turn Any Facebook Page Into High-Converting Ads — In Minutes',
    subtitle: 'AI-powered marketing tools for Facebook advertisers, video creators, and live streamers. Analyze competitors, generate copy, and build landing pages instantly.',
    cta: 'Start Free',
    ctaSub: 'No credit card required',
  },
  features: {
    title: 'Everything You Need to Dominate Your Market',
    analysis: { title: 'Page Analysis', desc: 'Scrape and analyze any Facebook page. Get SWOT insights powered by Claude AI.' },
    copy: { title: 'Copy Generator', desc: 'Generate 2 versions of title, body, and CTA copy for any campaign.' },
    landing: { title: 'Landing Page Builder', desc: 'Create full HTML landing pages with live preview and one-click download.' },
    video: { title: 'Video Generation', desc: 'AI video creation for product showcases, lifestyle content, and UGC ads.' },
  },
  pricing: {
    title: 'Simple, Transparent Pricing',
    subtitle: 'Start free, upgrade when you need more power.',
    starter: { name: 'Starter', price: '$19', period: '/month', tokens: '50,000 AI tokens', videos: '5 video generations', files: '3 brand files', support: 'Email support' },
    pro: { name: 'Pro', price: '$49', period: '/month', tokens: '200,000 AI tokens', videos: '20 video generations', files: '10 brand files', support: 'Priority email support', badge: 'Most Popular' },
    enterprise: { name: 'Enterprise', price: 'Custom', cta: 'Contact Us', tokens: 'Unlimited AI tokens', videos: 'Unlimited video generations', files: 'Unlimited brand files', support: 'Dedicated support' },
    cta: 'Get Started',
  },
  tokens: {
    title: 'Need More Tokens? Top Up Anytime',
    subtitle: 'Pay only for what you use. Tokens never expire.',
    small: { name: 'Small Pack', price: '$9', tokens: '20,000 tokens' },
    medium: { name: 'Medium Pack', price: '$19', tokens: '50,000 tokens' },
    large: { name: 'Large Pack', price: '$39', tokens: '120,000 tokens' },
    cta: 'Buy Now',
  },
  contact: {
    title: 'Contact Enterprise Sales',
    name: 'Full Name',
    email: 'Email Address',
    message: 'Tell us about your needs',
    submit: 'Send Message',
    success: 'Message sent! We\'ll get back to you within 24 hours.',
    error: 'Failed to send. Please email us directly.',
  },
  footer: {
    rights: '© 2026 AI Marketing OS. All rights reserved.',
    contact: 'Contact',
  },
}
```

- [ ] **Step 3: Create other locales (Simplified Chinese)**

Create `src/i18n/locales/zh.ts`:
```typescript
export default {
  nav: { features: '功能', pricing: '价格', login: '登入', getStarted: '免费开始' },
  hero: {
    title: '将任何 Facebook 主页转化为高转化广告 — 数分钟内完成',
    subtitle: 'AI 驱动的营销工具，专为 Facebook 广告主、视频创作者和口播达人设计。即时分析竞争对手、生成文案、制作落地页。',
    cta: '免费开始', ctaSub: '无需信用卡',
  },
  features: {
    title: '掌控市场所需的一切工具',
    analysis: { title: '主页分析', desc: '抓取并分析任何 Facebook 主页，获得由 Claude AI 驱动的 SWOT 洞察。' },
    copy: { title: '文案生成器', desc: '为任何广告系列生成 2 个版本的标题、正文和 CTA 文案。' },
    landing: { title: '落地页生成器', desc: '创建完整 HTML 落地页，实时预览，一键下载。' },
    video: { title: '视频生成', desc: '为产品展示、生活方式内容和 UGC 广告创建 AI 视频。' },
  },
  pricing: {
    title: '简单透明的定价',
    subtitle: '免费开始，需要更多时再升级。',
    starter: { name: '入门版', price: '$19', period: '/月', tokens: '50,000 AI tokens', videos: '5 条视频生成', files: '3 个品牌文件', support: '邮件支持' },
    pro: { name: '专业版', price: '$49', period: '/月', tokens: '200,000 AI tokens', videos: '20 条视频生成', files: '10 个品牌文件', support: '优先邮件支持', badge: '最受欢迎' },
    enterprise: { name: '企业版', price: '定制', cta: '联系我们', tokens: '无限 AI tokens', videos: '无限视频生成', files: '无限品牌文件', support: '专属支持' },
    cta: '立即开始',
  },
  tokens: {
    title: '需要更多 Token？随时充值',
    subtitle: '按需付费，Token 永不过期。',
    small: { name: '小包', price: '$9', tokens: '20,000 tokens' },
    medium: { name: '中包', price: '$19', tokens: '50,000 tokens' },
    large: { name: '大包', price: '$39', tokens: '120,000 tokens' },
    cta: '立即购买',
  },
  contact: { title: '企业销售咨询', name: '姓名', email: '邮箱地址', message: '请告诉我们您的需求', submit: '发送消息', success: '消息已发送！我们将在 24 小时内回复您。', error: '发送失败，请直接发邮件给我们。' },
  footer: { rights: '© 2026 AI Marketing OS. 版权所有。', contact: '联系我们' },
}
```

- [ ] **Step 4: Create remaining locales**

Create `src/i18n/locales/ms.ts` (Malay):
```typescript
export default {
  nav: { features: 'Ciri-ciri', pricing: 'Harga', login: 'Log Masuk', getStarted: 'Mulakan Percuma' },
  hero: { title: 'Tukar Mana-mana Halaman Facebook Kepada Iklan Bertukar Tinggi — Dalam Minit', subtitle: 'Alat pemasaran berkuasa AI untuk pengiklan Facebook, pencipta video, dan penyiar langsung.', cta: 'Mulakan Percuma', ctaSub: 'Tiada kad kredit diperlukan' },
  features: { title: 'Semua Yang Anda Perlukan', analysis: { title: 'Analisis Halaman', desc: 'Analisis mana-mana halaman Facebook dengan AI.' }, copy: { title: 'Penjana Salinan', desc: 'Jana 2 versi tajuk, badan, dan CTA.' }, landing: { title: 'Pembina Halaman', desc: 'Buat halaman HTML lengkap dengan pratonton.' }, video: { title: 'Jana Video', desc: 'Cipta video AI untuk kandungan produk.' } },
  pricing: { title: 'Harga Mudah & Telus', subtitle: 'Mulakan percuma, naik taraf bila perlu.', starter: { name: 'Pemula', price: '$19', period: '/bulan', tokens: '50,000 token AI', videos: '5 jana video', files: '3 fail jenama', support: 'Sokongan e-mel' }, pro: { name: 'Pro', price: '$49', period: '/bulan', tokens: '200,000 token AI', videos: '20 jana video', files: '10 fail jenama', support: 'Sokongan e-mel keutamaan', badge: 'Paling Popular' }, enterprise: { name: 'Perusahaan', price: 'Tersuai', cta: 'Hubungi Kami', tokens: 'Token AI tanpa had', videos: 'Jana video tanpa had', files: 'Fail jenama tanpa had', support: 'Sokongan dedikasi' }, cta: 'Mulakan' },
  tokens: { title: 'Perlu Lebih Token?', subtitle: 'Bayar mengikut penggunaan. Token tidak luput.', small: { name: 'Pek Kecil', price: '$9', tokens: '20,000 token' }, medium: { name: 'Pek Sederhana', price: '$19', tokens: '50,000 token' }, large: { name: 'Pek Besar', price: '$39', tokens: '120,000 token' }, cta: 'Beli Sekarang' },
  contact: { title: 'Hubungi Jualan Perusahaan', name: 'Nama Penuh', email: 'Alamat E-mel', message: 'Beritahu kami keperluan anda', submit: 'Hantar Mesej', success: 'Mesej dihantar! Kami akan membalas dalam 24 jam.', error: 'Gagal dihantar.' },
  footer: { rights: '© 2026 AI Marketing OS. Hak cipta terpelihara.', contact: 'Hubungi' },
}
```

Create `src/i18n/locales/th.ts` (Thai):
```typescript
export default {
  nav: { features: 'ฟีเจอร์', pricing: 'ราคา', login: 'เข้าสู่ระบบ', getStarted: 'เริ่มฟรี' },
  hero: { title: 'เปลี่ยนเพจ Facebook ใดก็ได้ให้เป็นโฆษณาที่มี Conversion สูง — ภายในไม่กี่นาที', subtitle: 'เครื่องมือการตลาด AI สำหรับนักโฆษณา Facebook ผู้สร้างวิดีโอ และนักไลฟ์สด', cta: 'เริ่มฟรี', ctaSub: 'ไม่ต้องใช้บัตรเครดิต' },
  features: { title: 'ทุกสิ่งที่คุณต้องการ', analysis: { title: 'วิเคราะห์เพจ', desc: 'วิเคราะห์เพจ Facebook ด้วย AI' }, copy: { title: 'สร้างข้อความโฆษณา', desc: 'สร้างข้อความ 2 เวอร์ชัน' }, landing: { title: 'สร้างหน้า Landing', desc: 'สร้างหน้า HTML พร้อมตัวอย่าง' }, video: { title: 'สร้างวิดีโอ', desc: 'สร้างวิดีโอ AI สำหรับผลิตภัณฑ์' } },
  pricing: { title: 'ราคาที่เรียบง่ายและโปร่งใส', subtitle: 'เริ่มฟรี อัปเกรดเมื่อต้องการ', starter: { name: 'เริ่มต้น', price: '$19', period: '/เดือน', tokens: '50,000 AI tokens', videos: '5 วิดีโอ', files: '3 ไฟล์แบรนด์', support: 'รองรับทางอีเมล' }, pro: { name: 'โปร', price: '$49', period: '/เดือน', tokens: '200,000 AI tokens', videos: '20 วิดีโอ', files: '10 ไฟล์แบรนด์', support: 'รองรับทางอีเมลด่วน', badge: 'ยอดนิยม' }, enterprise: { name: 'องค์กร', price: 'กำหนดเอง', cta: 'ติดต่อเรา', tokens: 'AI tokens ไม่จำกัด', videos: 'วิดีโอไม่จำกัด', files: 'ไฟล์แบรนด์ไม่จำกัด', support: 'รองรับเฉพาะบุคคล' }, cta: 'เริ่มเลย' },
  tokens: { title: 'ต้องการ Token เพิ่ม?', subtitle: 'จ่ายตามการใช้งาน Token ไม่หมดอายุ', small: { name: 'แพ็คเล็ก', price: '$9', tokens: '20,000 tokens' }, medium: { name: 'แพ็คกลาง', price: '$19', tokens: '50,000 tokens' }, large: { name: 'แพ็คใหญ่', price: '$39', tokens: '120,000 tokens' }, cta: 'ซื้อเลย' },
  contact: { title: 'ติดต่อฝ่ายขายองค์กร', name: 'ชื่อ-นามสกุล', email: 'อีเมล', message: 'บอกเราเกี่ยวกับความต้องการของคุณ', submit: 'ส่งข้อความ', success: 'ส่งข้อความแล้ว! เราจะตอบกลับภายใน 24 ชั่วโมง', error: 'ส่งไม่สำเร็จ' },
  footer: { rights: '© 2026 AI Marketing OS. สงวนลิขสิทธิ์', contact: 'ติดต่อ' },
}
```

Create `src/i18n/locales/vi.ts` (Vietnamese):
```typescript
export default {
  nav: { features: 'Tính năng', pricing: 'Bảng giá', login: 'Đăng nhập', getStarted: 'Bắt đầu miễn phí' },
  hero: { title: 'Biến Bất Kỳ Trang Facebook Nào Thành Quảng Cáo Chuyển Đổi Cao — Trong Vài Phút', subtitle: 'Công cụ marketing AI cho nhà quảng cáo Facebook, người sáng tạo video và người livestream.', cta: 'Bắt đầu miễn phí', ctaSub: 'Không cần thẻ tín dụng' },
  features: { title: 'Mọi Thứ Bạn Cần', analysis: { title: 'Phân Tích Trang', desc: 'Phân tích trang Facebook với AI.' }, copy: { title: 'Tạo Nội Dung', desc: 'Tạo 2 phiên bản tiêu đề, nội dung và CTA.' }, landing: { title: 'Xây Dựng Landing Page', desc: 'Tạo trang HTML đầy đủ với xem trước.' }, video: { title: 'Tạo Video', desc: 'Tạo video AI cho sản phẩm.' } },
  pricing: { title: 'Bảng Giá Đơn Giản & Minh Bạch', subtitle: 'Bắt đầu miễn phí, nâng cấp khi cần.', starter: { name: 'Cơ Bản', price: '$19', period: '/tháng', tokens: '50,000 AI tokens', videos: '5 video', files: '3 tệp thương hiệu', support: 'Hỗ trợ email' }, pro: { name: 'Chuyên Nghiệp', price: '$49', period: '/tháng', tokens: '200,000 AI tokens', videos: '20 video', files: '10 tệp thương hiệu', support: 'Hỗ trợ email ưu tiên', badge: 'Phổ biến nhất' }, enterprise: { name: 'Doanh Nghiệp', price: 'Tùy chỉnh', cta: 'Liên hệ', tokens: 'AI tokens không giới hạn', videos: 'Video không giới hạn', files: 'Tệp thương hiệu không giới hạn', support: 'Hỗ trợ riêng' }, cta: 'Bắt đầu' },
  tokens: { title: 'Cần Thêm Token?', subtitle: 'Trả theo sử dụng. Token không hết hạn.', small: { name: 'Gói Nhỏ', price: '$9', tokens: '20,000 tokens' }, medium: { name: 'Gói Vừa', price: '$19', tokens: '50,000 tokens' }, large: { name: 'Gói Lớn', price: '$39', tokens: '120,000 tokens' }, cta: 'Mua ngay' },
  contact: { title: 'Liên Hệ Bán Hàng Doanh Nghiệp', name: 'Họ và tên', email: 'Địa chỉ email', message: 'Cho chúng tôi biết nhu cầu của bạn', submit: 'Gửi tin nhắn', success: 'Đã gửi! Chúng tôi sẽ phản hồi trong 24 giờ.', error: 'Gửi thất bại.' },
  footer: { rights: '© 2026 AI Marketing OS. Bảo lưu mọi quyền.', contact: 'Liên hệ' },
}
```

Create `src/i18n/locales/id.ts` (Indonesian):
```typescript
export default {
  nav: { features: 'Fitur', pricing: 'Harga', login: 'Masuk', getStarted: 'Mulai Gratis' },
  hero: { title: 'Ubah Halaman Facebook Mana Pun Menjadi Iklan Konversi Tinggi — Dalam Menit', subtitle: 'Alat pemasaran bertenaga AI untuk pengiklan Facebook, kreator video, dan penyiar langsung.', cta: 'Mulai Gratis', ctaSub: 'Tidak perlu kartu kredit' },
  features: { title: 'Semua Yang Anda Butuhkan', analysis: { title: 'Analisis Halaman', desc: 'Analisis halaman Facebook dengan AI.' }, copy: { title: 'Generator Teks', desc: 'Buat 2 versi judul, teks, dan CTA.' }, landing: { title: 'Pembuat Landing Page', desc: 'Buat halaman HTML lengkap dengan pratinjau.' }, video: { title: 'Buat Video', desc: 'Buat video AI untuk produk.' } },
  pricing: { title: 'Harga Sederhana & Transparan', subtitle: 'Mulai gratis, upgrade saat butuh.', starter: { name: 'Pemula', price: '$19', period: '/bulan', tokens: '50,000 AI tokens', videos: '5 video', files: '3 file merek', support: 'Dukungan email' }, pro: { name: 'Pro', price: '$49', period: '/bulan', tokens: '200,000 AI tokens', videos: '20 video', files: '10 file merek', support: 'Dukungan email prioritas', badge: 'Paling Populer' }, enterprise: { name: 'Enterprise', price: 'Kustom', cta: 'Hubungi Kami', tokens: 'AI tokens tak terbatas', videos: 'Video tak terbatas', files: 'File merek tak terbatas', support: 'Dukungan khusus' }, cta: 'Mulai' },
  tokens: { title: 'Butuh Token Lebih?', subtitle: 'Bayar sesuai penggunaan. Token tidak kedaluwarsa.', small: { name: 'Paket Kecil', price: '$9', tokens: '20,000 tokens' }, medium: { name: 'Paket Sedang', price: '$19', tokens: '50,000 tokens' }, large: { name: 'Paket Besar', price: '$39', tokens: '120,000 tokens' }, cta: 'Beli Sekarang' },
  contact: { title: 'Hubungi Penjualan Enterprise', name: 'Nama Lengkap', email: 'Alamat Email', message: 'Ceritakan kebutuhan Anda', submit: 'Kirim Pesan', success: 'Pesan terkirim! Kami akan membalas dalam 24 jam.', error: 'Gagal terkirim.' },
  footer: { rights: '© 2026 AI Marketing OS. Hak cipta dilindungi.', contact: 'Hubungi' },
}
```

Create `src/i18n/locales/hi.ts` (Hindi):
```typescript
export default {
  nav: { features: 'विशेषताएं', pricing: 'मूल्य', login: 'लॉग इन', getStarted: 'मुफ्त शुरू करें' },
  hero: { title: 'किसी भी Facebook पेज को मिनटों में हाई-कन्वर्टिंग विज्ञापनों में बदलें', subtitle: 'Facebook विज्ञापनदाताओं, वीडियो क्रिएटर्स और लाइव स्ट्रीमर्स के लिए AI-संचालित मार्केटिंग टूल।', cta: 'मुफ्त शुरू करें', ctaSub: 'क्रेडिट कार्ड की जरूरत नहीं' },
  features: { title: 'बाजार में आगे रहने के लिए सब कुछ', analysis: { title: 'पेज विश्लेषण', desc: 'AI से किसी भी Facebook पेज का विश्लेषण करें।' }, copy: { title: 'कॉपी जेनरेटर', desc: '2 वर्जन में टाइटल, बॉडी और CTA बनाएं।' }, landing: { title: 'लैंडिंग पेज बिल्डर', desc: 'पूरा HTML पेज प्रीव्यू के साथ बनाएं।' }, video: { title: 'वीडियो जेनरेशन', desc: 'प्रोडक्ट के लिए AI वीडियो बनाएं।' } },
  pricing: { title: 'सरल और पारदर्शी मूल्य निर्धारण', subtitle: 'मुफ्त शुरू करें, जरूरत पड़ने पर अपग्रेड करें।', starter: { name: 'स्टार्टर', price: '$19', period: '/माह', tokens: '50,000 AI tokens', videos: '5 वीडियो', files: '3 ब्रांड फाइलें', support: 'ईमेल सपोर्ट' }, pro: { name: 'प्रो', price: '$49', period: '/माह', tokens: '200,000 AI tokens', videos: '20 वीडियो', files: '10 ब्रांड फाइलें', support: 'प्राथमिकता ईमेल सपोर्ट', badge: 'सबसे लोकप्रिय' }, enterprise: { name: 'एंटरप्राइज', price: 'कस्टम', cta: 'संपर्क करें', tokens: 'असीमित AI tokens', videos: 'असीमित वीडियो', files: 'असीमित ब्रांड फाइलें', support: 'डेडिकेटेड सपोर्ट' }, cta: 'शुरू करें' },
  tokens: { title: 'अधिक Token चाहिए?', subtitle: 'उपयोग के अनुसार भुगतान करें। Token कभी expire नहीं होते।', small: { name: 'छोटा पैक', price: '$9', tokens: '20,000 tokens' }, medium: { name: 'मध्यम पैक', price: '$19', tokens: '50,000 tokens' }, large: { name: 'बड़ा पैक', price: '$39', tokens: '120,000 tokens' }, cta: 'अभी खरीदें' },
  contact: { title: 'एंटरप्राइज सेल्स से संपर्क करें', name: 'पूरा नाम', email: 'ईमेल पता', message: 'हमें अपनी जरूरतें बताएं', submit: 'संदेश भेजें', success: 'संदेश भेज दिया! हम 24 घंटों में जवाब देंगे।', error: 'भेजने में विफल।' },
  footer: { rights: '© 2026 AI Marketing OS. सर्वाधिकार सुरक्षित।', contact: 'संपर्क' },
}
```

- [ ] **Step 5: Create i18n config**

Create `src/i18n/index.ts`:
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import zh from './locales/zh'
import ms from './locales/ms'
import th from './locales/th'
import vi from './locales/vi'
import id from './locales/id'
import hi from './locales/hi'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh }, ms: { translation: ms }, th: { translation: th }, vi: { translation: vi }, id: { translation: id }, hi: { translation: hi } },
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
```

- [ ] **Step 6: Create LanguageSwitcher component**

Create `src/components/LanguageSwitcher.tsx`:
```typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ms', label: 'Melayu', flag: '🇲🇾' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

  function change(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium">
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className="text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px] py-1">
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => change(lang.code)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${lang.code === i18n.language ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
              <span>{lang.flag}</span><span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Import i18n in main.tsx**

Modify `src/main.tsx` — add import before React imports:
```typescript
import './i18n/index'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 8: Commit**
```bash
git add src/i18n src/components/LanguageSwitcher.tsx src/main.tsx package.json package-lock.json
git commit -m "feat: add i18n support for 7 languages with language switcher"
```

---

### Task 2: Public Marketing Homepage

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/components/ContactModal.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useTranslation()` from react-i18next, `<LanguageSwitcher />`
- Produces: `/` route renders `<HomePage />`; `/login` renders `<Login />`

- [ ] **Step 1: Create ContactModal component**

Create `src/components/ContactModal.tsx`:
```typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props { onClose: () => void }

export default function ContactModal({ onClose }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('contact.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-700">{t('contact.success')}</p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')}</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
              <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {status === 'error' && <p className="text-red-500 text-sm">{t('contact.error')}</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {status === 'loading' ? '...' : t('contact.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create HomePage**

Create `src/pages/HomePage.tsx`:
```typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ContactModal from '../components/ContactModal'

const PLANS = ['starter', 'pro', 'enterprise'] as const
const TOKEN_PACKS = ['small', 'medium', 'large'] as const

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-100 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">AI Marketing OS</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900">{t('nav.features')}</a>
            <a href="#pricing" className="hover:text-gray-900">{t('nav.pricing')}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5">{t('nav.login')}</button>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t('nav.getStarted')}</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>🚀</span> AI-Powered Marketing Tools
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">{t('hero.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
              {t('hero.cta')} →
            </button>
            <p className="text-sm text-gray-500">{t('hero.ctaSub')}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">{t('features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { key: 'analysis', icon: '🔍', color: 'bg-blue-50 text-blue-600' },
              { key: 'copy', icon: '✍️', color: 'bg-purple-50 text-purple-600' },
              { key: 'landing', icon: '🖥️', color: 'bg-green-50 text-green-600' },
              { key: 'video', icon: '🎬', color: 'bg-orange-50 text-orange-600' },
            ].map(({ key, icon, color }) => (
              <div key={key} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${color}`}>{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{t(`features.${key}.title`)}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">{t('pricing.title')}</h2>
          <p className="text-center text-gray-600 mb-12">{t('pricing.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map(plan => {
              const p = t(`pricing.${plan}`, { returnObjects: true }) as Record<string, string>
              const isPro = plan === 'pro'
              const isEnterprise = plan === 'enterprise'
              return (
                <div key={plan} className={`relative bg-white rounded-2xl p-8 border-2 ${isPro ? 'border-blue-500 shadow-xl' : 'border-gray-100'}`}>
                  {isPro && p.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">{p.badge}</div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
                      {!isEnterprise && <span className="text-gray-500 mb-1">{p.period}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {['tokens', 'videos', 'files', 'support'].map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span> {p[feature]}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => isEnterprise ? setShowContact(true) : navigate('/login')}
                    className={`w-full py-3 rounded-xl font-semibold text-sm ${isPro ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                    {isEnterprise ? p.cta : t('pricing.cta')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Token Packs */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('tokens.title')}</h2>
          <p className="text-gray-600 mb-12">{t('tokens.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TOKEN_PACKS.map(pack => {
              const p = t(`tokens.${pack}`, { returnObjects: true }) as Record<string, string>
              return (
                <div key={pack} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                  <div className="text-3xl font-extrabold text-blue-600 my-3">{p.price}</div>
                  <p className="text-sm text-gray-600 mb-6">{p.tokens}</p>
                  <button onClick={() => navigate('/login')} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700">
                    {t('tokens.cta')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>{t('footer.rights')}</span>
          <span>{t('footer.contact')}: support@aimarketingos.com</span>
        </div>
      </footer>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  )
}
```

- [ ] **Step 3: Update App.tsx routes**

Modify `src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FilePage from './pages/FilePage'
import Analysis from './pages/Analysis'
import Copy from './pages/Copy'
import Landing from './pages/Landing'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/file/:id" element={<AuthGuard><FilePage /></AuthGuard>} />
        <Route path="/file/:id/analysis" element={<AuthGuard><Analysis /></AuthGuard>} />
        <Route path="/file/:id/copy" element={<AuthGuard><Copy /></AuthGuard>} />
        <Route path="/file/:id/landing" element={<AuthGuard><Landing /></AuthGuard>} />
        <Route path="/admin" element={<AuthGuard><AdminGuard><Admin /></AdminGuard></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Update AuthGuard to redirect to /login**

Modify `src/components/AuthGuard.tsx` — change redirect from `"/"` to `"/login"`:
```typescript
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

- [ ] **Step 5: Commit**
```bash
git add src/pages/HomePage.tsx src/components/ContactModal.tsx src/App.tsx src/components/AuthGuard.tsx
git commit -m "feat: add public marketing homepage with 7-language support"
```

---

### Task 3: Stripe Setup + Database Orders Table

**Files:**
- SQL migration (run in Supabase SQL editor)
- Create: `supabase/functions/create-checkout/index.ts`

**Interfaces:**
- Produces: `orders` table in DB; `create-checkout` Edge Function returns `{ url: string }`

- [ ] **Step 1: Create orders table in Supabase SQL Editor**

Run this SQL in Supabase Dashboard → SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('subscription', 'token_pack')),
  plan TEXT NOT NULL,
  amount_usd INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  tokens_granted INTEGER DEFAULT 0,
  tier_granted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
```

- [ ] **Step 2: Get Stripe API keys**

1. Go to https://dashboard.stripe.com/apikeys
2. Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)
3. Copy the **Publishable key** (starts with `pk_live_` or `pk_test_`)
4. Set the secret in Supabase:
```bash
supabase secrets set STRIPE_SECRET_KEY="sk_test_..." --project-ref tfbubpuzvqwryyqjimtw
```
5. Add publishable key to Vercel env:
```bash
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
```

- [ ] **Step 3: Create create-checkout Edge Function**

Create `supabase/functions/create-checkout/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY')!
const APP_URL = Deno.env.get('APP_URL') || 'https://ai-marketing-os-mauve.vercel.app'

const PRODUCTS = {
  starter: { type: 'subscription', price_usd: 1900, tokens: 50000, tier: 'pro', name: 'Starter Plan - $19/month' },
  pro: { type: 'subscription', price_usd: 4900, tokens: 200000, tier: 'pro', name: 'Pro Plan - $49/month' },
  token_small: { type: 'token_pack', price_usd: 900, tokens: 20000, tier: null, name: 'Token Pack - 20,000 tokens' },
  token_medium: { type: 'token_pack', price_usd: 1900, tokens: 50000, tier: null, name: 'Token Pack - 50,000 tokens' },
  token_large: { type: 'token_pack', price_usd: 3900, tokens: 120000, tier: null, name: 'Token Pack - 120,000 tokens' },
} as const

type ProductKey = keyof typeof PRODUCTS

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const user = await verifyUser(req)
    const { product } = await req.json() as { product: ProductKey }
    const productInfo = PRODUCTS[product]
    if (!productInfo) return new Response(JSON.stringify({ error: 'Invalid product' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const stripeBody = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(productInfo.price_usd),
      'line_items[0][price_data][product_data][name]': productInfo.name,
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/#pricing`,
      'metadata[user_id]': user.id,
      'metadata[product]': product,
      'metadata[tokens]': String(productInfo.tokens),
      'metadata[tier]': productInfo.tier || '',
      'metadata[product_type]': productInfo.type,
      'metadata[amount_usd]': String(productInfo.price_usd),
    })

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${STRIPE_SECRET}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: stripeBody,
    })

    const session = await stripeRes.json()
    if (!stripeRes.ok) throw new Error(session.error?.message || 'Stripe error')

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
```

- [ ] **Step 4: Deploy create-checkout**
```bash
supabase functions deploy create-checkout --project-ref tfbubpuzvqwryyqjimtw
```

- [ ] **Step 5: Commit**
```bash
git add supabase/functions/create-checkout
git commit -m "feat: add create-checkout Edge Function and orders table"
```

---

### Task 4: Stripe Webhook + contact-form Edge Functions

**Files:**
- Create: `supabase/functions/stripe-webhook/index.ts`
- Create: `supabase/functions/contact-form/index.ts`

**Interfaces:**
- Consumes: Stripe webhook events; Resend API
- Produces: updates `users` table (tier, token_balance) and `orders` table on payment success; sends email via Resend

- [ ] **Step 1: Create stripe-webhook Edge Function**

Create `supabase/functions/stripe-webhook/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function verifyStripeSignature(body: string, signature: string): Promise<boolean> {
  const parts = signature.split(',').reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split('=')
    acc[k] = v
    return acc
  }, {})
  const timestamp = parts['t']
  const sigV1 = parts['v1']
  const payload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(STRIPE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return computed === sigV1
}

serve(async (req) => {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  const valid = await verifyStripeSignature(body, signature)
  if (!valid) return new Response('Invalid signature', { status: 400 })

  const event = JSON.parse(body)
  if (event.type !== 'checkout.session.completed') return new Response('OK', { status: 200 })

  const session = event.data.object
  const meta = session.metadata
  const userId = meta.user_id
  const tokens = parseInt(meta.tokens)
  const tier = meta.tier
  const productType = meta.product_type
  const amountUsd = parseInt(meta.amount_usd)
  const product = meta.product

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Insert order record
  await supabase.from('orders').insert({
    user_id: userId,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    product_type: productType,
    plan: product,
    amount_usd: amountUsd,
    status: 'paid',
    tokens_granted: tokens,
    tier_granted: tier || null,
  })

  // Update user: add tokens
  const { data: currentUser } = await supabase.from('users').select('token_balance').eq('id', userId).single()
  const newBalance = (currentUser?.token_balance || 0) + tokens

  const updateData: Record<string, unknown> = { token_balance: newBalance, updated_at: new Date().toISOString() }
  if (productType === 'subscription' && tier) updateData.tier = tier

  await supabase.from('users').update(updateData).eq('id', userId)

  return new Response('OK', { status: 200 })
})
```

- [ ] **Step 2: Create contact-form Edge Function**

Create `supabase/functions/contact-form/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const TO_EMAIL = Deno.env.get('CONTACT_EMAIL') || 'hawkiatno1@gmail.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { name, email, message } = await req.json() as { name: string; email: string; message: string }
    if (!name || !email || !message) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AI Marketing OS <onboarding@resend.dev>',
        to: [TO_EMAIL],
        subject: `Enterprise Inquiry from ${name}`,
        html: `<h2>New Enterprise Inquiry</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      }),
    })

    if (!res.ok) throw new Error('Resend error')
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
```

- [ ] **Step 3: Get Resend API key and set secrets**

1. Sign up at https://resend.com (free tier: 3000 emails/month)
2. Go to API Keys → Create API Key
3. Set secrets:
```bash
supabase secrets set RESEND_API_KEY="re_..." --project-ref tfbubpuzvqwryyqjimtw
supabase secrets set CONTACT_EMAIL="hawkiatno1@gmail.com" --project-ref tfbubpuzvqwryyqjimtw
```

- [ ] **Step 4: Set Stripe webhook secret**

1. Go to https://dashboard.stripe.com/webhooks → Add endpoint
2. URL: `https://tfbubpuzvqwryyqjimtw.supabase.co/functions/v1/stripe-webhook`
3. Events: select `checkout.session.completed`
4. Copy the **Signing secret** (starts with `whsec_`)
5. Set secret:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref tfbubpuzvqwryyqjimtw
```

- [ ] **Step 5: Deploy both functions**
```bash
supabase functions deploy stripe-webhook --project-ref tfbubpuzvqwryyqjimtw
supabase functions deploy contact-form --project-ref tfbubpuzvqwryyqjimtw
```

- [ ] **Step 6: Commit**
```bash
git add supabase/functions/stripe-webhook supabase/functions/contact-form
git commit -m "feat: add stripe-webhook and contact-form Edge Functions"
```

---

### Task 5: Payment Success Page + Billing UI in Dashboard

**Files:**
- Create: `src/pages/PaymentSuccess.tsx`
- Create: `src/pages/Billing.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `callFunction<{url: string}>('create-checkout', ...)` from `src/lib/api.ts`
- Produces: `/payment-success` route; `/billing` route (authenticated)

- [ ] **Step 1: Create PaymentSuccess page**

Create `src/pages/PaymentSuccess.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => c - 1), 1000)
    const redirect = setTimeout(() => navigate('/dashboard'), 5000)
    return () => { clearInterval(timer); clearTimeout(redirect) }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">Your account has been upgraded. Tokens have been added to your balance.</p>
        <p className="text-sm text-gray-500 mb-8">Redirecting to dashboard in {countdown} seconds...</p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
          Go to Dashboard Now
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Billing page**

Create `src/pages/Billing.tsx`:
```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callFunction } from '../lib/api'
import TokenBadge from '../components/TokenBadge'

const PLANS = [
  { key: 'starter', name: 'Starter', price: '$19/mo', tokens: '50,000 tokens', videos: '5 videos', files: '3 files' },
  { key: 'pro', name: 'Pro', price: '$49/mo', tokens: '200,000 tokens', videos: '20 videos', files: '10 files', popular: true },
]

const TOKEN_PACKS = [
  { key: 'token_small', name: 'Small Pack', price: '$9', tokens: '20,000 tokens' },
  { key: 'token_medium', name: 'Medium Pack', price: '$19', tokens: '50,000 tokens' },
  { key: 'token_large', name: 'Large Pack', price: '$39', tokens: '120,000 tokens' },
]

export default function Billing() {
  const { session, dbUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(product: string) {
    if (!session) return
    setLoading(product)
    try {
      const { url } = await callFunction<{ url: string }>('create-checkout', { product }, session.access_token)
      window.location.href = url
    } catch {
      alert('Payment failed to initialize. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:text-blue-800 mb-2">← 返回仪表板</button>
            <h1 className="text-2xl font-bold text-gray-900">套餐与充值</h1>
          </div>
          {dbUser && <TokenBadge balance={dbUser.token_balance} max={dbUser.tier === 'pro' ? 200000 : 50000} />}
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">月度套餐</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map(plan => (
              <div key={plan.key} className={`bg-white rounded-2xl p-6 border-2 ${plan.popular ? 'border-blue-500' : 'border-gray-100'}`}>
                {plan.popular && <div className="text-xs font-bold text-blue-600 mb-2">⭐ 最受欢迎</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-gray-900 my-3">{plan.price}</div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li>✓ {plan.tokens}</li>
                  <li>✓ {plan.videos}</li>
                  <li>✓ {plan.files}</li>
                </ul>
                <button onClick={() => checkout(plan.key)} disabled={!!loading}
                  className={`w-full py-3 rounded-xl font-semibold text-sm ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} disabled:opacity-50`}>
                  {loading === plan.key ? '跳转中...' : '立即订阅'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Token 充值包</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TOKEN_PACKS.map(pack => (
              <div key={pack.key} className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900">{pack.name}</h3>
                <div className="text-2xl font-extrabold text-blue-600 my-2">{pack.price}</div>
                <p className="text-sm text-gray-600 mb-4">{pack.tokens}</p>
                <button onClick={() => checkout(pack.key)} disabled={!!loading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading === pack.key ? '跳转中...' : '立即购买'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update App.tsx with new routes**

Modify `src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FilePage from './pages/FilePage'
import Analysis from './pages/Analysis'
import Copy from './pages/Copy'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Billing from './pages/Billing'
import PaymentSuccess from './pages/PaymentSuccess'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/billing" element={<AuthGuard><Billing /></AuthGuard>} />
        <Route path="/file/:id" element={<AuthGuard><FilePage /></AuthGuard>} />
        <Route path="/file/:id/analysis" element={<AuthGuard><Analysis /></AuthGuard>} />
        <Route path="/file/:id/copy" element={<AuthGuard><Copy /></AuthGuard>} />
        <Route path="/file/:id/landing" element={<AuthGuard><Landing /></AuthGuard>} />
        <Route path="/admin" element={<AuthGuard><AdminGuard><Admin /></AdminGuard></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Add "升级套餐" button to Dashboard**

Modify `src/pages/Dashboard.tsx` — add upgrade button near the top after the title:
```typescript
// Add import at top:
import { useNavigate } from 'react-router-dom'

// Inside component, add navigate:
const navigate = useNavigate()

// Add button in the header area next to "+ 新建 File":
<button onClick={() => navigate('/billing')} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
  💳 升级套餐
</button>
```

- [ ] **Step 5: Commit**
```bash
git add src/pages/PaymentSuccess.tsx src/pages/Billing.tsx src/App.tsx src/pages/Dashboard.tsx
git commit -m "feat: add billing page, payment success page, and Stripe checkout flow"
```

---

### Task 6: Admin Orders + Inquiries Tab

**Files:**
- Modify: `supabase/functions/admin/index.ts`
- Modify: `src/pages/Admin.tsx`

**Interfaces:**
- Consumes: `callAdmin<T>()` from `src/lib/api.ts`
- Produces: GET `/orders` and GET `/inquiries` admin routes; Orders tab and Inquiries tab in Admin UI

- [ ] **Step 1: Add orders route to admin Edge Function**

Modify `supabase/functions/admin/index.ts` — add these routes inside the main handler before the final 404:

```typescript
// GET /orders — list all orders
if (method === 'GET' && path === '/orders') {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(email)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
```

- [ ] **Step 2: Deploy updated admin function**
```bash
supabase functions deploy admin --project-ref tfbubpuzvqwryyqjimtw
```

- [ ] **Step 3: Add Orders tab to Admin UI**

Modify `src/pages/Admin.tsx` — add `'orders'` to the tab list and add Orders tab content:

In the tabs array, add:
```typescript
{ key: 'orders', label: '订单管理' }
```

Add orders state and fetch:
```typescript
const [orders, setOrders] = useState<Array<{
  id: string; user_id: string; plan: string; amount_usd: number;
  status: string; tokens_granted: number; created_at: string;
  users?: { email: string }
}>>([])

// In fetchStats or separate useEffect:
async function fetchOrders() {
  if (!session) return
  try {
    const data = await callAdmin<typeof orders>('/orders', 'GET', session.access_token)
    setOrders(data)
  } catch {}
}
```

Add Orders tab render:
```typescript
{activeTab === 'orders' && (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className="px-4 py-3 text-left">用户</th>
          <th className="px-4 py-3 text-left">套餐</th>
          <th className="px-4 py-3 text-left">金额</th>
          <th className="px-4 py-3 text-left">Tokens</th>
          <th className="px-4 py-3 text-left">状态</th>
          <th className="px-4 py-3 text-left">时间</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
            <td className="px-4 py-3 text-gray-700">{order.users?.email || order.user_id.slice(0, 8)}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{order.plan}</td>
            <td className="px-4 py-3 text-gray-700">${(order.amount_usd / 100).toFixed(2)}</td>
            <td className="px-4 py-3 text-gray-700">{order.tokens_granted.toLocaleString()}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {order.status}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
        {orders.length === 0 && (
          <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">暂无订单</td></tr>
        )}
      </tbody>
    </table>
  </div>
)}
```

- [ ] **Step 4: Commit**
```bash
git add supabase/functions/admin src/pages/Admin.tsx
git commit -m "feat: add orders tab to admin panel"
```

---

### Task 7: Deploy Everything

- [ ] **Step 1: Set APP_URL secret**
```bash
supabase secrets set APP_URL="https://ai-marketing-os-mauve.vercel.app" --project-ref tfbubpuzvqwryyqjimtw
```

- [ ] **Step 2: Build and test locally**
```bash
npm run build
```
Expected: No TypeScript errors, dist/ folder created.

- [ ] **Step 3: Deploy to Vercel**
```bash
vercel --prod
```

- [ ] **Step 4: Test the full flow**
1. Visit `https://ai-marketing-os-mauve.vercel.app` — see homepage
2. Switch language to 中文 — UI updates
3. Click "Get Started" — redirects to `/login`
4. Click enterprise "Contact Us" — modal opens, fill form, submit
5. Log in → click "升级套餐" → Billing page loads
6. Click a plan → Stripe Checkout opens (use test card `4242 4242 4242 4242`)
7. Complete payment → `/payment-success` → auto-redirect to dashboard
8. Check token balance updated in dashboard
9. Log in as admin → `/admin` → Orders tab shows the order

- [ ] **Step 5: Final commit**
```bash
git add .
git commit -m "feat: complete marketing homepage + Stripe payments + i18n"
```
