-- Chat Threads Table
create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Chat Messages Table
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references chat_threads on delete cascade not null,
  sender text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  mood text,
  thinking text,
  truncated boolean default false
);

create index if not exists idx_chat_threads_user_id on chat_threads(user_id);
create index if not exists idx_chat_messages_thread_id on chat_messages(thread_id);
