-- Enforce Bangla wording for built-in SMS templates.

update public.sms_templates
set
  message_body = 'প্রিয় {{guardian_name}}, {{student_name}} এর জন্য {{amount}} টাকা পেমেন্ট গ্রহণ করা হয়েছে। ধন্যবাদ, {{coaching_name}}।',
  variables = '["guardian_name","student_name","amount","coaching_name"]'::jsonb,
  updated_at = now()
where category = 'payment_confirmation'
  and name = 'Payment Confirmation';

update public.sms_templates
set
  message_body = 'প্রিয় {{guardian_name}}, {{student_name}} এর {{month}} মাসের বকেয়া {{amount}}। অনুগ্রহ করে {{due_date}} তারিখের মধ্যে পরিশোধ করুন।',
  variables = '["guardian_name","student_name","month","amount","due_date"]'::jsonb,
  updated_at = now()
where category = 'payment_reminder'
  and name = 'Payment Reminder';

update public.sms_templates
set
  message_body = 'প্রিয় {{guardian_name}}, {{student_name}} এর {{month}} মাসের পেমেন্ট গ্রেস পিরিয়ডে আছে। বকেয়া {{amount}}।',
  variables = '["guardian_name","student_name","month","amount"]'::jsonb,
  updated_at = now()
where category = 'grace_period'
  and name = 'Grace Period Notice';

update public.sms_templates
set
  message_body = 'প্রিয় {{guardian_name}}, {{student_name}} এর {{month}} মাসের পেমেন্ট ওভারডিউ হয়েছে। বকেয়া {{amount}}।',
  variables = '["guardian_name","student_name","month","amount"]'::jsonb,
  updated_at = now()
where category = 'overdue_warning'
  and name = 'Overdue Warning';
