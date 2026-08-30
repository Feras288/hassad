# ملاحظات توافق Google Antigravity

تمت مراجعة وثائق Google Antigravity الرسمية في 30 أغسطس 2026 لتحديد طريقة تهيئة مشروع حصاد دون إضافة إعدادات غير موثقة إلى المستودع.

| المجال | النتيجة العملية للمشروع |
| --- | --- |
| مساحة المشروع | يمكن إضافة مجلد مشروع حصاد كـ **Project Folder** وتشغيل الوكلاء محلياً أو ضمن Git worktree من واجهة Antigravity. |
| الصلاحيات | ينبغي ضبط تنفيذ الطرفية والوصول إلى الملفات خارج المشروع على مبدأ «الطلب عند الحاجة»، مع إبقاء وضع العزل مفعلاً للمهام غير الموثوقة. |
| التعليمات | ستوضع قواعد المشروع وهندسته وقيود البيانات في ملف `AGENTS.md` ووثائق المساهمين كي يقرأها المطور أو الوكيل قبل التعديل. |
| التكاملات | تدعم المنصة أدوات قابلة للتخصيص مثل المهارات وخوادم MCP؛ لا يتطلب مشروع حصاد تكاملاً إضافياً منها للتشغيل المحلي. |

## توافق Copilot وClaude Code

| الأداة | ملف المشروع المقترح | الغرض |
| --- | --- | --- |
| GitHub Copilot | `.github/copilot-instructions.md` | تعليمات تنطبق على المشروع كاملاً: بنية التطبيق، أوامر التحقق، وقواعد السلامة. |
| GitHub Copilot | `.github/instructions/*.instructions.md` | تعليمات مخصصة لمسارات مثل `client/**` و`server/**` عند العمل في VS Code أو مراجعة التغييرات. |
| Claude Code | `CLAUDE.md` و`.claude/settings.json` | تعليمات مشتركة للمشروع وإعدادات لا تتضمن أسراراً ولا تمنح صلاحيات تنفيذ واسعة تلقائياً. |
| الوكلاء المتعددون | `AGENTS.md` و`GEMINI.md` | طبقة تعليمات قصيرة مشتركة تسهّل تهيئة الوكلاء وتوجّههم إلى الوثائق التفصيلية. |

تؤكد وثائق GitHub أن ملف `.github/copilot-instructions.md` يطبق على كامل المستودع، وأن ملفات التعليمات تحت `.github/instructions/` يمكن ربطها بمسارات محددة. وتوضح وثائق Claude Code أن `CLAUDE.md` و`.claude/settings.json` هما نقطتا البداية المعتادتان في مستوى المشروع، وأن ملفات المشروع يمكن مشاركتها مع الفريق عبر Git.

لا تحتوي الوثائق على ملف إعداد مستودع إلزامي يجب توليده داخل المشروع لهذه الغاية؛ لذلك يركز الإعداد على مستندات مساحة العمل، التعليمات القابلة للقراءة، وإعدادات VS Code غير الحساسة.

## مراجع

1. [Google Antigravity — Overview](https://antigravity.google/docs/overview/)
2. [Google Antigravity — Settings](https://antigravity.google/docs/settings/)
3. [GitHub Copilot — Adding repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
4. [Claude Code — Explore the .claude directory](https://code.claude.com/docs/en/claude-directory)
