-- بعد إنشاء المستخدم من Supabase Authentication > Users
-- استبدل UUID بالمعرف الحقيقي للمستخدم، ولا تضع كلمة المرور هنا.
insert into public.staff_profiles (id, display_name, role, is_active)
values ('PASTE-USER-UUID-HERE', 'مدير سومر', 'owner_admin', true);
