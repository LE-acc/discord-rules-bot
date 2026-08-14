--[[
    نقطة الربط الوحيدة مع سكربت التفاعل حقك ("interact").
    كل ملفات الكلاينت الثانية (floor.lua, warehouse.lua, truck.lua, laptop.lua)
    تستدعي بس الدوال الثلاث تحت — ماتتعامل مع سكربت التفاعل مباشرة أبدًا.

    هذا الملف ماله أي منطق شغال حاليًا، بس توثيق لشكل الاستدعاء. لما تربطه
    بسكربت الـ interact حقك، عبّي جسم كل دالة باستدعاء سكربتك المناسب:

    AddEntityInteraction(entity, options)
        - تضيف تفاعل على كيان (سيارة، بيد...).
        - استخدمها بالسكربت حقك عشان تسجل تفاعل على `entity` يطلع خياراته
          لما اللاعب يقرب منه ويضغط زر التفاعل.

    RemoveEntityInteraction(entity)
        - تشيل التفاعل المسجل على كيان معين (يستخدم قبل حذف الكيان).

    AddZoneInteraction(coords, radius, options)
        - تضيف تفاعل على منطقة/نقطة ثابتة (مثل مدخل المخزن أو اللابتوب)
          بدل ما يكون على كيان معين.

    شكل `options` اللي توصل للدوال الثلاث: array من عناصر
        { label = 'نص الخيار', icon = 'fa-solid fa-...', onSelect = function() ... end }
    كل عنصر يمثل خيار تفاعل، وسكربتك هو اللي يتكفل يعرضها ويستدعي onSelect
    لما اللاعب يختارها.
]]

function AddEntityInteraction(entity, options)
    -- اربطها بسكربت الـ interact حقك
end

function RemoveEntityInteraction(entity)
    -- اربطها بسكربت الـ interact حقك
end

function AddZoneInteraction(coords, radius, options)
    -- اربطها بسكربت الـ interact حقك
end
