# التطوير المدعوم بالذكاء الاصطناعي

يحتوي المشروع على طبقات تعليمات مشتركة لتقليل اختلاف النتائج بين Google Antigravity وGitHub Copilot وClaude Code. تصف هذه الملفات هندسة المشروع وقواعد البيانات والاختبارات؛ لا تضف مفاتيح حسابات أو رموز وصول أو إعدادات MCP خاصة إلى المستودع.

| الأداة             | الملف أو الإعداد                                | ما ينبغي فعله                                                                             |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| VS Code            | `.vscode/extensions.json` و`.vscode/tasks.json` | افتح المجلد وثبت الإضافات المقترحة واستخدم مهام التشغيل والفحص والاختبار.                 |
| GitHub Copilot     | `.github/copilot-instructions.md`               | فعّل قراءة تعليمات المستودع. توجد تعليمات أدق للعميل والخادم تحت `.github/instructions/`. |
| Claude Code        | `CLAUDE.md` و`.claude/settings.json`            | شغّل Claude من جذر المستودع؛ يقرأ السياق وقواعد الحماية المشتركة.                         |
| Google Antigravity | `GEMINI.md` و`.agents/rules/hassad.md`          | أضف مجلد المشروع ثم فعّل قاعدة مساحة العمل كـ **Always On**.                              |
| كل الأدوات         | `AGENTS.md`                                     | اقرأه قبل أي تعديل؛ وهو المرجع الموحد للسلامة والبنية والتحقق.                            |

## إعداد Google Antigravity

يتعامل Antigravity 2.0 مع إعدادات المشروع كحدود منفصلة للملفات والصلاحيات والتنفيذ. أضف جذر هذا المستودع كمجلد مشروع، وفعل عزل الطرفية، واجعل الوصول خارج مجلد المشروع «Ask» أو «Deny» حسب سياسة الفريق. ضع `.agents/rules/hassad.md` في قواعد مساحة العمل واختر **Always On**. تدعم Antigravity قواعد Markdown داخل `.agents/rules` مع توافق سابق مع `.agent/rules`. [1] [2]

## إعداد VS Code وGitHub Copilot

افتح مجلد المشروع كاملاً لا مجلد `client` أو `server` منفرداً. تثبت ملفات توصيات الإضافات Copilot وClaude Code وPrettier وVitest Explorer، وتوفر مهام VS Code أوامر مألوفة للفحص والاختبار والبناء. يستفيد Copilot من `.github/copilot-instructions.md` عبر المستودع ومن ملفات `.github/instructions/*.instructions.md` عندما يطابق الملف الجاري العمل عليه. [3]

## إعداد Claude Code

ثبت Claude Code أو إضافة VS Code الرسمية ثم شغله من جذر المشروع. يضع `CLAUDE.md` سياق المشروع المشترك في الجذر، وتبقى إعدادات المشروع غير الحساسة في `.claude/settings.json`. توضح وثائق Claude Code أن ملفات المشروع قابلة للمشاركة عبر Git، بخلاف الإعدادات الشخصية تحت `~/.claude`. [4] [5]

## ممارسات عمل موصى بها

استخدم طلباً واحداً واضحاً لكل تغيير، واطلب من الوكيل أولاً تحديد الملفات التي سيتأثر بها التعديل. لا تسمح بتطبيق ترحيل أو نشر تلقائياً دون مراجعة SQL والفرق. بعد أي تغيير اطلب تشغيل `pnpm check && pnpm test`، واطلب `pnpm build` عند تعديل الحزم أو إعدادات البناء. حافظ على طلبات الدمج صغيرة ومقسمة إلى نطاقات قابلة للمراجعة.

> لا تمنح أي وكيل صلاحية دائمة للوصول خارج المستودع أو لتنفيذ أوامر حذف واسعة. إن احتاج الوكيل مفتاحاً أو خدمة خارجية، استخدم إدارة الأسرار المناسبة ولا تضع القيمة في وثيقة أو ملف إعداد.

## مراجع

1. [Google Antigravity — Overview](https://antigravity.google/docs/overview/)
2. [Google Antigravity — Rules](https://antigravity.google/docs/rules/)
3. [GitHub Copilot — Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
4. [Claude Code — Explore the .claude directory](https://code.claude.com/docs/en/claude-directory)
5. [Claude Code for VS Code — Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
