-- Migration to create ai_chats table for storing AI chat history
create table if not exists ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  sender text not null check (sender in ('user', 'ai')),
  message text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create index if not exists idx_ai_chats_user_id on ai_chats(user_id);
