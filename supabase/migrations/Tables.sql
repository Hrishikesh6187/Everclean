
-- Create Homeowner table
CREATE TABLE homeowners (
  homeowner_id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  address text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Freelancer Applications table
CREATE TABLE freelancer_applications (
    application_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date NOT NULL,
    skill text[] NOT NULL,
    phone_number text NOT NULL,
    email text NOT NULL,
    years_of_experience integer NOT NULL,
    address text NOT NULL,
    ssn text NOT NULL UNIQUE,
    zip_codes text[] NOT NULL,
    payment_details jsonb NOT NULL,
    proof_of_id text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Media table
CREATE TABLE media (
    media_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    media_name text NOT NULL,
    pdf_file bytea NOT NULL,
    document_url text[],
    application_id uuid REFERENCES freelancer_applications(application_id),
    created_at timestamptz DEFAULT now()
);

-- Create Approved Freelancers table
CREATE TABLE approved_freelancers (
    freelancer_id uuid PRIMARY KEY,
    email text NOT NULL,
    password text NOT NULL,
    application_id uuid REFERENCES freelancer_applications(application_id) UNIQUE NOT NULL,
    profile_photo text[],
    hourly_pay decimal(10,2) NOT NULL DEFAULT 35.00,
    service_days text[] NOT NULL DEFAULT ARRAY["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    start_time time NOT NULL DEFAULT '09:00:00',
    end_time time NOT NULL DEFAULT '17:00:00',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Posts table
CREATE TABLE posts (
    post_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_content text NOT NULL,
    freelancer_id uuid REFERENCES approved_freelancers(freelancer_id) NOT NULL,
    image_urls text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Update the post_details view
CREATE VIEW post_details AS
SELECT 
    p.post_id,
    p.post_content,
    p.image_urls,
    p.created_at,
    p.freelancer_id,
    f.profile_photo,
    fa.first_name,
    fa.last_name,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) as likes_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) as comments_count
FROM posts p
JOIN approved_freelancers f ON p.freelancer_id = f.freelancer_id
JOIN freelancer_applications fa ON f.application_id = fa.application_id;

-- Create Comments table
CREATE TABLE comments (
    comment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_content text NOT NULL,
    post_id uuid REFERENCES posts(post_id) NOT NULL,
    freelancer_id uuid REFERENCES approved_freelancers(freelancer_id),
    homeowner_id uuid REFERENCES homeowners(homeowner_id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CHECK (
        (freelancer_id IS NOT NULL AND homeowner_id IS NULL) OR
        (freelancer_id IS NULL AND homeowner_id IS NOT NULL)
    )
);

-- Create Likes table
CREATE TABLE likes (
    like_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES posts(post_id) NOT NULL,
    freelancer_id uuid REFERENCES approved_freelancers(freelancer_id),
    homeowner_id uuid REFERENCES homeowners(homeowner_id),
    created_at timestamptz DEFAULT now(),
    CHECK (
        (freelancer_id IS NOT NULL AND homeowner_id IS NULL) OR
        (freelancer_id IS NULL AND homeowner_id IS NOT NULL)
    )
);

-- Create Admins table
CREATE TABLE admins (
    admin_id uuid PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    address text NOT NULL,
    phone_number text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Service Bookings table
CREATE TABLE service_bookings (
    booking_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    homeowner_id uuid REFERENCES homeowners(homeowner_id) NOT NULL,
    freelancer_id uuid REFERENCES approved_freelancers(freelancer_id) NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    service_type text[] NOT NULL,
    booking_date text NOT NULL,
    booking_time text NOT NULL,
    service_address text NOT NULL,
    special_instructions text,
    hourly_rate decimal(10,2) NOT NULL,
    estimated_duration text NOT NULL,
    total_estimate decimal(10,2) NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'Payment Pending', 'cancelled')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE platform_fees (
    fee_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_percentage numeric NOT NULL,
    fee_description text NOT NULL,
    effective_from timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Remove the freelancer_dashboard_stats table and replace with a view
CREATE OR REPLACE VIEW freelancer_dashboard_stats AS
SELECT 
    f.freelancer_id,
    COUNT(CASE WHEN sb.status = 'completed' THEN 1 END) as total_jobs_completed,
    COALESCE(SUM(CASE WHEN sb.status = 'completed' THEN sb.total_estimate END), 0) as total_earnings,
    COALESCE(AVG(sr.rating), 0) as average_rating,
    COALESCE(SUM(CASE 
        WHEN sb.status = 'completed' 
        THEN REGEXP_REPLACE(estimated_duration, '[^0-9]', '', 'g')::integer
    END), 0) as total_hours_worked,
    COALESCE(SUM(CASE 
        WHEN sb.status = 'completed' 
        AND DATE_TRUNC('month', sb.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        THEN sb.total_estimate 
    END), 0) as current_month_earnings,
    COUNT(CASE 
        WHEN sb.status = 'completed' 
        AND DATE_TRUNC('month', sb.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        THEN 1 
    END) as current_month_jobs,
    COUNT(CASE 
        WHEN sb.status IN ('pending', 'accepted') 
        AND sb.booking_date >= CURRENT_DATE::text
        THEN 1 
    END) as upcoming_jobs
FROM approved_freelancers f
LEFT JOIN service_bookings sb ON f.freelancer_id = sb.freelancer_id
LEFT JOIN service_reviews sr ON sb.booking_id = sr.booking_id
GROUP BY f.freelancer_id;

create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sender_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  booking_id uuid references service_bookings(booking_id)
);

CREATE TABLE service_reviews (
    review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES service_bookings(booking_id) NOT NULL,
    freelancer_id uuid REFERENCES approved_freelancers(freelancer_id) NOT NULL,
    homeowner_id uuid REFERENCES homeowners(homeowner_id) NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add policies for media
CREATE POLICY "Media is viewable by application owner"
    ON media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM freelancer_applications 
        WHERE application_id = media.application_id 
        AND email = auth.uid()::text
    ));

-- Add new policy to allow media uploads
CREATE POLICY "Allow media uploads"
    ON media
    FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON media TO public;

create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'freelancer-documents');

-- Create policy for post images storage
create policy "Post images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'post-images' );

create policy "Users can upload post images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'post-images' );

-- Create policy for profile photos storage
create policy "profile photos are publicly accessible"
on storage.objects for select
using ( bucket_id = 'profile-photos' );

create policy "Users can upload profile photos"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'profile-photos' );

-- Create comment_details view
CREATE OR REPLACE VIEW comment_details AS
SELECT 
    c.comment_id,
    c.comment_content,
    c.created_at,
    c.post_id,
    c.freelancer_id,
    fa.first_name,
    fa.last_name,
    f.profile_photo
FROM comments c
LEFT JOIN approved_freelancers f ON c.freelancer_id = f.freelancer_id
LEFT JOIN freelancer_applications fa ON f.application_id = fa.application_id;