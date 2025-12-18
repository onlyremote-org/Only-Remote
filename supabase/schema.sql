-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  job_preferences text[],
  subscription_tier text default 'free', -- 'free', 'pro'
  subscription_status text default 'active', -- 'active', 'trialing', 'canceled', 'past_due'
  onboarding_completed boolean default false,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for jobs
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  company_name text not null,
  company_logo text,
  location text,
  salary_range text,
  description text not null,
  apply_url text not null,
  tags text[],
  is_featured boolean default false,
  source text default 'manual', -- 'manual', 'api_1', 'api_2'
  external_id text unique
);

-- Set up RLS for jobs
alter table jobs enable row level security;

create policy "Jobs are viewable by everyone." on jobs
  for select using (true);

-- Create a table for user subscriptions (simplified for now)
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  status text not null, -- 'active', 'canceled', 'past_due'
  plan_id text not null, -- 'free', 'pro'
  current_period_end timestamp with time zone
);

-- Set up RLS for subscriptions
alter table subscriptions enable row level security;

create policy "Users can view own subscription." on subscriptions
  for select using (auth.uid() = user_id);

-- Create a table for saved jobs
create table saved_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  job_id uuid references jobs not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, job_id)
);

-- Set up RLS for saved jobs
alter table saved_jobs enable row level security;

create policy "Users can view own saved jobs." on saved_jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved jobs." on saved_jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved jobs." on saved_jobs
  for delete using (auth.uid() = user_id);

-- Create a table for resumes
create table resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  file_name text,
  content text,
  score integer,
  analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for resumes
alter table resumes enable row level security;

create policy "Users can view own resumes." on resumes
  for select using (auth.uid() = user_id);

create policy "Users can insert own resumes." on resumes
  for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
